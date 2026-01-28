# Attachments & Reactions

**Status:** Limited Documentation

This category covers file attachments and emoji reactions for Velt Comments.

## Available Information

### Reactions (VeltReactionTool)

Found in video player documentation at https://docs.velt.dev/async-collaboration/comments/setup/video-player-setup/custom-video-player-setup:

```jsx
import { VeltReactionTool } from '@veltdev/react';

<VeltReactionTool
  videoPlayerId={videoPlayerId}
  onReactionToolClick={() => onReactionToolClick()}
/>
```

The VeltReactionTool component:
- Enables adding reactions to video content
- Requires `videoPlayerId` prop
- Provides `onReactionToolClick` event handler

**For HTML:**
```html
<velt-reaction-tool video-player-id="videoPlayerId"></velt-reaction-tool>
```

## Source Pointers Searched

- https://docs.velt.dev/async-collaboration/comments/setup/video-player-setup/custom-video-player-setup - VeltReactionTool
- https://docs.velt.dev/async-collaboration/comments - General comments features

## Not Found / Unknown

The following features were searched but not documented:

### File Attachments
- Attaching files to comments
- Supported file types
- File size limits
- File storage configuration

### General Reactions
- Emoji reactions on comments (non-video)
- Reaction customization
- Reaction counts

## Recommendation

For attachments and reactions features:
- Check if your Velt plan includes these features
- Consult Velt support for availability
- Review the latest SDK release notes

## Usage Note

If you need reaction functionality outside of video players, or file attachments, these may require:
- Custom implementation using comment context/metadata
- Third-party file upload integration
- Contact with Velt for feature availability
