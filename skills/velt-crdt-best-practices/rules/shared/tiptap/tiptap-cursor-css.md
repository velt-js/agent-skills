---
title: Add CSS for Collaboration Cursors in Tiptap
impact: MEDIUM
impactDescription: Makes remote user cursors visible
tags: tiptap, css, cursor, caret, styling
---

## Add CSS for Collaboration Cursors in Tiptap

Add CSS styles to make collaboration cursors/carets visible. Without styling, you won't see where other users are typing.

**Required CSS:**

```css
/* Collaboration cursor styling */
.collaboration-cursor__caret,
.collaboration-carets__caret {
  border-left: 1px solid #0d0d0d;
  border-right: 1px solid #0d0d0d;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}

/* Username label above the caret */
.collaboration-cursor__label,
.collaboration-carets__label {
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

**Where to add:**
- Global CSS file (e.g., `globals.css`)
- CSS module imported in editor component
- Styled-components / Emotion styles

**Optional: Custom cursor colors per user:**

```css
/* Override with user-specific colors */
.collaboration-cursor__caret[data-user-id="user-1"] {
  border-color: #3b82f6;
}
.collaboration-cursor__label[data-user-id="user-1"] {
  background-color: #3b82f6;
  color: white;
}
```

**Verification:**
- [ ] CSS is loaded in the page
- [ ] Remote user cursors visible as colored carets
- [ ] Username labels appear above cursors
- [ ] Cursors track remote user positions

**Source Pointer:** `https://docs.velt.dev/realtime-collaboration/crdt/setup/tiptap` (### Step 4: Add CSS for Collaboration Cursor)
