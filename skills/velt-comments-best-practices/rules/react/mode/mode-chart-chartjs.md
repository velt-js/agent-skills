---
title: Add Comments to ChartJS Charts
impact: HIGH
impactDescription: Data point comments for Chart.js using manual positioning pattern
tags: chartjs, chart.js, chart, data-point, analytics
---

## Add Comments to ChartJS Charts

Add collaborative comments to Chart.js data points using the manual positioning pattern with context metadata.

**Setup Overview:**

Chart.js integration follows the custom charts pattern using `addManualComment` and `VeltCommentPin` for positioning.

**Complete Implementation:**

```jsx
import { useRef, useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ChartJSComments() {
  const chartId = 'analyticsBarChart';
  const chartRef = useRef(null);
  const { client } = useVeltClient();
  const commentModeState = useCommentModeState();
  const commentAnnotations = useCommentAnnotations();
  const [chartComments, setChartComments] = useState([]);

  const data = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Revenue',
      data: [12, 19, 3, 5, 2],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }]
  }), []);

  // Filter comments for this chart
  useEffect(() => {
    const filtered = commentAnnotations?.filter(
      (c) => c.context?.chartId === chartId
    );
    setChartComments(filtered || []);
  }, [commentAnnotations]);

  // Handle chart click
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
      const { datasetIndex, index } = elements[0];
      const dataset = chart.data.datasets[datasetIndex];
      const context = {
        chartId,
        seriesId: dataset.label,
        xValue: chart.data.labels[index],
        yValue: dataset.data[index]
      };
      addComment(context);
    }
  };

  const addComment = (context) => {
    if (client && commentModeState) {
      client.getCommentElement().addManualComment({ context });
    }
  };

  const findPoint = (context) => {
    const chart = chartRef.current;
    if (!chart) return null;

    const dataset = chart.data.datasets.find(d => d.label === context.seriesId);
    const index = chart.data.labels.indexOf(context.xValue);

    if (dataset && index !== -1) {
      return {
        x: chart.scales.x.getPixelForValue(index),
        y: chart.scales.y.getPixelForValue(context.yValue)
      };
    }
    return null;
  };

  const renderPin = (annotation) => {
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
        <Bar data={data} options={{}} ref={chartRef} />
        {chartComments.map(renderPin)}
      </div>
    </VeltProvider>
  );
}
```

**Key Chart.js Specifics:**

**1. Register Components:**
```jsx
ChartJS.register(CategoryScale, LinearScale, BarElement, ...);
```

**2. Get Elements at Click:**
```jsx
chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, false)
```

**3. Get Pixel Position:**
```jsx
x: chart.scales.x.getPixelForValue(index)
y: chart.scales.y.getPixelForValue(yValue)
```

**Verification Checklist:**
- [ ] Chart.js components registered
- [ ] Container has data-velt-manual-comment-container="true"
- [ ] Context includes chartId, seriesId, xValue, yValue
- [ ] Pin position calculated from chart scales
- [ ] Comments filtered by chartId

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/chart-comments-setup/chartjs - Setup reference
- https://docs.velt.dev/async-collaboration/comments/setup/chart-comments-setup/custom-charts - Pattern details
