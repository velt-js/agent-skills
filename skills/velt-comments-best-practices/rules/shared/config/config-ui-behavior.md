---
title: UI/UX Toggle Methods — Comment Display, Interaction, and Behavior
impact: LOW
impactDescription: Fine-tune comment UI appearance and interaction behavior
tags: enableCollapsedComments, enableMobileMode, enableCommentPinHighlighter, enableDialogOnHover, enableFloatingCommentDialog, enableDraftMode, enableDraftConfirmation, draftConfirmation, enableLazyLoadResolvedComments, lazyLoadResolvedComments, enableGhostComments, enableHotkey, enableEnterKeyToSubmit, enablePersistentCommentMode, enableForceCloseAllOnEsc, enableMinimap, enableCommentIndex, enableDeviceInfo, enableReplyAvatars, composerMode, showCommentsOnDom, hideCommentsOnDom, showResolvedCommentsOnDom, enableFilterCommentsOnDom, excludeLocationIds, enableSvgAsImg, enableMultiThread, enableCollapsedRepliesPreview, disableCollapsedRepliesPreview, collapsedRepliesPreview
---

## UI/UX Toggle Methods — Comment Display, Interaction, and Behavior

Fine-tune comment UI appearance and user interaction patterns. Most toggles exist as a `<VeltComments>` prop, a kebab-case HTML attribute on `<velt-comments>`, and an `enable*` / `disable*` pair on `getCommentElement()`. Several older shorthand calls (`showCommentsOnDom(true)`, `svgAsImg(true)`, `composerMode('inline')`) do not exist; use the exact names below.

**Incorrect (invented signatures):**

```jsx
const commentElement = client.getCommentElement();
commentElement.showCommentsOnDom(true);          // no boolean param; use show/hide pair
commentElement.composerMode('inline');           // composerMode is a prop, not a method
commentElement.svgAsImg(true);                   // use enableSvgAsImg()
commentElement.excludeLocationIds([1, 2]);       // excludeLocationIds lives on the client
commentElement.enableMultithread();              // casing is enableMultiThread()
```

**Correct (Display & Layout):**

```jsx
const commentElement = client.getCommentElement();

// Collapse middle replies: first + last comment with an "N more replies" divider (default false)
commentElement.enableCollapsedComments();
commentElement.enableFullExpanded();             // Always render fully expanded (default false)

commentElement.enableFloatingCommentDialog();    // default true
commentElement.enableDialogOnHover();            // default true
commentElement.enableCommentPinHighlighter();    // default true

// Show / hide pins on the DOM
commentElement.showCommentsOnDom();              // default: shown
commentElement.hideCommentsOnDom();
commentElement.showResolvedCommentsOnDom();      // default: hidden
commentElement.hideResolvedCommentsOnDom();
commentElement.enableFilterCommentsOnDom();      // Mirror sidebar filters onto page pins

// Hide comments at specific locations (client-level API, not commentElement)
client.excludeLocationIds(['location1', 'location2']);
client.excludeLocationIds([]);                   // reset

// Re-position the open dialog after you move a manual pin (no params)
commentElement.updateCommentDialogPosition();
```

**Comment Numbering & Info:**

```jsx
commentElement.enableCommentIndex();             // default false
commentElement.enableDeviceInfo();               // default false
commentElement.enableDeviceIndicatorOnCommentPins();
commentElement.enableShortUserName();            // default true
commentElement.enableReplyAvatars();             // default false
commentElement.setMaxReplyAvatars(2);
commentElement.enableSeenByUsers();              // default true
commentElement.setUnreadIndicatorMode('verbose'); // 'minimal' (default) | 'verbose'
```

**Ghost Comments (comments whose target element is gone):**

```jsx
commentElement.enableGhostComments();            // default false
commentElement.enableGhostCommentsIndicator();   // default true
```

**Draft Mode, Draft Confirmation, and Lazy-Loading Resolved Comments:**

