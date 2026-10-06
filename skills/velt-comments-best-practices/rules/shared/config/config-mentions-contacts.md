---
title: Configure @Mentions, Contacts, and User Assignment
impact: MEDIUM
impactDescription: Control @mention behavior, contact lists, and comment assignment
tags: assignUser, setAssignToType, enableAtHere, setAtHereLabel, enableUserMentions, enablePaginatedContactList, getContactList, updateContactList, updateOrgList, enableCustomAutocompleteSearch, autocompleteSearch, onContactSelected, subscribeCommentAnnotation, getContactElement, useContactUtils, contacts, mentions
---

## Configure @Mentions, Contacts, and User Assignment

Mentions and contact-list methods are split across two elements. Assignment, subscriptions, pagination, and custom autocomplete search live on the **comment element**. `@here`, user mentions, the contact list, and contact selection live on the **contact element** (`client.getContactElement()` or the `useContactUtils()` hook). Calling contact methods on the comment element fails.

**Incorrect (wrong element and wrong payload shapes):**

```jsx
const commentElement = client.getCommentElement();
commentElement.assignUser({ annotationId: 'ann-123', userId: 'user-2' }); // needs assignedTo: User
commentElement.setAssignToType('checkbox');                                // needs { type }
commentElement.enableAtHere();                                             // contact element API
commentElement.updateContactList(contacts);                                // contact element API
commentElement.customAutocompleteSearch(async (q) => search(q));           // not a callback API
```

**Correct (comment element: assignment, subscription, pagination):**

```jsx
const commentElement = client.getCommentElement();

// Assign a user: pass the full user object as assignedTo
await commentElement.assignUser({
  annotationId: 'ann-123',
  assignedTo: { userId: 'user-2', name: 'Jane', email: 'jane@example.com' },
});

// Assign-to UI mode
commentElement.setAssignToType({ type: 'checkbox' }); // or { type: 'dropdown' }

// Thread notification subscriptions
await commentElement.subscribeCommentAnnotation({ annotationId: 'ann-123' });
await commentElement.unsubscribeCommentAnnotation({ annotationId: 'ann-123' });

// Paginate large contact lists in the @mention dropdown (default false)
commentElement.enablePaginatedContactList();
```

**Correct (contact element: @here, mentions, contact list, selection):**

```jsx
const contactElement = client.getContactElement(); // or: const contactElement = useContactUtils();

contactElement.enableAtHere();                     // default disabled
contactElement.setAtHereLabel('@all');
contactElement.setAtHereDescription('Notify all users in this document');
contactElement.enableUserMentions();               // default true

// Replace (default) or merge the session contact list; does not change access control
contactElement.updateContactList(
  [{ userId: 'userId1', name: 'User Name', email: 'user1@velt.dev' }],
  { merge: false },
);
// Restrict sidebar People/Assigned/Tagged/Involved filters to this list + current user
contactElement.updateContactList(contacts, { filters: true });

// Teams shown in the "Selected Teams" visibility picker (full replace on every call)
contactElement.updateOrgList({ orgList: [{ id: 'org-A', name: 'Team A' }] });

contactElement.updateContactListScopeForOrganizationUsers(['all', 'organization', 'organizationUserGroup', 'document']);

contactElement.getContactList().subscribe((response) => console.log(response));

const subscription = contactElement.onContactSelected().subscribe((payload) => {
  // payload: { contact, isOrganizationContact, isDocumentContact, documentAccessType }
});
subscription?.unsubscribe();
```

React hooks: `useContactUtils()`, `useContactList()`, `useContactSelected()`, `useAssignUser()`, `useSubscribeCommentAnnotation()`, `useUnsubscribeCommentAnnotation()`.

**Correct (custom autocomplete search for large or remote contact lists):**

```jsx
// 1. Enable the feature
<VeltComments customAutocompleteSearch={true} />
// or: commentElement.enableCustomAutocompleteSearch();

// 2. Seed an initial list, then answer each search event
const contactElement = client.getContactElement();
contactElement.updateContactList(initialUsers);

const subscription = commentElement.on('autocompleteSearch').subscribe(async (inputData) => {
  if (inputData.type === 'contact') {
    const users = await yourApi.searchUsers(inputData.searchText);
    contactElement.updateContactList(users, { merge: false });
  }
});
subscription?.unsubscribe();
```

**Mention group and scroll props:**

```jsx
<VeltComments
  expandMentionGroups={true}
  showMentionGroupsFirst={true}
  autoCompleteScrollConfig={{ itemSize: 28, minBufferPx: 100, maxBufferPx: 200 }}
/>
```

**Key details:**
- `assignUser()` takes `assignedTo` (a `User`), not a bare `userId`.
- `setAssignToType()` takes an `AssignToConfig` object: `{ type: 'dropdown' | 'checkbox' }`.
- `updateContactList()` only affects the current session; it does not grant document access.
- In Other Frameworks, use `Velt.getCommentElement()` and `Velt.getContactElement()`.

**Verification:**
- [ ] `@here`, mentions, and contact-list calls use the contact element, not the comment element
- [ ] `assignUser()` passes `assignedTo: { userId, ... }`
- [ ] Custom search enabled via prop or `enableCustomAutocompleteSearch()` and answered from the `autocompleteSearch` event
- [ ] `onContactSelected()` and `autocompleteSearch` subscriptions are unsubscribed on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#mentions - @Mentions
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#customautocompletesearch - customAutocompleteSearch
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatecontactlist - updateContactList
- https://docs.velt.dev/api-reference/sdk/models/data-models#assigntoconfig - AssignToConfig
