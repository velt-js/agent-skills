---
title: Django, Flask, and FastAPI Integration Patterns
impact: MEDIUM
impactDescription: Re-initializing per request opens a new connection pool each time, and re-wrapping SDK responses breaks the data provider contract
tags: python, django, flask, fastapi, frameworks, integration, singleton, csrf_exempt, from_dict
---

## Django, Flask, and FastAPI Integration Patterns

Initialize the SDK once per process and reuse it in every handler. Each handler parses the frontend body with `<RequestType>.from_dict(...)`, calls `sdk.selfHosting.*`, and returns the SDK's response dict with its `statusCode` as the HTTP status. Do not re-wrap the response: the frontend data provider reads `success`, `statusCode`, and `data`.

**Incorrect:**

```python
@app.route('/api/velt/comments/get', methods=['POST'])
def get_comments():
    sdk = VeltSDK.initialize(CONFIG)          # WRONG: a new SDK (and pool) per request
    result = sdk.selfHosting.comments.getComments(GetCommentResolverRequest.from_dict(request.json))
    return jsonify({'data': result['data']})  # WRONG: drops success / statusCode
```

**Django (lazy singleton + settings):**

```python
# velt_sdk.py
from django.conf import settings
from velt_py import VeltSDK

_velt_sdk = None

def get_velt_sdk():
    global _velt_sdk
    if _velt_sdk is None:
        _velt_sdk = VeltSDK.initialize(settings.VELT_SDK_CONFIG)
    return _velt_sdk
```

```python
# settings.py
import os
VELT_SDK_CONFIG = {
    'database': {'connection_string': os.environ.get('VELT_MONGODB_CONNECTION_STRING')},
    'apiKey': os.environ.get('VELT_API_KEY'),
    'authToken': os.environ.get('VELT_AUTH_TOKEN'),
}
```

```python
# views.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from velt_py import GetCommentResolverRequest
from .velt_sdk import get_velt_sdk

@csrf_exempt
@require_http_methods(["POST"])
def get_comments(request):
    try:
        comment_request = GetCommentResolverRequest.from_dict(json.loads(request.body))
        result = get_velt_sdk().selfHosting.comments.getComments(comment_request)
        return JsonResponse(result, status=result.get('statusCode', 200))
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e), 'errorCode': 'INTERNAL_ERROR',
                             'statusCode': 500}, status=500)
```

**Flask (module-level SDK):**

```python
from flask import Flask, request, jsonify
from velt_py import VeltSDK, GetCommentResolverRequest

app = Flask(__name__)
sdk = VeltSDK.initialize({'database': {'connection_string': 'mongodb+srv://...'}})

@app.route('/api/velt/comments/get', methods=['POST'])
def get_comments():
    result = sdk.selfHosting.comments.getComments(GetCommentResolverRequest.from_dict(request.json))
    return jsonify(result), result.get('statusCode', 200)
```

**FastAPI (module-level SDK):**

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from velt_py import VeltSDK, GetCommentResolverRequest

app = FastAPI()
sdk = VeltSDK.initialize({'database': {'connection_string': 'mongodb+srv://...'}})

@app.post('/api/velt/comments/get')
async def get_comments(request: Request):
    result = sdk.selfHosting.comments.getComments(GetCommentResolverRequest.from_dict(await request.json()))
    return JSONResponse(content=result, status_code=result.get('statusCode', 200))
```

**Key points:**

- Install the database extra your config uses (`velt-py[mongodb]` or `velt-py[postgres]`); Django 4.2.26+ is required only for the self-hosting backend.
- Multi-process servers (gunicorn, uWSGI) open one pool per worker; under uWSGI enable threads (`--enable-threads`).
- Django resolver views need `@csrf_exempt` because the Velt frontend posts to them directly; authenticate them with `sdk.selfHosting.verifyToken` instead (see `backend-verify-resolver-auth`).
- Load credentials from environment variables.

**Verification:**
- [ ] The SDK is initialized once per process (module level or a lazy singleton), never inside a handler
- [ ] Handlers return the SDK result dict unchanged with `status=result.get('statusCode', 200)`
- [ ] Django resolver views use `@csrf_exempt` and `@require_http_methods(["POST"])`
- [ ] Requests are built with `from_dict` from the raw JSON body
- [ ] The database extra matching `database.type` is installed

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#framework-examples - "Framework Examples"
- https://docs.velt.dev/backend-sdks/python#requirements - "Requirements"
