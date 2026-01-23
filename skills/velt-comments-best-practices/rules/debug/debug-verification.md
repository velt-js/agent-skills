---
title: Verify Velt Comments Integration
impact: LOW-MEDIUM
impactDescription: Checklist to confirm correct setup and functionality
tags: verification, testing, checklist, validation
---

## Verify Velt Comments Integration

Use this checklist to verify your Velt Comments integration is working correctly.

**1. SDK Initialization Check**

Open browser console and run:
```javascript
// Should return document metadata
await Velt.getMetadata();

// Should return user object
await Velt.getCurrentUser();
```

**2. Core Setup Verification**

- [ ] VeltProvider wraps application with valid API key
- [ ] Domain added to "Managed Domains" in Velt Console
- [ ] User authenticated with userId, organizationId, name, email
- [ ] Document set with stable, unique ID
- [ ] VeltComments component added to app root

**3. Comment Creation Test**

- [ ] Click VeltCommentTool button
- [ ] Cursor changes to comment pin (Freestyle mode)
- [ ] Click on page creates comment dialog
- [ ] Submit comment successfully
- [ ] Comment persists after page refresh

**4. Multi-User Test**

- [ ] Open two browsers (one incognito)
- [ ] Login as different users with same organizationId
- [ ] Set same documentId in both
- [ ] Create comment in one browser
- [ ] Comment appears in other browser

**5. Mode-Specific Tests**

**Freestyle Mode:**
- [ ] VeltCommentTool button visible
- [ ] Click anywhere creates comment

**Popover Mode:**
- [ ] popoverMode={true} set
- [ ] Comments attach to target elements
- [ ] Triangle or bubble indicator visible

**Text Mode:**
- [ ] Select text shows comment tool
- [ ] Comment attaches to selection
- [ ] Highlighted text marked

**Stream Mode:**
- [ ] streamMode={true} set
- [ ] Comments appear in right column
- [ ] Stream scrolls with content

**Video/Lottie:**
- [ ] Timeline shows comment bubbles
- [ ] Comments link to correct timestamps
- [ ] Clicking comment seeks media

**Editor (TipTap/Slate/Lexical):**
- [ ] textMode={false} set
- [ ] Extension installed and configured
- [ ] Comments render in editor
- [ ] renderComments called on annotation change

**6. Sidebar Verification**

- [ ] VeltCommentsSidebar renders
- [ ] VeltSidebarButton toggles sidebar
- [ ] Comments listed in sidebar
- [ ] Click navigates to comment

**7. Console Error Check**

Open browser console and check for:
- [ ] No Velt-related errors
- [ ] No "Invalid API key" errors
- [ ] No network errors to Velt endpoints
- [ ] No authentication errors

**8. Performance Check**

- [ ] Comments load without significant delay
- [ ] No UI blocking during comment operations
- [ ] Smooth interaction with comment dialogs

**Quick Test Script:**

```javascript
// Run in browser console
async function testVeltSetup() {
  try {
    const metadata = await Velt.getMetadata();
    console.log('Document metadata:', metadata);

    const user = await Velt.getCurrentUser();
    console.log('Current user:', user);

    const commentElement = Velt.getCommentElement();
    commentElement.getAllCommentAnnotations().subscribe((annotations) => {
      console.log('Comment annotations:', annotations?.length || 0);
    });

    console.log('Velt setup appears correct!');
  } catch (error) {
    console.error('Velt setup issue:', error);
  }
}
testVeltSetup();
```

**Source Pointers:**
- `/docs/get-started/quickstart.mdx` - "Step 8: Verify Setup"
