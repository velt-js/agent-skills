---
title: Customize the Single Editor Mode Panel with Wireframes
impact: MEDIUM
impactDescription: Restyle or rearrange the default editor/viewer panel without rebuilding the access-request flow
tags: ui, wireframe, VeltSingleEditorModePanel, VeltSingleEditorModePanelWireframe, velt-single-editor-mode-panel, shadowDom, darkMode, variant
---

## Customize the Single Editor Mode Panel with Wireframes

The default panel (`VeltSingleEditorModePanel` / `<velt-single-editor-mode-panel>`) shows the user's editor or viewer status, access requests, the request countdown, and accept/reject controls. To change its look or layout, define a `VeltSingleEditorModePanelWireframe` inside `VeltWireframe` instead of rebuilding the flow with the APIs.

**Why this matters:**

A custom panel built from scratch must re-implement request, cancel, accept, reject, countdown, and "edit here" states. The wireframe keeps that logic and lets you change only the markup and styling.

**Incorrect (wireframe outside the wrapper, styling the shadow DOM from outside):**

```jsx
<VeltSingleEditorModePanelWireframe>
  <VeltSingleEditorModePanelWireframe.RequestAccess />
</VeltSingleEditorModePanelWireframe>
<VeltSingleEditorModePanel /> {/* shadowDom defaults to true; your CSS cannot reach inside */}
```

**Correct (React / Next.js):**

```jsx
"use client";
import {
  VeltWireframe,
  VeltSingleEditorModePanel,
  VeltSingleEditorModePanelWireframe,
} from "@veltdev/react";

function SingleEditorPanel() {
  return (
    <>
      <VeltWireframe>
        <VeltSingleEditorModePanelWireframe>
          <VeltSingleEditorModePanelWireframe.ViewerText />
          <VeltSingleEditorModePanelWireframe.EditorText />
          <VeltSingleEditorModePanelWireframe.Countdown />
          {/* Editor sees this when editing in a different tab */}
          <VeltSingleEditorModePanelWireframe.EditHere />
          {/* Editor sees these when a viewer requests access */}
          <VeltSingleEditorModePanelWireframe.AcceptRequest />
          <VeltSingleEditorModePanelWireframe.RejectRequest />
          {/* Viewer sees this by default */}
          <VeltSingleEditorModePanelWireframe.RequestAccess />
          {/* Viewer sees this after requesting access */}
          <VeltSingleEditorModePanelWireframe.CancelRequest />
        </VeltSingleEditorModePanelWireframe>
      </VeltWireframe>

      <VeltSingleEditorModePanel shadowDom={false} darkMode={false} />
    </>
  );
}
```

**Correct (Other Frameworks):**

```html
<velt-wireframe style="display:none;">
  <velt-single-editor-mode-panel-wireframe>
    <velt-single-editor-mode-panel-viewer-text-wireframe></velt-single-editor-mode-panel-viewer-text-wireframe>
    <velt-single-editor-mode-panel-editor-text-wireframe></velt-single-editor-mode-panel-editor-text-wireframe>
    <velt-single-editor-mode-panel-countdown-wireframe></velt-single-editor-mode-panel-countdown-wireframe>
    <velt-single-editor-mode-panel-edit-here-wireframe></velt-single-editor-mode-panel-edit-here-wireframe>
    <velt-single-editor-mode-panel-accept-request-wireframe></velt-single-editor-mode-panel-accept-request-wireframe>
    <velt-single-editor-mode-panel-reject-request-wireframe></velt-single-editor-mode-panel-reject-request-wireframe>
    <velt-single-editor-mode-panel-request-access-wireframe></velt-single-editor-mode-panel-request-access-wireframe>
    <velt-single-editor-mode-panel-cancel-request-wireframe></velt-single-editor-mode-panel-cancel-request-wireframe>
  </velt-single-editor-mode-panel-wireframe>
</velt-wireframe>

<velt-single-editor-mode-panel shadow-dom="false"></velt-single-editor-mode-panel>
```

**Panel props:**

| React prop | HTML attribute | Default | Use |
|---|---|---|---|
| `shadowDom` | `shadow-dom` | `true` | Set `false` to style the panel with your own CSS |
| `darkMode` | `dark-mode` | `false` | Dark theme |
| `variant` | `variant` | none | Use a named wireframe variant (`variant="custom-ui"`) |

**Key details:**

- Show the panel with `enableDefaultSingleEditorUI()` (enabled by default) and/or by rendering the panel component
- Only build fully custom UI (with `disableDefaultSingleEditorUI()` plus the editor/viewer APIs) when the wireframe cannot express your design
- Omit a sub-component from the wireframe to hide that part of the panel

**Verification:**
- [ ] Wireframe is inside `VeltWireframe` / `<velt-wireframe style="display:none;">`
- [ ] `VeltSingleEditorModePanel` is rendered (or the default UI is enabled)
- [ ] `shadowDom={false}` is set when applying custom CSS
- [ ] Viewer request, editor accept/reject, countdown, and "edit here" states were tested with two users and two tabs

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/single-editor-mode - "VeltSingleEditorModePanelWireframe", "Styling", "Variants"
- https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior#enabledefaultsingleeditorui - "enableDefaultSingleEditorUI"
- https://docs.velt.dev/ui-customization/wireframes/layout-customization#create-custom-variants - "Create Custom Variants"
