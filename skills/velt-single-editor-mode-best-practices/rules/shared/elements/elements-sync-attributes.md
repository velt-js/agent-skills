---
title: Apply Sync Access Attributes to Native HTML Elements Only
impact: HIGH
impactDescription: Prevent broken element control when using customMode
tags: data-velt-sync-access, data-velt-sync-access-disabled, native HTML, React components, customMode
---

## Apply Sync Access Attributes to Native HTML Elements Only

Fine-tune which elements Single Editor Mode controls with `data-velt-sync-access` and `data-velt-sync-access-disabled`. The attributes work in both modes, and are **required** with `customMode: true` because the SDK then no longer makes elements read-only on its own. They only work on **native HTML elements**, not React components.

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

**Custom mode:**

```jsx
// With customMode: true the SDK won't auto-manage read-only state,
// so every element you want locked for viewers needs data-velt-sync-access="true"
liveStateSyncElement.enableSingleEditorMode({
  customMode: true,
});
```

**Attributes:**

| Attribute | Purpose |
|-----------|---------|
| `data-velt-sync-access="true"` | Element is controlled by SEM (disabled for viewers) |
| `data-velt-sync-access-disabled="true"` | Element is excluded from SEM (always interactive) |

**Key details:**
- Both attributes only work on **native HTML elements** (div, button, input, etc.)
- With `customMode: false` (default) the SDK manages read-only state and the attributes refine it; with `customMode: true` you must mark controlled elements yourself
- Give elements with sync attributes an `id` for more robust syncing
- Use `data-velt-sync-access-disabled` to exclude elements like help buttons, navigation, or always-on controls
- Wrap React components in native elements if you need SEM control over them

**Verification:**
- [ ] Attributes applied only to native HTML elements, not React components
- [ ] With `customMode: true`, every element that viewers must not edit has `data-velt-sync-access="true"`
- [ ] Elements that should always be interactive have `data-velt-sync-access-disabled`
- [ ] React components wrapped in native elements when SEM control needed

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Fine tune elements control; https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Notes
