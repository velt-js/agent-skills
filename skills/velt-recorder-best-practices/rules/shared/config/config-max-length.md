---
title: Set Maximum Recording Duration
impact: HIGH
impactDescription: Prevents runaway recordings and controls upload sizes
tags: maxLength, duration, limit, VeltRecorderTool, VeltRecorderControlPanel, useRecorderUtils, setMaxLength
---

## Set Maximum Recording Duration

Without a max duration limit, recordings can grow indefinitely, leading to oversized files, slow uploads, and excessive storage costs. Set `maxLength` in seconds to enforce a cap.

**Incorrect (no duration limit):**

```jsx
// No maxLength — recordings can run indefinitely
<VeltRecorderTool type="all" />
<VeltRecorderControlPanel mode="thread" />
```

**Correct (duration limit via props):**

```jsx
{/* Set max recording length to 120 seconds (2 minutes) */}
<VeltRecorderTool type="all" maxLength={120} />
<VeltRecorderControlPanel mode="thread" maxLength={120} />
```

**Correct (duration limit via API):**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function RecorderConfig() {
  const recorderUtils = useRecorderUtils();

  useEffect(() => {
    // Set max recording length to 120 seconds
    recorderUtils.setMaxLength(120);
  }, [recorderUtils]);

  return <VeltRecorderTool type="all" />;
}
```

**For non-React frameworks:**

```js
const recorderElement = Velt.getRecorderElement();
recorderElement.setMaxLength(120); // 120 seconds
```

**For HTML:**

```html
<velt-recorder-tool type="all" max-length="120"></velt-recorder-tool>
<velt-recorder-control-panel mode="thread" max-length="120"></velt-recorder-control-panel>
```

**Key details:**
- `maxLength` is specified in seconds
- Can be set on both VeltRecorderTool and VeltRecorderControlPanel via props
- Can also be set programmatically via `useRecorderUtils().setMaxLength()` or `Velt.getRecorderElement().setMaxLength()`
- When set via props, ensure both components use the same value for consistency

**Verification:**
- [ ] Max recording duration is set
- [ ] Recording automatically stops when limit is reached
- [ ] Value is consistent across VeltRecorderTool and VeltRecorderControlPanel

**Source Pointer:** https://docs.velt.dev/async-collaboration/recorder/customize-behavior - setMaxLength
