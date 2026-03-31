---
title: Use useEditorAccessTimer for React Timeout UI
impact: MEDIUM
impactDescription: Declarative countdown UI for editor access timeout in React
tags: useEditorAccessTimer, hooks, react, EditorAccessTimer, countdown, durationLeft, state
---

## Use useEditorAccessTimer for React Timeout UI

Use `useEditorAccessTimer()` in React instead of manually subscribing to `getEditorAccessTimer()`. The hook returns the timer state reactively for building countdown UIs.

**Incorrect (manual subscription in React):**

```jsx
function Countdown() {
  const { client } = useVeltClient();

  useEffect(() => {
    const sub = client.getLiveStateSyncElement()
      .getEditorAccessTimer()
      .subscribe((timer) => { /* ... */ });
    return () => sub?.unsubscribe();
  }, [client]);
}
```

**Correct (hook-based countdown):**

```jsx
import { useEditorAccessTimer } from '@veltdev/react';

function AccessTimeoutCountdown() {
  const editorAccessTimer = useEditorAccessTimer();

  useEffect(() => {
    if (editorAccessTimer?.state === 'completed') {
      // Handle timeout completion (access may have been transferred)
      console.log('Timeout reached');
    }
  }, [editorAccessTimer]);

  if (!editorAccessTimer || editorAccessTimer.state === 'idle') return null;

  return (
    <div>
      {editorAccessTimer.state === 'inProgress' && (
        <div className="countdown">
          <p>Respond to access request</p>
          <span>{editorAccessTimer.durationLeft}s remaining</span>
        </div>
      )}
      {editorAccessTimer.state === 'completed' && (
        <p>Time expired</p>
      )}
    </div>
  );
}
```

**Key details:**
- Returns `EditorAccessTimer` with `state` ('idle' | 'inProgress' | 'completed') and `durationLeft` (seconds)
- Updates reactively as the countdown progresses
- Use `useEffect` watching the timer to handle the `completed` state
- Combine with `useEditorAccessRequestHandler()` for a complete editor-side timeout + request UI

**Verification:**
- [ ] Using hook instead of manual Observable subscription
- [ ] All 3 timer states handled (idle, inProgress, completed)
- [ ] Countdown displayed during inProgress state
- [ ] Completion handled in useEffect

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - getEditorAccessTimer
