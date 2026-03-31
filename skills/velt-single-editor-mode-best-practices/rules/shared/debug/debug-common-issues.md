---
title: Debug Common Single Editor Mode Issues
impact: LOW-MEDIUM
impactDescription: Quick troubleshooting for frequent Single Editor Mode problems
tags: debugging, troubleshooting, heartbeat, enableHeartbeat, disableHeartbeat, updateUserPresence, resetUserAccess, common issues
---

## Debug Common Single Editor Mode Issues

Common issues when integrating Velt Single Editor Mode and how to resolve them.

**Issue 1: Default UI panel not visible**

```jsx
// Ensure BOTH are done:
// 1. Call enableDefaultSingleEditorUI()
liveStateSyncElement.enableDefaultSingleEditorUI();

// 2. Render the panel component
<VeltSingleEditorModePanel shadowDom={false} />

// If building custom UI, call disableDefaultSingleEditorUI() instead
```

**Issue 2: Elements not becoming read-only for viewers**

```jsx
// If using customMode: true, SDK does NOT auto-manage read-only state
// You must use data attributes on NATIVE HTML elements:

// Wrong — attributes on React components do nothing:
<MyButton data-velt-sync-access="true">Edit</MyButton>

// Correct — attributes on native elements:
<button data-velt-sync-access="true">Edit</button>

// Or wrap React components:
<div data-velt-sync-access="true">
  <MyButton>Edit</MyButton>
</div>

// If customMode: false (default), SDK auto-manages read-only state
```

**Issue 3: Editor can edit in multiple tabs**

```jsx
// Verify singleTabEditor is true (default):
liveStateSyncElement.enableSingleEditorMode({
  singleTabEditor: true,
});

// When user is editor on another tab, prompt to switch:
const { isEditor, isEditorOnCurrentTab } = useUserEditorState();
if (isEditor && !isEditorOnCurrentTab) {
  // Show "Edit on this tab" button
  liveStateSyncElement.editCurrentTab();
}
```

**Issue 4: Heartbeat must be disabled BEFORE enabling SEM**

```jsx
// Incorrect order — disabling after enable has no effect:
liveStateSyncElement.enableSingleEditorMode();
liveStateSyncElement.disableHeartbeat(); // Too late

// Correct order:
liveStateSyncElement.disableHeartbeat();
liveStateSyncElement.enableSingleEditorMode();
```

**Issue 5: Ambiguous editor presence detection**

```jsx
// Use updateUserPresence() as a fallback for presence detection
liveStateSyncElement.updateUserPresence({
  sameUserPresentOnTab: false,
  differentUserPresentOnTab: true,
  userIds: ['user-2']
});
```

**Issue 6: Stuck editor state**

```jsx
// Reset editor access for all users
liveStateSyncElement.resetUserAccess();
// This clears the current editor and allows any user to take over
```

**Testing checklist:**
1. Open the same document as 2 different users in separate browser profiles
2. Verify only one user can edit at a time
3. Test access request flow (request → accept/reject)
4. Test timeout behavior (default 5 seconds)
5. Test multi-tab behavior with `singleTabEditor: true`
6. Verify scoped containers work (elements outside scope remain interactive)

**Verification:**
- [ ] VeltProvider configured with API key and user authenticated
- [ ] Document ID set via Velt setup
- [ ] `enableSingleEditorMode()` called with explicit config
- [ ] Default UI enabled or custom UI implemented
- [ ] `data-velt-sync-access` attributes on native HTML elements only
- [ ] Heartbeat disabled before SEM if disabling is needed
- [ ] Tested with multiple users in separate browser profiles

**Source Pointer:** https://docs.velt.dev/realtime-collaboration/single-editor-mode/setup - Testing and Debugging, Notes; https://docs.velt.dev/realtime-collaboration/single-editor-mode/customize-behavior - Heartbeat, Presence Heartbeat, resetUserAccess
