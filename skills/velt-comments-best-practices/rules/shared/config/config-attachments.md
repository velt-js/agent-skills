---
title: Configure Comment Attachments and File Uploads
impact: MEDIUM
impactDescription: Enable file attachments, screenshots, and manage uploaded files
tags: enableAttachments, disableAttachments, enableScreenshot, addAttachment, deleteAttachment, getAttachment, allowedFileTypes, setComposerFileAttachments, attachments
---

## Configure Comment Attachments and File Uploads

Enable file uploads in comments and control attachment behavior.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Enable/disable attachments feature
commentElement.enableAttachments();
commentElement.disableAttachments();

// Enable/disable screenshot capture
commentElement.enableScreenshot();
commentElement.disableScreenshot();

// Restrict allowed file types
commentElement.allowedFileTypes(['image/png', 'image/jpeg', 'application/pdf']);

// Add attachment programmatically
commentElement.addAttachment({
  annotationId: 'ann-123',
  commentId: 1,
  attachment: {
    name: 'design.png',
    url: 'https://example.com/design.png',
    mimeType: 'image/png',
    size: 204800,
  },
});

// Delete attachment
commentElement.deleteAttachment({
  annotationId: 'ann-123',
  commentId: 1,
  attachmentId: 'att-1',
});

// Get attachment data
const attachment = commentElement.getAttachment({
  annotationId: 'ann-123',
  commentId: 1,
  attachmentId: 'att-1',
});

// Pre-populate composer with attachments
commentElement.setComposerFileAttachments([file1, file2]);

// Show attachment filename in comment message
<VeltComments attachmentNameInMessage={true} />
```

**Key details:**
- Attachments are stored in `comment.attachments[]`
- `allowedFileTypes()` accepts MIME type strings
- `setComposerFileAttachments()` accepts File objects
- Download control is covered separately in the attachments rule (attach/attach-download-control.md)

**Verification:**
- [ ] Attachments enabled before file upload UI renders
- [ ] Allowed file types match application requirements
- [ ] Attachment IDs are valid for delete/get operations

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Attachments
