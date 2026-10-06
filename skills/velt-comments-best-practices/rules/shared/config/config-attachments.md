---
title: Configure Comment Attachments and File Uploads
impact: MEDIUM
impactDescription: Enable file attachments, screenshots, and manage uploaded files
tags: enableAttachments, disableAttachments, enableScreenshot, addAttachment, deleteAttachment, getAttachment, allowedFileTypes, setAllowedFileTypes, setComposerFileAttachments, attachmentNameInMessage, useAddAttachment, attachments
---

## Configure Comment Attachments and File Uploads

Attachments are on by default. File-type restrictions use **extensions** through `setAllowedFileTypes()` (there is no `allowedFileTypes()` method), and programmatic uploads pass `File` objects in a `files` array. Building an attachment object with a `url` by hand does not upload anything.

**Incorrect (invented method and payloads):**

```jsx
commentElement.allowedFileTypes(['image/png', 'application/pdf']);   // no such method; MIME types
commentElement.addAttachment({ annotationId: 'ann-123', attachment: { url: '...' } });
commentElement.setComposerFileAttachments([file1, file2]);             // needs { files }
```

**Correct:**

```jsx
const commentElement = client.getCommentElement();

commentElement.enableAttachments();   // default true
commentElement.enableScreenshot();    // default false

// Restrict by file extension (default: png, jpg, gif, svg up to 15MB per file)
commentElement.setAllowedFileTypes(['jpg', 'png']);

// Upload File objects to an existing thread
const responses = await commentElement.addAttachment({
  annotationId: 'ANNOTATION_ID',
  files: [file1, file2],
});

// Delete / list attachments on a comment (commentId is a number)
await commentElement.deleteAttachment({ annotationId: 'ANNOTATION_ID', commentId: 1, attachmentId: 'ATTACHMENT_ID' });
const attachments = await commentElement.getAttachment({ annotationId: 'ANNOTATION_ID', commentId: 1 });

// Pre-fill a composer with files (new composer, existing thread, or element-bound composer)
commentElement.setComposerFileAttachments({ files: [file1, file2] });
commentElement.setComposerFileAttachments({ files: [file1], annotationId: 'annotation-123' });
commentElement.setComposerFileAttachments({ files: [file1], targetElementId: 'element-1' });
```

```jsx
// Props
<VeltComments attachments={true} screenshot={true} allowedFileTypes={['jpg', 'png']} attachmentNameInMessage={true} />
```

```html
<velt-comments allowed-file-types="['jpg', 'png']" attachment-name-in-message="true"></velt-comments>
```

React hooks: `useAddAttachment()`, `useDeleteAttachment()`, `useGetAttachment()` (each returns the matching method, for example `const { addAttachment } = useAddAttachment();`).

**Key details:**
- `getAttachment()` returns `Attachment[]` for the comment.
- Download control and click interception are covered in `attach/attach-download-control.md`.
- In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Verification:**
- [ ] `setAllowedFileTypes()` (or the `allowedFileTypes` prop) uses extensions, not MIME types
- [ ] `addAttachment()` and `setComposerFileAttachments()` pass `files: File[]`
- [ ] `deleteAttachment()` includes `annotationId`, `commentId`, and `attachmentId`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#attachments - Attachments
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#setcomposerfileattachments - setComposerFileAttachments
- https://docs.velt.dev/api-reference/sdk/models/data-models#uploadfiledata - UploadFileData
