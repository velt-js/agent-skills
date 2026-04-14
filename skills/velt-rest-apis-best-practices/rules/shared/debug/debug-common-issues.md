---
title: Troubleshooting Common Backend Integration Issues
impact: LOW-MEDIUM
impactDescription: Fast diagnosis of common errors prevents extended debugging sessions
tags: debug, troubleshooting, errors, auth, webhooks
---

## Troubleshooting Common Backend Integration Issues

### Issue 1: 401 Unauthorized on REST API Calls

**Symptom:** REST API returns `401 Unauthorized` or `403 Forbidden`.

**Cause:** Missing or incorrect authentication headers.

**Incorrect:**

```bash
# Missing required headers
curl -X POST https://api.velt.dev/v2/commentannotations/get \
  -H "Content-Type: application/json" \
  -d '{"data": {"organizationId": "org-123", "documentId": "doc-456"}}'
```

**Correct:**

```bash
curl -X POST https://api.velt.dev/v2/commentannotations/get \
  -H "Content-Type: application/json" \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -d '{"data": {"organizationId": "org-123", "documentId": "doc-456"}}'
```

**Fix:** Ensure both `x-velt-api-key` and `x-velt-auth-token` headers are present on every request. Get values from Velt Console > Configuration.

### Issue 2: JWT Token Expired

**Symptom:** Frontend authentication fails after working initially. Error event `token_expired` fires.

**Cause:** JWT tokens expire after 48 hours.

**Correct (regenerate on expiry):**

```javascript
const veltClient = useVeltClient();

useEffect(() => {
  if (veltClient) {
    veltClient.on("token_expired", async () => {
      const response = await fetch("/api/velt/token", {
        method: "POST",
        body: JSON.stringify({ userId: currentUser.id })
      });
      const { token } = await response.json();
      veltClient.setAuthToken(token);
    });
  }
}, [veltClient]);
```

**Fix:** Listen for the `token_expired` event on the frontend and call your backend to generate a fresh JWT token. Tokens last 48 hours from creation.

### Issue 3: Python SDK Returns INVALID_INPUT

**Symptom:** Python SDK operations return an `INVALID_INPUT` error.

**Cause:** Request type imports do not match the operation being performed.

**Incorrect:**

```python
from velt import GetCommentsRequest

# Wrong request type for saving
request = GetCommentsRequest(
    organization_id="org-123",
    document_id="doc-456"
)
sdk.save_comments(request)  # INVALID_INPUT — wrong request type
```

**Correct:**

```python
from velt import SaveCommentsRequest

request = SaveCommentsRequest(
    organization_id="org-123",
    document_id="doc-456",
    comments=[...]
)
sdk.save_comments(request)
```

**Fix:** Verify that the imported request type matches the SDK method. Each method has a corresponding request class: `GetCommentsRequest` for `get_comments()`, `SaveCommentsRequest` for `save_comments()`, etc.

### Issue 4: Webhook Not Firing

**Symptom:** Your webhook endpoint never receives events.

**Cause:** URL not configured or endpoint not returning 2xx.

**Diagnosis checklist:**

1. Verify the webhook URL is set in Velt Console > Configurations > Webhook Service.
2. Confirm the URL is publicly accessible (not localhost).
3. Check that your endpoint returns a 2xx status code.
4. For v2 webhooks, verify event type filters include the events you expect.
5. Test with a service like webhook.site to confirm Velt is sending events.

**Correct (minimal endpoint that always returns 200):**

```javascript
app.post("/velt/webhook", (req, res) => {
  console.log("Received webhook:", JSON.stringify(req.body));
  res.status(200).send("OK");
});
```

### Issue 5: S3 Upload Failing

**Symptom:** Attachment uploads fail or return permission errors.

**Cause:** AWS credentials in SDK config are invalid or missing required S3 permissions.

**Diagnosis checklist:**

1. Verify `S3Config` has correct `region`, `access_key`, `secret_key`, and `bucket`.
2. Confirm the IAM user/role has `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` permissions on the bucket.
3. Check the bucket exists in the specified region.
4. Ensure CORS is configured on the bucket if uploads originate from the browser.

**Correct (S3 config with env vars):**

```python
from velt import S3Config

s3 = S3Config(
    region=os.environ["AWS_REGION"],
    access_key=os.environ["AWS_ACCESS_KEY_ID"],
    secret_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    bucket=os.environ["VELT_S3_BUCKET"]
)
```

**Verification:**
- [ ] REST API calls include both `x-velt-api-key` and `x-velt-auth-token` headers
- [ ] JWT token refresh is handled via `token_expired` event listener
- [ ] Python SDK request types match the method being called
- [ ] Webhook endpoint is publicly accessible and returns 2xx
- [ ] S3 credentials have the required IAM permissions

**Source Pointer:** `https://docs.velt.dev/api-reference/rest-api/overview` (## REST API > ### Authentication & Troubleshooting)
