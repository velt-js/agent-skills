---
title: Use Text Mode for Text Highlight Comments
impact: HIGH
impactDescription: Comments attached to selected text, like Google Docs highlighting
tags: text, highlight, selection, text-mode, annotation
---

## Use Text Mode for Text Highlight Comments

Text mode allows users to select text and attach comments to the selection. This is enabled by default and works similarly to Google Docs text comments.

**Incorrect (text mode disabled unintentionally):**

```jsx
// Text mode disabled - users can't highlight to comment
<VeltComments textMode={false} />
```

**Correct (text mode enabled - default behavior):**

```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments textMode={true} />

      <article>
        <p>Select any text in this paragraph to add a comment...</p>
      </article>
    </VeltProvider>
  );
}
```

**How Text Mode Works:**
1. User selects text on the page
2. Comment Tool button appears near the selection
3. User clicks to add a comment
4. Comment is attached to the highlighted text
5. Text selection is visually marked

**For HTML:**

```html
<velt-comments text-mode="true"></velt-comments>

<article>
  <p>Select any text to add a comment...</p>
</article>
```

**Disable Text Mode (when using editor integrations):**

When using TipTap, SlateJS, or Lexical integrations, disable native text mode:

```jsx
// Disable for editor integrations
<VeltComments textMode={false} />
```

**Combining with Stream Mode:**

Text mode works well with Stream mode for a Google Docs-like experience:

```jsx
<VeltComments
  textMode={true}
  streamMode={true}
  streamViewContainerId="document-container"
/>
```

**Verification Checklist:**
- [ ] `textMode={true}` (or omitted - it's default)
- [ ] Selecting text shows Comment Tool
- [ ] Comments attach to selected text
- [ ] Highlighted text is visually marked

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/text.mdx` - Complete setup
