# Velt Comments Best Practices

**Version 1.0.0**  
Velt  
January 2026

> **Note:**  
> This document is mainly for agents and LLMs to follow when maintaining,  
> generating, or refactoring codebases. Humans may also find it useful,  
> but guidance here is optimized for automation and consistency by  
> AI-assisted workflows.

---

## Abstract

Comprehensive Velt Comments implementation guide covering comment modes, setup patterns, UI customization, and best practices. This skill provides evidence-backed patterns for integrating Velt's collaborative comments feature into React, Next.js, and other web applications. Covers Freestyle, Popover, Stream, Text, Page Mode, Inline Comments, rich text editor integrations (TipTap, SlateJS, Lexical), media player comments (Video, Lottie), chart comments (Highcharts, ChartJS, Nivo), and standalone component patterns.

---

## Table of Contents

1. [Core Setup](#1-core-setup) — **CRITICAL**
   - 1.1 [Authenticate Users Before Using Comments](#11-authenticate-users-before-using-comments)
   - 1.2 [Initialize Document Context for Comments](#12-initialize-document-context-for-comments)
   - 1.3 [Initialize VeltProvider with API Key](#13-initialize-veltprovider-with-api-key)

2. [Comment Modes](#2-comment-modes) — **HIGH**
   - 2.1 [Add Comments to Canvas/Drawing Applications](#21-add-comments-to-canvasdrawing-applications)
   - 2.2 [Add Comments to ChartJS Charts](#22-add-comments-to-chartjs-charts)
   - 2.3 [Add Comments to Custom Charts with Manual Positioning](#23-add-comments-to-custom-charts-with-manual-positioning)
   - 2.4 [Add Comments to Nivo Charts](#24-add-comments-to-nivo-charts)
   - 2.5 [Add Data Point Comments to Highcharts](#25-add-data-point-comments-to-highcharts)
   - 2.6 [Integrate Comments with Lexical Editor](#26-integrate-comments-with-lexical-editor)
   - 2.7 [Integrate Comments with SlateJS Editor](#27-integrate-comments-with-slatejs-editor)
   - 2.8 [Integrate Comments with TipTap Editor](#28-integrate-comments-with-tiptap-editor)
   - 2.9 [Add Frame-by-Frame Comments to Lottie Animations](#29-add-frame-by-frame-comments-to-lottie-animations)
   - 2.10 [Integrate Comments with Custom Video Player](#210-integrate-comments-with-custom-video-player)
   - 2.11 [Use Freestyle Mode for Pin-Anywhere Comments](#211-use-freestyle-mode-for-pin-anywhere-comments)
   - 2.12 [Use Inline Comments for Traditional Thread Style](#212-use-inline-comments-for-traditional-thread-style)
   - 2.13 [Use Page Mode for Page-Level Comments](#213-use-page-mode-for-page-level-comments)
   - 2.14 [Use Popover Mode for Table Cell Comments](#214-use-popover-mode-for-table-cell-comments)
   - 2.15 [Use Prebuilt Video Player for Quick Setup](#215-use-prebuilt-video-player-for-quick-setup)
   - 2.16 [Use Stream Mode for Google Docs-Style Comments](#216-use-stream-mode-for-google-docs-style-comments)
   - 2.17 [Use Text Mode for Text Highlight Comments](#217-use-text-mode-for-text-highlight-comments)

3. [Standalone Components](#3-standalone-components) — **MEDIUM-HIGH**
   - 3.1 [Use Comment Pin for Manual Position Control](#31-use-comment-pin-for-manual-position-control)
   - 3.2 [Use Comment Composer for Custom Comment Input](#32-use-comment-composer-for-custom-comment-input)
   - 3.3 [Use Comment Thread to Render Existing Comments](#33-use-comment-thread-to-render-existing-comments)

4. [Comment Surfaces](#4-comment-surfaces) — **MEDIUM-HIGH**
   - 4.1 [Use Comments Sidebar for Comment Navigation](#41-use-comments-sidebar-for-comment-navigation)
   - 4.2 [Use Sidebar Button to Toggle Comments Panel](#42-use-sidebar-button-to-toggle-comments-panel)

5. [UI Customization](#5-ui-customization) — **MEDIUM**
   - 5.1 [Customize Comment Bubble Display](#51-customize-comment-bubble-display)
   - 5.2 [Customize Comment Dialog Appearance](#52-customize-comment-dialog-appearance)
   - 5.3 [Use Wireframe Components for Custom UI](#53-use-wireframe-components-for-custom-ui)

6. [Data Model](#6-data-model) — **MEDIUM**
   - 6.1 [Filter and Group Comments](#61-filter-and-group-comments)
   - 6.2 [Work with Comment Annotations Data](#62-work-with-comment-annotations-data)
   - 6.3 [Add Custom Metadata to Comments with Context](#63-add-custom-metadata-to-comments-with-context)

7. [Debugging & Testing](#7-debugging-testing) — **LOW-MEDIUM**
   - 7.1 [Troubleshoot Common Velt Integration Issues](#71-troubleshoot-common-velt-integration-issues)
   - 7.2 [Verify Velt Comments Integration](#72-verify-velt-comments-integration)

8. [Moderation & Permissions](#8-moderation-permissions) — **LOW**

9. [Attachments & Reactions](#9-attachments-reactions) — **LOW**

---

## 1. Core Setup

**Impact: CRITICAL**

Essential setup patterns required for any Velt comments implementation. Includes provider initialization, document configuration, and user authentication.

### 1.1 Authenticate Users Before Using Comments

**Impact: CRITICAL (Required - SDK will not work without user authentication)**

Users must be authenticated with Velt before they can view or create comments. The SDK will not function properly without authentication.

**Incorrect (missing authentication):**

```jsx
// SDK won't work without authenticated user
import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY">
      <VeltComments />  {/* Users can't interact with comments */}
    </VeltProvider>
  );
}
```

**Correct (using authProvider - recommended):**

```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

const user = {
  userId: 'user-123',
  organizationId: 'org-abc',
  name: 'John Doe',
  email: 'john.doe@example.com',
  photoUrl: 'https://i.pravatar.cc/300',
};

export default function App() {
  return (
    <VeltProvider
      apiKey="YOUR_API_KEY"
      authProvider={{
        user,
        retryConfig: { retryCount: 3, retryDelay: 1000 },
        generateToken: async () => {
          // Fetch JWT token from your backend
          const token = await fetchVeltTokenFromBackend();
          return token;
        }
      }}
    >
      <VeltComments />
    </VeltProvider>
  );
}
```

**Alternative (using useIdentify hook):**

```jsx
import { VeltProvider, VeltComments, useIdentify } from '@veltdev/react';

function AuthComponent() {
  const user = {
    userId: 'user-123',
    organizationId: 'org-abc',
    name: 'John Doe',
    email: 'john.doe@example.com',
    photoUrl: 'https://i.pravatar.cc/300',
  };

  useIdentify(user);
  return null;
}

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY">
      <AuthComponent />
      <VeltComments />
    </VeltProvider>
  );
}
```

---

### 1.2 Initialize Document Context for Comments

**Impact: CRITICAL (Required - SDK will not work without document initialization)**

A Document represents a shared collaborative space. You must call `setDocument` or `setDocuments` to define the context where comments will be stored and retrieved.

**Incorrect (missing document setup):**

```jsx
// Comments won't be associated with any document
import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY" authProvider={...}>
      <VeltComments />  {/* No document context */}
    </VeltProvider>
  );
}
```

**Correct (using useVeltClient):**

```jsx
import { useEffect } from 'react';
import { VeltProvider, VeltComments, useVeltClient } from '@veltdev/react';

function DocumentSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      client.setDocuments([
        {
          id: 'unique-document-id',
          metadata: { documentName: 'My Document' }
        }
      ]);
    }
  }, [client]);

  return null;
}

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_API_KEY" authProvider={...}>
      <DocumentSetup />
      <VeltComments />
    </VeltProvider>
  );
}
```

**Correct (using useSetDocument hook):**

```jsx
import { VeltProvider, VeltComments, useSetDocument } from '@veltdev/react';

function DocumentComponent() {
  useSetDocument('my-document-id', { documentName: 'My Collaborative Document' });

  return (
    <div>
      <VeltComments />
      {/* Document content */}
    </div>
  );
}
```

**For HTML/Vanilla JS:**

```javascript
async function loadVelt() {
  await Velt.init("YOUR_VELT_API_KEY");

  // Set document after authentication
  Velt.setDocuments([
    { id: 'unique-document-id', metadata: { documentName: 'Document Name' } }
  ]);
}
```

---

### 1.3 Initialize VeltProvider with API Key

**Impact: CRITICAL (Required - Comments will not function without provider setup)**

The VeltProvider must wrap your application to enable any Velt collaboration features. Without this setup, no Velt components will render or function.

**Incorrect (missing provider):**

```jsx
// Comments won't work without VeltProvider
import { VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <div>
      <VeltComments />  {/* This will not work */}
    </div>
  );
}
```

**Correct (provider wrapping app):**

```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_VELT_API_KEY">
      <VeltComments />
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**For Next.js (App Router):**

```jsx
'use client';

import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="YOUR_VELT_API_KEY">
      <VeltComments />
      {/* Your app content */}
    </VeltProvider>
  );
}
```

**For HTML/Vanilla JS:**

```html
<script type="module" src="https://cdn.velt.dev/lib/sdk@latest/velt.js" onload="loadVelt()"></script>
<script>
  async function loadVelt() {
    await Velt.init("YOUR_VELT_API_KEY");
  }
</script>
<body>
  <velt-comments></velt-comments>
</body>
```

---

## 2. Comment Modes

**Impact: HIGH**

Different comment presentation and interaction modes for various use cases. Includes Freestyle, Popover, Stream, Text, Page, Inline, rich text editor integrations, media player comments, and chart comments.

### 2.1 Add Comments to Canvas/Drawing Applications

**Impact: HIGH (Manual comment positioning for HTML5 canvas and drawing apps)**

Add collaborative comments to HTML5 canvas or drawing applications using manual comment positioning with VeltCommentPin.

**Implementation:**

```jsx
import { useState, useEffect, useRef } from 'react';
import {
  VeltProvider,
  VeltComments,
  VeltCommentTool,
  VeltCommentPin,
  useVeltClient,
  useCommentAnnotations,
  useCommentModeState
} from '@veltdev/react';

export default function CanvasComments() {
  const canvasId = 'myDrawingCanvas';
  const canvasRef = useRef(null);
  const { client } = useVeltClient();
  const commentModeState = useCommentModeState();
  const commentAnnotations = useCommentAnnotations();
  const [canvasComments, setCanvasComments] = useState([]);

  // Filter comments for this canvas
  useEffect(() => {
    const filtered = commentAnnotations?.filter(
      (c) => c.context?.canvasId === canvasId
    );
    setCanvasComments(filtered || []);
  }, [commentAnnotations]);

  // Handle canvas click
  const handleCanvasClick = (event) => {
    if (!commentModeState || !client) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const context = {
      canvasId,
      commentType: 'manual',
      x,
      y,
      // Optional: store relative position for responsive
      xPercent: x / rect.width,
      yPercent: y / rect.height
    };

    client.getCommentElement().addManualComment({ context });
  };

  // Render comment pin at stored position
  const renderPin = (annotation) => {
    const ctx = annotation.context || {};
    if (ctx.x === undefined || ctx.y === undefined) return null;

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
        style={{ position: 'relative' }}
        data-velt-manual-comment-container="true"
      >
        <canvas
          ref={canvasRef}
          id={canvasId}
          width={800}
          height={600}
          onClick={handleCanvasClick}
          style={{ border: '1px solid #ccc' }}
        />
        {canvasComments.map(renderPin)}
      </div>
    </VeltProvider>
  );
}
```

**1. Calculate Click Position:**

```jsx
const rect = canvasRef.current.getBoundingClientRect();
const x = event.clientX - rect.left;
const y = event.clientY - rect.top;
```

**2. Store in Context:**

```jsx
const context = {
  canvasId,           // For filtering
  commentType: 'manual',
  x, y,               // Pixel position
  xPercent, yPercent  // Optional: relative position
};
```

**3. Add Manual Comment:**

```jsx
client.getCommentElement().addManualComment({ context });
```

**4. Position Pin:**

```jsx
style={{
  position: 'absolute',
  left: `${ctx.x}px`,
  top: `${ctx.y}px`,
  transform: 'translate(-50%, -100%)'
}}
```

**Alternative: Using onCommentAdd:**

```jsx
// Let Velt handle click, add metadata via callback
<VeltComments
  onCommentAdd={(event) => {
    // Add custom metadata to comment
    return {
      ...event,
      context: {
        ...event.context,
        canvasId,
        customData: 'value'
      }
    };
  }}
/>
```

---

### 2.2 Add Comments to ChartJS Charts

**Impact: HIGH (Data point comments for Chart.js using manual positioning pattern)**

Add collaborative comments to Chart.js data points using the manual positioning pattern with context metadata.

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

---

### 2.3 Add Comments to Custom Charts with Manual Positioning

**Impact: HIGH (Manual comment pin positioning for any charting library)**

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

---

### 2.4 Add Comments to Nivo Charts

**Impact: HIGH (Data point comments for Nivo charts using manual positioning pattern)**

Add collaborative comments to Nivo chart data points using the manual positioning pattern.

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

**1. Click Handler:**

```jsx
onClick={(bar, event) => {
  // bar.x, bar.y, bar.width, bar.height available
  // bar.data contains the data object
}}
```

**2. Position Storage:**

```jsx
const context = {
  chartId,
  category: bar.data.category,
  value: bar.data.value,
  x: bar.x + bar.width / 2,
  y: bar.y
};
```

---

### 2.5 Add Data Point Comments to Highcharts

**Impact: HIGH (Comments on chart data points using VeltHighChartComments)**

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

```jsx
<div style={{ position: 'relative' }}>
  {/* Chart and Velt component */}
</div>
const chartComponentRef = useRef(null);

<HighchartsReact
  ref={chartComponentRef}
  ...
/>
{chartComponentRef.current && (
  <VeltHighChartComments
    id="unique-chart-id"
    chartComputedData={chartComponentRef.current}
  />
)}
```

2. **Chart Ref:**
3. **Conditional Rendering:**

**Customize Metadata Display:**

```jsx
<VeltHighChartComments
  id="my-chart"
  chartComputedData={chartComponentRef.current}
  dialogMetadataTemplate={['label', 'value', 'groupId']}
/>

// Default: ['groupId', 'label', 'value']
```

---

### 2.6 Integrate Comments with Lexical Editor

**Impact: HIGH (Text comments in Lexical rich text editor with CommentNode)**

Add collaborative text comments to Lexical editor using Velt's Lexical extension. Users can select text and add comments that integrate with Lexical's node system.

**Incorrect (using default text mode):**

```jsx
// Default text mode doesn't integrate with Lexical properly
<VeltComments textMode={true} />
<LexicalComposer ... />
```

**Correct (with Lexical extension):**

```jsx
npm install @veltdev/lexical-velt-comments @veltdev/client lexical
import { VeltProvider, VeltComments } from '@veltdev/react';

<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { CommentNode } from '@veltdev/lexical-velt-comments';

const initialConfig = {
  namespace: 'MyEditor',
  nodes: [CommentNode],  // Register Velt comment node
  onError: console.error,
};

function Editor() {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* plugins */}
    </LexicalComposer>
  );
}
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { addComment, renderComments } from '@veltdev/lexical-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

function CommentPlugin() {
  const [editor] = useLexicalComposerContext();
  const commentAnnotations = useCommentAnnotations();

  // Render comments when annotations change
  useEffect(() => {
    if (editor && commentAnnotations?.length) {
      renderComments({ editor, commentAnnotations });
    }
  }, [editor, commentAnnotations]);

  const handleAddComment = () => {
    if (editor) {
      addComment({ editor });
    }
  };

  return (
    <button onMouseDown={(e) => {
      e.preventDefault();
      handleAddComment();
    }}>
      Add Comment
    </button>
  );
}
```

**Step 2: Configure VeltComments**
**Step 3: Register CommentNode in editor config**
**Step 4: Add comment functionality**

**Export Editor State Without Comments:**

```jsx
import { exportJSONWithoutComments } from '@veltdev/lexical-velt-comments';

// Store clean state without comment nodes
const cleanState = exportJSONWithoutComments(editor);
```

**Style Commented Text:**

```css
velt-comment-text[comment-available="true"] {
  background-color: #ffff00;
}
```

---

### 2.7 Integrate Comments with SlateJS Editor

**Impact: HIGH (Text comments in SlateJS rich text editor with custom elements)**

Add collaborative text comments to SlateJS editor using Velt's SlateJS extension. Users can select text and add comments that integrate with Slate's document model.

**Incorrect (using default text mode):**

```jsx
// Default text mode doesn't integrate with SlateJS properly
<VeltComments textMode={true} />
<Slate ... />
```

**Correct (with SlateJS extension):**

```jsx
npm install @veltdev/slate-velt-comments
import { VeltProvider, VeltComments } from '@veltdev/react';

<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
import { createEditor } from 'slate';
import { withReact, Slate, Editable, useSlate } from 'slate-react';
import { withHistory } from 'slate-history';
import { withVeltComments, addComment, renderComments, SlateVeltComment } from '@veltdev/slate-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

// Create editor with Velt extension
const editor = withVeltComments(
  withReact(withHistory(createEditor())),
  { HistoryEditor: SlateHistoryEditor }
);
import type { VeltCommentsElement } from '@veltdev/slate-velt-comments';

type CustomElement = VeltCommentsElement;

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
  }
}
function SlateEditor() {
  const editor = useSlate();
  const commentAnnotations = useCommentAnnotations();

  // Render comments when annotations change
  useEffect(() => {
    if (editor && commentAnnotations) {
      renderComments({ editor, commentAnnotations });
    }
  }, [commentAnnotations, editor]);

  const handleAddComment = () => {
    addComment({ editor });
  };

  return (
    <Slate editor={editor} initialValue={initialValue}>
      <button onMouseDown={(e) => {
        e.preventDefault();
        handleAddComment();
      }}>
        Comment
      </button>
      <Editable renderElement={renderElement} />
    </Slate>
  );
}

// Render Velt comment elements
const renderElement = (props) => {
  if (props.element.type === 'veltComment') {
    return <SlateVeltComment {...props} element={props.element} />;
  }
  return <p {...props.attributes}>{props.children}</p>;
};
```

**Step 2: Configure VeltComments**
**Step 3: Configure editor with extension**
**Step 4: Register custom type**
**Step 5: Render comments and add button**

**Style Commented Text:**

```css
velt-comment-text[comment-available="true"] {
  background-color: #ffff00;
}
```

---

### 2.8 Integrate Comments with TipTap Editor

**Impact: HIGH (Text comments in TipTap rich text editor with highlight marks)**

Add collaborative text comments to TipTap editor using Velt's TipTap extension. Users can select text and add comments that persist as marks in the editor.

**Incorrect (using default text mode instead of extension):**

```jsx
// Default text mode doesn't integrate with TipTap properly
<VeltComments textMode={true} />
<Editor ... />
```

**Correct (with TipTap extension):**

```jsx
npm install @veltdev/tiptap-velt-comments
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TiptapVeltComments, addComment, renderComments } from '@veltdev/tiptap-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

export default function TipTapComponent() {
  const commentAnnotations = useCommentAnnotations();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapVeltComments,
    ],
    content: '<p>Hello Velt!</p>',
  });

  // Render comments when annotations change
  useEffect(() => {
    if (editor && commentAnnotations?.length) {
      renderComments({ editor, commentAnnotations });
    }
  }, [editor, commentAnnotations]);

  const handleAddComment = () => {
    if (editor) {
      addComment({ editor });
    }
  };

  return (
    <div>
      <EditorContent editor={editor} />

      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddComment();
            }}
          >
            Add Comment
          </button>
        </BubbleMenu>
      )}
    </div>
  );
}
```

**Step 2: Configure VeltComments**
**Step 3: Add extension to TipTap editor**

**With Custom Metadata (Context):**

```jsx
addComment({
  editor,
  editorId: 'my-doc-1',
  context: {
    storyId: 'story-123',
    section: 'intro',
  },
});
```

**Configure Mark Persistence:**

```jsx
const editor = useEditor({
  extensions: [
    TiptapVeltComments.configure({
      persistVeltMarks: false, // Set false if storing HTML yourself
    }),
  ],
});
```

**Style Commented Text:**

```css
velt-comment-text[comment-available="true"] {
  background-color: #ffff00;
}
```

---

### 2.9 Add Frame-by-Frame Comments to Lottie Animations

**Impact: HIGH (Comments synced to specific frames in Lottie animations)**

Add collaborative comments to Lottie animations that sync with specific frames, similar to video player comments.

**Incorrect (missing location/frame management):**

```jsx
// Comments won't sync with animation frames
<VeltComments />
<LottiePlayer ... />
```

**Correct (with frame-synced commenting):**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentTool,
  VeltCommentPlayerTimeline,
  VeltCommentsSidebar,
  VeltSidebarButton,
  useVeltClient
} from '@veltdev/react';

export default function LottieComments() {
  const { client } = useVeltClient();
  const lottieRef = useRef(null);

  // Handle comment mode - pause and set location
  const onCommentModeChange = (mode) => {
    if (mode) {
      lottieRef.current?.pause();
      setLocation();
    }
  };

  // Set location with current frame
  const setLocation = () => {
    const currentFrame = Math.floor(lottieRef.current?.currentFrame || 0);
    client.setLocation({
      currentMediaPosition: currentFrame
    });
  };

  // Clear location when animation plays
  const removeLocation = () => {
    client.removeLocation();
  };

  // Handle comment click - seek to frame
  const onCommentClick = (event) => {
    const { location } = event;
    if (location?.currentMediaPosition !== undefined) {
      lottieRef.current.goToAndStop(location.currentMediaPosition, true);
      client.setLocation(location);
    }
  };

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments
        priority={true}
        autoCategorize={true}
        commentIndex={true}
      />

      <VeltCommentTool onCommentModeChange={onCommentModeChange} />
      <VeltSidebarButton />

      <div style={{ position: 'relative' }}>
        <LottiePlayer
          ref={lottieRef}
          onPlay={removeLocation}
          // ... other props
        />
        <VeltCommentPlayerTimeline
          totalMediaLength={120}
          onCommentClick={onCommentClick}
        />
      </div>

      <VeltCommentsSidebar
        embedMode={true}
        onCommentClick={onCommentClick}
      />
    </VeltProvider>
  );
}
```

**1. Set Total Media Length (frames):**

```jsx
<VeltCommentPlayerTimeline totalMediaLength={120} />

// Or via API:
const commentElement = client.getCommentElement();
commentElement.setTotalMediaLength(120);
```

**2. Set Location on Comment Mode:**

```jsx
const setLocation = () => {
  client.setLocation({
    currentMediaPosition: Math.floor(currentFrame)
  });
};
```

**3. Remove Location on Play:**

```jsx
const removeLocation = () => {
  client.removeLocation();
};
```

**4. Handle Comment Click:**

```jsx
const onCommentClick = (event) => {
  const { location } = event;
  if (location?.currentMediaPosition !== undefined) {
    // Seek to frame
    lottiePlayer.goToAndStop(location.currentMediaPosition, true);
    // Set location to show comment
    client.setLocation(location);
  }
};
```

**Limit Commentable Elements:**

```jsx
const commentElement = client.getCommentElement();
commentElement.allowedElementIds(['lottiePlayerContainer']);
```

**For HTML:**

```html
<velt-comments priority="true" auto-categorize="true"></velt-comments>

<velt-comment-tool></velt-comment-tool>

<div style="position: relative;">
  <your-lottie-player id="lottiePlayerContainer"></your-lottie-player>
  <velt-comment-player-timeline total-media-length="120"></velt-comment-player-timeline>
</div>
```

---

### 2.10 Integrate Comments with Custom Video Player

**Impact: HIGH (Add comments to any video player with timeline and sidebar)**

Add collaborative comments to your own video player using Velt's timeline component and location-based commenting system.

**Incorrect (missing location management):**

```jsx
// Comments won't sync with video timeline
<VeltComments />
<VeltCommentPlayerTimeline />
<video src="..." />
```

**Correct (with location and timeline integration):**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentTool,
  VeltCommentPlayerTimeline,
  VeltCommentsSidebar,
  VeltSidebarButton,
  useVeltClient
} from '@veltdev/react';

export default function VideoComments() {
  const { client } = useVeltClient();
  const videoRef = useRef(null);

  // Handle comment mode activation
  const onCommentModeChange = async (mode) => {
    if (mode) {
      // Pause video when commenting
      videoRef.current?.pause();

      // Set location with current video time
      const currentTime = Math.floor(videoRef.current?.currentTime || 0);
      await client.setLocations([{
        currentMediaPosition: currentTime,
        videoPlayerId: 'my-video-player'
      }]);
    }
  };

  // Handle video play - clear location
  const onVideoPlay = async () => {
    await client.unsetLocationsIds();
  };

  // Handle comment click - seek to timestamp
  const onCommentClick = async (event) => {
    const { location } = event;
    if (location?.currentMediaPosition !== undefined) {
      videoRef.current.currentTime = location.currentMediaPosition;
      videoRef.current.pause();
      await client.setLocations([location]);
    }
  };

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      <VeltCommentTool onCommentModeChange={onCommentModeChange} />
      <VeltSidebarButton />

      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          id="my-video-player"
          src="https://example.com/video.mp4"
          onPlay={onVideoPlay}
        />
        <VeltCommentPlayerTimeline
          videoPlayerId="my-video-player"
          totalMediaLength={120}
          onCommentClick={onCommentClick}
        />
      </div>

      <VeltCommentsSidebar
        embedMode={true}
        onCommentClick={onCommentClick}
      />
    </VeltProvider>
  );
}
```

**2. Timeline Setup:**

```jsx
<div style={{ position: 'relative' }}>  {/* Parent must not be static */}
  <YourVideoPlayer id="videoPlayerId" />
  <VeltCommentPlayerTimeline
    videoPlayerId="videoPlayerId"
    totalMediaLength={120}  {/* Total seconds or frames */}
  />
</div>
```

**3. Set Location When Commenting:**

```jsx
await client.setLocations([{
  currentMediaPosition: currentTimeInSeconds,
  videoPlayerId: 'videoPlayerId'
}]);
```

**4. Clear Location When Playing:**

```jsx
await client.unsetLocationsIds();
```

**5. Handle Comment Clicks:**

```jsx
const onCommentClick = async (event) => {
  const { location } = event;
  // Seek video to location.currentMediaPosition
  // Set location to show comment
  await client.setLocations([location]);
};
```

**For HTML:**

```html
<div style="position: relative;">
  <video id="videoPlayerId" src="..."></video>
  <velt-comment-player-timeline
    video-player-id="videoPlayerId"
    total-media-length="120"
  ></velt-comment-player-timeline>
</div>
```

---

### 2.11 Use Freestyle Mode for Pin-Anywhere Comments

**Impact: HIGH (Default mode - enables clicking anywhere to pin comments)**

Freestyle mode allows users to click anywhere on the page to pin comments. This is the default comment mode and works well for general page annotation or design feedback.

**Incorrect (missing VeltCommentTool):**

```jsx
// Users can't initiate comment mode without the tool
import { VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      {/* No way to start commenting */}
    </VeltProvider>
  );
}
```

**Correct (with VeltCommentTool):**

```jsx
import { VeltProvider, VeltComments, VeltCommentTool } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      <div className="toolbar">
        <VeltCommentTool />
      </div>
    </VeltProvider>
  );
}
```

**For HTML:**

```html
<body>
  <velt-comments></velt-comments>

  <div class="toolbar">
    <velt-comment-tool></velt-comment-tool>
  </div>
</body>
```

**Custom Comment Tool Button:**

```jsx
<VeltCommentTool>
  <button slot="button">
    {/* Your custom button */}
    Add Comment
  </button>
</VeltCommentTool>
```

---

### 2.12 Use Inline Comments for Traditional Thread Style

**Impact: HIGH (Traditional comment threads bound to container elements)**

Inline Comments mode shows comment threads directly within content sections, supporting both single-threaded and multi-threaded conversations.

**Incorrect (missing VeltInlineCommentsSection):**

```jsx
// Inline comments won't appear in the container
<VeltComments />

<section id="article-section">
  <p>Article content...</p>
  {/* No inline comments component */}
</section>
```

**Correct (with VeltInlineCommentsSection):**

```jsx
import { VeltProvider, VeltComments, VeltInlineCommentsSection } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      <section id="container-id">
        <div>Your Article Content</div>

        <VeltInlineCommentsSection
          targetElementId="container-id"
        />
      </section>
    </VeltProvider>
  );
}
```

**Multi-threaded vs Single-threaded:**

```jsx
// Multi-threaded (default) - multiple comment threads
<VeltInlineCommentsSection
  targetElementId="container-id"
  multiThread={true}
/>

// Single-threaded - one thread per section
<VeltInlineCommentsSection
  targetElementId="container-id"
  multiThread={false}
/>
```

**Custom Placeholder Text:**

```jsx
<VeltInlineCommentsSection
  targetElementId="container-id"
  commentPlaceholder="Add a comment..."
  replyPlaceholder="Write a reply..."
  composerPlaceholder="Start typing..."
/>
```

**Styling Options:**

```jsx
<VeltInlineCommentsSection
  targetElementId="container-id"
  shadowDom={false}
  dialogVariant="dialog-variant"
  variant="inline-section-variant"
  darkMode={true}
/>
```

**For HTML:**

```html
<velt-comments></velt-comments>

<section id="container-id">
  <div>Your Article</div>

  <velt-inline-comments-section
    target-element-id="container-id"
    multi-thread="true"
  >
  </velt-inline-comments-section>
</section>
```

---

### 2.13 Use Page Mode for Page-Level Comments

**Impact: HIGH (Comments at page level via sidebar, not attached to elements)**

Page mode enables users to leave comments at the page level through the Comments Sidebar, rather than attaching them to specific elements. Useful for general page feedback.

**Incorrect (missing pageMode on sidebar):**

```jsx
// Page comments won't appear at sidebar bottom
<VeltComments />
<VeltCommentsSidebar />
```

**Correct (with pageMode enabled):**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebar,
  VeltSidebarButton
} from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentsSidebar pageMode={true} />

      <div className="toolbar">
        <VeltSidebarButton />
      </div>
    </VeltProvider>
  );
}
```

**For HTML:**

```html
<velt-comments></velt-comments>
<velt-comments-sidebar page-mode="true"></velt-comments-sidebar>

<div class="toolbar">
  <velt-sidebar-button></velt-sidebar-button>
</div>
```

**Programmatic Page Mode Composer Control (v4.7.7+):**

```jsx
import { useVeltClient } from '@veltdev/react';

function PageModeControls() {
  const { client } = useVeltClient();

  const openComposerWithContext = () => {
    const commentElement = client.getCommentElement();
    // Set context data before opening composer
    commentElement.setContextInPageModeComposer({
      section: 'header',
      category: 'feedback'
    });
    // Focus the page mode composer
    commentElement.focusPageModeComposer();
  };

  const clearContext = () => {
    const commentElement = client.getCommentElement();
    commentElement.clearPageModeComposerContext();
  };

  return (
    <>
      <button onClick={openComposerWithContext}>Add Page Comment</button>
      <button onClick={clearContext}>Clear Context</button>
    </>
  );
}
```

---

### 2.14 Use Popover Mode for Table Cell Comments

**Impact: HIGH (Google Sheets-style comments attached to specific elements)**

Popover mode attaches comments to specific elements using `targetElementId`, similar to Google Sheets comments on cells. Use this for tables, grids, or any UI where comments should be bound to specific elements.

**Incorrect (missing popoverMode and targetElementId):**

```jsx
// Comments won't bind to specific cells
<VeltComments />

<div className="table">
  <div className="cell" id="cell-1">
    <VeltCommentTool />  {/* Not bound to the cell */}
  </div>
</div>
```

**Correct (with popoverMode and targetElementId):**

```jsx
import { VeltProvider, VeltComments, VeltCommentTool, VeltCommentBubble } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments popoverMode={true} />

      <div className="table">
        <div className="cell" id="cell-id-1">
          <VeltCommentTool targetElementId="cell-id-1" />
          <VeltCommentBubble targetElementId="cell-id-1" />
        </div>
        <div className="cell" id="cell-id-2">
          <VeltCommentTool targetElementId="cell-id-2" />
          <VeltCommentBubble targetElementId="cell-id-2" />
        </div>
      </div>
    </VeltProvider>
  );
}
```

**Two Patterns for Comment Tools:**

```jsx
<div className="cell" id="cell-id-1">
  <VeltCommentTool targetElementId="cell-id-1" />
</div>
<VeltCommentTool />  {/* Single tool in toolbar */}

<div className="cell"
     id="cell-A"
     data-velt-target-comment-element-id="cell-A">
  Content
</div>
```

**Pattern B: Single Comment Tool with data attributes**

**Adding Custom Metadata (Context):**

```jsx
<VeltCommentTool
  targetElementId="cell-id"
  context={{ rowId: 'row-1', columnId: 'col-A', value: 100 }}
/>
```

**Comment Bubble (shows reply count):**

```jsx
<VeltCommentBubble
  targetElementId="cell-id-1"
  commentCountType="unread"  // or "total"
/>
```

**Disable Triangle Indicator:**

```jsx
<VeltComments popoverMode={true} popoverTriangleComponent={false} />
```

**For HTML:**

```html
<velt-comments popover-mode="true"></velt-comments>

<div class="cell" id="cell-1">
  <velt-comment-tool target-element-id="cell-1"></velt-comment-tool>
  <velt-comment-bubble target-element-id="cell-1"></velt-comment-bubble>
</div>
```

---

### 2.15 Use Prebuilt Video Player for Quick Setup

**Impact: HIGH (Velt-provided video player with built-in commenting)**

Velt provides a prebuilt video player component with commenting and sync features already integrated. Use this for quick implementation without custom player setup.

**Incorrect (manual setup when prebuilt works):**

```jsx
// Unnecessary complexity for simple video commenting
<VeltComments />
<VeltCommentTool />
<VeltCommentPlayerTimeline ... />
<video src="..." />  // Manual integration required
```

**Correct (using prebuilt player):**

```jsx
import { VeltProvider, VeltVideoPlayer } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltVideoPlayer
        src="https://example.com/video.mp4"
        darkMode={false}
        sync={true}
      />
    </VeltProvider>
  );
}
```

**For HTML:**

```html
<velt-video-player
  src="https://example.com/video.mp4"
  dark-mode="false"
  sync="true"
>
</velt-video-player>
```

---

### 2.16 Use Stream Mode for Google Docs-Style Comments

**Impact: HIGH (Comments appear in a side column synchronized with scroll position)**

Stream mode renders comment dialogs in a column on the right side, similar to Google Docs. Comments auto-position and scroll with content. Works well combined with Text mode.

**Incorrect (missing streamMode and container reference):**

```jsx
// Comments won't appear in stream layout
<VeltComments />
<div className="document">Content</div>
```

**Correct (with streamMode and container ID):**

```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <div id="scrolling-container-id" style={{ overflow: 'auto', height: '100vh' }}>
        {/* This element is scrollable */}
        <div className="target-content">
          {/* This element contains content to be commented */}
          <p>Your document content here...</p>
        </div>

        <VeltComments
          streamMode={true}
          streamViewContainerId="scrolling-container-id"
        />
      </div>
    </VeltProvider>
  );
}
```

**For HTML:**

```html
<div id="scrolling-container-id">
  <div class="target-content">
    <!-- Your document content -->
  </div>

  <velt-comments
    stream-mode="true"
    stream-view-container-id="scrolling-container-id"
  ></velt-comments>
</div>
```

---

### 2.17 Use Text Mode for Text Highlight Comments

**Impact: HIGH (Comments attached to selected text, like Google Docs highlighting)**

Text mode allows users to select text and attach comments to the selection. This is enabled by default and works similarly to Google Docs text comments.

**Incorrect (text mode disabled unintentionally):**

```jsx
// Text mode disabled - users can't highlight to comment
<VeltComments textMode={false} />
```

**Correct (text mode enabled - default behavior):**

```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments textMode={true} />

      <article>
        <p>Select any text in this paragraph to add a comment...</p>
      </article>
    </VeltProvider>
  );
}
```

**For HTML:**

```html
<velt-comments text-mode="true"></velt-comments>

<article>
  <p>Select any text to add a comment...</p>
</article>
```

**Disable Text Mode (when using editor integrations):**

```jsx
// Disable for editor integrations
<VeltComments textMode={false} />
```

**Combining with Stream Mode:**

```jsx
<VeltComments
  textMode={true}
  streamMode={true}
  streamViewContainerId="document-container"
/>
```

---

## 3. Standalone Components

**Impact: MEDIUM-HIGH**

Individual comment components for building custom implementations. Includes Comment Pin, Comment Thread, and Comment Composer for DIY comment interfaces.

### 3.1 Use Comment Pin for Manual Position Control

**Impact: MEDIUM-HIGH (Full control over comment pin placement in complex UIs)**

VeltCommentPin gives you complete control over where comment pins appear. Use this for complex UIs, canvas applications, or when automatic positioning doesn't meet your needs.

**1. Add Comments with Custom Metadata:**

```jsx
<VeltComments
  onCommentAdd={(event) => {
    // Add custom positioning data
    return {
      ...event,
      context: {
        ...event.context,
        customX: 100,
        customY: 200
      }
    };
  }}
/>
const { client } = useVeltClient();
const commentModeState = useCommentModeState();

const handleClick = (event) => {
  if (client && commentModeState) {
    const commentElement = client.getCommentElement();
    commentElement.addManualComment({
      context: {
        x: event.clientX,
        y: event.clientY
      }
    });
  }
};
```

Option B: Using addManualComment API

**2. Retrieve Comment Annotations:**

```jsx
import { useCommentAnnotations } from '@veltdev/react';

const commentAnnotations = useCommentAnnotations();

// Or via API
const commentElement = client.getCommentElement();
commentElement.getAllCommentAnnotations().subscribe((annotations) => {
  // Process annotations
});
```

**3. Render Comment Pins:**

```jsx
import { VeltCommentPin } from '@veltdev/react';

function CommentPins({ annotations }) {
  return annotations.map((annotation) => {
    const { x, y } = annotation.context || {};

    return (
      <div
        key={annotation.annotationId}
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <VeltCommentPin annotationId={annotation.annotationId} />
      </div>
    );
  });
}
```

**Complete Example:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentTool,
  VeltCommentPin,
  useVeltClient,
  useCommentAnnotations,
  useCommentModeState
} from '@veltdev/react';

export default function ManualPinExample() {
  const { client } = useVeltClient();
  const commentModeState = useCommentModeState();
  const commentAnnotations = useCommentAnnotations();

  const handleContainerClick = (event) => {
    if (!client || !commentModeState) return;

    const rect = event.currentTarget.getBoundingClientRect();
    client.getCommentElement().addManualComment({
      context: {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      }
    });
  };

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentTool />

      <div
        style={{ position: 'relative', width: '100%', height: 500 }}
        data-velt-manual-comment-container="true"
        onClick={handleContainerClick}
      >
        {commentAnnotations?.map((annotation) => (
          <div
            key={annotation.annotationId}
            style={{
              position: 'absolute',
              left: annotation.context?.x,
              top: annotation.context?.y
            }}
          >
            <VeltCommentPin annotationId={annotation.annotationId} />
          </div>
        ))}
      </div>
    </VeltProvider>
  );
}
```

---

### 3.2 Use Comment Composer for Custom Comment Input

**Impact: MEDIUM-HIGH (Add comment input anywhere in your application)**

The Comment Standalone Composer lets you add comment input anywhere in your application. Combine with Comment Thread and Comment Pin for fully custom comment interfaces.

**Implementation:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentComposer,
  useCommentAnnotations
} from '@veltdev/react';

function CustomCommentSidebar() {
  const commentAnnotations = useCommentAnnotations();

  return (
    <div className="custom-sidebar">
      {/* Composer for new comments */}
      <div className="new-comment-section">
        <h4>Add Comment</h4>
        <VeltCommentComposer />
      </div>

      {/* List existing comments */}
      <div className="comments-list">
        {commentAnnotations?.map((annotation) => (
          <div key={annotation.annotationId}>
            {/* Render comment content */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <CustomCommentSidebar />
    </VeltProvider>
  );
}
```

**Combining with Other Standalone Components:**

```jsx
import {
  VeltCommentComposer,
  VeltCommentThread,
  VeltCommentPin
} from '@veltdev/react';

function FullCustomInterface() {
  const commentAnnotations = useCommentAnnotations();

  return (
    <div className="layout">
      {/* Main content area with pins */}
      <div className="content" data-velt-manual-comment-container="true">
        {commentAnnotations?.map((a) => (
          <div
            key={a.annotationId}
            style={{ position: 'absolute', left: a.context?.x, top: a.context?.y }}
          >
            <VeltCommentPin annotationId={a.annotationId} />
          </div>
        ))}
      </div>

      {/* Sidebar with composer and threads */}
      <div className="sidebar">
        <VeltCommentComposer />

        {commentAnnotations?.map((a) => (
          <VeltCommentThread key={a.annotationId} annotationId={a.annotationId} />
        ))}
      </div>
    </div>
  );
}
```

**Composer Props (v4.7.3+):**

```jsx
<VeltCommentComposer
  placeholder="Leave a comment..."       // Custom placeholder text (v4.7.3+)
  readOnly={false}                        // Disable input (v4.7.9+)
  targetComposerElementId="my-composer"   // Associate with specific element (v4.7.4+)
/>
```

**Note:** The prop `targetElementId` was renamed to `targetComposerElementId` in v4.7.4. Use `targetComposerElementId` for all new implementations.

**Programmatic Submission (v4.7.4+):**

```jsx
import { useVeltClient } from '@veltdev/react';

function ComposerControls() {
  const { client } = useVeltClient();

  const submit = () => {
    const commentElement = client.getCommentElement();
    // Submit comment from a specific composer
    commentElement.submitComment({ targetComposerElementId: 'my-composer' });
  };

  const clear = () => {
    const commentElement = client.getCommentElement();
    commentElement.clearComposer();
  };

  return (
    <>
      <button onClick={submit}>Submit</button>
      <button onClick={clear}>Clear</button>
    </>
  );
}
```

**Listening for Text Changes (v4.7.3+):**

```jsx
<VeltComments
  onComposerTextChange={(event) => {
    // event includes draft annotation and targetComposerElementId
    console.log('Text changed:', event);
  }}
/>
```

**For HTML:**

```html
<velt-comment-composer
  placeholder="Leave a comment..."
  target-composer-element-id="my-composer"
></velt-comment-composer>
```

---

### 3.3 Use Comment Thread to Render Existing Comments

**Impact: MEDIUM-HIGH (Render comment threads in custom locations like kanban boards)**

The Standalone Comment Thread component renders existing comment data in custom locations. Use this to build custom UIs like kanban boards or your own sidebar implementation.

**1. Get Comment Annotations:**

```jsx
import { useCommentAnnotations } from '@veltdev/react';

const commentAnnotations = useCommentAnnotations();
```

**2. Render Comment Thread:**

```jsx
import { VeltCommentThread } from '@veltdev/react';

function CustomCommentList() {
  const commentAnnotations = useCommentAnnotations();

  return (
    <div className="custom-sidebar">
      {commentAnnotations?.map((annotation) => (
        <div key={annotation.annotationId} className="comment-card">
          <VeltCommentThread
            annotationId={annotation.annotationId}
          />
        </div>
      ))}
    </div>
  );
}
```

**Complete Example - Kanban Board:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentThread,
  useCommentAnnotations
} from '@veltdev/react';

function KanbanColumn({ status }) {
  const allAnnotations = useCommentAnnotations();

  // Filter comments by status from context
  const columnComments = allAnnotations?.filter(
    (a) => a.context?.status === status
  );

  return (
    <div className="kanban-column">
      <h3>{status}</h3>
      {columnComments?.map((annotation) => (
        <div key={annotation.annotationId} className="kanban-card">
          <div className="card-title">{annotation.context?.title}</div>
          <VeltCommentThread annotationId={annotation.annotationId} />
        </div>
      ))}
    </div>
  );
}

export default function KanbanBoard() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      <div className="kanban-board">
        <KanbanColumn status="todo" />
        <KanbanColumn status="in-progress" />
        <KanbanColumn status="done" />
      </div>
    </VeltProvider>
  );
}
```

**Styling the Thread:**

```jsx
<VeltCommentThread
  annotationId={annotation.annotationId}
  dialogVariant="custom-variant"
  darkMode={true}
/>
```

**For HTML:**

```html
<velt-comment-thread
  annotation-id="annotation-123"
  dialog-variant="custom-variant"
>
</velt-comment-thread>
```

---

## 4. Comment Surfaces

**Impact: MEDIUM-HIGH**

Navigation and display surfaces for comments. Includes the Comments Sidebar and related toggle components.

### 4.1 Use Comments Sidebar for Comment Navigation

**Impact: MEDIUM-HIGH (Central panel for viewing, filtering, and navigating all comments)**

VeltCommentsSidebar provides a panel displaying all comments with search, filter, and navigation capabilities. Essential for any non-trivial commenting implementation.

**Basic Setup:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebar,
  VeltSidebarButton
} from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentsSidebar />

      <div className="toolbar">
        <VeltSidebarButton />
      </div>
    </VeltProvider>
  );
}
```

**Embed Mode (in custom container):**

```jsx
<div className="my-sidebar-container">
  <VeltCommentsSidebar embedMode={true} />
</div>
```

**Page Mode (page-level comments):**

```jsx
<VeltCommentsSidebar pageMode={true} />
```

**Disable Comment Grouping:**

```jsx
<VeltCommentsSidebar
  groupConfig={{ enable: false }}
/>
```

**Handle Comment Clicks:**

```jsx
<VeltCommentsSidebar
  onCommentClick={(event) => {
    const { location, documentId, targetElementId, context } = event;
    // Navigate to comment location
    // e.g., scroll to element, seek video, etc.
  }}
/>
```

**For HTML:**

```html
<velt-comments-sidebar
  embed-mode="true"
  page-mode="false"
>
</velt-comments-sidebar>

<velt-sidebar-button></velt-sidebar-button>
```

**Complete Example with Video Player:**

```jsx
<VeltCommentsSidebar
  embedMode={true}
  onCommentClick={(event) => {
    const { location } = event;
    if (location?.currentMediaPosition !== undefined) {
      // Seek video to timestamp
      videoRef.current.currentTime = location.currentMediaPosition;
      // Set location to show comments
      client.setLocations([location]);
    }
  }}
/>
```

---

### 4.2 Use Sidebar Button to Toggle Comments Panel

**Impact: MEDIUM-HIGH (User control for showing/hiding comments sidebar)**

VeltSidebarButton provides a button to open and close the Comments Sidebar. Place it in your toolbar or navigation for easy access.

**Basic Setup:**

```jsx
import { VeltSidebarButton } from '@veltdev/react';

<div className="toolbar">
  <VeltSidebarButton />
</div>
```

**Custom Button Appearance:**

```jsx
<VeltSidebarButton>
  <button className="my-custom-button">
    Comments
  </button>
</VeltSidebarButton>
```

**With Icon:**

```jsx
<VeltSidebarButton>
  <div className="sidebar-btn">
    <CommentIcon />
    <span>Comments</span>
  </div>
</VeltSidebarButton>
```

**For HTML:**

```html
<velt-sidebar-button>
  <button class="my-custom-btn">
    Comments
  </button>
</velt-sidebar-button>
```

**Complete Example:**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebar,
  VeltSidebarButton,
  VeltCommentTool
} from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentsSidebar />

      <nav className="toolbar">
        <VeltCommentTool />
        <VeltSidebarButton />
      </nav>

      <main>
        {/* App content */}
      </main>
    </VeltProvider>
  );
}
```

---

## 5. UI Customization

**Impact: MEDIUM**

Visual customization patterns for comment components. Includes dialog customization, bubble styling, and wireframe component usage.

### 5.1 Customize Comment Bubble Display

**Impact: MEDIUM (Configure comment count bubbles and indicators)**

VeltCommentBubble shows comment count indicators on elements. Customize the display type, count mode, and appearance.

**Basic Usage:**

```jsx
import { VeltCommentBubble } from '@veltdev/react';

<div className="cell" id="cell-1">
  <VeltCommentBubble targetElementId="cell-1" />
</div>
```

**Comment Count Type:**

```jsx
// Show total replies (default)
<VeltCommentBubble
  targetElementId="cell-1"
  commentCountType="total"
/>

// Show only unread count
<VeltCommentBubble
  targetElementId="cell-1"
  commentCountType="unread"
/>
```

**Using with Context (complex matching):**

```jsx
<VeltCommentBubble
  context={{ rowId: 'row-1', columnId: 'col-A' }}
  commentCountType="unread"
/>
```

**Disable Triangle (Popover Mode):**

```jsx
<VeltComments
  popoverMode={true}
  popoverTriangleComponent={false}
/>
```

**For HTML:**

```html
<velt-comment-bubble
  target-element-id="cell-1"
  comment-count-type="unread"
></velt-comment-bubble>
```

**Complete Popover Pattern:**

```jsx
<div className="cell" id="cell-1">
  <VeltCommentTool targetElementId="cell-1" />
  <VeltCommentBubble targetElementId="cell-1" commentCountType="unread" />
  Cell Content
</div>
```

---

### 5.2 Customize Comment Dialog Appearance

**Impact: MEDIUM (Match comment dialogs to your application design system)**

Customize comment dialog appearance using variants, styling, and wireframe components to match your design system.

**Pre-defined Variants:**

```jsx
<VeltComments dialogVariant="variant-name" />
```

**Dark Mode:**

```jsx
<VeltComments darkMode={true} />
```

**Disable Shadow DOM (for CSS access):**

```jsx
<VeltComments shadowDom={false} />
```

**Wireframe Customization (full control):**

```jsx
import { VeltCommentDialogWireframe } from '@veltdev/react';

<VeltCommentDialogWireframe.Header>
  {/* Custom header content */}
</VeltCommentDialogWireframe.Header>

<VeltCommentDialogWireframe.Body>
  {/* Custom body content */}
</VeltCommentDialogWireframe.Body>
```

**CSS Customization (with shadowDom=false):**

```css
/* Target Velt comment elements */
velt-comment-dialog {
  --velt-primary-color: #your-brand-color;
}

.velt-comment-dialog-header {
  background: #f5f5f5;
}
```

**For HTML:**

```html
<velt-comments
  dialog-variant="variant-name"
  dark-mode="true"
  shadow-dom="false"
></velt-comments>
```

**Inline Comments Section Customization:**

```jsx
<VeltInlineCommentsSection
  targetElementId="container-id"
  dialogVariant="custom-variant"
  variant="inline-section-variant"
  darkMode={true}
  shadowDom={false}
/>
```

---

### 5.3 Use Wireframe Components for Custom UI

**Impact: MEDIUM (Build fully custom comment UIs with wireframe building blocks)**

Velt provides wireframe components that give you complete control over comment UI structure while maintaining functionality.

**Comment Dialog Wireframe Structure:**

```jsx
import { VeltCommentDialogWireframe } from '@veltdev/react';

function CustomCommentDialog() {
  return (
    <VeltCommentDialogWireframe>
      <VeltCommentDialogWireframe.GhostBanner />
      <VeltCommentDialogWireframe.PrivateBanner />
      <VeltCommentDialogWireframe.AssigneeBanner />

      <VeltCommentDialogWireframe.Header>
        <VeltCommentDialogWireframe.Status />
        <VeltCommentDialogWireframe.Priority />
        <VeltCommentDialogWireframe.Options />
      </VeltCommentDialogWireframe.Header>

      <VeltCommentDialogWireframe.Body>
        {/* Comment content */}
      </VeltCommentDialogWireframe.Body>

      <VeltCommentDialogWireframe.Composer>
        {/* Input area */}
      </VeltCommentDialogWireframe.Composer>
    </VeltCommentDialogWireframe>
  );
}
```

**Comments Sidebar Wireframe:**

```jsx
import { VeltCommentsSidebarWireframe } from '@veltdev/react';

function CustomSidebar() {
  return (
    <VeltCommentsSidebarWireframe>
      <VeltCommentsSidebarWireframe.Header>
        <VeltCommentsSidebarWireframe.Filter />
        <VeltCommentsSidebarWireframe.CloseButton />
      </VeltCommentsSidebarWireframe.Header>

      <VeltCommentsSidebarWireframe.Panel>
        <VeltCommentsSidebarWireframe.List />
        <VeltCommentsSidebarWireframe.EmptyPlaceholder />
      </VeltCommentsSidebarWireframe.Panel>
    </VeltCommentsSidebarWireframe>
  );
}
```

**For HTML:**

```html
<velt-comment-dialog-wireframe>
  <velt-comment-dialog-wireframe-header>
    <velt-comment-dialog-wireframe-status></velt-comment-dialog-wireframe-status>
  </velt-comment-dialog-wireframe-header>
</velt-comment-dialog-wireframe>
```

---

## 6. Data Model

**Impact: MEDIUM**

Patterns for working with comment data structures. Includes custom metadata, comment annotations, and filtering/grouping.

### 6.1 Filter and Group Comments

**Impact: MEDIUM (Organize comments by context, location, or custom criteria)**

Filter and group comments based on context, location, or custom criteria for better organization and display.

**Filter by Context:**

```jsx
const commentAnnotations = useCommentAnnotations();

// Filter by chart ID
const chartComments = commentAnnotations?.filter(
  (a) => a.context?.chartId === 'my-chart'
);

// Filter by category
const bugComments = commentAnnotations?.filter(
  (a) => a.context?.category === 'bug'
);

// Filter by status
const openComments = commentAnnotations?.filter(
  (a) => a.context?.status === 'open'
);
```

**Filter by Target Element:**

```jsx
// Comments on specific element
const elementComments = commentAnnotations?.filter(
  (a) => a.targetElementId === 'element-id'
);
```

**Filter by Location:**

```jsx
// Comments at specific video timestamp
const frameComments = commentAnnotations?.filter(
  (a) => a.location?.currentMediaPosition === 120
);
```

**Sidebar Grouping Configuration:**

```jsx
// Disable grouping
<VeltCommentsSidebar
  groupConfig={{ enable: false }}
/>

// Enable grouping (default)
<VeltCommentsSidebar
  groupConfig={{ enable: true }}
/>
```

**Group Comments Manually:**

```jsx
const commentAnnotations = useCommentAnnotations();

// Group by section
const groupedBySection = commentAnnotations?.reduce((groups, annotation) => {
  const section = annotation.context?.section || 'uncategorized';
  if (!groups[section]) groups[section] = [];
  groups[section].push(annotation);
  return groups;
}, {});

// Render grouped
Object.entries(groupedBySection).map(([section, comments]) => (
  <div key={section}>
    <h3>{section}</h3>
    {comments.map((a) => (
      <CommentItem key={a.annotationId} annotation={a} />
    ))}
  </div>
));
```

**Comment Aggregation Pattern (Tables):**

```jsx
<VeltComments
  popoverMode={true}
  groupMatchedComments={true}  // Group comments on same element
/>
```

---

### 6.2 Work with Comment Annotations Data

**Impact: MEDIUM (Retrieve and manipulate comment annotation objects)**

Comment Annotations are the data objects representing comments. Access them for custom rendering, filtering, or integration with your application.

**React Hooks:**

```jsx
import { useCommentAnnotations } from '@veltdev/react';

function CommentsList() {
  const commentAnnotations = useCommentAnnotations();

  return (
    <div>
      {commentAnnotations?.map((annotation) => (
        <div key={annotation.annotationId}>
          <p>Comment ID: {annotation.annotationId}</p>
          <p>Document ID: {annotation.documentId}</p>
          <p>Context: {JSON.stringify(annotation.context)}</p>
        </div>
      ))}
    </div>
  );
}
```

**API Method (Non-React):**

```jsx
const { client } = useVeltClient();

useEffect(() => {
  if (client) {
    const commentElement = client.getCommentElement();
    const subscription = commentElement.getAllCommentAnnotations().subscribe(
      (annotations) => {
        console.log('Annotations:', annotations);
      }
    );

    return () => subscription.unsubscribe();
  }
}, [client]);
```

**CommentAnnotation Object Structure:**

```typescript
interface CommentAnnotation {
  annotationId: string;      // Unique identifier
  documentId: string;        // Document this belongs to
  location: object;          // Location data
  targetElementId: string;   // Target DOM element ID
  context: object;           // Custom metadata
  comments: Comment[];       // Array of comment messages
  // ... other fields
}
```

**Get Specific Annotation:**

```jsx
// By annotation ID
const annotation = commentAnnotations?.find(
  (a) => a.annotationId === 'specific-id'
);

// By target element
const elementAnnotations = commentAnnotations?.filter(
  (a) => a.targetElementId === 'my-element-id'
);
```

**Add Comment Annotation Programmatically:**

```jsx
const { client } = useVeltClient();

const addAnnotation = () => {
  const commentElement = client.getCommentElement();
  commentElement.addCommentAnnotation({
    targetElementId: 'element-id',
    context: { custom: 'data' }
  });
};
```

**Batched Annotation Counts (v5.0.0-beta.10+):**

```jsx
const commentElement = client.getCommentElement();

// Get counts across multiple documents efficiently (80% more efficient)
commentElement.getCommentAnnotationsCount({
  documentIds: ['doc-1', 'doc-2', 'doc-3'],
  batchedPerDocument: true
}).subscribe((result) => {
  // result.data: { "doc-1": { total: 10, unread: 2 }, "doc-2": { total: 15, unread: 5 } }
  console.log(result.data);
});
```

---

### 6.3 Add Custom Metadata to Comments with Context

**Impact: MEDIUM (Attach custom data for filtering, grouping, and processing)**

Add custom metadata (context) to comments for filtering, grouping, rendering, and notification processing.

**Use Cases:**

```jsx
<VeltCommentTool
  targetElementId="element-id"
  context={{
    category: 'feedback',
    section: 'header',
    priority: 'high',
    customField: 'value'
  }}
/>
<VeltComments
  onCommentAdd={(event) => {
    // Add or modify context before comment is created
    return {
      ...event,
      context: {
        ...event.context,
        timestamp: Date.now(),
        pageSection: 'main-content'
      }
    };
  }}
/>
const { client } = useVeltClient();

const addCommentWithMetadata = () => {
  const commentElement = client.getCommentElement();
  commentElement.addManualComment({
    context: {
      chartId: 'revenue-chart',
      dataPoint: { x: 100, y: 200 },
      seriesName: 'Q1 Revenue'
    }
  });
};
```

**Method 2: Via onCommentAdd Callback**
**Method 3: Via addManualComment API**

**Accessing Context in Annotations:**

```jsx
const commentAnnotations = useCommentAnnotations();

commentAnnotations?.forEach((annotation) => {
  const context = annotation.context;
  console.log(context.category);  // 'feedback'
  console.log(context.section);   // 'header'
});
```

**Filtering by Context:**

```jsx
const commentAnnotations = useCommentAnnotations();

// Filter comments for specific chart
const chartComments = commentAnnotations?.filter(
  (a) => a.context?.chartId === 'revenue-chart'
);

// Filter by custom category
const feedbackComments = commentAnnotations?.filter(
  (a) => a.context?.category === 'feedback'
);
```

**Method 4: Via Global Context Provider (v5.0.0-beta.7+):**

```jsx
import { useSetContextProvider } from '@veltdev/react';

function AppWithContextProvider() {
  // Global context provider applied to all new comment annotations
  useSetContextProvider(() => ({
    appVersion: '2.0',
    environment: 'production',
    currentPage: window.location.pathname
  }));

  return <VeltComments />;
}

// Or via API
const commentElement = client.getCommentElement();
commentElement.setContextProvider(() => ({
  appVersion: '2.0',
  environment: 'production'
}));
```

**For HTML:**

```html
<velt-comment-tool
  target-element-id="element-id"
  context='{"category": "feedback", "section": "header"}'
></velt-comment-tool>
```

---

## 7. Debugging & Testing

**Impact: LOW-MEDIUM**

Troubleshooting patterns and verification checklists for Velt integrations.

### 7.1 Troubleshoot Common Velt Integration Issues

**Impact: LOW-MEDIUM (Quick fixes for common setup and runtime problems)**

Common issues and solutions when integrating Velt Comments.

**Issue: Components Not Rendering**

**Solutions:**

```jsx
// 1. Ensure VeltProvider wraps all Velt components
<VeltProvider apiKey="YOUR_API_KEY">
  <VeltComments />  {/* Must be inside provider */}
</VeltProvider>

// 2. For Next.js, add 'use client' directive
'use client';  // Add at top of file

// 3. Check API key is valid
console.log('API Key:', process.env.NEXT_PUBLIC_VELT_API_KEY);

// 4. Check domain is safelisted in Velt Console
```

**Issue: Users Can't See Each Other's Comments**
**Symptoms:** Comments visible to creator only

**Solutions:**

```jsx
// 1. Ensure same organizationId for all users
const user = {
  userId: 'user-123',
  organizationId: 'same-org-id',  // Must match across users
  // ...
};

// 2. Ensure same documentId
client.setDocuments([{ id: 'same-document-id' }]);

// 3. Verify authentication completes before document setup
```

**Issue: Comments Not Persisting**
**Symptoms:** Comments disappear on refresh

**Solutions:**

```jsx
// 1. Verify authentication is working
const user = await client.getCurrentUser();
console.log('Current user:', user);

// 2. Check document is set correctly
await Velt.getMetadata();  // Should return document metadata

// 3. Ensure stable document ID
// BAD: Uses changing ID
client.setDocuments([{ id: `doc-${Date.now()}` }]);

// GOOD: Uses stable ID
client.setDocuments([{ id: 'project-123-document' }]);
```

**Issue: Popover Comments Not Attaching to Elements**
**Symptoms:** Comments appear in wrong location

**Solutions:**

```jsx
// 1. Ensure popoverMode is enabled
<VeltComments popoverMode={true} />

// 2. Match targetElementId with element ID
<div id="cell-1">  {/* Element has ID */}
  <VeltCommentTool targetElementId="cell-1" />  {/* Same ID */}
</div>

// 3. For single tool pattern, add data attribute
<div
  id="cell-1"
  data-velt-target-comment-element-id="cell-1"  {/* Both required */}
>
```

**Issue: Video/Lottie Comments Not Syncing**
**Symptoms:** Comments don't appear at correct timestamps

**Solutions:**

```jsx
// 1. Set totalMediaLength
<VeltCommentPlayerTimeline totalMediaLength={videoDuration} />

// 2. Set location with currentMediaPosition
client.setLocation({
  currentMediaPosition: currentTimeInSeconds
});

// 3. Clear location when playing
client.removeLocation();  // or client.unsetLocationsIds()
```

**Issue: Editor Comments (TipTap/Slate/Lexical) Not Working**
**Symptoms:** Can't add comments to editor text

**Solutions:**

```jsx
// 1. Disable default text mode
<VeltComments textMode={false} />

// 2. Ensure extension/plugin is installed
// TipTap: npm install @veltdev/tiptap-velt-comments
// Slate: npm install @veltdev/slate-velt-comments
// Lexical: npm install @veltdev/lexical-velt-comments

// 3. Call renderComments when annotations change
useEffect(() => {
  if (editor && commentAnnotations?.length) {
    renderComments({ editor, commentAnnotations });
  }
}, [editor, commentAnnotations]);
```

**Debug Using Browser Console:**

```javascript
// Check SDK initialization
await Velt.getMetadata();

// Check current user
await Velt.getCurrentUser();

// Check comment element
const commentElement = Velt.getCommentElement();
commentElement.getAllCommentAnnotations().subscribe(console.log);
```

---

### 7.2 Verify Velt Comments Integration

**Impact: LOW-MEDIUM (Checklist to confirm correct setup and functionality)**

Use this checklist to verify your Velt Comments integration is working correctly.

**1. SDK Initialization Check**

Open browser console and run:

**Quick Test Script:**

```javascript
// Run in browser console
async function testVeltSetup() {
  try {
    const metadata = await Velt.getMetadata();
    console.log('Document metadata:', metadata);

    const user = await Velt.getCurrentUser();
    console.log('Current user:', user);

    const commentElement = Velt.getCommentElement();
    commentElement.getAllCommentAnnotations().subscribe((annotations) => {
      console.log('Comment annotations:', annotations?.length || 0);
    });

    console.log('Velt setup appears correct!');
  } catch (error) {
    console.error('Velt setup issue:', error);
  }
}
testVeltSetup();
```

---

## 8. Moderation & Permissions

**Impact: LOW**

Access control and moderation features for comments. Limited documentation available.

*No rules defined yet. See rules/_template.md for creating new rules.*

## 9. Attachments & Reactions

**Impact: LOW**

File attachments and emoji reaction features. Limited documentation available.

*No rules defined yet. See rules/_template.md for creating new rules.*

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/comments/overview
- https://docs.velt.dev/get-started/quickstart
- https://docs.velt.dev/ui-customization/overview
- https://console.velt.dev
