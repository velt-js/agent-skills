---
title: Attachment Upload and Delete via Python SDK with S3
impact: HIGH
impactDescription: Missing S3 configuration or incorrect file parameters cause upload failures
tags: python, attachments, s3, upload, self-hosting
---

## Attachment Upload and Delete via Python SDK with S3

Attachment operations require S3 to be configured during SDK initialization. The save method accepts file data alongside the request object, while delete removes files from both the database and S3.

**Incorrect (attempting attachment operations without S3 config):**

```python
from velt import VeltSdk, VeltSdkConfig, MongoDBConfig

# Missing S3 config — attachment operations will fail
config = VeltSdkConfig(
    api_key="your_api_key",
    auth_token="your_auth_token",
    mongodb=MongoDBConfig(
        connection_string="mongodb+srv://user:pass@cluster.mongodb.net/velt_db"
    )
)

sdk = VeltSdk(config)
# sdk.selfHosting.attachments.saveAttachment(...) will raise an error
```

**Correct (SDK init with S3 for attachments):**

```python
from velt import VeltSdk, VeltSdkConfig, MongoDBConfig, S3Config

config = VeltSdkConfig(
    api_key="your_api_key",
    auth_token="your_auth_token",
    mongodb=MongoDBConfig(
        connection_string="mongodb+srv://user:pass@cluster.mongodb.net/velt_db"
    ),
    s3=S3Config(
        region="us-east-1",
        access_key="AKIA...",
        secret_key="secret...",
        bucket="velt-attachments"
    )
)

sdk = VeltSdk(config)
```

**Correct (upload an attachment):**

```python
from velt import SaveAttachmentResolverRequest

# Read file data as bytes
with open("report.pdf", "rb") as f:
    file_data = f.read()

request = SaveAttachmentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comment_id="comment_1"
)

response = sdk.selfHosting.attachments.saveAttachment(
    request,
    file_data=file_data,
    file_name="report.pdf",
    mime_type="application/pdf"
)

if response.success:
    attachment_url = response.data
    print(f"Uploaded: {attachment_url}")
else:
    print(f"Upload failed: {response.error}")
```

**Correct (delete an attachment):**

```python
from velt import DeleteAttachmentResolverRequest

request = DeleteAttachmentResolverRequest(
    organization_id="org_123",
    document_id="doc_456",
    comment_id="comment_1",
    attachment_id="attachment_789"
)

response = sdk.selfHosting.attachments.deleteAttachment(request)

if response.success:
    print("Attachment deleted from database and S3")
```

**Key points:**

- S3 config (`region`, `access_key`, `secret_key`, `bucket`) must be provided at SDK init time. Without it, all attachment operations fail.
- `saveAttachment` takes four arguments: the request object, `file_data` (bytes), `file_name` (string), and `mime_type` (string).
- `deleteAttachment` removes the file from both MongoDB and S3.
- The S3 bucket must exist and the IAM credentials must have `s3:PutObject` and `s3:DeleteObject` permissions.
- File data should be read as bytes (`"rb"` mode), not as a string.

**Verification:**
- [ ] S3Config is included in VeltSdkConfig initialization
- [ ] S3 bucket exists and IAM credentials have correct permissions
- [ ] File data is read as bytes, not text
- [ ] `mime_type` matches the actual file type
- [ ] Response `success` is checked before using the returned URL
- [ ] Delete operations specify `attachment_id`

**Source Pointer:** `https://docs.velt.dev/api-reference/sdk/python/attachments` (## Python SDK > ### Attachments)
