---
title: Use VeltCommentDialogAgentSuggestion Primitives for Custom AI Suggestion UIs
impact: MEDIUM
impactDescription: Agent suggestion primitives enable fully custom accept/reject UIs for AI-generated suggestions within comment dialogs
tags: agent-suggestion, VeltCommentDialogAgentSuggestion, primitives, accept, reject, banner, resolution, AI, suggestions
---

## Use VeltCommentDialogAgentSuggestion Primitives for Custom AI Suggestion UIs

The `VeltCommentDialogAgentSuggestion*` primitive family provides 21 composable components for building custom UIs around AI agent suggestions within comment dialogs. These are used when suggestions are created via the Velt Suggestions API and rendered in comment threads.

**Component hierarchy:**

```
VeltCommentDialogAgentSuggestionBanner          — resolution banner (after accept/reject)
├── VeltCommentDialogAgentSuggestionBannerAvatar
│   ├── VeltCommentDialogAgentSuggestionBannerAvatarUserImage
│   └── VeltCommentDialogAgentSuggestionBannerAvatarStatusIcon
├── VeltCommentDialogAgentSuggestionBannerLabel
├── VeltCommentDialogAgentSuggestionBannerSeparator
├── VeltCommentDialogAgentSuggestionBannerResolverUserName
└── VeltCommentDialogAgentSuggestionBannerTimestamp

VeltCommentDialogAgentSuggestionHeaderTimestamp  — relative time in suggestion header
VeltCommentDialogAgentSuggestionHeaderMenu       — overflow menu (3-dot)
├── VeltCommentDialogAgentSuggestionHeaderMenuTrigger
└── VeltCommentDialogAgentSuggestionHeaderMenuContent
    └── VeltCommentDialogAgentSuggestionHeaderMenuContentItem
        ├── VeltCommentDialogAgentSuggestionHeaderMenuContentItemIcon
        └── VeltCommentDialogAgentSuggestionHeaderMenuContentItemLabel

VeltCommentDialogAgentSuggestionBody             — suggestion title + content
VeltCommentDialogAgentSuggestionFooter           — footer container
└── VeltCommentDialogAgentSuggestionFooterOpenComment  — navigate to full thread

VeltCommentDialogAgentSuggestionActions          — accept/reject button group
├── VeltCommentDialogAgentSuggestionActionsActionAccept
└── VeltCommentDialogAgentSuggestionActionsActionReject
```

**Usage pattern — Context Wrapper (recommended):**

All primitives accept `annotationId` either directly or inherit it from `VeltCommentDialogContextWrapper`:

```jsx
<VeltCommentDialogContextWrapper annotationId="abc123">
  <VeltCommentDialogAgentSuggestionBody />
  <VeltCommentDialogAgentSuggestionActions>
    <VeltCommentDialogAgentSuggestionActionsActionAccept />
    <VeltCommentDialogAgentSuggestionActionsActionReject />
  </VeltCommentDialogAgentSuggestionActions>
  <VeltCommentDialogAgentSuggestionBanner />
</VeltCommentDialogContextWrapper>
```

**Usage pattern — Standalone (ID-based):**

```jsx
<VeltCommentDialogAgentSuggestionBody annotationId="abc123" />
<VeltCommentDialogAgentSuggestionActions annotationId="abc123" />
```

**Common inputs (inherited by all primitives):**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `annotationId` | `string` | - | Required in standalone mode; inherited from context wrapper |
| `defaultCondition` | `boolean` | `undefined` | When false, always shows (bypasses SDK show/hide logic) |
| `inlineCommentSectionMode` | `boolean` | `false` | Inline comment section mode |
| `commentPinSelected` | `boolean` | `false` | Comment pin selected state |
| `fullExpanded` | `boolean` | `false` | Full expansion state |

**Custom resolution banner example:**

```jsx
<VeltCommentDialogAgentSuggestionBanner annotationId="abc123">
  <VeltCommentDialogAgentSuggestionBannerAvatar>
    <VeltCommentDialogAgentSuggestionBannerAvatarUserImage />
    <VeltCommentDialogAgentSuggestionBannerAvatarStatusIcon />
  </VeltCommentDialogAgentSuggestionBannerAvatar>
  <VeltCommentDialogAgentSuggestionBannerLabel />
  <VeltCommentDialogAgentSuggestionBannerSeparator />
  <VeltCommentDialogAgentSuggestionBannerResolverUserName />
  <VeltCommentDialogAgentSuggestionBannerTimestamp />
</VeltCommentDialogAgentSuggestionBanner>
```

**Custom suggestion header with overflow menu:**

```jsx
<VeltCommentDialogAgentSuggestionHeaderTimestamp annotationId="abc123" />
<VeltCommentDialogAgentSuggestionHeaderMenu annotationId="abc123">
  <VeltCommentDialogAgentSuggestionHeaderMenuTrigger />
  <VeltCommentDialogAgentSuggestionHeaderMenuContent>
    <VeltCommentDialogAgentSuggestionHeaderMenuContentItem>
      <VeltCommentDialogAgentSuggestionHeaderMenuContentItemIcon />
      <VeltCommentDialogAgentSuggestionHeaderMenuContentItemLabel />
    </VeltCommentDialogAgentSuggestionHeaderMenuContentItem>
  </VeltCommentDialogAgentSuggestionHeaderMenuContent>
</VeltCommentDialogAgentSuggestionHeaderMenu>
```

**HTML equivalents:** All components have kebab-case HTML custom element counterparts (e.g., `<velt-comment-dialog-agent-suggestion-banner>`). HTML uses string attributes (`annotation-id`, `default-condition="true"`), React uses camelCase props with actual booleans/objects.
