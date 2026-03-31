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
// 1. Activity Logs enabled in Velt Console?
//    console.velt.dev > Dashboard > Configuration > Activity Logs
// 2. VeltProvider configured with valid API key?
// 3. User authenticated via Velt?
// 4. Document ID set (if filtering by document)?
// 5. Subscription active (not unsubscribed prematurely)?

// Quick verification:
const activities = useAllActivities();
console.log('Activities state:', activities);
// null = loading, [] = no activities, [...] = has data
```

**Issue 2: useAllActivities returns null indefinitely**

```jsx
// null is the loading state — but if it persists:
// 1. Verify VeltProvider wraps the component
// 2. Verify Activity Logs enabled in Console
// 3. Check browser console for Velt SDK errors

function ActivityFeed() {
  const activities = useAllActivities();

  // Always handle null state explicitly
  if (activities === null) {
    return <div>Loading activities...</div>;
    // If this persists, check Console and VeltProvider setup
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

**Issue 4: CRDT edits flooding the activity feed**

```jsx
// Without debounce: every keystroke = one activity record
// Solution: set debounce time on CRDT element (NOT activity element)

// Incorrect target:
const activityElement = client.getActivityElement();
// activityElement has no setActivityDebounceTime method

// Correct target:
const crdtElement = client.getCrdtElement();
crdtElement.setActivityDebounceTime(5000); // 5-second batching
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

```jsx
// The Add activities REST endpoint may require additional configuration
// Verify:
// 1. API key and auth token are correct
// 2. organizationId matches your workspace
// 3. Required fields present: featureType, actionType, actionUser, targetEntityId
// 4. actionUser includes at minimum: { userId, name }
```

**Verification checklist:**
- [ ] Activity Logs enabled in Velt Console
- [ ] VeltProvider wrapping components with valid API key
- [ ] User authenticated via Velt
- [ ] Document ID set for document-scoped feeds
- [ ] Observable subscriptions cleaned up on unmount
- [ ] CRDT debounce configured to reduce feed noise
- [ ] Template variable names match displayMessageTemplateData keys

**Source Pointer:** https://docs.velt.dev/async-collaboration/activity/setup; https://docs.velt.dev/async-collaboration/activity/customize-behavior
