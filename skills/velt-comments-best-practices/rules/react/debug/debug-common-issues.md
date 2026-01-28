---
title: Troubleshoot Common Velt Integration Issues
impact: LOW-MEDIUM
impactDescription: Quick fixes for common setup and runtime problems
tags: debugging, troubleshooting, errors, issues, fixes
---

## Troubleshoot Common Velt Integration Issues

Common issues and solutions when integrating Velt Comments.

**Issue: Components Not Rendering**

**Symptoms:** VeltComments, VeltCommentTool, etc. don't appear

**Solutions:**
```jsx
// 1. Ensure VeltProvider wraps all Velt components
<VeltProvider apiKey="YOUR_API_KEY">
  <VeltComments />  {/* Must be inside provider */}
</VeltProvider>

// 2. For Next.js, add 'use client' directive
'use client';  // Add at top of file

// 3. Check API key is valid
console.log('API Key:', process.env.NEXT_PUBLIC_VELT_API_KEY);

// 4. Check domain is safelisted in Velt Console
```

**Issue: Users Can't See Each Other's Comments**

**Symptoms:** Comments visible to creator only

**Solutions:**
```jsx
// 1. Ensure same organizationId for all users
const user = {
  userId: 'user-123',
  organizationId: 'same-org-id',  // Must match across users
  // ...
};

// 2. Ensure same documentId
client.setDocuments([{ id: 'same-document-id' }]);

// 3. Verify authentication completes before document setup
```

**Issue: Comments Not Persisting**

**Symptoms:** Comments disappear on refresh

**Solutions:**
```jsx
// 1. Verify authentication is working
const user = await client.getCurrentUser();
console.log('Current user:', user);

// 2. Check document is set correctly
await Velt.getMetadata();  // Should return document metadata

// 3. Ensure stable document ID
// BAD: Uses changing ID
client.setDocuments([{ id: `doc-${Date.now()}` }]);

// GOOD: Uses stable ID
client.setDocuments([{ id: 'project-123-document' }]);
```

**Issue: Popover Comments Not Attaching to Elements**

**Symptoms:** Comments appear in wrong location

**Solutions:**
```jsx
// 1. Ensure popoverMode is enabled
<VeltComments popoverMode={true} />

// 2. Match targetElementId with element ID
<div id="cell-1">  {/* Element has ID */}
  <VeltCommentTool targetElementId="cell-1" />  {/* Same ID */}
</div>

// 3. For single tool pattern, add data attribute
<div
  id="cell-1"
  data-velt-target-comment-element-id="cell-1"  {/* Both required */}
>
```

**Issue: Video/Lottie Comments Not Syncing**

**Symptoms:** Comments don't appear at correct timestamps

**Solutions:**
```jsx
// 1. Set totalMediaLength
<VeltCommentPlayerTimeline totalMediaLength={videoDuration} />

// 2. Set location with currentMediaPosition
client.setLocation({
  currentMediaPosition: currentTimeInSeconds
});

// 3. Clear location when playing
client.removeLocation();  // or client.unsetLocationsIds()
```

**Issue: Editor Comments (TipTap/Slate/Lexical) Not Working**

**Symptoms:** Can't add comments to editor text

**Solutions:**
```jsx
// 1. Disable default text mode
<VeltComments textMode={false} />

// 2. Ensure extension/plugin is installed
// TipTap: npm install @veltdev/tiptap-velt-comments
// Slate: npm install @veltdev/slate-velt-comments
// Lexical: npm install @veltdev/lexical-velt-comments

// 3. Call renderComments when annotations change
useEffect(() => {
  if (editor && commentAnnotations?.length) {
    renderComments({ editor, commentAnnotations });
  }
}, [editor, commentAnnotations]);
```

**Debug Using Browser Console:**

```javascript
// Check SDK initialization
await Velt.getMetadata();

// Check current user
await Velt.getCurrentUser();

// Check comment element
const commentElement = Velt.getCommentElement();
commentElement.getAllCommentAnnotations().subscribe(console.log);
```

**Verification Checklist:**
- [ ] API key valid and domain safelisted
- [ ] VeltProvider wraps all Velt components
- [ ] User authenticated before document setup
- [ ] Document ID is stable and consistent
- [ ] Mode-specific props configured correctly

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart - "Debugging" section
