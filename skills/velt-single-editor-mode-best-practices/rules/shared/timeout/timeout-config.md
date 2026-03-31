---
title: Configure Editor Access Timeout and Transfer Behavior
impact: MEDIUM
impactDescription: Automatic timeout and editor transfer for unresponsive editors
tags: setEditorAccessTimeout, enableEditorAccessTransferOnTimeOut, disableEditorAccessTransferOnTimeOut, getEditorAccessTimer, EditorAccessTimer, timeout
---

## Configure Editor Access Timeout and Transfer Behavior

When a viewer requests editor access, the editor has a configurable time window to respond. If the timeout expires, access can auto-transfer to the requester.

**Incorrect (using default 5-second timeout for complex workflows):**

```jsx
// Default timeout is 5 seconds — too short for many real-world scenarios
// Editor may not see the request in time before auto-transfer happens
```

**Correct (custom timeout with timer tracking):**

```jsx
import { useLiveStateSyncUtils } from '@veltdev/react';

function TimeoutConfig() {
  const liveStateSyncElement = useLiveStateSyncUtils();

  useEffect(() => {
    // Set a longer timeout for complex editing workflows
    liveStateSyncElement.setEditorAccessTimeout(15); // 15 seconds

    // Enable auto-transfer on timeout (enabled by default)
    liveStateSyncElement.enableEditorAccessTransferOnTimeOut();
  }, [liveStateSyncElement]);
}
```

**Tracking timer state via API:**

```jsx
import { useVeltClient } from '@veltdev/react';

function TimeoutCountdown() {
  const { client } = useVeltClient();
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    const liveStateSyncElement = client.getLiveStateSyncElement();

    const sub = liveStateSyncElement.getEditorAccessTimer().subscribe((timerData) => {
      setTimer(timerData); // { state, durationLeft }
    });

    return () => sub?.unsubscribe();
  }, [client]);

  if (!timer || timer.state === 'idle') return null;

  return (
    <div>
      {timer.state === 'inProgress' && (
        <p>Time remaining: {timer.durationLeft}s</p>
      )}
      {timer.state === 'completed' && (
        <p>Timeout reached — access transferred</p>
      )}
    </div>
  );
}
```

**For non-React frameworks:**

```js
const liveStateSyncElement = Velt.getLiveStateSyncElement();

liveStateSyncElement.setEditorAccessTimeout(15);
liveStateSyncElement.enableEditorAccessTransferOnTimeOut();

liveStateSyncElement.getEditorAccessTimer().subscribe((timer) => {
  // timer.state: 'idle' | 'inProgress' | 'completed'
  // timer.durationLeft: seconds remaining
});
```

**EditorAccessTimer states:**

| State | Meaning |
|-------|---------|
| `'idle'` | No active timeout (no pending request) |
| `'inProgress'` | Countdown active, show remaining time |
| `'completed'` | Timeout reached, access may have been transferred |

**Key details:**
- Default timeout is **5 seconds** — adjust based on your workflow needs
- `enableEditorAccessTransferOnTimeOut()` is enabled by default — when timeout expires, editor access auto-transfers to the requester
- Call `disableEditorAccessTransferOnTimeOut()` if you want the request to simply expire without transfer
- In React, prefer `useEditorAccessTimer()` hook (see `timeout-hooks` rule)

**Verification:**
- [ ] Timeout duration appropriate for the workflow (not too short)
- [ ] Auto-transfer behavior matches desired UX
- [ ] Timer state tracked for countdown UI
- [ ] Subscription cleaned up on unmount

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - setEditorAccessTimeout, enableEditorAccessTransferOnTimeOut, getEditorAccessTimer
