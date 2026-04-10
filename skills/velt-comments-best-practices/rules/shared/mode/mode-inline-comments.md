---
title: Use Inline Comments for Traditional Thread Style
impact: HIGH
impactDescription: Traditional comment threads bound to container elements
tags: inline, thread, inline-comments-section, targetelementid, multi-thread
---

## Use Inline Comments for Traditional Thread Style

Inline Comments mode shows comment threads directly within content sections, supporting both single-threaded and multi-threaded conversations.

**Incorrect (missing VeltInlineCommentsSection):**

```jsx
// Inline comments won't appear in the container
<VeltComments />

<section id="article-section">
  <p>Article content...</p>
  {/* No inline comments component */}
</section>
```

**Correct (with VeltInlineCommentsSection, context, and recommended props):**

```jsx
import { VeltProvider, VeltComments, VeltInlineCommentsSection } from '@veltdev/react';

export default function App() {
  const items = [
    { id: 'task-1', title: 'Design Review', status: 'in-progress' },
    { id: 'task-2', title: 'API Integration', status: 'todo' },
  ];

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments
        shadowDom={false}
        textMode={false}
      />

      {items.map((item) => (
        <section key={item.id} id={`item-${item.id}`}>
          <h3>{item.title}</h3>
          <p>Status: {item.status}</p>

          <VeltInlineCommentsSection
            targetElementId={`item-${item.id}`}
            multiThread={true}
            shadowDom={false}
            composerPosition="bottom"
            context={{ itemId: item.id, itemTitle: item.title, status: item.status }}
          />
        </section>
      ))}
    </VeltProvider>
  );
}
```

**Why these props matter:**
- `context={{}}` — attaches metadata to every comment in this section. Essential for filtering, grouping, and knowing which item a comment belongs to. Without this, comments are only tied to a DOM element ID which can break if your UI changes.
- `composerPosition="bottom"` — places the comment composer below existing threads, which is the natural position for inline discussions (like GitHub PR comments)
- `shadowDom={false}` — lets your CSS styles apply to inline comment components
- `textMode={false}` on VeltComments — prevents conflicts with inline comment sections

**Key Requirements:**
1. Container element needs unique `id`
2. `VeltInlineCommentsSection` inside the container
3. `targetElementId` matches the container's ID
4. `context` prop with item-specific metadata for filtering/grouping

**Multi-threaded vs Single-threaded:**

```jsx
// Multi-threaded (default) - multiple comment threads
<VeltInlineCommentsSection
  targetElementId="container-id"
  multiThread={true}
/>

// Single-threaded - one thread per section
<VeltInlineCommentsSection
  targetElementId="container-id"
  multiThread={false}
/>
```

**Custom Placeholder Text:**

```jsx
<VeltInlineCommentsSection
  targetElementId="container-id"
  commentPlaceholder="Add a comment..."
  replyPlaceholder="Write a reply..."
  composerPlaceholder="Start typing..."
/>
```

**Styling Options:**

```jsx
<VeltInlineCommentsSection
  targetElementId="container-id"
  shadowDom={false}
  dialogVariant="dialog-variant"
  variant="inline-section-variant"
/>
```

**For HTML:**

```html
<velt-comments></velt-comments>

<section id="container-id">
  <div>Your Article</div>

  <velt-inline-comments-section
    target-element-id="container-id"
    multi-thread="true"
  >
  </velt-inline-comments-section>
</section>
```

**Wireframe `context` Variable Resolution (v5.0.2-beta.11+):**

Inside wireframe templates for `VeltInlineCommentsSection`, the `context` data variable resolves from `parentLocalUIState.context` — the document/location context for the section. This is the corrected behavior as of v5.0.2-beta.11.

```jsx
// Inside a VeltInlineCommentsSection wireframe template:
// `context` resolves from parentLocalUIState.context (document/location context).
// Use field="context.someProperty" to access location-level context data.
<velt-data field="context.someProperty" />

// For annotation-level context in other (non-Inline-Section) components,
// use field="annotation.context.someProperty" instead.
<velt-data field="annotation.context.someProperty" />
```

```html
<!-- HTML — same distinction applies in velt-data field expressions -->
<!-- Inside VeltInlineCommentsSection wireframe: context = parentLocalUIState.context -->
<velt-data field="context.someProperty"></velt-data>

<!-- Inside other component wireframes: annotation-level context -->
<velt-data field="annotation.context.someProperty"></velt-data>
```

**Verification Checklist:**
- [ ] VeltComments has `shadowDom={false}` and `textMode={false}`
- [ ] Container has unique ID
- [ ] VeltInlineCommentsSection is inside container with matching `targetElementId`
- [ ] `context` prop includes item-specific metadata (IDs, status, etc.)
- [ ] `composerPosition="bottom"` is set for natural thread layout
- [ ] `shadowDom={false}` is set on VeltInlineCommentsSection
- [ ] multiThread setting matches requirements

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/inline-comments - Complete setup
- https://docs.velt.dev/ui-customization/overview - Wireframe data variable resolution