```jsx
// draftMode defaults to true: partial comments are saved with isDraft: true on close
commentElement.enableDraftMode();

// Opt-in (default false, requires draftMode): Keep Draft / Delete Draft popup with a
// quoted preview instead of saving the draft silently
commentElement.enableDraftConfirmation();
commentElement.disableDraftConfirmation();

// Opt-in (default false): skip fetching resolved (terminal-status) comments on initial load
commentElement.enableLazyLoadResolvedComments();
commentElement.disableLazyLoadResolvedComments();
```

```jsx
// Same flags as props
<VeltComments draftMode={true} draftConfirmation={true} lazyLoadResolvedComments={true} />
```

```html
<velt-comments draft-mode="true" draft-confirmation="true" lazy-load-resolved-comments="true"></velt-comments>
```

- `draftConfirmation` never fires for non-draft writes (edits, status, priority, assignment, deletes). Keep Draft, Escape, or a backdrop click saves the draft; Delete Draft discards it. The popup reuses the confirm dialog with a `velt-confirm-dialog--draft` modifier class and a `Preview` wireframe slot.
- With `lazyLoadResolvedComments`, selecting a terminal status, Status → All, Reset filters, or the `resolved` quick filter fetches resolved comments for that document. The unlock re-locks when you navigate to another document or organization. `showResolvedCommentsOnDom()` does not unlock the fetch, and terminal status options show no count (not `0`) while withheld.

**Keyboard & Input:**

```jsx
commentElement.enableHotkey();                   // 'c' toggles comment mode (default false)
commentElement.enableEnterKeyToSubmit();         // default: Enter = newline, Shift+Enter = submit
commentElement.enableDeleteOnBackspace();        // default enabled
commentElement.enablePersistentCommentMode();    // Stay in comment mode after placing a pin
commentElement.enableForceCloseAllOnEsc();       // ESC exits persistent comment mode too
```

**Mobile & Auth:**

```jsx
commentElement.enableMobileMode();
commentElement.enableSignInButton();             // default false
```

```jsx
// onSignIn is a component event, not a commentElement method
<VeltComments signInButton={true} onSignIn={() => yourSignInMethod()} />
```

**Minimap:**

```jsx
<VeltComments minimap={true} minimapPosition="left" />
commentElement.enableMinimap();
```

**Sidebar Button on Dialog:**

```jsx
commentElement.enableSidebarButtonOnCommentDialog(); // default true

const subscription = commentElement
  .onSidebarButtonOnCommentDialogClick()
  .subscribe((event) => openMySidebar(event));
subscription?.unsubscribe();
```

**Composer Mode and Delete Behavior (props):**

```jsx
// composerMode: 'default' (actions bar shows on focus) | 'expanded' (always visible)
// deleteThreadWithFirstComment: default true
<VeltComments composerMode="expanded" deleteThreadWithFirstComment={false} />

commentElement.enableDeleteReplyConfirmation();
```

**Confirm Dialog Variant CSS Classes:**

The confirm dialog host receives a BEM modifier based on its type: `velt-confirm-dialog--comment`, `velt-confirm-dialog--reply`, and `velt-confirm-dialog--draft` (draft confirmation popup). The base class `velt-confirm-dialog` is always present.

```css
.velt-confirm-dialog--comment { border-left: 4px solid red; }
.velt-confirm-dialog--reply { border-left: 4px solid orange; }
.velt-confirm-dialog--draft { border-left: 4px solid gray; }
```

**Comment Modes & Selection:**

```jsx
commentElement.focusPageModeComposer();
commentElement.enableAreaComment();              // default true
commentElement.enableMultiThread();              // default false; needs multithread wireframe if you customized the dialog
commentElement.enableChangeDetectionInCommentMode();
commentElement.enableSvgAsImg();                 // Treat SVGs as flat images
commentElement.enableCommentToNearestAllowedElement();
```

**PDF & Iframe Support:**

