---
title: Customize Recorder UI with Wireframe Components
impact: LOW
impactDescription: Full structural customization of all recorder UI elements
tags: wireframe, VeltRecorderToolWireframe, VeltRecorderControlPanelWireframe, VeltRecorderPlayerWireframe, VeltVideoEditorPlayerWireframe, VeltTranscriptionWireframe, VeltSubtitlesWireframe, customization
---

## Customize Recorder UI with Wireframe Components

The recorder exposes 9 wireframe component hierarchies for full structural customization. Each sub-component accepts `defaultCondition?: boolean` to control visibility.

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
- [ ] Parent component has `shadowDom={false}` for custom styling
- [ ] Wireframe hierarchy matches the component being customized
- [ ] All desired sub-components included (omitted ones won't render)

**Source Pointer:** https://docs.velt.dev/ui-customization/features/async/recorder/
