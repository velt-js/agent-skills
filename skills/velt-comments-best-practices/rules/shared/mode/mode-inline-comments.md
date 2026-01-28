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
  darkMode={true}
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

**Verification Checklist:**
- [ ] Container has unique ID
- [ ] VeltInlineCommentsSection is inside container
- [ ] targetElementId matches container ID
- [ ] multiThread setting matches requirements

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/inline-comments - Complete setup
