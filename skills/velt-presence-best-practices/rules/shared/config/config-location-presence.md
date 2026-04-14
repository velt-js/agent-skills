---
title: Filter Presence by Location within a Document
impact: MEDIUM
impactDescription: Show presence scoped to a specific section or area of a document
tags: location, locationId, section, scope, presence-config
---

## Filter Presence by Location

In multi-section documents, you can scope presence to a specific section using the `locationId` prop. This shows only the users who are active in that particular area, rather than everyone viewing the document.

**Why this matters:**

In apps with distinct sections — such as a spreadsheet with multiple sheets, a slide deck with individual slides, or a document with chapters — global document presence is too coarse. Users need to know who is working in the same section to avoid conflicts and coordinate edits effectively.

**React: Presence scoped to a location**

```jsx
import { VeltPresence } from "@veltdev/react";

function SectionHeader({ sectionId, title }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <VeltPresence locationId={sectionId} />
    </div>
  );
}
```

**React: Multiple sections with independent presence**

```jsx
import { VeltPresence } from "@veltdev/react";

function MultiSectionDocument() {
  return (
    <div>
      <section>
        <div className="section-toolbar">
          <h2>Introduction</h2>
          <VeltPresence locationId="section-intro" />
        </div>
        {/* Section content */}
      </section>

      <section>
        <div className="section-toolbar">
          <h2>Analysis</h2>
          <VeltPresence locationId="section-analysis" />
        </div>
        {/* Section content */}
      </section>
    </div>
  );
}
```

**HTML: Presence scoped to a location**

```html
<div class="section-header">
  <h2>Introduction</h2>
  <velt-presence location-id="section-intro"></velt-presence>
</div>

<div class="section-header">
  <h2>Analysis</h2>
  <velt-presence location-id="section-analysis"></velt-presence>
</div>
```

**Use cases for location-scoped presence:**

| App Type | Location ID Strategy |
|----------|---------------------|
| Spreadsheet | Sheet name or tab ID (`sheet-1`, `sheet-2`) |
| Slide deck | Slide index or ID (`slide-0`, `slide-5`) |
| Multi-chapter document | Chapter or section ID (`chapter-intro`) |
| Kanban board | Column or card ID (`column-in-progress`) |

**How it works:**

When you set `locationId`, VeltPresence filters its avatar list to only users whose current location matches that ID. Users must also have their location set (via Velt's location tracking) for this filtering to work correctly.

A `VeltPresence` without `locationId` still shows all users in the document, so you can combine a global presence bar in the header with per-section presence indicators.

**Verification:**
- [ ] `locationId` is set on each section's `VeltPresence` component
- [ ] Each section shows only users active in that specific location
- [ ] Location IDs are stable and unique within the document
- [ ] Global presence (no `locationId`) still works in the main header if needed
- [ ] Users navigating between sections update presence in real time

**Source Pointers:**
- `https://docs.velt.dev/presence/customize-behavior/set-location` - Location-based presence
