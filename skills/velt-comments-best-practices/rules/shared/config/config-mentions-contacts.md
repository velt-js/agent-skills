---
title: Configure @Mentions, Contacts, and User Assignment
impact: MEDIUM
impactDescription: Control @mention behavior, contact lists, and comment assignment
tags: assignUser, setAssignToType, enableAtHere, enableUserMentions, enablePaginatedContactList, getContactList, updateContactList, customAutocompleteSearch, subscribeCommentAnnotation, contacts, mentions
---

## Configure @Mentions, Contacts, and User Assignment

Configure how @mentions, contact lists, and user assignment work in comments.

**API Methods (via getCommentElement()):**

```tsx
const commentElement = client.getCommentElement();

// Assign user to annotation
commentElement.assignUser({ annotationId: 'ann-123', userId: 'user-2' });

// Configure assignee list scope
commentElement.setAssignToType('dropdown'); // or 'checkbox'

// Enable/disable @mentions
commentElement.enableUserMentions();
commentElement.disableUserMentions();

// Enable @here (notify all users on document)
commentElement.enableAtHere();
commentElement.disableAtHere();
commentElement.setAtHereLabel('Notify All');
commentElement.setAtHereDescription('Send to everyone on this document');

// Contact list management
commentElement.enablePaginatedContactList();
commentElement.disablePaginatedContactList();

const contacts = await commentElement.getContactList();
commentElement.updateContactList(updatedContacts);
commentElement.updateContactListScopeForOrganizationUsers();

// Listen to contact selection
commentElement.onContactSelected().subscribe((contact) => {
  console.log('Selected:', contact);
});

// Mention group options
commentElement.showMentionGroupsFirst();
commentElement.showMentionGroupsOnly();
commentElement.expandMentionGroups();

// Custom autocomplete search
commentElement.customAutocompleteSearch(async (query) => {
  const results = await myBackend.searchUsers(query);
  return results;
});

// Thread subscriptions
commentElement.subscribeCommentAnnotation({ annotationId: 'ann-123' });
commentElement.unsubscribeCommentAnnotation({ annotationId: 'ann-123' });

// Autocomplete scroll behavior
<VeltComments autoCompleteScrollConfig={{ itemSize: 28 }} />
```

**Key details:**
- `setAssignToType('dropdown')` — dropdown selection for single assignee
- `setAssignToType('checkbox')` — checkbox selection for multiple assignees
- `subscribeCommentAnnotation` adds current user to thread notification list
- `customAutocompleteSearch` overrides default contact search with custom logic
- `enablePaginatedContactList` improves performance for large contact lists

**Verification:**
- [ ] Contact list populated before enabling mentions
- [ ] Custom autocomplete returns array of User objects
- [ ] Subscription cleanup called for onContactSelected

**Source Pointer:** https://docs.velt.dev/async-collaboration/comments/customize-behavior - @Mentions & Contacts
