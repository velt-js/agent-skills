---
title: Configure Ephemeral Chat in Huddle
impact: MEDIUM
impactDescription: Chat messages within huddle are ephemeral and not persisted after huddle ends
tags: huddle, chat, ephemeral, VeltHuddle, configuration
---

## Ephemeral Chat Within Huddle

`VeltHuddle` supports an ephemeral chat feature that allows participants to exchange text messages during a huddle session. Chat messages are not persisted after the huddle ends.

**Why this matters:**

Ephemeral chat provides a lightweight communication channel during huddles for sharing links, code snippets, or notes without leaving the huddle context. Understanding that messages are ephemeral prevents users from relying on huddle chat for persistent information.

**React: Enable or disable chat**

```jsx
"use client";
import { VeltHuddle } from "@veltdev/react";

function App() {
  return (
    <>
      {/* Chat enabled (default behavior) */}
      <VeltHuddle chat={true} />

      {/* Chat disabled */}
      <VeltHuddle chat={false} />
    </>
  );
}
```

**React: Programmatic control via hook**

```jsx
"use client";
import { useHuddleUtils } from "@veltdev/react";

function HuddleChatToggle() {
  const huddleElement = useHuddleUtils();

  const enableChat = () => {
    huddleElement?.enableChat();
  };

  const disableChat = () => {
    huddleElement?.disableChat();
  };

  return (
    <div>
      <button onClick={enableChat}>Enable Chat</button>
      <button onClick={disableChat}>Disable Chat</button>
    </div>
  );
}
```

**HTML: Chat configuration**

```html
<!-- Chat enabled (default) -->
<velt-huddle chat="true"></velt-huddle>

<!-- Chat disabled -->
<velt-huddle chat="false"></velt-huddle>
```

**Key behaviors:**

- Chat is enabled by default (`chat={true}`)
- Messages are ephemeral — they are not stored or retrievable after the huddle session ends
- Chat is only visible to active huddle participants
- Use `useHuddleUtils()` to get the `HuddleElement` for programmatic control

**Verification:**
- [ ] `chat` prop is set on `VeltHuddle` as intended
- [ ] Chat messages appear for all huddle participants during active session
- [ ] Messages are not persisted after the huddle ends
- [ ] Programmatic enable/disable works via `huddleElement`

**Source Pointers:**
- `https://docs.velt.dev/huddle/customize-behavior` - Huddle behavior configuration
