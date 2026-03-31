---
title: Select Recording Type and Customize Tool Button
impact: HIGH
impactDescription: Controls what users can record (audio, video, screen, or all)
tags: type, mode, audio, video, screen, all, VeltRecorderTool, buttonLabel
---

## Select Recording Type and Customize Tool Button

The `type` prop on VeltRecorderTool determines which recording mode is available. The default is `audio`, which may not match your use case. Set it explicitly to avoid confusion.

**Incorrect (relying on default type):**

```jsx
// Default type is 'audio' — users may expect video or screen recording
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

<!-- With custom label -->
<velt-recorder-tool type="all" button-label="Record Feedback"></velt-recorder-tool>
```

**Key details:**
- `all` shows a mode picker dialog letting users choose between audio, video, and screen
- `audio`, `video`, `screen` go directly to that recording mode without a picker
- `buttonLabel` adds custom text alongside the recorder icon

**Verification:**
- [ ] Recording type explicitly set via `type` prop
- [ ] Correct mode activates when user clicks the tool
- [ ] Button label matches application context (if customized)

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - type, buttonLabel