```jsx
// data-velt-pdf-viewer is an HTML attribute, not a method
<div data-velt-pdf-viewer="true">
  <PDFViewer />
</div>
```

**AI Auto-Categorization:**

```jsx
commentElement.enableAutoCategorize();           // default false
commentElement.setCustomCategory([
  { id: 'bug', name: 'Bug', color: 'red' },
  { id: 'feedback', name: 'Feedback', color: 'blue' },
]);
```

**Comment Bubble Grouping:**

```jsx
commentElement.enableGroupMatchedComments();     // Group bubbles matching the same context/targetElementId
```

**Custom Lists (Autocomplete Chips):**

```jsx
// Annotation-level dropdown (tags/categories on the thread)
commentElement.createCustomListDataOnAnnotation({
  type: 'multi', // 'multi' | 'single'
  placeholder: 'Select a category',
  data: [
    { id: 'violent', label: 'Violent' },
    { id: 'nsfw', label: 'NSFW' },
  ],
});

// Comment-level hotkey list: typing the hotkey in the composer opens a picker
commentElement.createCustomListDataOnComment({
  hotkey: '#', // single character only
  type: 'custom',
  data: [
    { id: '1', name: 'File 1', description: 'File Description 1' },
  ],
});
```

**Recording in Comments:**

```jsx
await commentElement.deleteRecording({ annotationId: 'ann-123', commentId: 1, recordingId: 'rec-1' });
const recordings = await commentElement.getRecording({ annotationId: 'ann-123', commentId: 1 });

// Comma-separated string: 'audio' (default) | 'video' | 'screen' | 'all' | 'none'
commentElement.setAllowedRecordings('audio,screen'); // omit 'video' to disable video recording

commentElement.enableRecordingTranscription();
```

**Edit Draft Preservation (v5.0.2-beta.18+):**

When a user dismisses the edit composer without submitting, the in-progress edits are kept in memory as a draft. The collapsed thread card shows a `(DRAFT)` badge, and clicking it re-opens the edit composer pre-filled. Drafts are session-only and are cleared on submit, Escape, or page refresh. There is no API surface for this behavior.

**Collapsed Replies Preview (v5.0.2-beta.37+):**

When enabled, a non-selected dialog shows the collapsed teaser (first comment, a "Show N replies…" divider, last comment) instead of only the first comment. Defaults to disabled.

```jsx
commentElement.enableCollapsedRepliesPreview();
commentElement.disableCollapsedRepliesPreview();
```

Also settable as `<VeltComments collapsedRepliesPreview={true} />` or `<velt-comments collapsed-replies-preview="true"></velt-comments>`. Boolean HTML attributes need an explicit `="true"` / `="false"`; a bare attribute is treated as disabled.

**Key details:**
- All toggle methods have corresponding `disable` variants.
- Call configuration methods after `getCommentElement()` is available (inside a `useEffect` with `client` as a dependency in React).
- In Other Frameworks, use `Velt.getCommentElement()` and `Velt.excludeLocationIds()`.

**Verification:**
- [ ] No invented signatures (`showCommentsOnDom(true)`, `svgAsImg(true)`, `composerMode(...)`, `enableMultithread()`)
- [ ] `excludeLocationIds()` called on `client` / `Velt`, not on the comment element
- [ ] `draftConfirmation` only enabled together with `draftMode`
- [ ] `lazyLoadResolvedComments` UI accounts for terminal statuses showing no count until unlocked
- [ ] `setAllowedRecordings()` receives a comma-separated string, not an array
- [ ] Hotkeys don't conflict with application shortcuts

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#uiux - UI/UX
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#draftconfirmation - draftConfirmation
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#lazyloadresolvedcomments - lazyLoadResolvedComments
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#excludelocationids - excludeLocationIds
- https://docs.velt.dev/ui-customization/features/async/comments/confirm-dialog - Confirm dialog wireframes and modifier classes
