---
title: Bind Cursors Wireframe Slots Using componentConfig Template Variables
impact: MEDIUM
impactDescription: Drives dynamic pointer content, conditional rendering, and class toggling inside Cursors wireframe slots without manual subscriptions
tags: wireframe, template-variables, velt-data, velt-if, velt-class, componentConfig, flat-config, cursor-pointer, cursors
---

## Bind Cursors Wireframe Slots Using componentConfig Template Variables

The Cursors wireframe exposes a fixed set of template variables that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var}"` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Live Cursors uses the **flat-config** access pattern: variables are addressed via the explicit `componentConfig.<path>` form, **not** short names. The orchestrating `<velt-cursor>` element is not itself wireframed — only the per-user `<velt-cursor-pointer-wireframe>` is customizable, and its `componentConfig` is **per-user** (one instance per remote cursor).

Do not rebuild pointer state from `useCursorUsers` or use short-name variable lookups. The wireframe already supplies each pointer's data via `componentConfig.<path>`.

**Correct (read the per-user `componentConfig` via `VeltData` / `velt-if` / `velt-class`):**

```jsx
<VeltCursorPointerWireframe>
  <div className="my-cursor" style={{ background: '{componentConfig.cursorUser.color}' }}>
    <span className="my-cursor__name" style={{ color: '{componentConfig.getTextColor()}' }}>
      <VeltData field="componentConfig.cursorUser.name" />
    </span>
  </div>
</VeltCursorPointerWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-cursor-pointer-wireframe>
  <div class="my-cursor" [style.background]="'{componentConfig.cursorUser.color}'">
    <span class="my-cursor__name" [style.color]="'{componentConfig.getTextColor()}'">
      {{ '{componentConfig.cursorUser.name}' }}
    </span>
  </div>
</velt-cursor-pointer-wireframe>
```

### Root `<velt-cursor>` variables (full remote-cursor list + local user)

| Variable | Type | Use |
|---|---|---|
| `componentConfig.user` | `User` | Currently identified end-user. |
| `componentConfig.cursorUsers` | `CursorUser[]` | Remote users — one entry per pointer. |
| `componentConfig.currentCursorUser` | `CursorUser` | The current iteration cursor user. |
| `componentConfig.huddleOnCursorMode` | `boolean` | Global huddle-on-cursor mode active. |
| `componentConfig.huddleJoined` | `boolean` | Local user has joined a huddle. |
| `componentConfig.huddleOnCursorModeByAttendeeId` | `Record<string, boolean>` | Per-attendee huddle flag. |
| `componentConfig.attendeesByUserId` | `Record<string, Attendee>` | Remote attendees keyed by user id. |
| `componentConfig.remoteStreamsByUserId` | `Record<string, Record<string, MediaStream>>` | Internal — not user-addressable. |
| `componentConfig.localStream` | `MediaStream \| undefined` | Local media stream when in a huddle. |
| `componentConfig.isFirstComponent` | `boolean` | True only on the first instance on the page. |

### Per-user `<velt-cursor-pointer-wireframe>` variables

The pointer's `componentConfigSignal` is **per-user** — it carries data for one specific cursor.

| Variable | Type | Use |
|---|---|---|
| `componentConfig.cursorUser` | `CursorUser` | The user this pointer represents (`name`, `color`, `textColor`, `photoUrl`, `userId`). |
| `componentConfig.selfCursorPointer` | `boolean` | True when this pointer is the local user (production normally hides). |
| `componentConfig.showDefault` | `boolean` | Default arrow icon should render. |
| `componentConfig.showAvatar` | `boolean` | Avatar bubble should render. |
| `componentConfig.showAudio` | `boolean` | Audio indicator (huddle mode) should render. |
| `componentConfig.showVideo` | `boolean` | Video tile (huddle mode) should render. |
| `componentConfig.stream` | `MediaStream \| undefined` | Audio / video stream when available. |
| `componentConfig.gainVolume` | `number` | Audio gain for the animated speaking ring. |
| `componentConfig.lightenedColor` | `string` | Internal — used to compute inline ring style. |
| `componentConfig.variant` | `string` | Wireframe variant id. |

