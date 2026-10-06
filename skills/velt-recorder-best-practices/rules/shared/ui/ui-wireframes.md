---
title: Customize Recorder UI with Wireframe Components
impact: LOW
impactDescription: Full structural customization of all recorder UI elements
tags: wireframe, VeltRecorderToolWireframe, VeltRecorderControlPanelWireframe, VeltRecorderPlayerWireframe, VeltVideoEditorPlayerWireframe, VeltTranscriptionWireframe, VeltSubtitlesWireframe, customization
---

## Customize Recorder UI with Wireframe Components

The recorder exposes 9 wireframe component hierarchies for full structural customization. Each sub-component accepts `defaultCondition?: boolean` to control visibility. Wireframes are templates: place them inside `VeltWireframe` (React) or `<velt-wireframe style="display:none;">` (HTML), separate from the live recorder components.

**Incorrect (wireframe rendered on its own):**

```jsx
// Outside VeltWireframe the SDK never registers the template
<VeltRecorderAllToolWireframe>
  <span>Record</span>
</VeltRecorderAllToolWireframe>
```

**Correct (inside VeltWireframe):**

```jsx
import { VeltWireframe, VeltRecorderAllToolMenuWireframe } from '@veltdev/react';

<VeltWireframe>
  <VeltRecorderAllToolMenuWireframe>
    <VeltRecorderAllToolMenuWireframe.Audio>Audio note</VeltRecorderAllToolMenuWireframe.Audio>
    <VeltRecorderAllToolMenuWireframe.Video>Camera</VeltRecorderAllToolMenuWireframe.Video>
    <VeltRecorderAllToolMenuWireframe.Screen>Screen</VeltRecorderAllToolMenuWireframe.Screen>
  </VeltRecorderAllToolMenuWireframe>
</VeltWireframe>
```

```html
<velt-wireframe style="display:none;">
  <velt-recorder-all-tool-menu-wireframe>
    <velt-recorder-all-tool-menu-audio-wireframe>Audio note</velt-recorder-all-tool-menu-audio-wireframe>
    <velt-recorder-all-tool-menu-video-wireframe>Camera</velt-recorder-all-tool-menu-video-wireframe>
    <velt-recorder-all-tool-menu-screen-wireframe>Screen</velt-recorder-all-tool-menu-screen-wireframe>
  </velt-recorder-all-tool-menu-wireframe>
</velt-wireframe>
```

**Recorder Tool Wireframes:**

| Wireframe | Description |
|-----------|-------------|
| `VeltRecorderAllToolWireframe` | All-in-one tool with type selector menu |
| `VeltRecorderAllToolMenuWireframe` | Menu with `.Audio`, `.Video`, `.Screen` sub-items |
| `VeltRecorderAudioToolWireframe` | Audio-only recording tool |
| `VeltRecorderVideoToolWireframe` | Video-only recording tool |
| `VeltRecorderScreenToolWireframe` | Screen-only recording tool |

**Control Panel Wireframe:**

```
VeltRecorderControlPanelWireframe
├── .FloatingMode
│   ├── .Container (video/waveform display)
│   ├── .ScreenMiniContainer (mini view for screen recordings)
│   ├── .Loading
│   └── .ActionBar (time, pause/play, stop, clear, PiP buttons)
└── .ThreadMode (inline mode)
```

**Player Wireframe:**

```
VeltRecorderPlayerWireframe
├── .VideoContainer
│   ├── .Video, .Timeline, .PlayButton, .SeekBar
│   ├── .FullScreenButton, .Overlay, .Subtitles
│   ├── .Avatar, .Name, .SubtitlesButton
│   ├── .Transcription, .EditButton, .CopyLink, .Delete
└── .AudioContainer
    ├── .AudioToggle, .Time, .AudioWaveform
    ├── .Subtitles, .Avatar, .Name, .SubtitlesButton
    ├── .Transcription, .CopyLink, .Delete, .Audio
```

**Expanded Player Wireframe:**

```
VeltRecorderPlayerExpandedWireframe
├── .Panel
│   ├── .Display, .CopyLink, .MinimizeButton, .Subtitles
│   └── .Controls
│       ├── .ProgressBar, .ToggleButton, .Time
│       ├── .SubtitleButton, .TranscriptionButton
│       ├── .VolumeButton, .SettingsButton, .DeleteButton
└── .Transcription
```

**Recording Preview Steps Dialog Wireframe:**

```
VeltRecordingPreviewStepsDialogWireframe
├── .Audio
│   ├── .CloseButton, .Timer, .Waveform
│   ├── .SettingsPanel, .ButtonPanel, .BottomPanel
└── .Video
    ├── .CloseButton, .Timer, .VideoPlayer, .ScreenPlayer
    ├── .CameraOffMessage, .CameraButton
    ├── .SettingsPanel, .ButtonPanel, .BottomPanel
```

**Media Source Settings Wireframe:**

```
VeltMediaSourceSettingsWireframe
├── .Audio
│   ├── .ToggleIcon, .SelectedLabel, .Divider
│   └── .Options → .Item (Icon + Label)
└── .Video (same structure as .Audio)
```

**Video Editor Wireframe:**

```
VeltVideoEditorPlayerWireframe
├── .Title, .ApplyButton, .RetakeButton, .DownloadButton, .CloseButton
├── .Preview → .Loading, .Video
├── .ToggleButton, .Time, .SplitButton, .DeleteButton, .AddZoomButton
└── .Timeline
    ├── .BackspaceHint, .Onboarding
    └── .Container → .Playhead, .Trim, .Scale (with dropdown), .Marker
```

**Transcription Wireframe:**

```
VeltTranscriptionWireframe
├── .FloatingMode
│   ├── .Button, .Tooltip
│   └── .PanelContainer → .Panel
│       ├── .CloseButton, .CopyLink
│       ├── .Summary → .Text, .ExpandToggle
│       └── .Content → .Item → .Text, .Time
└── .EmbedMode → .Panel (same structure)
```

**Subtitles Wireframe:**

```
VeltSubtitlesWireframe
├── .EmbedMode → .Text
└── .FloatingMode
    ├── .Button, .Tooltip
    └── .Panel → .CloseButton, .Text
```

**Key details:**
- All wireframe components accept `defaultCondition?: boolean` to control render conditions
- Set `shadowDom={false}` on the parent component to apply custom CSS
- Wireframes override the default UI structure — omitted sub-components won't render

**Verification:**
- [ ] Wireframes are wrapped in `VeltWireframe` / `<velt-wireframe style="display:none;">`
- [ ] Parent component has `shadowDom={false}` for custom styling
- [ ] Wireframe hierarchy matches the component being customized
- [ ] All desired sub-components included (omitted ones won't render)

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/recorder/recorder-tool - "Recorder Tool"
- https://docs.velt.dev/ui-customization/features/async/recorder/control-panel - "Control Panel"
- https://docs.velt.dev/ui-customization/features/async/recorder/recorder-player - "Recorder player"
- https://docs.velt.dev/ui-customization/features/async/recorder/recorder-player-expanded - "Recorder Player Expanded"
- https://docs.velt.dev/ui-customization/features/async/recorder/recording-preview-steps-dialog - "Recording Preview Steps Dialog"
- https://docs.velt.dev/ui-customization/features/async/recorder/media-source-settings - "Media Source Settings"
- https://docs.velt.dev/ui-customization/features/async/recorder/video-editor - "Video Editor"
- https://docs.velt.dev/ui-customization/features/async/recorder/transcription - "Transcription"
- https://docs.velt.dev/ui-customization/features/async/recorder/subtitles - "Subtitles"
