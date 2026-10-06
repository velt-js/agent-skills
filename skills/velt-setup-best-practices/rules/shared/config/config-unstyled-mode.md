---
title: Use setUnstyledMode for Headless Styling Instead of Overriding Every Velt Style
impact: MEDIUM
impactDescription: Removes Velt's built-in visual styling in one call while keeping layout and positioning, so custom CSS does not fight default styles
tags: setUnstyledMode, unstyled, headless, keepFunctionalStyles, styling, css, globalStyles, v6
---

## Use setUnstyledMode for Headless Styling Instead of Overriding Every Velt Style

When you style Velt components entirely with your own CSS, call `setUnstyledMode(true)` (v6.0.0-beta.10+). It removes Velt's visual styling from styles in the page head and inside shadow roots, including styles injected after the call. By default it keeps layout and positioning styles so components still work. It is reversible at any time.

**Incorrect (fighting every default style with !important overrides):**

```css
/* Brittle: each Velt release can add new visual rules you must override again */
velt-comment-dialog * {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  font-family: inherit !important;
}
```

**Correct (React / Next.js):**

```jsx
"use client";
import { useEffect } from "react";
import { useVeltClient } from "@veltdev/react";

export function VeltHeadlessStyles() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    // Remove Velt's visual styling; keep layout/positioning (default)
    client.setUnstyledMode(true);
  }, [client]);

  return null;
}

// Strip everything down to raw browser defaults
// client.setUnstyledMode(true, { keepFunctionalStyles: false });

// Restore all Velt styling
// client.setUnstyledMode(false);
```

**Correct (Other Frameworks):**

```js
Velt.setUnstyledMode(true);
Velt.setUnstyledMode(true, { keepFunctionalStyles: false });
Velt.setUnstyledMode(false);
```

**Params:**

| Param | Type | Description |
|-------|------|-------------|
| `value` | `boolean` | `true` removes Velt's visual styling; `false` restores it |
| `config?` | `{ keepFunctionalStyles?: boolean }` | Default `true` keeps layout and positioning styles. Set `false` to strip to browser defaults |

Returns `void`. There is no React hook; call it on `client` from `useVeltClient()`.

**Related options:**
- `config={{ globalStyles: false }}` on `VeltProvider` stops Velt's global stylesheet from loading at all. Use it only when you own all CSS.
- For theming with `--velt-*` CSS variables or wireframes, follow the UI customization guide instead; unstyled mode is for fully headless styling.

**Verification:**
- [ ] `setUnstyledMode(true)` is called once after the client is available, not on every render
- [ ] `keepFunctionalStyles` left at the default `true` unless you re-implement layout and positioning yourself
- [ ] Your stylesheet reaches Velt elements (shadow DOM off or `injectCustomCss()` for selector-based CSS)

**Source Pointers:**
- https://docs.velt.dev/get-started/advanced#setunstyledmode - setUnstyledMode()
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setunstyledmode - setUnstyledMode() API reference
- https://docs.velt.dev/api-reference/sdk/models/data-models#config - Config (`globalStyles`)
- https://docs.velt.dev/ui-customization/setup - "Choose your shadow DOM strategy"
