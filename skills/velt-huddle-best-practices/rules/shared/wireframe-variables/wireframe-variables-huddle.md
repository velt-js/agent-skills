---
title: Bind Huddle Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives dynamic content, conditional rendering, and class toggling inside Huddle wireframe slots without rebuilding state from huddle hooks
tags: wireframe, template-variables, velt-data, velt-if, velt-class, componentConfig, flat-config, huddle, huddle-tool, attendee
---

## Bind Huddle Wireframe Slots Using Template Variables

The Huddle wireframes expose a fixed set of template variables read with three directives — `<velt-data field="...">` for text, `velt-if="{var}"` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Huddle uses the **flat-config** access pattern: variables are addressed by their explicit `componentConfig.<path>` form (not short-name aliases). Each wireframe primitive carries its own `componentConfigSignal` — the root `<velt-huddle>`, the `<velt-huddle-tool>` button, and the per-attendee tiles each expose a different variable set.

**Incorrect (rebuilding huddle state from hooks and conditionally mounting wireframe slots):**

```jsx
import { useHuddleState } from '@veltdev/react';
import { VeltHuddleWireframe, VeltVideoHuddleUserWireframe } from '@veltdev/react';

function Room({ attendees }) {
  const huddle = useHuddleState();
  if (!huddle?.meetingJoined) return null;
  // Reimplements the meetingJoined gate and the per-attendee tile context
  // that the wireframe already exposes via componentConfig.
  return (
    <VeltHuddleWireframe>
      {attendees.map((a) => (
        <VeltVideoHuddleUserWireframe key={a.userId}>
          <div className={a.userId === currentUser.id ? 'mine' : ''}>
            <span>{a.name}</span>
          </div>
        </VeltVideoHuddleUserWireframe>
      ))}
    </VeltHuddleWireframe>
  );
}
```

