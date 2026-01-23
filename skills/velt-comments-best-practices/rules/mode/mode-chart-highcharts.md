---
title: Add Data Point Comments to Highcharts
impact: HIGH
impactDescription: Comments on chart data points using VeltHighChartComments
tags: highcharts, chart, data-point, velthighchartcomments, analytics
---

## Add Data Point Comments to Highcharts

Add collaborative comments to Highcharts data points using Velt's dedicated Highcharts integration component.

**Incorrect (using freestyle on chart):**

```jsx
// Freestyle comments won't attach to data points properly
<VeltComments />
<VeltCommentTool />
<HighchartsReact highcharts={Highcharts} options={options} />
```

**Correct (using VeltHighChartComments):**

```jsx
import { useRef } from 'react';
import { VeltProvider, VeltComments, VeltHighChartComments } from '@veltdev/react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function HighchartsWithComments() {
  const chartComponentRef = useRef(null);

  const options = {
    // Your Highcharts configuration
    series: [{
      data: [1, 2, 3, 4, 5]
    }]
  };

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      <div style={{ position: 'relative' }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          ref={chartComponentRef}
        />

        {chartComponentRef.current && (
          <VeltHighChartComments
            id="my-highcharts-example"
            chartComputedData={chartComponentRef.current}
          />
        )}
      </div>
    </VeltProvider>
  );
}
```

**Key Setup Requirements:**

1. **Container Styling:**
```jsx
<div style={{ position: 'relative' }}>
  {/* Chart and Velt component */}
</div>
```

2. **Chart Ref:**
```jsx
const chartComponentRef = useRef(null);

<HighchartsReact
  ref={chartComponentRef}
  ...
/>
```

3. **Conditional Rendering:**
```jsx
{chartComponentRef.current && (
  <VeltHighChartComments
    id="unique-chart-id"
    chartComputedData={chartComponentRef.current}
  />
)}
```

**VeltHighChartComments Props:**

| Prop | Type | Description |
|------|------|-------------|
| `id` | string | Unique ID to scope comments to this chart |
| `chartComputedData` | ref | Reference to HighchartsReact component |
| `dialogMetadataTemplate` | array | Customize metadata display order |

**Customize Metadata Display:**

```jsx
<VeltHighChartComments
  id="my-chart"
  chartComputedData={chartComponentRef.current}
  dialogMetadataTemplate={['label', 'value', 'groupId']}
/>

// Default: ['groupId', 'label', 'value']
```

**Verification Checklist:**
- [ ] Container div has position: relative
- [ ] Chart ref is created and passed to HighchartsReact
- [ ] VeltHighChartComments rendered conditionally when ref exists
- [ ] Unique id assigned to VeltHighChartComments
- [ ] chartComputedData receives the ref

**Source Pointers:**
- `/docs/async-collaboration/comments/setup/chart-comments-setup/highcharts.mdx` - Complete setup
