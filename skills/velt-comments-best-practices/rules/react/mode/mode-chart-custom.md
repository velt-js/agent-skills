---
title: Add Comments to Custom Charts with Manual Positioning
impact: HIGH
impactDescription: Manual comment pin positioning for any charting library
tags: chart, custom, manual, veltcommentpin, context, data-point
---

## Add Comments to Custom Charts with Manual Positioning

For charts without dedicated Velt integration (or any custom chart library), use manual comment positioning with VeltCommentPin and context metadata.

**Incorrect (using freestyle without data binding):**

```jsx
// Comments won't be tied to specific data points
<VeltComments />
<VeltCommentTool />
<Bar data={data} options={options} />
```

**Correct (with manual positioning):**

```jsx
import { useRef, useEffect, useState } from 'react';
import { Chart as ChartJS } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  VeltProvider,
  VeltComments,
  VeltCommentTool,
  VeltCommentPin,
  useVeltClient,
  useCommentAnnotations,
  useCommentModeState
} from '@veltdev/react';

export default function CustomChartComments() {
  const chartRef = useRef(null);
  const chartId = 'myDataChart';
  const { client } = useVeltClient();
  const commentModeState = useCommentModeState();
  const commentAnnotations = useCommentAnnotations();
  const [chartComments, setChartComments] = useState([]);

  // Filter comments for this chart
  useEffect(() => {
    const filtered = commentAnnotations?.filter(
      (c) => c.context?.chartId === chartId
    );
    setChartComments(filtered || []);
  }, [commentAnnotations]);

  // Handle chart click - find data point and add comment
  const handleChartClick = (event) => {
    const chart = chartRef.current;
    if (!chart || !commentModeState) return;

    const elements = chart.getElementsAtEventForMode(
      event.nativeEvent,
      'nearest',
      { intersect: true },
      false
    );

    if (elements.length > 0) {
      const element = elements[0];
      const dataset = chart.data.datasets[element.datasetIndex];
      const xValue = chart.data.labels[element.index];
      const yValue = dataset.data[element.index];

      // Context includes data point info for positioning
      const context = {
        chartId,
        seriesId: dataset.label,
        xValue,
        yValue
      };

      addManualComment(context);
    }
  };

  // Add comment with context
  const addManualComment = (context) => {
    if (client && commentModeState) {
      const commentElement = client.getCommentElement();
      commentElement.addManualComment({ context });
    }
  };

  // Calculate pin position from context
  const findPoint = (context) => {
    const chart = chartRef.current;
    if (!chart) return null;

    const dataset = chart.data.datasets.find(
      (d) => d.label === context.seriesId
    );
    const index = chart.data.labels.indexOf(context.xValue);

    if (dataset && index !== -1 && dataset.data[index] === context.yValue) {
      return {
        x: chart.scales.x.getPixelForValue(index),
        y: chart.scales.y.getPixelForValue(context.yValue)
      };
    }
    return null;
  };

  // Render comment pin at calculated position
  const renderCommentPin = (annotation) => {
    const point = findPoint(annotation.context || {});
    if (!point) return null;

    return (
      <div
        key={annotation.annotationId}
        style={{
          position: 'absolute',
          left: `${point.x}px`,
          top: `${point.y}px`,
          transform: 'translate(0%, -100%)',
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
        style={{ position: 'relative' }}
        onClick={handleChartClick}
        data-velt-manual-comment-container="true"
      >
        <Bar data={data} options={options} ref={chartRef} />
        {chartComments.map(renderCommentPin)}
      </div>
    </VeltProvider>
  );
}
```

**Key Steps:**

**1. Container Setup:**
```jsx
<div
  style={{ position: 'relative' }}
  data-velt-manual-comment-container="true"
>
```

**2. Handle Click - Get Data Point:**
```jsx
const elements = chart.getElementsAtEventForMode(event, 'nearest', ...);
const context = { chartId, seriesId, xValue, yValue };
```

**3. Add Manual Comment:**
```jsx
const commentElement = client.getCommentElement();
commentElement.addManualComment({ context });
```

**4. Get & Filter Annotations:**
```jsx
const commentAnnotations = useCommentAnnotations();
const filtered = commentAnnotations?.filter(c => c.context?.chartId === chartId);
```

**5. Render Pins with Position:**
```jsx
<VeltCommentPin annotationId={annotation.annotationId} />
```

**Verification Checklist:**
- [ ] Container has data-velt-manual-comment-container="true"
- [ ] Container has position: relative
- [ ] Context includes chartId for filtering
- [ ] Context includes data for recalculating position
- [ ] VeltCommentPin receives correct annotationId

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/chart-comments-setup/custom-charts.mdx` - Complete setup
