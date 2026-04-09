---
title: UI/UX Toggle Methods — Comment Display, Interaction, and Behavior
impact: LOW
impactDescription: Fine-tune comment UI appearance and interaction behavior
tags: enableCollapsedComments, enableMobileMode, enableCommentPinHighlighter, enableDialogOnHover, enableFloatingCommentDialog, enableDraftMode, enableGhostComments, enableHotkey, enableEnterKeyToSubmit, enablePersistentCommentMode, enableMinimap, enableCommentIndex, enableDeviceInfo, enableReplyAvatars, composerMode, showCommentsOnDom, showResolvedCommentsOnDom
---

## UI/UX Toggle Methods — Comment Display, Interaction, and Behavior

Fine-tune comment UI appearance and user interaction patterns. All methods are on `getCommentElement()`.

**Display & Layout:**

```tsx
const commentElement = client.getCommentElement();

// Collapsed/expanded view
commentElement.enableCollapsedComments();     // Collapse all threads
commentElement.enableFullExpanded();          // Always show expanded

// Floating dialog positioning
commentElement.enableFloatingCommentDialog(); // Dialog floats near pin

// Dialog behavior
commentElement.enableDialogOnHover();         // Open dialog on hover (not click)
commentElement.enableCommentPinHighlighter(); // Highlight pin on hover

// Show/hide comments on page
commentElement.showCommentsOnDom(true);       // Show all comment pins
commentElement.showResolvedCommentsOnDom(true); // Include resolved
commentElement.filterCommentsOnDom(filterFn); // Custom filter function
commentElement.excludeLocationIds([1, 2]);    // Hide specific locations

// Custom dialog position
commentElement.updateCommentDialogPosition({ x: 100, y: 200 });
```

**Comment Numbering & Info:**

```tsx
commentElement.enableCommentIndex();          // Show comment numbers (#1, #2, ...)
commentElement.enableDeviceInfo();            // Show device used for comment
commentElement.enableDeviceIndicatorOnCommentPins(); // Device icon on pins
commentElement.enableShortUserName();         // Shorten display names
commentElement.enableReplyAvatars();          // Show avatars on replies
commentElement.enableSeenByUsers();           // "Seen by" indicator
```

**Ghost Comments (orphaned comments):**

```tsx
commentElement.enableGhostComments();         // Show ghost comments
commentElement.enableGhostCommentsIndicator(); // Visual indicator for ghosts
```

**Draft Mode:**

```tsx
commentElement.enableDraftMode();             // Save drafts before submit
```

**Keyboard & Input:**

```tsx
commentElement.enableHotkey();                // Enable keyboard shortcuts
commentElement.enableEnterKeyToSubmit();      // Enter to submit (Shift+Enter for newline)
commentElement.enableDeleteOnBackspace();     // Backspace to delete
commentElement.enablePersistentCommentMode(); // Keep comment mode active after placing
commentElement.forceCloseAllOnEsc();          // ESC closes all dialogs
```

**Mobile & Auth:**

```tsx
commentElement.enableMobileMode();            // Mobile-optimized UI
commentElement.enableSignInButton();          // Show sign-in button for unauthenticated
commentElement.onSignIn((event) => {          // Auth callback
  router.push('/login');
});
```

**Minimap:**

```tsx
commentElement.enableMinimap();               // Overview minimap of all comments
```

**Sidebar Button on Dialog:**

```tsx
commentElement.enableSidebarButtonOnCommentDialog(); // Add sidebar button to dialog header
commentElement.onSidebarButtonOnCommentDialogClick((event) => {
  // Open sidebar when button clicked
});
```

**Composer Mode:**

```tsx
// Control how the composer appears
// 'inline' — composer inline in thread
// 'popup' — composer in popup
// 'dialog' — composer in dialog
commentElement.composerMode('inline');
```

**Delete Behavior:**

```tsx
// Delete entire thread when first comment is deleted
commentElement.deleteThreadWithFirstComment(true);

// Show confirmation before deleting replies
commentElement.enableDeleteReplyConfirmation();
```

**Page Mode:**

```tsx
// Auto-focus page mode composer
commentElement.focusPageModeComposer();
```

**Comment Modes & Selection:**

```tsx
// Area/box comment selection
commentElement.enableAreaComment();

// Multiple threads per element
commentElement.enableMultithread();

// Detect DOM changes while in comment mode
commentElement.enableChangeDetectionInCommentMode();

// Treat SVG elements as images for commenting
commentElement.svgAsImg(true);
```

**PDF & Iframe Support:**

```tsx
// Enable PDF viewer comment support
// Add data-velt-pdf-viewer="true" attribute to your PDF container element:
<div data-velt-pdf-viewer="true">
  <PDFViewer />
</div>

// Iframe support — comments work inside iframes automatically
// when VeltProvider is loaded in the iframe
```

**AI Auto-Categorization:**

```tsx
// Auto-categorize comments (Question, Feedback, Bug, Other)
commentElement.enableAutoCategorize();
commentElement.disableAutoCategorize();

// Define custom categories
commentElement.setCustomCategory([
  { id: 'question', name: 'Question' },
  { id: 'feedback', name: 'Feedback' },
  { id: 'bug', name: 'Bug Report' },
  { id: 'feature', name: 'Feature Request' },
]);
```

**Comment Aggregation & Grouping:**

```tsx
// Group comments that match by context (e.g., same row in a table)
commentElement.enableGroupMatchedComments();
commentElement.disableGroupMatchedComments();
```

**Custom Lists (Autocomplete Chips):**

```tsx
// Add custom data to annotation-level autocomplete
commentElement.createCustomListDataOnAnnotation({
  listId: 'labels',
  data: [
    { id: 'label-1', name: 'Design' },
    { id: 'label-2', name: 'Engineering' },
  ],
});

// Add custom data to comment-level autocomplete
commentElement.createCustomListDataOnComment({
  listId: 'tags',
  data: [
    { id: 'tag-1', name: 'Urgent' },
    { id: 'tag-2', name: 'Nice to have' },
  ],
});
```

**Recording in Comments:**

```tsx
// Delete a recording from a comment
commentElement.deleteRecording({ annotationId: 'ann-123', recordingId: 'rec-1' });

// Get recording data
const recording = commentElement.getRecording({ annotationId: 'ann-123', recordingId: 'rec-1' });

// Restrict recording types (default: all)
commentElement.setAllowedRecordings(['audio', 'video']); // exclude 'screen'

// Show countdown before recording starts
commentElement.enableRecordingCountdown();

// Enable auto-transcription of recordings
commentElement.enableRecordingTranscription();
commentElement.disableRecordingTranscription();
```

**Key details:**
- All toggle methods have corresponding `disable` variants
- Most can also be set as props on `<VeltComments>` or via HTML attributes
- Call configuration methods after `getCommentElement()` is available (inside useEffect with client dependency)
- `data-velt-pdf-viewer` is an HTML attribute, not a method

**Verification:**
- [ ] Toggle methods called after comment element is available
- [ ] Mobile mode tested on actual mobile devices
- [ ] Hotkeys don't conflict with application shortcuts
- [ ] Ghost comments behavior understood (comments from deleted elements)

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - UI/UX
