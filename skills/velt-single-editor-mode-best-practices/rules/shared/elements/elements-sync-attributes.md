---
title: Apply Sync Access Attributes to Native HTML Elements Only
impact: HIGH
impactDescription: Prevent broken element control when using customMode
tags: data-velt-sync-access, data-velt-sync-access-disabled, native HTML, React components, customMode
---

## Apply Sync Access Attributes to Native HTML Elements Only

When using `customMode: true`, fine-tune which elements are controlled by Single Editor Mode using `data-velt-sync-access` and `data-velt-sync-access-disabled` attributes. These attributes only work on **native HTML elements**, not React components.

**Incorrect (attributes on React components):**

```jsx
// data-velt-sync-access does NOT work on React components
<MyButton data-velt-sync-access="true">Edit</MyButton>
<CustomInput data-velt-sync-access="true" />
```

**Correct (attributes on native HTML elements):**

```jsx
// Enable sync access on native elements
<div data-velt-sync-access="true">
  <input type="text" placeholder="Controlled by SEM" />
  <button>Save</button>
</div>

// Exclude specific elements from SEM control
<div data-velt-sync-access="true">
  <input type="text" placeholder="Controlled" />
  <button data-velt-sync-access-disabled="true">
    Always clickable (e.g., help button)
  </button>
</div>
```

**Wrapping React components for SEM control:**

```jsx
// Wrap React components in native elements to apply the attribute
<div data-velt-sync-access="true">
  <MyButton>Edit</MyButton>  {/* Now controlled via parent div */}
</div>

// Or exclude a React component from control
<div data-velt-sync-access="true">
  <div data-velt-sync-access-disabled="true">
    <HelpWidget />  {/* Always interactive */}
  </div>
</div>
```

**Setup requirement:**

```jsx
// customMode must be true for manual element control
liveStateSyncElement.enableSingleEditorMode({
  customMode: true,  // SDK won't auto-manage read-only state
});
```

**Attributes:**

| Attribute | Purpose |
|-----------|---------|
| `data-velt-sync-access="true"` | Element is controlled by SEM (disabled for viewers) |
| `data-velt-sync-access-disabled="true"` | Element is excluded from SEM (always interactive) |

**Key details:**
- Both attributes only work on **native HTML elements** (div, button, input, etc.)
- Set `customMode: true` when using these attributes — the SDK won't auto-manage read-only state
- Use `data-velt-sync-access-disabled` to exclude elements like help buttons, navigation, or always-on controls
- Wrap React components in native elements if you need SEM control over them

**Verification:**
- [ ] Attributes applied only to native HTML elements, not React components
- [ ] `customMode: true` set in `enableSingleEditorMode()` config
- [ ] Elements that should always be interactive have `data-velt-sync-access-disabled`
- [ ] React components wrapped in native elements when SEM control needed

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Fine tune elements control; https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Notes