**Correct (read injected variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
<VeltHuddleToolWireframe>
  <button
    className="my-huddle-trigger"
    velt-class="'is-disabled': {componentConfig.disabled}, 'is-active': {componentConfig.meetingJoined}">
    <span velt-if="!{componentConfig.meetingJoined}">Join huddle</span>
    <span velt-if="{componentConfig.meetingJoined}">Leave huddle</span>
  </button>
</VeltHuddleToolWireframe>

<VeltHuddleWireframe velt-if="{componentConfig.meetingJoined}">
  <VeltVideoHuddleUserWireframe>
    <div className="my-tile" velt-class="'is-local': {componentConfig.isLocal}">
      <video />
      <span><velt-data field="componentConfig.attendee.name" /></span>
    </div>
  </VeltVideoHuddleUserWireframe>
  <VeltScreenSharingHuddleWireframe velt-if="{componentConfig.screenSharing.stream}">
    <video />
    <span><velt-data field="componentConfig.screenSharing.attendee.name" /> is sharing</span>
  </VeltScreenSharingHuddleWireframe>
  <VeltHuddleMenuPanelWireframe />
</VeltHuddleWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-huddle-wireframe velt-if="{componentConfig.meetingJoined}">
  <velt-video-huddle-user-wireframe>
    <div class="my-tile" velt-class="'is-local': {componentConfig.isLocal}">
      <video></video>
      <span><velt-data field="componentConfig.attendee.name"></velt-data></span>
    </div>
  </velt-video-huddle-user-wireframe>
  <velt-screen-sharing-huddle-wireframe velt-if="{componentConfig.screenSharing.stream}">
    <video></video>
  </velt-screen-sharing-huddle-wireframe>
  <velt-huddle-menu-panel-wireframe></velt-huddle-menu-panel-wireframe>
</velt-huddle-wireframe>
```

### Root `<velt-huddle>` variables

| Variable | Type | Use |
|---|---|---|
| `componentConfig.user` | `User \| null` | Identified end-user. |
| `componentConfig.meetingJoined` | `boolean` | Local user is in a huddle. Gate the room with `velt-if`. |
| `componentConfig.isDragging` | `boolean` | Floating panel is being dragged. |
| `componentConfig.huddleAttendees` | `Attendee[]` | Active attendees — read `.length` for the count. |
| `componentConfig.localStream` | `MediaStream \| null` | Local media stream. |
| `componentConfig.localStreamState.audioState` | `boolean` | Local mic on. |
| `componentConfig.localStreamState.videoState` | `boolean` | Local camera on. |
| `componentConfig.localStreamState.screenSharingState` | `boolean` | Local screen-share on. |
| `componentConfig.localScreenSharingStream` | `MediaStream \| null` | Local screen-share stream. |
| `componentConfig.screenSharing` | `{ attendee?, stream? } \| null` | Active remote screen-share (if any). |
| `componentConfig.huddleCursorAvailableByAttendeeId` | `Record<string, boolean>` | Per-attendee cursor-stream availability. |
| `componentConfig.videoStateEnabledInPastByUserId` | `Record<string, boolean>` | Whether each user has ever enabled video. |
| `componentConfig.peerConnectionStateMapByUserId` | `Record<string, string>` | WebRTC peer-connection state per user. |
| `componentConfig.remoteStreamsByUserId` | `Record<string, Record<string, MediaStream>>` | Internal — not user-addressable. |

### `<velt-huddle-tool>` variables

| Variable | Type | Use |
|---|---|---|
| `componentConfig.type` | `'audio' \| 'video' \| 'presentation' \| 'all'` | Controls the tool exposes. |
| `componentConfig.screenSharingSupported` | `boolean` | Browser supports screen-share. |
| `componentConfig.disabled` | `boolean` | Tool disabled by host config. |
| `componentConfig.meetingJoined` | `boolean` | Local user is in a huddle. |
| `componentConfig.joinedHuddleToolComponentId` | `string \| null` | Id of the tool that owns the active huddle. |
| `componentConfig.user` | `User \| null` | Identified end-user. |
| `componentConfig.huddleAttendees` | `Attendee[]` | Active attendees. |
| `componentConfig.isFirstComponent` | `boolean` | True only on the first instance on the page. |
| `componentConfig.bannerRemoved` | `boolean` | User dismissed the join banner. |
| `componentConfig.positions` | `any` | Internal — drives inline floating-position style. |

### Per-attendee tile context

Resolvable only inside `<velt-audio-huddle-user-wireframe>` and `<velt-video-huddle-user-wireframe>`:

| Variable | Type | Use |
|---|---|---|
| `componentConfig.attendee` | `Attendee` | This tile's attendee record. |
| `componentConfig.stream` | `MediaStream` | This attendee's stream. |
| `componentConfig.isLocal` | `boolean` | True on the local user's tile. |
| `componentConfig.color` | `string` | Accent colour — internal style driver. |
| `componentConfig.gainVolume` | `number` | Audio gain driving the speaking-ring animation. |

The screen-share viewer (`<velt-screen-sharing-huddle-wireframe>`) reads `componentConfig.screenSharing.stream` and `componentConfig.screenSharing.attendee` from the **root** config, not from a per-tile context.

### `shouldShow` gates worth remembering

| Slot | Built-in gate |
|---|---|
| `<velt-huddle-wireframe>` (root) | Renders when `componentConfig.meetingJoined === true`. |
| `<velt-screen-sharing-huddle-wireframe>` | Renders when `componentConfig.screenSharing.stream` is truthy. |

### Common mistakes — DO NOT

**1. DO NOT drop the `componentConfig.` prefix.** Huddle uses the flat-config access pattern — `<velt-data field="meetingJoined" />` resolves to nothing. Use `<velt-data field="componentConfig.meetingJoined" />`.

**2. DO NOT reference per-attendee variables outside a tile.** `componentConfig.attendee`, `.stream`, `.isLocal`, `.color`, and `.gainVolume` are only defined inside `<velt-audio-huddle-user-wireframe>` / `<velt-video-huddle-user-wireframe>`. Referencing them from the root or the menu panel returns `undefined` silently.

**3. DO NOT confuse `componentConfig.screenSharing` (root) with a per-tile variable.** Read the active remote share from the root config inside the screen-share viewer slot.

**Verification:**
- [ ] All wireframe variables use the explicit `componentConfig.<path>` prefix
- [ ] Per-attendee context (`componentConfig.attendee`, `.stream`, `.isLocal`, `.color`, `.gainVolume`) is only used inside an audio- or video-huddle-user wireframe
- [ ] Root room is gated by `velt-if="{componentConfig.meetingJoined}"` — not by conditionally mounting the wireframe from a hook
- [ ] Screen-share viewer reads `componentConfig.screenSharing.stream` from the **root** config, not a per-tile alias
- [ ] Huddle-tool template uses `componentConfig.disabled`, `componentConfig.meetingJoined`, and `componentConfig.type` from its own scope

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/realtime/huddle/wireframe-variables — "Huddle Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
