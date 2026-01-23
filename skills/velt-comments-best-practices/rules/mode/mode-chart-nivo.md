---
title: Add Comments to Nivo Charts
impact: HIGH
impactDescription: Data point comments for Nivo charts using manual positioning pattern
tags: nivo, chart, data-point, analytics, react-visualization
---

## Add Comments to Nivo Charts

Add collaborative comments to Nivo chart data points using the manual positioning pattern.

**Setup Overview:**

Nivo charts integration follows the custom charts pattern using `addManualComment` and `VeltCommentPin` for positioning. Since Nivo charts are SVG-based, you'll need to handle click events and calculate positions accordingly.

**Implementation Pattern:**

```jsx
import { useState, useEffect, useRef } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import {
  VeltProvider,
  VeltComments,
  VeltCommentTool,
  VeltCommentPin,
  useVeltClient,
  useCommentAnnotations,
  useCommentModeState
} from '@veltdev/react';

export default function NivoChartComments() {
  const chartId = 'nivoBarChart';
  const containerRef = useRef(null);
  const { client } = useVeltClient();
  const commentModeState = useCommentModeState();
  const commentAnnotations = useCommentAnnotations();
  const [chartComments, setChartComments] = useState([]);

  const data = [
    { category: 'A', value: 100 },
    { category: 'B', value: 200 },
    { category: 'C', value: 150 },
  ];

  // Filter comments for this chart
  useEffect(() => {
    const filtered = commentAnnotations?.filter(
      (c) => c.context?.chartId === chartId
    );
    setChartComments(filtered || []);
  }, [commentAnnotations]);

  // Handle bar click from Nivo
  const handleBarClick = (bar, event) => {
    if (!commentModeState || !client) return;

    const context = {
      chartId,
      category: bar.data.category,
      value: bar.data.value,
      // Store click position for pin rendering
      x: bar.x + bar.width / 2,
      y: bar.y
    };

    client.getCommentElement().addManualComment({ context });
  };

  const renderPin = (annotation) => {
    const ctx = annotation.context || {};
    if (!ctx.x || !ctx.y) return null;

    return (
      <div
        key={annotation.annotationId}
        style={{
          position: 'absolute',
          left: `${ctx.x}px`,
          top: `${ctx.y}px`,
          transform: 'translate(-50%, -100%)',
          zIndex: 1000
        }}
      >
        <VeltCommentPin annotationId={annotation.annotationId} />
      </div>
    );
  };

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentTool />

      <div
        ref={containerRef}
        style={{ position: 'relative', height: 400 }}
        data-velt-manual-comment-container="true"
      >
        <ResponsiveBar
          data={data}
          keys={['value']}
          indexBy="category"
          onClick={handleBarClick}
          // ... other Nivo props
        />
        {chartComments.map(renderPin)}
      </div>
    </VeltProvider>
  );
}
```

**Nivo-Specific Considerations:**

**1. Click Handler:**
Nivo provides bar data with position info:
```jsx
onClick={(bar, event) => {
  // bar.x, bar.y, bar.width, bar.height available
  // bar.data contains the data object
}}
```

**2. Position Storage:**
Store pixel positions in context since Nivo doesn't expose scales like Chart.js:
```jsx
const context = {
  chartId,
  category: bar.data.category,
  value: bar.data.value,
  x: bar.x + bar.width / 2,
  y: bar.y
};
```

**3. Responsive Charts:**
For `ResponsiveBar`/`ResponsiveLine`, positions are relative to container.

**Verification Checklist:**
- [ ] Container has data-velt-manual-comment-container="true"
- [ ] Container has position: relative
- [ ] onClick handler captures bar data and position
- [ ] Context stores position for pin rendering
- [ ] Comments filtered by chartId

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/chart-comments-setup/nivo-charts.mdx` - Setup reference
- `/docs/async-collaboration/comments/setup/chart-comments-setup/custom-charts.mdx` - Pattern details
