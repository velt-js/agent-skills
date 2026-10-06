---
title: Use Locations for Sub-Areas Within a Document
impact: MEDIUM
impactDescription: Locations partition a document (slides, video timestamps, dashboard filters) so comments and presence group correctly without creating extra documents
tags: setLocations, setLocation, useSetLocations, useSetLocation, location, locationName, rootLocationId, appendLocation, data-velt-location-id, unsetLocationsIds, removeLocations
---

## Use Locations for Sub-Areas Within a Document

A location is an optional subspace inside a document. Use it for slides in a deck, timestamps in a video, or filters on a dashboard. Do not create a separate document per sub-area: everyone with access to the document can access all its locations, and access control cannot be set per location. The sidebar groups comments by location automatically.

**Incorrect (one document per slide):**

```jsx
// Splits one presentation into many documents: separate presence, separate access
setDocuments([{ id: `deck-42-slide-${slideIndex}`, metadata: { documentName: `Slide ${slideIndex}` } }]);
```

**Correct (React / Next.js):**

```jsx
import { useEffect } from "react";
import { useSetLocations, useVeltClient } from "@veltdev/react";

function SlideLocation({ slideId, slideTitle }) {
  // Hook
  const { setLocations } = useSetLocations();

  useEffect(() => {
    setLocations([{ id: slideId, locationName: slideTitle }]);
  }, [slideId, slideTitle]);

  return null;
}

// API Method
const { client } = useVeltClient();
await client.setLocations(
  [
    { id: "slide-1", locationName: "Slide 1" },
    { id: "slide-2", locationName: "Slide 2" },
  ],
  { rootLocationId: "slide-2" }
);
```

**Correct (Other Frameworks):**

```js
await Velt.setLocations(
  [
    { id: "slide-1", locationName: "Slide 1" },
    { id: "slide-2", locationName: "Slide 2" },
  ],
  { rootLocationId: "slide-2" }
);

// Append more locations without replacing the current ones
await Velt.setLocations([{ id: "slide-3", locationName: "Slide 3" }], { appendLocation: true });
```

**Location object:**

| Field | Rule |
|-------|------|
| `id` | String or number. Optional when `locationName` is set. An `id` of `0` is valid and takes precedence over `locationName` |
| `locationName` | Non-empty display name shown in components like `VeltCommentsSidebar`. Identifies the location when `id` is omitted |
| custom fields | Any extra keys you need |

**Several locations on one page:** add `data-velt-location-id` to each location's container so new comments attach to the right location.

```html
<div data-velt-location-id="slide-1">...</div>
<div data-velt-location-id="slide-2">...</div>
```

**Cleanup:** `unsetLocationsIds()` with no arguments removes all locations; pass ids to remove specific ones. Since v6.0.0-beta.9, `removeLocations()` with no arguments clears the current location.

**Verification:**
- [ ] Locations are set after the document is set, inside a child of `VeltProvider`
- [ ] Each location has an `id` or a non-empty `locationName`
- [ ] The first location (or `rootLocationId`) is the one features write to by default
- [ ] Multi-location pages use `data-velt-location-id` containers

**Source Pointers:**
- https://docs.velt.dev/key-concepts/overview#locations - Locations (properties, Subscribe to Locations, Location Boundaries)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setlocations - setLocations()
- https://docs.velt.dev/api-reference/sdk/api/api-methods#removelocations - removeLocations()
- https://docs.velt.dev/get-started/advanced#locations - Locations
