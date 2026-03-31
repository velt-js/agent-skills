---
title: Control Countdown Timer and Embedded Settings
impact: LOW-MEDIUM
impactDescription: Customize recording start experience and settings panel placement
tags: recordingCountdown, settingsEmbedded, VeltRecorderControlPanel, VeltRecorderNotes
---

## Control Countdown Timer and Embedded Settings

The recording countdown timer (enabled by default) gives users a visual cue before recording starts. The settings panel can be embedded inline within the control panel for custom layouts.

**Incorrect (disabling countdown without considering impact):**

```jsx
{/* Without countdown, recording starts immediately —
    users may miss the beginning of their content */}
<VeltRecorderControlPanel recordingCountdown={false} />
```

**Correct (intentional countdown configuration):**

```jsx
{/* Keep countdown enabled (default) for standard recording flows */}
<VeltRecorderControlPanel mode="thread" />

{/* Disable countdown for quick-capture scenarios */}
<VeltRecorderControlPanel
  mode="thread"
  recordingCountdown={false}
/>

{/* Disable countdown on recorder notes */}
<VeltRecorderNotes recordingCountdown={false} />
```

**Embedded settings:**

```jsx
{/* Embed settings panel inline within the control panel */}
<VeltRecorderControlPanel
  mode="thread"
  settingsEmbedded={true}
/>
```

**Countdown via API:**

```jsx
import { useVeltClient } from '@veltdev/react';

const client = useVeltClient();

// Enable/disable countdown programmatically
client.getRecorderElement().enableRecordingCountdown();
client.getRecorderElement().disableRecordingCountdown();
```

**For HTML:**

```html
<velt-recorder-control-panel
  mode="thread"
  recording-countdown="false"
  settings-embedded="true"
></velt-recorder-control-panel>

<velt-recorder-notes recording-countdown="false"></velt-recorder-notes>
```

**Key details:**
- `recordingCountdown` defaults to `true` — shows a countdown before recording starts
- `settingsEmbedded` is only available on VeltRecorderControlPanel (default: `false`)
- When `settingsEmbedded={true}`, use Control Panel wireframes to reposition the settings within the layout
- Disabling countdown is useful for quick-capture UIs but may cause users to miss recording the start of their content

**Verification:**
- [ ] Countdown behavior matches the intended UX flow
- [ ] Settings embedding used with wireframes for proper layout control
- [ ] Users are not confused by immediate recording start if countdown is disabled

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - recordingCountdown, settingsEmbedded
