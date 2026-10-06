---
title: Customize the Suggestion Card with Exported Primitives and Wireframes Only
impact: MEDIUM
impactDescription: Importing a primitive that @veltdev/react does not export breaks the build; use the shipped suggestion action primitives and wireframe slots instead
tags: agent-suggestion, suggestion, VeltCommentDialogSuggestionActions, VeltCommentDialogSuggestionActionAccept, VeltCommentDialogSuggestionActionReject, VeltCommentDialogAgentSuggestion, wireframe, primitives, accept, reject, banner, acceptSuggestion, rejectSuggestion, beta
---

## Customize the Suggestion Card with Exported Primitives and Wireframes Only

Suggestion annotations (`type: 'suggestion'`, from agents or humans) render as a suggestion card with Accept / Reject controls and, once resolved, a resolution banner. The generated primitives catalog is the source of truth for what exists: the `VeltCommentDialogAgentSuggestion*` family (29 components) is **Beta and not exported by `@veltdev/react` yet**, so importing one today fails. Earlier names such as `VeltCommentDialogAgentSuggestionActionsActionAccept` or `VeltCommentDialogAgentSuggestionHeaderMenu` never existed.

**Incorrect (importing the unexported Beta family or invented names):**

```jsx
import {
  VeltCommentDialogAgentSuggestionBody,               // Beta: not exported yet
  VeltCommentDialogAgentSuggestionActionsActionAccept, // never existed
} from '@veltdev/react';
```

**Correct (exported suggestion action primitives):**

```jsx
import {
  VeltCommentDialogSuggestionActions,
  VeltCommentDialogSuggestionActionAccept,
  VeltCommentDialogSuggestionActionReject,
} from '@veltdev/react';

function SuggestionControls({ annotationId }) {
  return (
    <VeltCommentDialogSuggestionActions annotationId={annotationId}>
      <VeltCommentDialogSuggestionActionAccept annotationId={annotationId} />
      <VeltCommentDialogSuggestionActionReject annotationId={annotationId} />
    </VeltCommentDialogSuggestionActions>
  );
}
```

**Correct (custom buttons that resolve the suggestion through the API):**

```jsx
const commentElement = client.getCommentElement();

// Same action as the built-in buttons: sets suggestion.status, flips annotation.type to 'comment',
// and emits suggestionAccepted / suggestionRejected
await commentElement.acceptSuggestion({ annotationId });
await commentElement.rejectSuggestion({ annotationId });
```

```js
// Other Frameworks
const commentElement = Velt.getCommentElement();
await commentElement.acceptSuggestion({ annotationId: 'ANNOTATION_ID' });
```

**Wireframe slots for the suggestion card:**

The registered wireframe slot elements for the card are the `velt-comment-dialog-agent-suggestion-*-wireframe` family. The slot tree under the Comment Dialog wireframe is:

```
AgentSuggestion
├── Body / Header / Footer(.OpenComment) / Actions(.Accept, .Reject)
├── Header → Agent(.Avatar, .Name) / Author(.Avatar, .Name) / Timestamp
│            Menu(.Trigger, .Content → Item(.Icon, .Label))
└── Banner → Avatar(.UserImage, .StatusIcon) / Label / Separator / Timestamp / ResolverUserName
```

```html
<velt-wireframe style="display:none;">
  <velt-comment-dialog-agent-suggestion-actions-wireframe>
    <velt-comment-dialog-agent-suggestion-action-accept-wireframe></velt-comment-dialog-agent-suggestion-action-accept-wireframe>
    <velt-comment-dialog-agent-suggestion-action-reject-wireframe></velt-comment-dialog-agent-suggestion-action-reject-wireframe>
  </velt-comment-dialog-agent-suggestion-actions-wireframe>
</velt-wireframe>
```

The Comment Dialog wireframes feature page shows the same card under `VeltCommentDialogWireframe.Suggestion.*` (`Header`, `Body`, `Footer`, `Actions.ActionAccept` / `Actions.ActionReject`, `Banner`). Before shipping wireframe markup, confirm the exact slot name against the Wireframe components reference, which lists every registered slot element.

**Replacing the Accept / Reject row with your own chips:**

Set `actions` on the comment or annotation to render customer-defined chips in place of the built-in Accept / Reject row, then handle `commentActionClicked`. See `data-comment-actions.md`.

**Verification Checklist:**
- [ ] No imports from the `VeltCommentDialogAgentSuggestion*` family until it ships in `@veltdev/react`
- [ ] Custom Accept / Reject controls use `VeltCommentDialogSuggestionAction*` primitives or call `acceptSuggestion()` / `rejectSuggestion()`
- [ ] Wireframe slot names checked against the Wireframe components reference
- [ ] HTML wireframe wrapper uses `style="display:none;"` and no self-closing custom elements

**Source Pointers:**
- https://docs.velt.dev/ui-customization/reference/primitives - Primitives catalog (Beta note on `VeltCommentDialogAgentSuggestion*`)
- https://docs.velt.dev/ui-customization/reference/wireframe-components - Wireframe slot elements (agent suggestion sub-family)
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/wireframes#suggestion - Suggestion wireframes
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/primitives#veltcommentdialogsuggestionactionaccept - VeltCommentDialogSuggestionActionAccept
- https://docs.velt.dev/async-collaboration/suggestions/overview - Suggestions lifecycle
