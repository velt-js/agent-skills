---
title: Customize Comment Dialog Appearance
impact: MEDIUM
impactDescription: Match comment dialogs to your application design system
tags: dialog, customization, styling, wireframe, ui
---

## Customize Comment Dialog Appearance

Customize comment dialog appearance using variants, styling, and wireframe components to match your design system.

**Pre-defined Variants:**

```jsx
<VeltComments dialogVariant="variant-name" />
```

**Dark Mode:**

```jsx
<VeltComments darkMode={true} />
```

**Disable Shadow DOM (for CSS access):**

```jsx
<VeltComments shadowDom={false} />
```

**Wireframe Customization (full control):**

Velt provides wireframe components for complete UI customization:

```jsx
import { VeltCommentDialogWireframe } from '@veltdev/react';

<VeltCommentDialogWireframe.Header>
  {/* Custom header content */}
</VeltCommentDialogWireframe.Header>

<VeltCommentDialogWireframe.Body>
  {/* Custom body content */}
</VeltCommentDialogWireframe.Body>
```

**Available Wireframe Components:**

| Component | Purpose |
|-----------|---------|
| `GhostBanner` | Banner for ghost/anonymous comments |
| `PrivateBanner` | Banner for private comments |
| `AssigneeBanner` | Shows assigned user |
| `Header` | Dialog header section |
| `Status` | Comment status indicator |
| `Priority` | Priority selector |
| `Options` | Comment options menu |

**CSS Customization (with shadowDom=false):**

```css
/* Target Velt comment elements */
velt-comment-dialog {
  --velt-primary-color: #your-brand-color;
}

.velt-comment-dialog-header {
  background: #f5f5f5;
}
```

**For HTML:**

```html
<velt-comments
  dialog-variant="variant-name"
  dark-mode="true"
  shadow-dom="false"
></velt-comments>
```

**Inline Comments Section Customization:**

```jsx
<VeltInlineCommentsSection
  targetElementId="container-id"
  dialogVariant="custom-variant"
  variant="inline-section-variant"
  darkMode={true}
  shadowDom={false}
/>
```

**Verification Checklist:**
- [ ] Variant applied if using pre-defined styles
- [ ] shadowDom={false} if using custom CSS
- [ ] darkMode matches app theme
- [ ] Wireframes used for complex customization

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Structure
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/styling - Styling
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/pre-defined-variants - Variants
