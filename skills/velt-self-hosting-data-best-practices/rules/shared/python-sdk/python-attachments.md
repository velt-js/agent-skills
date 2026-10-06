---
title: Attachment Upload and Delete via Python SDK with S3
impact: HIGH
impactDescription: Wrong aws config keys or reading the multipart body as JSON make every attachment upload fail
tags: python, attachments, s3, upload, multipart, self-hosting, SaveAttachmentResolverRequest, DeleteAttachmentResolverRequest, from_dict
---

## Attachment Upload and Delete via Python SDK with S3

`sdk.selfHosting.attachments.saveAttachment` uploads the file to S3 and saves its metadata; `deleteAttachment` removes the S3 object and the metadata. Configure the `aws` block at `VeltSDK.initialize`. The save endpoint receives `multipart/form-data`: the file in the `file` field and the JSON request in the `request` field.

**Incorrect:**

```python
# WRONG aws keys: the SDK reads bucket_name / region / access_key_id / secret_access_key
sdk = VeltSDK.initialize({'aws': {'bucket': 'b', 'access_key': '...', 'secret_key': '...'}})

@app.route('/api/velt/attachments/save', methods=['POST'])
def save_attachment():
    body = request.json  # WRONG: attachment saves are multipart, not JSON
    return sdk.selfHosting.attachments.saveAttachment(body)
```

**Correct (S3 config):**

```python
import os
from velt_py import VeltSDK

sdk = VeltSDK.initialize({
    'database': {'connection_string': os.environ['VELT_MONGODB_URI']},
    'aws': {
        'bucket_name': os.environ['AWS_S3_BUCKET'],
        'region': os.environ.get('AWS_REGION', 'us-east-1'),
        'access_key_id': os.environ['AWS_ACCESS_KEY_ID'],
        'secret_access_key': os.environ['AWS_SECRET_ACCESS_KEY'],
    },
})
```

**Correct (Flask save and delete):**

```python
import json
from flask import request, jsonify
from velt_py import SaveAttachmentResolverRequest, DeleteAttachmentResolverRequest

@app.route('/api/velt/attachments/save', methods=['POST'])
def save_attachment():
    file = request.files.get('file')
    request_json = request.form.get('request')
    if not file or not request_json:
        return jsonify({'success': False, 'error': 'File and request JSON are required',
                        'errorCode': 'INVALID_INPUT', 'statusCode': 400}), 400

    save_request = SaveAttachmentResolverRequest.from_dict(json.loads(request_json))
    result = sdk.selfHosting.attachments.saveAttachment(
        save_request,
        file_data=file.read(),        # bytes
        file_name=file.filename,
        mime_type=file.content_type,
    )
    return jsonify(result), result.get('statusCode', 200)

@app.route('/api/velt/attachments/delete', methods=['POST'])
def delete_attachment():
    delete_request = DeleteAttachmentResolverRequest.from_dict(request.json)  # delete is JSON
    result = sdk.selfHosting.attachments.deleteAttachment(delete_request)
    return jsonify(result), result.get('statusCode', 200)
```

In Django read `request.FILES.get('file')` and `request.POST.get('request')`; in FastAPI declare `file: UploadFile = File(...)` and `request: str = Form(...)` and `await file.read()`.

**Key points:**

- `saveAttachment(request, file_data=..., file_name=..., mime_type=...)`: the typed request first, then the file as keyword arguments. Read the file as bytes.
- Only the save endpoint is multipart; delete receives JSON.
- The S3 bucket must exist and the credentials need `s3:PutObject` and `s3:DeleteObject`.
- Return the SDK result dict unchanged so the frontend gets `success`, `statusCode`, and `data`.

**Verification:**
- [ ] `aws` uses `bucket_name`, `region`, `access_key_id`, `secret_access_key`
- [ ] The save route parses multipart (`file` + `request` JSON string); the delete route parses JSON
- [ ] Requests are built with `SaveAttachmentResolverRequest.from_dict(...)` / `DeleteAttachmentResolverRequest.from_dict(...)`
- [ ] `file_data` is bytes and `mime_type` comes from the upload
- [ ] The response dict is returned as-is with its `statusCode`

**Source Pointers:**
- https://docs.velt.dev/backend-sdks/python#attachments - "Attachments" (saveAttachment, deleteAttachment; Django, Flask, FastAPI tabs)
- https://docs.velt.dev/backend-sdks/python#self-hosting-configuration - "AWS (Attachments)"
