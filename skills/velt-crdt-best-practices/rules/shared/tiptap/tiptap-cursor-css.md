---
title: Add CSS for Collaboration Cursors in Tiptap
impact: CRITICAL
impactDescription: Without this CSS, remote user cursors render as thick full-width blocks instead of thin carets
tags: tiptap, css, cursor, caret, styling, y-prosemirror, ProseMirror-yjs-cursor
---

## Add CSS for Collaboration Cursors in Tiptap

Add CSS styles to make collaboration cursors/carets visible as thin lines. Without styling, cursors appear as thick full-width blocks.

**Which class names to target depends on the integration:**
- **Velt CRDT (`@veltdev/tiptap-crdt-react`)** uses `y-prosemirror` internally, which renders `.ProseMirror-yjs-cursor` elements
- **Tiptap Collaboration Cursor (`@tiptap/extension-collaboration-cursor`)** renders `.collaboration-cursor__caret` elements

Include CSS for **both** patterns to cover all integrations.

**Required CSS (add to `globals.css`):**

```css
/* ===== y-prosemirror cursors (used by Velt CRDT) ===== */

/* Thin caret line */
.ProseMirror .ProseMirror-yjs-cursor {
  position: relative;
  border-left: 2px solid #0d0d0d;
  border-right: none;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  word-break: normal;
}

/* Force the inner span to inline so cursor doesn't expand to full width */
.ProseMirror .ProseMirror-yjs-cursor > span {
  display: inline !important;
}

/* Floating username label above the caret */
.ProseMirror .ProseMirror-yjs-cursor > div {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-weight: 600;
  font-style: normal;
  line-height: normal;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
  color: white;
  white-space: nowrap;
  user-select: none;
}

/* Selection highlight for remote users */
.ProseMirror .ProseMirror-yjs-selection {
  opacity: 0.3;
}

/* ===== Tiptap collaboration-cursor extension (alternative integration) ===== */

.ProseMirror .collaboration-cursor__caret,
.ProseMirror .collaboration-carets__caret {
  border-left: 1px solid #0d0d0d !important;
  border-right: 1px solid #0d0d0d !important;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}

/* Username label above the caret */
.ProseMirror .collaboration-cursor__label,
.ProseMirror .collaboration-carets__label {
  border-radius: 3px 3px 3px 0;
  color: #0d0d0d;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  left: -1px;
  line-height: normal;
  padding: 0.1rem 0.3rem;
  position: absolute;
  top: -1.4em;
  user-select: none;
  white-space: nowrap;
}
```

The `!important` flags and `.ProseMirror` parent selector are required because y-prosemirror applies inline `background-color` styles that override class-based styling without them. The `> span { display: inline !important }` rule is critical for the y-prosemirror integration — without it, the cursor span renders as a block element spanning the full editor width.

**Where to add:**
- Global CSS file (e.g., `globals.css`) — recommended
- CSS module imported in editor component
- Styled-components / Emotion styles

**Optional: Custom cursor colors per user:**

```css
/* y-prosemirror: colors are set via inline styles by the extension */
/* Tiptap collaboration-cursor: override with data attributes */
.collaboration-cursor__caret[data-user-id="user-1"] {
  border-color: #3b82f6;
}
.collaboration-cursor__label[data-user-id="user-1"] {
  background-color: #3b82f6;
  color: white;
}
```

**Verification:**
- [ ] CSS is loaded in the page (check DevTools → Elements → Styles)
- [ ] Remote user cursors visible as thin carets (not thick blocks)
- [ ] Cursor is 1-2px wide, not full editor width
- [ ] Username labels appear floating above cursors
- [ ] Cursors track remote user positions in real-time
- [ ] Selection highlights are semi-transparent

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 4: Add CSS for Collaboration Cursor)
