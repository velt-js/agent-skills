---
title: Bind Recorder Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives recording-state styling, mode gating, playback time/scrubber binding, and per-type tool variant rendering across the Recorder wireframe family without re-subscribing to recorder state
tags: wireframe, template-variables, velt-data, velt-if, velt-class, recorder, recorder-button, control-panel, recorder-player, expanded-player
---

## Bind Recorder Wireframe Slots Using Template Variables

The Recorder wireframe family (`<velt-recorder-...-wireframe>` / `<VeltRecorder...Wireframe>`) covers the trigger button, the pin shown on a recorder annotation, the recording-in-progress control panel (floating / thread / collapsed / paused / loading / screen / video variants), and the playback surface — including the expanded full-screen player and its overlay controls.

You read the wireframe's exposed variables with three directives — `<velt-data field="...">` for text, `velt-if="{var}"` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing recording state, type gating, or playback time tracking on top of `useRecordings` / `useRecorderEventCallback`.

This feature uses the **flat-config** access pattern — every property lives directly on the root of `componentConfigSignal()` (no nested `appState` / `featureState` / `data` / `uiState`). Reach values via `{componentConfigSignal.<name>}`. The shorter `{<name>}` form also works for any field at the root **except** for the six naming-conflict cases listed below.

For the structural catalog of which recorder wireframe tags exist, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top of that.

**Incorrect (rebuilding recorder state from hooks and gating slots from the host component):**

```jsx
import { useRecorderEventCallback, useVeltClient } from '@veltdev/react';
import { VeltRecorderButtonWireframe } from '@veltdev/react';

function RecordButton() {
  const [isRecording, setIsRecording] = useState(false);
  // Reimplements recordingInProgress + screen-sharing capability the wireframe already exposes.
  useRecorderEventCallback('RECORDING_STARTED', () => setIsRecording(true));
  useRecorderEventCallback('RECORDING_ENDED', () => setIsRecording(false));
  const canScreen = !!navigator.mediaDevices?.getDisplayMedia;
  return (
    <VeltRecorderButtonWireframe>
      <button className={isRecording ? 'rec on' : 'rec'}>
        {isRecording ? 'Stop' : (canScreen ? 'Record screen' : 'Record')}
      </button>
    </VeltRecorderButtonWireframe>
  );
}
```

