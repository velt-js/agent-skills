---
title: Set defaultCondition on V2 Primitive Sub-Components to Control Default Rendering
impact: MEDIUM
impactDescription: Prevents the SDK's default show/hide logic from conflicting with custom wireframe compositions in V2 primitive component families
tags: v2-primitives, defaultCondition, wireframe, comment-pin, comment-bubble, text-comment, inline-comments-section, multi-thread-comment-dialog, sidebar-button, customization, ui
---

## Set defaultCondition on V2 Primitive Sub-Components to Control Default Rendering

Six comment component families have been migrated to the V2 primitive architecture: Comment Pin (6 primitives), Comment Bubble (3, HTML-only), Text Comment (7), Inline Comments Section (23), Multi-Thread Comment Dialog (24), and Sidebar Button (3). Every primitive in these families accepts a `defaultCondition` / `default-condition` prop. When a wireframe replaces a section of the UI, set `defaultCondition={false}` to bypass the SDK's built-in default show/hide logic and prevent double-rendering or unintended visibility toggles.

<!-- TODO (v5.0.2-beta.11): Verify the exact primitive component names within each family (e.g., the individual identifiers for the 6 Comment Pin primitives). Release note confirms primitive counts per family and the `defaultCondition` prop name, but does not enumerate individual primitive names. -->

**Incorrect (omitting defaultCondition when overriding a primitive section):**

```jsx
// The SDK's default show/hide logic still runs, causing the primitive
// to render in its default state alongside the custom wireframe content.
<VeltCommentPinWireframe.SomePrimitive>
  <MyCustomContent />
</VeltCommentPinWireframe.SomePrimitive>
```

**Correct (React — set defaultCondition={false} to bypass default rendering logic):**

```jsx
import { VeltWireframe } from '@veltdev/react';

// Inside a VeltWireframe block, pass defaultCondition={false} to any
// V2 primitive whose section is being replaced by custom content.
// Applies to all families: Comment Pin, Comment Bubble, Text Comment,
// Inline Comments Section, Multi-Thread Comment Dialog, Sidebar Button.
<VeltWireframe>
  <VeltCommentPinWireframe.SomePrimitive defaultCondition={false}>
    <MyCustomContent />
  </VeltCommentPinWireframe.SomePrimitive>
</VeltWireframe>
```

**Correct (HTML — use default-condition attribute):**

```html
<!-- Inside a <velt-wireframe style="display:none;"> wrapper -->
<velt-wireframe style="display:none;">
  <velt-comment-pin-primitive-wireframe default-condition="false">
    <!-- Custom content replaces the default primitive rendering -->
  </velt-comment-pin-primitive-wireframe>
</velt-wireframe>
```

**V2-Migrated Component Families (v5.0.2-beta.11+):**

| Family | Primitive Count | Notes |
|--------|----------------|-------|
| Comment Pin | 6 | React + HTML |
| Comment Bubble | 3 | HTML-only primitives |
| Text Comment | 7 | React + HTML |
| Inline Comments Section | 23 | React + HTML |
| Multi-Thread Comment Dialog | 24 | React + HTML |
| Sidebar Button | 3 | React + HTML |

**Verification Checklist:**
- [ ] `defaultCondition={false}` is set on any V2 primitive whose section is fully replaced by a custom wireframe
- [ ] Primitive components are wrapped inside a `<VeltWireframe>` block (React) or `<velt-wireframe style="display:none;">` wrapper (HTML)
- [ ] HTML attributes use kebab-case: `default-condition="false"`
- [ ] Only primitives from the six V2-migrated families are targeted (Comment Pin, Comment Bubble, Text Comment, Inline Comments Section, Multi-Thread Comment Dialog, Sidebar Button)

**Source Pointers:**
- https://docs.velt.dev/ui-customization/overview - Wireframe and primitive architecture overview
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Comment dialog primitives reference
