---
title: Attachments & Reactions
impact: MEDIUM
impactDescription: File attachment control and emoji reaction features
tags: attachments, reactions, file-upload, download
---

# Attachments & Reactions

This category covers file attachments and emoji reactions for Velt Comments.

## Where each topic lives

- **Attachment download control and click interception:** `attach-download-control.md` (`attachmentDownload`, `attachmentDownloadClicked`).
- **Enabling attachments, file-type limits, programmatic uploads:** `config/config-attachments.md` (`setAllowedFileTypes`, `addAttachment`, `setComposerFileAttachments`).
- **Comment reactions (enable, custom set, add / delete / toggle):** `config/config-reactions.md`.

## Video player reactions

`VeltReactionTool` adds reactions to video content and needs a `videoPlayerId`:

```jsx
import { VeltReactionTool } from '@veltdev/react';

<VeltReactionTool videoPlayerId={videoPlayerId} onReactionToolClick={() => onReactionToolClick()} />
```

```html
<velt-reaction-tool video-player-id="videoPlayerId"></velt-reaction-tool>
```

## Source Pointers

- https://docs.velt.dev/async-collaboration/comments/customize-behavior#attachments - Attachments
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#reactions - Reactions
- https://docs.velt.dev/async-collaboration/comments/setup/video-player-setup/custom-video-player-setup - VeltReactionTool
