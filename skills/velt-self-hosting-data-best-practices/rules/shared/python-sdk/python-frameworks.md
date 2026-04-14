---
title: Django, Flask, and FastAPI Integration Patterns
impact: MEDIUM
impactDescription: Incorrect framework integration causes SDK reinitialization on every request or missing CSRF handling
tags: python, django, flask, fastapi, frameworks, integration
---

## Django, Flask, and FastAPI Integration Patterns

Initialize the Velt SDK once at application startup, then use it across request handlers. Each framework has its own conventions for initialization and request handling.

**Django — Initialize in apps.py, use in views.py:**

```python
# myapp/apps.py
import os
from django.apps import AppConfig
from velt import VeltSdk, VeltSdkConfig, MongoDBConfig

class MyAppConfig(AppConfig):
    name = 'myapp'
    velt_sdk = None

    def ready(self):
        MyAppConfig.velt_sdk = VeltSdk(VeltSdkConfig(
            api_key=os.environ["VELT_API_KEY"],
            auth_token=os.environ["VELT_AUTH_TOKEN"],
            mongodb=MongoDBConfig(
                connection_string=os.environ["MONGODB_URI"]
            )
        ))
```

```python
# myapp/views.py
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from velt import GetCommentResolverRequest
from .apps import MyAppConfig

@csrf_exempt
def get_comments(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST required"}, status=405)

    body = json.loads(request.body)
    sdk = MyAppConfig.velt_sdk

    resolver_request = GetCommentResolverRequest(
        organization_id=body["organizationId"],
        document_id=body["documentId"]
    )

    response = sdk.selfHosting.comments.getComments(resolver_request)

    if response.success:
        return JsonResponse({"data": response.data})
    return JsonResponse({"error": response.error}, status=response.error_code)
```

**Flask — Initialize at module level:**

```python
import os
from flask import Flask, request, jsonify
from velt import VeltSdk, VeltSdkConfig, MongoDBConfig, GetCommentResolverRequest

app = Flask(__name__)

sdk = VeltSdk(VeltSdkConfig(
    api_key=os.environ["VELT_API_KEY"],
    auth_token=os.environ["VELT_AUTH_TOKEN"],
    mongodb=MongoDBConfig(
        connection_string=os.environ["MONGODB_URI"]
    )
))

@app.route("/api/comments/get", methods=["POST"])
def get_comments():
    body = request.json

    resolver_request = GetCommentResolverRequest(
        organization_id=body["organizationId"],
        document_id=body["documentId"]
    )

    response = sdk.selfHosting.comments.getComments(resolver_request)

    if response.success:
        return jsonify({"data": response.data})
    return jsonify({"error": response.error}), response.error_code
```

**FastAPI — Initialize at module level, use async endpoints:**

```python
import os
from fastapi import FastAPI, Request
from velt import VeltSdk, VeltSdkConfig, MongoDBConfig, GetCommentResolverRequest

app = FastAPI()

sdk = VeltSdk(VeltSdkConfig(
    api_key=os.environ["VELT_API_KEY"],
    auth_token=os.environ["VELT_AUTH_TOKEN"],
    mongodb=MongoDBConfig(
        connection_string=os.environ["MONGODB_URI"]
    )
))

@app.post("/api/comments/get")
async def get_comments(req: Request):
    body = await req.json()

    resolver_request = GetCommentResolverRequest(
        organization_id=body["organizationId"],
        document_id=body["documentId"]
    )

    response = sdk.selfHosting.comments.getComments(resolver_request)

    if response.success:
        return {"data": response.data}
    return {"error": response.error}
```

**Key points:**

- Initialize the SDK once at startup, not per-request. Reinitializing creates unnecessary MongoDB connections.
- Django requires `@csrf_exempt` on Velt endpoints since they receive POST requests from your frontend or webhooks.
- Django SDK init goes in `AppConfig.ready()` to run once when the app starts.
- Flask and FastAPI can initialize at module level since they have simpler lifecycles.
- All frameworks should load credentials from environment variables.

**Verification:**
- [ ] SDK is initialized once at application startup, not inside request handlers
- [ ] Django views use `@csrf_exempt` decorator
- [ ] Django init is in `AppConfig.ready()`, not at module level
- [ ] Credentials come from environment variables
- [ ] Endpoints use POST method
- [ ] Error responses include the error message from the SDK response

**Source Pointer:** `https://docs.velt.dev/api-reference/sdk/python/overview` (## Python SDK > ### Framework Integration)
