---
title: Bind Transcription / Subtitles Wireframe Slots Using Template Variables
impact: MEDIUM
impactDescription: Drives transcript-panel visibility, active-segment styling, subtitles toggling, and summary expand/collapse state across the Transcription, Subtitles, and Subtitles-Dialog wireframes without re-subscribing to recorder transcription state
tags: wireframe, template-variables, velt-data, velt-if, velt-class, transcription, subtitles, recorder
---

## Bind Transcription / Subtitles Wireframe Slots Using Template Variables

The Transcription feature renders three related primitives — the transcript panel (`<velt-transcription-...-wireframe>`), the live subtitles overlay (`<velt-subtitles-...-wireframe>`), and a popover subtitles dialog (`<velt-subtitles-dialog-wireframe>`). They share the same flat-config access pattern as the rest of the recorder family: read variables via `<velt-data field="...">`, gate slots with `velt-if="{var}"`, and toggle classes with `velt-class="'cls': {var}"`.

This feature uses **flat-config** access. Use the explicit `componentConfig.<name>` path — the transcription primitives do **not** alias to the short `{name}` form the recorder root supports. The full standalone transcription variable set (`vttFileTextArray`, `highlightedTextIndex`, `transcription.summary`, etc.) lives here; the parent recorder player exposes only a subset (see `wireframe-variables/wireframe-variables-recorder.md`).

**Incorrect (rebuilding transcript state and segment-active styling from hooks):**

```jsx
import { useRecorderEventCallback } from '@veltdev/react';
import { VeltTranscriptionWireframe } from '@veltdev/react';

function Transcript({ recording }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  // Reimplements transcriptionVisible + highlightedTextIndex the wireframe already exposes.
  useRecorderEventCallback('TRANSCRIPTION_COMPLETED', () => setOpen(true));
  return (
    <VeltTranscriptionWireframe>
      {open && recording.transcription?.segments.map((s, i) => (
        <p className={i === active ? 'on' : ''}>{s.text}</p>
      ))}
    </VeltTranscriptionWireframe>
  );
}
```