**Correct (read the slot's injected variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import { VeltRecorderButtonWireframe } from '@veltdev/react';

<VeltRecorderButtonWireframe>
  <button
    className="rec"
    veltClass="'is-recording': {componentConfigSignal.recordingInProgress}, 'is-disabled': {componentConfigSignal.disabled}, 'theme-dark': {componentConfigSignal.darkMode}">
    <span veltIf="!{componentConfigSignal.recordingInProgress}">
      <VeltData field="componentConfigSignal.buttonLabel" />
    </span>
    <span veltIf="{componentConfigSignal.recordingInProgress}">Recording…</span>
  </button>
</VeltRecorderButtonWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-recorder-button-wireframe>
  <button class="rec"
          velt-class="'is-recording': {componentConfigSignal.recordingInProgress}">
    <span velt-if="!{componentConfigSignal.recordingInProgress}">
      <velt-data field="componentConfigSignal.buttonLabel"></velt-data>
    </span>
    <span velt-if="{componentConfigSignal.recordingInProgress}">Recording…</span>
  </button>
</velt-recorder-button-wireframe>
```

### Naming conflicts — use the full path

Six names collide with mappings used elsewhere. Inside a Recorder wireframe, prefer the explicit `componentConfigSignal.<name>` path for these — the short form resolves to the wrong namespace:

| Conflicting name | Short form resolves to | Use this for Recorder |
|---|---|---|
| `disabled` | `parentLocalUIState.disabled` | `componentConfigSignal.disabled` |
| `darkMode` | `parentLocalUIState.darkMode` | `componentConfigSignal.darkMode` |
| `variant` | `parentLocalUIState.variant` | `componentConfigSignal.variant` |
| `screenSharingSupported` | `componentConfigSignal.featureState.screenSharingSupported` | `componentConfigSignal.screenSharingSupported` |
| `user` | `componentConfigSignal.appState.user` | `componentConfigSignal.user` |
| `annotation` | `componentConfigSignal.data.annotation` | `componentConfigSignal.annotation` |

### Variables by region

The recorder injects a single flat config object; the variables exposed depend on which wireframe tag the slot lives inside.

**Recorder Button** (`<velt-recorder-button-wireframe>` and its per-type children — `recorder-audio-tool`, `recorder-video-tool`, `recorder-screen-tool`, `recorder-all-tool`):

| Variable | Type | Notes |
|---|---|---|
| `componentConfigSignal.buttonLabel` | `string` | Custom label text (e.g. `"Record"`). |
| `componentConfigSignal.recordingInProgress` | `boolean` | A recording is currently active. |
| `componentConfigSignal.types` | `RecorderMode[]` | Modes permitted on this button — subset of `'audio' \| 'video' \| 'screen' \| 'all'`. Gate per-type child tags with `velt-if="{componentConfigSignal.types.includes('audio')}"` etc. |
| `componentConfigSignal.recorderModes` | `{ AUDIO; VIDEO; SCREEN; ALL }` | Constant id map for comparing to `types`. |
| `componentConfigSignal.disabled` | `boolean` | Button is disabled. |
| `componentConfigSignal.darkMode` | `boolean` | Dark mode is active. |
| `componentConfigSignal.shadowDom` | `boolean` | Shadow-DOM rendering enabled (host config). |
| `componentConfigSignal.screenSharingSupported` | `boolean` | Browser supports `getDisplayMedia`. Gate `recorder-screen-tool` on this. |
| `componentConfigSignal.recordingCountdown` | `boolean` | 3-2-1 countdown overlay is enabled. |
| `componentConfigSignal.variant` | `string` | Wireframe variant id. |
| `componentConfigSignal.initRecording` | `(type) => void` | Click handler — call from a custom button to start a recording of the given type. |

**Recorder Pin** (`<velt-recorder-pin-wireframe>`):

| Variable | Type | Notes |
|---|---|---|
| `componentConfigSignal.recorderPinAnnotation` | `RecorderAnnotation` | The annotation this pin represents (`from`, `recorderId`, `recorders`). |
| `componentConfigSignal.recorderPinSelected` | `boolean` | Pin is currently selected. |
| `componentConfigSignal.multipleRecorderPinsSelected` | `boolean` | Multi-select mode is active. |
| `componentConfigSignal.dragging` | `boolean` | Pin is being dragged. |

**Recorder Player — shared** (used by `<velt-recorder-player-wireframe>`, every `recorder-player-*-wireframe` sub-primitive, the expanded-player tags, and the control-panel's playback-like surfaces). All these tags receive the **same** flat `componentConfigSignal` carrying the active recording's metadata + behaviour callbacks:

| Variable | Type | Notes |
|---|---|---|
| `componentConfigSignal.recordingTranscriptionEnabled` | `boolean` | Transcription overlay is enabled for this recording. |
| `componentConfigSignal.recordingType` | `'audio' \| 'video' \| 'screen'` | Recorder type. Use with `velt-class="'is-{componentConfigSignal.recordingType}': true"`. |
| `componentConfigSignal.recorderInitData` | `RecorderInitData` | Active recording handle (internal — used by playback). |
| `componentConfigSignal.attachment` | `Attachment` | Saved-attachment record — bind `componentConfigSignal.attachment.url`. |
| `componentConfigSignal.videoPosterDefaultImage` | `string` | Default poster image when no first frame is captured yet. |
| `componentConfigSignal.annotation` | `RecorderAnnotation` | Recorder annotation backing this playback. |
| `componentConfigSignal.totalTimeValue` | `number` | Total duration in milliseconds — bind on `recorder-player-time` and `expanded-controls-total-time`. |
| `componentConfigSignal.currentTimeValue` | `number` | Current playback position in milliseconds — bind on `recorder-player-time`, `expanded-controls-current-time`. |
| `componentConfigSignal.user` | `User` | Currently identified end-user — bind `componentConfigSignal.user.name` / `.photoUrl` on `recorder-player-avatar`. |
| `componentConfigSignal.dragging` | `boolean` | Pin / panel is being dragged. |
| `componentConfigSignal.recorderPinSelected` | `boolean` | Pin is currently selected. |
| `componentConfigSignal.sourceFeature` | `'comment' \| 'standalone' \| ...` | Where this player is mounted — `velt-class="'source-{componentConfigSignal.sourceFeature}': true"`. |
| `componentConfigSignal.videoContainerHovered` | `boolean` | Video container is hovered. |
| `componentConfigSignal.mode` | `'floating' \| 'thread'` | Control-panel layout mode (also on player). |
| `componentConfigSignal.variant` | `RecorderVariant` | Wireframe variant id. |
| `componentConfigSignal.isPlaying` | `boolean` | Playback is active — gate `expanded-controls-toggle-play/pause` icons. |
| `componentConfigSignal.isRecording` | `boolean` | Control-panel: recording (not paused) — gate `action-bar-toggle-pause/play` icons. |
| `componentConfigSignal.elapsedTime` | `number` | Elapsed-recording time label (`action-bar-time`). |

**Player behaviour callbacks.** The shared player config exposes ~15 behaviour callbacks you can attach to your own buttons — `timeUpdate`, `toggleVideo`, `onSliderGrab` / `onSliderDrag` / `onSliderRelease`, `onSeekToVideo(seconds)` / `onSeekToAudio(seconds)`, `onSubtitlesButtonClick` / `onSubtitlesPanelDragged`, `onTranscriptionButtonClick` / `onTranscriptionPanelDragged` / `onTranscriptionTimestampClick` / `onTranscriptionSummaryCopy`, `toggleAnnotation`, `copyLink`, `deleteRecorderAnnotation`, `setVideoContainerHovered(boolean)`.

### Wireframe tag families

The recorder feature has a large set of overridable surfaces. They are grouped here by region; bind only what you actually customise — every tag falls back to the default render.

**Root + per-type tool variants** — gate per-type variants on `types.includes(...)` and the `screen` variant additionally on `screenSharingSupported`:

| Wireframe tag | Notes |
|---|---|
| `<velt-recorder-button-wireframe>` | Root trigger. |
| `<velt-recorder-audio-tool-wireframe>` | Audio-only variant. |
| `<velt-recorder-video-tool-wireframe>` | Video-only variant. |
| `<velt-recorder-screen-tool-wireframe>` | Screen-only variant. Gate on `{componentConfigSignal.screenSharingSupported}`. |
| `<velt-recorder-all-tool-wireframe>` (+ `-menu-wireframe`, `-menu-audio/-video/-screen-wireframe` children) | Unified "record any" button that opens a per-type menu. |

**Pin / Player root**:

| Wireframe tag | Notes |
|---|---|
| `<velt-recorder-pin-wireframe>` | Pin overlay on a recorder annotation. |
| `<velt-recorder-player-wireframe>` | Playback widget root — composes the ~20 sub-primitives below. |

**Player internals** — overlay, container, time/name/timeline, action buttons, subtitles, transcription:

| Wireframe tag | Notes |
|---|---|
| `<velt-recorder-player-overlay-wireframe>` | Overlay UI on top of the playing video (controls + scrubber + buttons). |
| `<velt-recorder-player-video-container-wireframe>` / `<velt-recorder-player-video-wireframe>` | Container + inline `<video>` for video recordings. |
| `<velt-recorder-player-audio-container-wireframe>` / `<velt-recorder-player-audio-wireframe>` | Container + inline `<audio>` for audio recordings. |
| `<velt-recorder-player-audio-waveform-wireframe>` | Animated waveform for audio recordings. |
| `<velt-recorder-player-audio-toggle-wireframe>` (+ `-play-wireframe`, `-pause-wireframe`) | Play / pause button group. |
| `<velt-recorder-player-timeline-wireframe>` (+ `-seek-bar-wireframe`) | Scrubber timeline + draggable seek bar. |
| `<velt-recorder-player-time-wireframe>` | Current / total time labels — bind `currentTimeValue` and `totalTimeValue`. |
| `<velt-recorder-player-name-wireframe>` | Recording's name / title. |
| `<velt-recorder-player-edit-button-wireframe>` / `…-delete-wireframe` / `…-copy-link-wireframe` / `…-full-screen-button-wireframe> ` | Action buttons on the player overlay. |
| `<velt-recorder-player-subtitles-wireframe>` / `…-subtitles-button-wireframe` | Subtitles overlay + toggle. |
| `<velt-recorder-player-transcription-wireframe>` | Transcript panel (subset of transcription variables — full set lives on the Transcription feature config in standalone mode). |
| `<velt-recorder-player-avatar-wireframe>` / `…-play-button-wireframe` | Recorder author's avatar (`user.photoUrl`); compact play-only button. |

**Control panel** (during recording) — floating / thread / collapsed / paused / loading / screen / video modes plus the action bar:

| Wireframe tag | Notes |
|---|---|
| `<velt-recorder-control-panel-wireframe>` | Root. Props: `mode` (`'floating' \| 'thread'`), `panelId`. |
| `<velt-recorder-control-panel-floating-mode-wireframe>` (+ `-container-wireframe`, `-waveform-wireframe`) | Floating layout. |
| `<velt-recorder-control-panel-thread-mode-wireframe>` | Thread (composer-embedded) layout. |
| `<velt-recorder-control-panel-collapsed-button-wireframe>` (+ `-on-wireframe` / `-off-wireframe`) | Collapsed-state button. Gate `-on` on `{componentConfigSignal.isRecording}`, `-off` on the inverse. |
| `<velt-recorder-control-panel-paused-wireframe>` | Paused-state overlay. |
| `<velt-recorder-control-panel-loading-wireframe>` | Loading state (initialising recorder). |
| `<velt-recorder-control-panel-screen-wireframe>` (+ `-mini-container-wireframe`) | Screen-recording overlays. |
| `<velt-recorder-control-panel-video-wireframe>` | Video-recording overlay. |
| `<velt-recorder-control-panel-action-bar-wireframe>` (+ `-stop-wireframe`, `-clear-wireframe`, `-toggle-wireframe`/`-toggle-pause-wireframe`/`-toggle-play-wireframe`, `-pip-wireframe`, `-time-wireframe`, `-type-icon-wireframe`, `-waveform-wireframe`) | Action-bar children. Gate pause icon on `{componentConfigSignal.isRecording}`, play on its inverse. |

**Expanded player** (full-screen playback) — separate control-bar tags:

| Wireframe tag | Notes |
|---|---|
| `<velt-recorder-player-expanded-wireframe>` (+ `-panel-wireframe`, `-controls-wireframe`) | Expanded-player root, inner panel, control-bar wrapper. |
| `…-expanded-controls-toggle-button-wireframe` (+ `-play-wireframe`, `-pause-wireframe`) | Play / pause toggle. Gate `-play` on `!{componentConfigSignal.isPlaying}`, `-pause` on `{componentConfigSignal.isPlaying}`. |
| `…-expanded-controls-progress-bar-wireframe` | Scrubber progress bar. |
| `…-expanded-controls-current-time-wireframe` / `…-total-time-wireframe` / `…-time-wireframe` | Time labels — bind `currentTimeValue`, `totalTimeValue`. |
| `…-expanded-controls-volume-button-wireframe` / `…-settings-button-wireframe` / `…-delete-button-wireframe` | Overlay action buttons. |
| `…-expanded-controls-subtitle-button-wireframe` (+ `-icon-wireframe`, `-tooltip-wireframe`) | Subtitle toggle subtree. |
| `…-expanded-controls-transcription-button-wireframe` (+ `-icon-wireframe`, `-tooltip-wireframe`) | Transcription toggle subtree. |
| `…-expanded-copy-link-wireframe` / `…-expanded-minimize-button-wireframe` | Copy-link; minimise (exit fullscreen). |

### Putting it together

A custom record button paired with a custom playback overlay (scrubber + delete):

```jsx
<VeltRecorderButtonWireframe>
  <button className="my-record"
          veltClass="'is-recording': {componentConfigSignal.recordingInProgress}">
    <span veltIf="!{componentConfigSignal.recordingInProgress}">
      <VeltData field="componentConfigSignal.buttonLabel" />
    </span>
    <span veltIf="{componentConfigSignal.recordingInProgress}">Stop</span>
  </button>
</VeltRecorderButtonWireframe>

<VeltRecorderPlayerWireframe>
  <VeltRecorderPlayerVideoWireframe><video /></VeltRecorderPlayerVideoWireframe>
  <VeltRecorderPlayerOverlayWireframe>
    <VeltRecorderPlayerTimeWireframe>
      <VeltData field="componentConfigSignal.currentTimeValue" />
      /
      <VeltData field="componentConfigSignal.totalTimeValue" />
    </VeltRecorderPlayerTimeWireframe>
    <VeltRecorderPlayerTimelineWireframe />
    <VeltRecorderPlayerDeleteWireframe />
  </VeltRecorderPlayerOverlayWireframe>
</VeltRecorderPlayerWireframe>
```

### Common mistakes — DO NOT

**1. DO NOT use the short `{disabled}` / `{darkMode}` / `{variant}` / `{user}` / `{annotation}` / `{screenSharingSupported}` forms inside a Recorder wireframe.** These six names collide with mappings used elsewhere — always use the full `componentConfigSignal.<name>` path. Other root-level fields (`buttonLabel`, `recordingInProgress`, `types`, `currentTimeValue`, `totalTimeValue`, etc.) accept either form, but prefer the full path for consistency.

**2. DO NOT collapse the audio / video / screen trichotomy into one slot.** Each recorder type has its own tool variant (`recorder-audio-tool` / `…-video-tool` / `…-screen-tool` / `…-all-tool`) and its own control-panel surface. Gate per-type slots with `velt-if="{componentConfigSignal.types.includes('audio')}"` (and additionally with `{componentConfigSignal.screenSharingSupported}` for the screen variant).

**3. DO NOT confuse `isRecording` with `recordingInProgress`.** `recordingInProgress` is true for the entire recording session (button is "stop"); `isRecording` is the paused/unpaused state inside the control-panel action bar.

**4. DO NOT confuse `isPlaying` (player toggle state) with `recordingInProgress` (recorder state).** The expanded-player toggle icons gate on `{componentConfigSignal.isPlaying}`; the record button gates on `{componentConfigSignal.recordingInProgress}`.

**5. DO NOT rebuild scrubber / time logic — bind to the shared callbacks.** The shared player config exposes `onSliderGrab` / `onSliderDrag` / `onSliderRelease`, `onSeekToVideo(seconds)` / `onSeekToAudio(seconds)`, `toggleVideo`, `timeUpdate`, `copyLink`, `deleteRecorderAnnotation`. Attach these to your custom buttons; do not re-implement seek state.

**6. DO NOT call `componentConfigSignal.initRecording` without a type argument.** The recorder button click handler is `initRecording(type)` where `type` is one of `'audio' \| 'video' \| 'screen' \| 'all'`. Pass the type matching the button's intended mode.

**Verification:**
- [ ] Recorder wireframe slots use the full `componentConfigSignal.<name>` path for the six naming-conflict variables (`disabled`, `darkMode`, `variant`, `user`, `annotation`, `screenSharingSupported`)
- [ ] Per-type tool variants (`recorder-audio-tool`, `…-video-tool`, `…-screen-tool`) are gated on `{componentConfigSignal.types.includes(...)}` — and the screen variant additionally on `{componentConfigSignal.screenSharingSupported}`
- [ ] Control-panel action-bar `toggle-pause` / `toggle-play` icons are gated on `{componentConfigSignal.isRecording}` / its inverse — not `recordingInProgress`
- [ ] Expanded-player toggle icons are gated on `{componentConfigSignal.isPlaying}` / its inverse
- [ ] Custom record buttons call `componentConfigSignal.initRecording(type)` with an explicit `'audio' \| 'video' \| 'screen' \| 'all'` argument
- [ ] Custom scrubber / seek / copy-link / delete buttons wire to the shared callbacks (`onSliderDrag`, `onSeekToVideo`, `copyLink`, `deleteRecorderAnnotation`) — not re-implemented
- [ ] Time labels bind `componentConfigSignal.currentTimeValue` / `totalTimeValue` (milliseconds) on `recorder-player-time` and the expanded `current-time` / `total-time` tags
- [ ] The transcript panel relies on the subset exposed via the shared player config — full transcription variables (`vttFileTextArray`, `highlightedTextIndex`) live on the Transcription feature config in standalone mode

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/recorder/wireframe-variables — "Recorder Wireframe Variables" (full per-slot reference)
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog), `ui/ui-control-panel-mode.md` (floating vs thread modes), `ui/ui-ai-transcription.md` (transcription overlay), `config/config-type-and-mode.md` (recorder modes), `config/config-picture-in-picture.md` (PiP toggle on the action bar)