### Helper functions (callable from wireframe markup)

| Function | Returns | Use |
|---|---|---|
| `componentConfig.onImageLoadError()` | — | Call from your custom `<img onerror>` — falls back to initials avatar. |
| `componentConfig.getGainAnimationBorderStyle()` | `string` | Inline `border-color: ...` for the speaking-ring animation. |
| `componentConfig.getTextColor()` | `string` | Contrast-correct text colour for the user's name label. |

### Root props (`<velt-cursor>`)

| React Prop | HTML Attribute | Type | Default | Use |
|---|---|---|---|---|
| `darkMode` | `dark-mode` | `boolean` | `false` | Force dark-mode rendering. |
| `variant` | `variant` | `string` | — | Wireframe variant id. |

The per-user `<velt-cursor-pointer-wireframe>` accepts no additional public props — its config is supplied by the cursor service for each remote user.

### Deeply-nested cursor-pointer child tags

Each registered as `<velt-cursor-pointer-...-wireframe>` and resolves the per-user `componentConfig`:

| Tag | Notes |
|---|---|
| `<velt-cursor-pointer-arrow-wireframe>` | Arrow-icon part of the pointer. |
| `<velt-cursor-pointer-default-wireframe>` | Default (non-huddle) pointer surround. |
| `<velt-cursor-pointer-default-name-wireframe>` | Name pill on the default pointer. |
| `<velt-cursor-pointer-default-comment-wireframe>` | Inline comment label next to the pointer. |
| `<velt-cursor-pointer-avatar-wireframe>` | User avatar bubble. |
| `<velt-cursor-pointer-audio-huddle-wireframe>` | Audio-huddle pointer variant (speaking ring). |
| `<velt-cursor-pointer-audio-huddle-avatar-wireframe>` | Audio-huddle avatar. |
| `<velt-cursor-pointer-audio-huddle-audio-wireframe>` | Waveform / VU indicator. |
| `<velt-cursor-pointer-video-huddle-wireframe>` | Video-huddle pointer variant. |

### Common mistakes — DO NOT

**1. DO NOT drop the `componentConfig.` prefix.** Cursors is flat-config. `<velt-data field="cursorUser.name" />` resolves to nothing — use `<velt-data field="componentConfig.cursorUser.name" />`.

**2. DO NOT try to wireframe the root `<velt-cursor>`.** It has no `<velt-cursor-wireframe>` registration. Customize the per-user pointer via `<velt-cursor-pointer-wireframe>` instead.

**3. DO NOT mix root and per-user variables in the same slot.** Inside `<velt-cursor-pointer-wireframe>`, `componentConfig` is per-user — `componentConfig.cursorUsers` (root, plural) is not defined; use `componentConfig.cursorUser` (per-user, singular).

**4. DO NOT gate both default and huddle variants without checking `showDefault` / `showAudio` / `showVideo`.** These flags are mutually exclusive in practice; without them you render overlapping pointers.

**Verification:**
- [ ] All variable references use the `componentConfig.<path>` form (flat-config), never short names
- [ ] Root variables (`componentConfig.cursorUsers`, `componentConfig.user`, huddle-mode flags) are read on `<velt-cursor>` host, not inside the per-user pointer
- [ ] Per-user variables (`componentConfig.cursorUser`, `componentConfig.selfCursorPointer`, `componentConfig.show*`) are read only inside `<velt-cursor-pointer-wireframe>` and its child tags
- [ ] Default vs. avatar vs. audio-huddle vs. video-huddle variants are gated by their respective `componentConfig.show*` flags
- [ ] Helper functions (`onImageLoadError`, `getGainAnimationBorderStyle`, `getTextColor`) are called as functions, not read as data

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/cursors-wireframe-variables — "Cursors Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
