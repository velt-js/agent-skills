---
title: Control Attachment Download Behavior and Intercept Clicks
impact: MEDIUM
impactDescription: Prevent automatic downloads and intercept attachment clicks for custom viewers, analytics, or access control
tags: attachment, download, attachmentDownload, enableAttachmentDownload, disableAttachmentDownload, attachmentDownloadClicked, event
---

## Control Attachment Download Behavior and Intercept Clicks

By default, clicking an attachment in a comment triggers a file download. Use `attachmentDownload` / `enableAttachmentDownload()` / `disableAttachmentDownload()` to suppress that behavior, and subscribe to the `attachmentDownloadClicked` event to handle every attachment click regardless of the download setting.

**Incorrect (no click interception, download cannot be suppressed):**

```jsx
// No control over attachment download — browser always triggers a download on click.
// Cannot open files in a custom viewer or log analytics.
<VeltComments />
```

**Correct (disable download, intercept clicks in React):**

```jsx
import { VeltComments, useVeltClient, useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

// Option A: Declarative prop — disable download via prop on <VeltComments>
<VeltComments attachmentDownload={false} />

// Option B: Imperative API — toggle download via commentElement methods
function AttachmentDownloadController() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Disable automatic download on attachment click
    commentElement.disableAttachmentDownload();

    return () => {
      // Re-enable when component unmounts if needed
      commentElement.enableAttachmentDownload();
    };
  }, [client]);

  return null;
}

// Listening to the attachmentDownloadClicked event (fires on every click)
function AttachmentClickListener() {
  const attachmentClickedEvent = useCommentEventCallback('attachmentDownloadClicked');

  useEffect(() => {
    if (attachmentClickedEvent) {
      const { annotationId, attachment } = attachmentClickedEvent;
      console.log('Attachment clicked on annotation:', annotationId);
      console.log('Attachment ID:', attachment.attachmentId);
      // Open in custom viewer, log analytics, or enforce access control here
    }
  }, [attachmentClickedEvent]);

  return null;
}
```

**Correct (disable download in HTML / Other Frameworks):**

```html
<!-- Declarative attribute -->
<velt-comments attachment-download="false"></velt-comments>
```

```typescript
// Imperative API methods (non-React)
const commentElement = Velt.getCommentElement();
commentElement.disableAttachmentDownload();
commentElement.enableAttachmentDownload();

// Event subscription
commentElement.on('attachmentDownloadClicked').subscribe((event) => {
  console.log('Attachment clicked on annotation:', event.annotationId);
  console.log('Attachment ID:', event.attachment.attachmentId);
});
```

**`attachmentDownload` Prop Reference:**

| Prop / Attribute | Type | Default | Description |
|---|---|---|---|
| `attachmentDownload` (React) | boolean | `true` | Controls whether clicking an attachment triggers a file download. Set to `false` to suppress download. |
| `attachment-download` (HTML) | string | `"true"` | Same control via HTML attribute. Use `"false"` to suppress download. |

**`AttachmentDownloadClickedEvent` Interface:**

```typescript
interface AttachmentDownloadClickedEvent {
  annotationId: string;               // ID of the comment annotation containing the attachment
  commentAnnotation: CommentAnnotation; // Full comment annotation object
  attachment: Attachment;             // Attachment object that was clicked
  metadata?: VeltEventMetadata;       // Optional event metadata
}
```

**Key Behaviors:**

- Download is enabled by default — no breaking change when upgrading.
- `attachmentDownloadClicked` fires on **every** attachment click, even when download is enabled.
- Use the event to open a custom file viewer, log analytics, or enforce access control without needing to disable downloads globally.
- `enableAttachmentDownload()` and `disableAttachmentDownload()` operate on `commentElement` obtained via `client.getCommentElement()` (React) or `Velt.getCommentElement()` (non-React).

**CSS State Classes:**

Velt applies the following CSS classes to composer attachment elements to reflect loading and edit-mode states. These classes allow styling attachment states without needing to use wireframes.

> **Shadow DOM note:** These classes live inside Velt's Shadow DOM by default. To target them with external CSS you must either disable Shadow DOM (`shadowDom={false}` / `shadow-dom="false"`) or use CSS custom properties. See the `ui-comment-dialog` rule for the Shadow DOM disable pattern.

```css
/* Base container class applied to every composer attachment wrapper */
.velt-composer-attachment-container {
  display: flex;
  gap: 8px;
}

/* Applied while the attachment is uploading or in a loading state */
.velt-composer-attachment--loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Applied when the comment composer is in edit mode */
.velt-composer-attachment--edit-mode {
  border: 1px solid var(--velt-edit-color);
}
```

<!-- TODO (v5.0.1-beta.2): Verify exact DOM element hierarchy for .velt-composer-attachment-container and whether shadowDom must be disabled to target these classes, or whether CSS custom properties suffice. Release note confirms classes exist and their semantic meaning but does not specify DOM depth or shadow DOM requirements. -->

**Verification Checklist:**
- [ ] `attachmentDownload={false}` or `disableAttachmentDownload()` called to suppress default download
- [ ] `attachmentDownloadClicked` event handler subscribed to handle click side-effects
- [ ] Subscription cleaned up on component unmount (non-React: `unsubscribe()`)
- [ ] Shadow DOM disabled (`shadowDom={false}`) if targeting CSS state classes with external stylesheets

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior/attachments - Attachment download control
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - `useCommentEventCallback` hook
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/styling - Shadow DOM and CSS customization