**Correct (read the slot's injected variables via `velt-data` / `velt-if` / `velt-class`):**

```jsx
import {
  VeltTranscriptionPanelWireframe,
  VeltTranscriptionSummaryWireframe,
  VeltTranscriptionContentItemWireframe,
} from '@veltdev/react';

<VeltTranscriptionPanelWireframe
  veltClass="'visible': {componentConfig.transcriptionVisible}, 'mode-{componentConfig.mode}': true">
  <VeltTranscriptionSummaryWireframe>
    <p veltIf="{componentConfig.showMoreSummary}">
      <VeltData field="componentConfig.transcription.summary" />
    </p>
  </VeltTranscriptionSummaryWireframe>

  <VeltTranscriptionContentItemWireframe
    veltClass="'is-active': '{segment.startTimeInSeconds} <= {currentTime} && {segment.endTimeInSeconds} > {currentTime}'">
    <time><VeltData field="segment.startTime" /></time>
    <p><VeltData field="segment.text" /></p>
  </VeltTranscriptionContentItemWireframe>
</VeltTranscriptionPanelWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-transcription-panel-wireframe
  velt-class="'visible': {componentConfig.transcriptionVisible}">
  <velt-transcription-content-item-wireframe
    velt-class="'is-active': '{segment.startTimeInSeconds} <= {currentTime} && {segment.endTimeInSeconds} > {currentTime}'">
    <p><velt-data field="segment.text"></velt-data></p>
  </velt-transcription-content-item-wireframe>
</velt-transcription-panel-wireframe>
```

### Transcription config — key variables

State on `<velt-transcription>` and children. Bind via `componentConfig.<name>`:

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.mode` | `'floating' \| 'sidebar' \| 'embed'` | Layout mode — pair with `velt-class="'mode-{componentConfig.mode}': true"`. |
| `componentConfig.transcription` | `Transcription` | Transcript object — bind `componentConfig.transcription.summary`. |
| `componentConfig.transcriptionVisible` | `boolean` | Transcript panel is open. |
| `componentConfig.vttFileTextArray` | `{ startTime, endTime, startTimeInSeconds, endTimeInSeconds, text }[]` | Parsed VTT segments. |
| `componentConfig.highlightedTextIndex` | `number` | Currently-playing segment index (`-1` when none). |
| `componentConfig.showMoreSummary` | `boolean` | Summary expanded state. |
| `componentConfig.copySummaryButtonTooltip` | `string` | "Copy" / "Copied!" tooltip text. |
| `componentConfig.sidebarVisible` | `boolean` | Sidebar variant visible. |
| `componentConfig.darkMode` | `boolean` | Dark mode active. |
| `componentConfig.showDefaultBtn` | `boolean` | Whether to render the default trigger button. |

### Transcription behaviour callbacks

Attach these to your custom buttons rather than re-implementing seek / copy / toggle state. Each is exposed on `componentConfig.<name>` and is safe to invoke from a custom click handler.

| Callback | Signature | Notes |
|---|---|---|
| `componentConfig.copyToClipboard` | `() => void` | Copies the transcript summary to the clipboard. Pair with `componentConfig.copySummaryButtonTooltip` for the "Copy" / "Copied!" label. |
| `componentConfig.onClose` | `() => void` | Closes the transcript panel. Wire to your custom close button instead of toggling `transcriptionVisible` manually. |
| `componentConfig.onDragRelease` | `(...args) => void` | Drag-to-position release handler for floating-mode transcripts. Wire to your draggable handle's release / pointerup event. |
| `componentConfig.onSeekTo` | `(seconds: number) => void` | Seeks the host player to a given timestamp. Call with `segment.startTimeInSeconds` from a click handler on a `<velt-transcription-content-item-wireframe>` row. |
| `componentConfig.onTranscriptionButtonClick` | `() => void` | Trigger-button click handler. Wire to your custom trigger button instead of toggling `transcriptionVisible`. |
| `componentConfig.toggleShowMoreSummary` | `() => void` | Expands / collapses the summary. Pair with `componentConfig.showMoreSummary` for the expanded state. |
| `componentConfig.toggleSidebar` | `() => void` | Toggles the sidebar variant on / off. Pair with `componentConfig.sidebarVisible`. |

### Subtitles / Subtitles-Dialog config

State on `<velt-subtitles>` and `<velt-subtitles-dialog>` (the dialog adds CDK-overlay positioning fields):

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.subtitlesVisible` | `boolean` | Subtitles panel visible. |
| `componentConfig.dialogVisible` | `boolean` | Dialog variant visible. |
| `componentConfig.highlightedTextIndex` | `number` | Active segment index. |
| `componentConfig.vttFileTextArray` | `Segment[]` | Same shape as transcription. |
| `componentConfig.transcription` | `Transcription` | Transcript object. |
| `componentConfig.showDefaultBtn` | `boolean` | Render the default toggle button. |
| `componentConfig.onSubtitlesButtonClick` | `Function` | Subtitle-button click handler — wire to your custom button. |

### Subtitles-Dialog CDK overlay positioning

Dialog-only — these back the popover variant's CDK overlay. Treat as **internal positioning state**: bind only if you are replacing the default popover anchor / offset behaviour. The default render handles them automatically.

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.overlayTrigger` | `CdkOverlayOrigin` | CDK overlay anchor element. Used as the `cdkOverlayOrigin` on the popover. |
| `componentConfig.positions` | `ConnectedPosition[]` | CDK overlay position pairs (e.g., `start`/`bottom`, `end`/`top` fallbacks). Bind to `cdkConnectedOverlayPositions`. |
| `componentConfig.overlayOriginX` | `OverlayOriginX` | Anchor origin X-axis discriminator (`start` / `center` / `end`). |
| `componentConfig.overlayOriginY` | `OverlayOriginY` | Anchor origin Y-axis discriminator (`top` / `center` / `bottom`). |
| `componentConfig.cdkConnectedOverlayOffsetX` | `number` | Horizontal nudge offset, in pixels. Used to compute the popover's inline X offset. |
| `componentConfig.cdkConnectedOverlayOffsetY` | `number` | Vertical nudge offset, in pixels. Used to compute the popover's inline Y offset. |

### Context-specific variables (only inside `<velt-transcription-content-item-wireframe>`)

| Variable | Type | Notes |
|---|---|---|
| `segment` | `{ startTime, endTime, startTimeInSeconds, endTimeInSeconds, text }` | Per-iteration row from `vttFileTextArray`. |
| `currentTime` | `number` | Current playback time — compare to `segment.startTimeInSeconds` / `endTimeInSeconds` for active styling. |

### Wireframe tag families

**Transcription:** `<velt-transcription-wireframe>` (root), `-button-wireframe`, `-tooltip-wireframe`, `-panel-wireframe`, `-panel-container-wireframe`, `-content-item-wireframe` (iterates `vttFileTextArray`; injects `segment` / `currentTime`), `-summary-wireframe` (+ `-expand-toggle-wireframe` / `-on-wireframe` / `-off-wireframe`), `-copy-link-wireframe` (+ `-button-wireframe` / `-tooltip-wireframe`), `-close-button-wireframe`, `-floating-mode-wireframe`, `-embed-mode-wireframe`.

**Subtitles:** `<velt-subtitles-wireframe>` (root), `-button-wireframe`, `-tooltip-wireframe`, `-panel-wireframe`, `-close-button-wireframe`, `-floating-mode-wireframe`, `-embed-mode-wireframe`, plus `<velt-subtitles-dialog-wireframe>` (popover variant gated on `dialogVisible`).

### Common mistakes — DO NOT

**1. DO NOT use the short `{var}` form here.** Transcription / subtitles wireframes use explicit `componentConfig.<name>` paths. Unlike the recorder root, the short form is not aliased on these primitives.

**2. DO NOT confuse `transcriptionVisible` with `subtitlesVisible`.** They gate different panels — transcription is the full transcript with summary; subtitles is the live overlay during playback. Bind each to its own panel/button.

**3. DO NOT iterate `vttFileTextArray` manually inside `<velt-transcription-panel-wireframe>`.** Use `<velt-transcription-content-item-wireframe>` — it iterates and injects `segment` + `currentTime` for active-segment styling. Outside that iterator, `segment` and `currentTime` are not resolvable.

**4. DO NOT rebuild seek / copy / toggle logic.** Wire `onSeekTo(seconds)` (transcript timestamp click), `copyToClipboard` (summary copy), `toggleShowMoreSummary`, `toggleSidebar`, and `onSubtitlesButtonClick` to your custom buttons rather than re-implementing them.

**Verification:**
- [ ] Transcription / subtitles slots use explicit `componentConfig.<name>` paths (not the short `{name}` form)
- [ ] Per-segment rendering happens inside `<velt-transcription-content-item-wireframe>` so `segment` / `currentTime` are resolvable
- [ ] Active-segment styling compares `{segment.startTimeInSeconds} <= {currentTime} && {segment.endTimeInSeconds} > {currentTime}` (not `highlightedTextIndex` equality alone — that's the indexed-cursor variant)
- [ ] Summary expand / collapse gates on `{componentConfig.showMoreSummary}` and wires `toggleShowMoreSummary` to the toggle
- [ ] Custom transcript / subtitle buttons call `onTranscriptionButtonClick` / `onSubtitlesButtonClick` rather than re-implementing open/close state
- [ ] Subtitles-dialog popover gates on `{componentConfig.dialogVisible}`; CDK overlay positioning fields are left to the default render

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/recorder/transcription-wireframe-variables — "Transcription Wireframe Variables" (full per-slot reference)
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `wireframe-variables/wireframe-variables-recorder.md` (parent recorder player exposes a subset of these variables on `recorder-player-transcription-wireframe` / `recorder-player-subtitles-wireframe`), `ui/ui-ai-transcription.md` (enabling transcription on a recording)
