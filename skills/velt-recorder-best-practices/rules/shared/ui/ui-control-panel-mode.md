---
title: Choose Floating vs Thread Mode for Control Panel
impact: MEDIUM
impactDescription: Controls where the recording preview appears during active recording
tags: mode, floating, thread, VeltRecorderControlPanel, layout
---

## Choose Floating vs Thread Mode for Control Panel

VeltRecorderControlPanel has two display modes that determine where the recording preview and controls appear. Choose the right mode for your layout.

**Incorrect (using default floating mode in a thread/chat context):**

```jsx
// Default 'floating' mode renders at bottom-left corner,
// ignoring DOM position — wrong for inline chat or form layouts
<div className="chat-message">
  <VeltRecorderControlPanel />
</div>
```

**Correct (explicit mode selection):**

```jsx
{/* Floating mode — renders at bottom-left corner of the viewport
    regardless of where the component is placed in the DOM */}
<VeltRecorderControlPanel mode="floating" />

{/* Thread mode — renders exactly where placed in the DOM,
    useful for inline/chat layouts */}
<div className="message-composer">
  <VeltRecorderControlPanel mode="thread" />
</div>
```

**For HTML:**

```html
<!-- Floating: viewport overlay -->
<velt-recorder-control-panel mode="floating"></velt-recorder-control-panel>

<!-- Thread: inline at DOM position -->
<velt-recorder-control-panel mode="thread"></velt-recorder-control-panel>
```

**Key details:**
- `floating` (default) — always renders at the bottom-left corner of the viewport, regardless of DOM position
- `thread` — renders exactly where the component is placed in the DOM tree
- Use `floating` for general-purpose recording UIs
- Use `thread` for inline contexts like chat threads, forms, or comment composers

**Verification:**
- [ ] Mode explicitly set based on layout requirements
- [ ] `thread` mode used when control panel should appear inline
- [ ] `floating` mode used when viewport overlay is preferred

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - mode
