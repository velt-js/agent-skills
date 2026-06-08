---
title: Add Share & Invite with VeltUserInviteTool
impact: MEDIUM
impactDescription: VeltUserInviteTool provides a ready-made invite widget for sharing documents with collaborators; without it, developers build custom invite flows that miss Velt's built-in access control integration
tags: share, invite, VeltUserInviteTool, velt-user-invite-tool, collaboration, access-control, permission, slot, parts, CSS
---

## Add Share & Invite with VeltUserInviteTool

`VeltUserInviteTool` is a drop-in widget that lets users invite others to collaborate on the current document. It handles the invite flow (email input, role selection, sending) and integrates with Velt's access control system automatically.

### Setup

**React / Next.js:**

```jsx
import { VeltUserInviteTool } from '@veltdev/react';

function Toolbar() {
  return (
    <div className="toolbar">
      <VeltUserInviteTool />
    </div>
  );
}
```

**HTML:**

```html
<velt-user-invite-tool></velt-user-invite-tool>
```

Place the component wherever you want the invite button to appear — typically in a toolbar or header alongside other collaboration controls like `VeltPresence` and `VeltSidebarButton`.

### Customize the Button with Slots

Replace the default invite button with your own template using the `button` slot:

**React:**

```jsx
<VeltUserInviteTool>
  <button slot="button">Share & Invite</button>
</VeltUserInviteTool>
```

**HTML:**

```html
<velt-user-invite-tool>
  <button slot="button">Share & Invite</button>
</velt-user-invite-tool>
```

The slot replaces only the trigger button — the invite dialog UI is still managed by Velt.

### Style with CSS Parts

The component uses Shadow DOM. Target internal elements with `::part()`:

| Part | Description |
|------|-------------|
| `container` | The invite tool outer container |
| `button-container` | The button wrapper |
| `button-icon` | The SVG icon inside the button |

```css
velt-user-invite-tool::part(button-icon) {
  width: 1.5rem;
  height: 1.5rem;
}

velt-user-invite-tool::part(button-container) {
  border-radius: 8px;
  background: #2563eb;
  color: white;
}
```

### Verification

- [ ] `VeltUserInviteTool` is placed inside the VeltProvider tree
- [ ] A document is set via `setDocument()` before the invite tool is used
- [ ] Clicking the button opens the invite dialog
- [ ] Invited users receive access to the document

**Source Pointers:**
- `https://docs.velt.dev/permission-management/share-and-invite/overview` — Feature overview
- `https://docs.velt.dev/permission-management/share-and-invite/setup` — Setup steps
- `https://docs.velt.dev/permission-management/share-and-invite/customize-ui/parts` — CSS parts reference
- `https://docs.velt.dev/permission-management/share-and-invite/customize-ui/slots` — Slot customization
