---
title: Select Recording Type and Customize Tool Button
impact: HIGH
impactDescription: Controls what users can record (audio, video, screen, or all)
tags: type, mode, audio, video, screen, all, VeltRecorderTool, buttonLabel
---

## Select Recording Type and Customize Tool Button

The `type` prop on VeltRecorderTool determines which recording mode is available. The docs disagree on the default (the customize-behavior page says `audio`; the behaviors reference says `video`), so always set it explicitly.

**Incorrect (relying on default type):**

```jsx
// Default type is ambiguous across docs; users may get a mode they did not expect
<VeltRecorderTool />
```

**Correct (explicit type selection):**

```jsx
{/* All modes — shows a mode picker dialog */}
<VeltRecorderTool type="all" />

{/* Audio only — starts audio recording directly */}
<VeltRecorderTool type="audio" />

{/* Video only — starts webcam recording directly */}
<VeltRecorderTool type="video" />

{/* Screen only — starts screen capture directly */}
<VeltRecorderTool type="screen" />
```

**Limit the picker to a subset (comma-separated):**

```jsx
{/* Renders a dropdown limited to audio and video */}
<VeltRecorderTool type="audio, video" />
```

**Bind a tool to a specific control panel:**

```jsx
<VeltRecorderTool type="all" panelId="composer-panel" />
<VeltRecorderControlPanel mode="thread" panelId="composer-panel" />
```

**Custom button label:**

```jsx
{/* Add descriptive text to the recorder button */}
<VeltRecorderTool type="all" buttonLabel="Record Feedback" />
```

**For HTML:**

```html
<velt-recorder-tool type="all"></velt-recorder-tool>
<velt-recorder-tool type="audio"></velt-recorder-tool>
<velt-recorder-tool type="video"></velt-recorder-tool>
<velt-recorder-tool type="screen"></velt-recorder-tool>

<!-- Subset picker and panel binding -->
<velt-recorder-tool type="audio, video" panel-id="composer-panel"></velt-recorder-tool>
<velt-recorder-control-panel mode="thread" panel-id="composer-panel"></velt-recorder-control-panel>

<!-- With custom label -->
<velt-recorder-tool type="all" button-label="Record Feedback"></velt-recorder-tool>
```

**Key details:**
- `all` shows a mode picker dialog letting users choose between audio, video, and screen
- `audio`, `video`, `screen` go directly to that recording mode without a picker
- A comma-separated `type` (e.g. `'audio, video'`) renders a dropdown limited to those modes
- `screen` only renders where the browser supports screen sharing
- `panelId` binds a tool to the control panel with the same `panelId` when several panels are mounted
- `buttonLabel` adds custom text alongside the recorder icon

**Verification:**
- [ ] Recording type explicitly set via `type` prop
- [ ] Correct mode activates when user clicks the tool
- [ ] Button label matches application context (if customized)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#type - "type"
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#buttonlabel - "buttonLabel"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltRecorderTool & VeltRecorderNotes" (comma-separated `type`, `panelId`)
