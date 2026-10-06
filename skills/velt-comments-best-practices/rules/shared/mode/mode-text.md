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

When using TipTap, SlateJS, Lexical, or other editor integrations, disable native text mode. Since v6.0.16-beta.1, default text and pin comments are disabled inside TipTap and other ProseMirror-based editors regardless, so use the dedicated plugin there.

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

**Keep highlights on their original anchor (`restrictTextSearchToAnchor`, v6.0.0-beta.3+):**

When the commented text can no longer be found in its anchor element, the SDK by default searches wider (`document.body`, or the location element for location-scoped comments) before ghosting the comment. Turn this off when the same text appears in several regions and a comment must never re-bind elsewhere:

```jsx
<VeltComments restrictTextSearchToAnchor={true} />
// or
const commentElement = client.getCommentElement();
commentElement.enableRestrictTextSearchToAnchor();
```

```html
<velt-comments restrict-text-search-to-anchor="true"></velt-comments>
```

**Programmatic text comments:** `commentElement.addCommentOnSelectedText()` comments on the current selection; `addCommentOnElement({ targetElement: { elementId, targetText, occurrence } })` targets a specific occurrence. To attach a known annotation to text in your own markup, wrap it in `VeltCommentText` (see `standalone-comment-text.md`).

**Verification Checklist:**
- [ ] `restrictTextSearchToAnchor` enabled only when wider re-binding would attach comments to the wrong text
- [ ] `textMode={true}` (or omitted - it's default)
- [ ] Selecting text shows Comment Tool
- [ ] Comments attach to selected text
- [ ] Highlighted text is visually marked

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/text - Complete setup
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#restricttextsearchtoanchor - restrictTextSearchToAnchor
