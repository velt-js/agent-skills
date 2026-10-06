---
title: Debug Common Activity Log Issues
impact: LOW-MEDIUM
impactDescription: Quick troubleshooting for frequent activity log integration problems
tags: debug, troubleshooting, issues, verification, activity
---

## Debug Common Activity Log Issues

Common issues when integrating Velt Activity Logs and how to resolve them.

**Issue 1: Activities not appearing in feed**

```jsx
// Check these in order:
// 1. VeltProvider configured with a valid API key and authProvider?
// 2. Filters (documentIds, featureTypes, actionTypes, maxDays default 30) not excluding everything?
// 3. Document set (if using currentDocumentOnly or document filters)?
// 4. Subscription active (not unsubscribed prematurely)?
// 5. Workspace activity enabled? Check activityServiceConfig.isEnabled
//    with the Get Activity Config workspace REST API

// Quick verification:
const activities = useAllActivities();
console.log('Activities state:', activities);
// null = loading, [] = no activities, [...] = has data
```

**Issue 2: useAllActivities returns null indefinitely**

```jsx
// null is the loading state. If it persists:
// 1. Verify VeltProvider wraps the component and the user is authenticated
// 2. Check browser console for Velt SDK errors
// 3. On SDK builds before 6.0.13, VeltActivityLog could spin forever when the
//    workspace had activity disabled; 6.0.13+ settles to the empty state

function ActivityFeed() {
  const activities = useAllActivities();

  // Always handle null state explicitly
  if (activities === null) {
    return <div>Loading activities...</div>;
    // If this persists, check authProvider and workspace activity config
  }

  return activities.map(a => <div key={a.id}>{a.displayMessage}</div>);
}
```

**Issue 3: Observable subscription memory leak**

```jsx
// Incorrect — subscription never cleaned up
useEffect(() => {
  const activityElement = client.getActivityElement();
  activityElement.getAllActivities().subscribe((data) => {
    setActivities(data);
  });
  // Missing cleanup!
}, [client]);

// Correct — store and unsubscribe
useEffect(() => {
  const activityElement = client.getActivityElement();
  const subscription = activityElement.getAllActivities().subscribe((data) => {
    if (data !== null) setActivities(data);
  });
  return () => subscription?.unsubscribe(); // Cleanup
}, [client]);
```

**Issue 4: CRDT edit records too coarse or too frequent**

```jsx
// Default: one CRDT activity record per 10-minute window
// Adjust on the CRDT element (NOT the activity element); minimum 10,000 ms

// Incorrect target:
const activityElement = client.getActivityElement();
// activityElement has no setActivityDebounceTime method

// Correct target:
const crdtElement = client.getCrdtElement();
crdtElement.setActivityDebounceTime(10000); // 10 seconds is the minimum
```

**Issue 5: Custom activity template not rendering correctly**

```jsx
// Template variables must exactly match keys in displayMessageTemplateData

// Incorrect — {{ver}} doesn't match 'version' key
await activityElement?.createActivity({
  displayMessageTemplate: '{{actionUser.name}} deployed {{ver}}',
  displayMessageTemplateData: { version: 'v1.0' }, // Key is 'version' not 'ver'
});
// Result: "John deployed {{ver}}" — variable not interpolated

// Correct — keys match
await activityElement?.createActivity({
  displayMessageTemplate: '{{actionUser.name}} deployed {{version}}',
  displayMessageTemplateData: { version: 'v1.0' },
});
// Result: "John deployed v1.0"
```

**Issue 6: REST API Add endpoint fails**

```js
// Verify:
// 1. activityServiceConfig is enabled for the workspace (Console or
//    POST /v2/workspace/activityconfig/update with { isEnabled: true })
// 2. API key and auth token are correct
// 3. organizationId and documentId are present
// 4. Each activity has featureType, actionType, actionUser
//    (targetEntityId is required only when featureType is 'custom')
```

**Issue 7: "No activities found" flashes after switching organization or document**

```js
// SDK builds before 6.0.13 showed the empty state instead of the loading state
// right after an organization switch, document switch, or sign-out.
// Upgrade to 6.0.13 or later.
```

**Verification checklist:**
- [ ] VeltProvider wrapping components with valid API key and authProvider
- [ ] Workspace activityServiceConfig enabled (required for REST Add)
- [ ] User authenticated via Velt
- [ ] Document ID set for document-scoped feeds
- [ ] Observable subscriptions cleaned up on unmount
- [ ] CRDT debounce, if set, is at least 10,000 ms
- [ ] Template variable names match displayMessageTemplateData keys

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/activity/setup - "Setup"
- https://docs.velt.dev/async-collaboration/activity/customize-behavior#getallactivities - "getAllActivities"
- https://docs.velt.dev/api-reference/rest-apis/v2/activities/add-activities - "Add Activity Logs" (activityServiceConfig requirement)
- https://docs.velt.dev/release-notes/version-6/sdk-changelog - 6.0.13 Activity Logs fixes
