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

**Correct (with VeltInlineCommentsSection):**

```jsx
import { VeltProvider, VeltComments, VeltInlineCommentsSection } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      <section id="container-id">
        <div>Your Article Content</div>

        <VeltInlineCommentsSection
          targetElementId="container-id"
        />
      </section>
    </VeltProvider>
  );
}
```

**Key Requirements:**
1. Container element needs unique `id`
2. `VeltInlineCommentsSection` inside the container
3. `targetElementId` matches the container's ID

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
- [ ] Container has unique ID
- [ ] VeltInlineCommentsSection is inside container
- [ ] targetElementId matches container ID
- [ ] multiThread setting matches requirements
- [ ] In Inline Comments Section wireframe templates, `field="context.someProperty"` is used for document/location context (resolves from `parentLocalUIState.context`); use `field="annotation.context.someProperty"` for annotation-level context in other component wireframes

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/inline-comments - Complete setup
- https://docs.velt.dev/ui-customization/overview - Wireframe data variable resolution
