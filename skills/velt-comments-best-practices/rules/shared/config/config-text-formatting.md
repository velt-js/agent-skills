---
title: Configure Rich Text Formatting in Comment Composer
impact: LOW
impactDescription: Control which text formatting options are available in the comment composer
tags: enableFormatOptions, setFormatConfig, formatting, bold, italic, link, blockquote, code
---

## Configure Rich Text Formatting in Comment Composer

Control which rich text formatting options appear in the comment composer toolbar.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Enable rich text toolbar
commentElement.enableFormatOptions();

// Configure which formats are available
commentElement.setFormatConfig({
  bold: true,
  italic: true,
  link: true,
  blockquote: true,
  strikethrough: true,
  codeBlock: true,
  heading: false,       // Disable headings
  list: true,           // Bullet list
  orderedList: true,    // Numbered list
});
```

**Key details:**
- `enableFormatOptions()` must be called to show the toolbar
- `setFormatConfig()` controls individual format availability
- All options default to `true` when format options are enabled
- Set specific options to `false` to hide them from the toolbar

**Verification:**
- [ ] `enableFormatOptions()` called before rendering
- [ ] Format config matches application requirements

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - Text Formatting
