# Velt Comments Best Practices

**Version 1.1.3**  
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
   - 2.6 [Integrate Comments with Ace Editor](#26-integrate-comments-with-ace-editor)
   - 2.7 [Integrate Comments with CodeMirror Editor](#27-integrate-comments-with-codemirror-editor)
   - 2.8 [Integrate Comments with Lexical Editor](#28-integrate-comments-with-lexical-editor)
   - 2.9 [Integrate Comments with Plate Editor](#29-integrate-comments-with-plate-editor)
   - 2.10 [Integrate Comments with Quill Editor](#210-integrate-comments-with-quill-editor)
   - 2.11 [Integrate Comments with SlateJS Editor](#211-integrate-comments-with-slatejs-editor)
   - 2.12 [Integrate Comments with TipTap Editor](#212-integrate-comments-with-tiptap-editor)
   - 2.13 [Add Frame-by-Frame Comments to Lottie Animations](#213-add-frame-by-frame-comments-to-lottie-animations)
   - 2.14 [Integrate Comments with Custom Video Player](#214-integrate-comments-with-custom-video-player)
   - 2.15 [Use Freestyle Mode for Pin-Anywhere Comments](#215-use-freestyle-mode-for-pin-anywhere-comments)
   - 2.16 [Use Inline Comments for Traditional Thread Style](#216-use-inline-comments-for-traditional-thread-style)
   - 2.17 [Use Page Mode for Page-Level Comments](#217-use-page-mode-for-page-level-comments)
   - 2.18 [Use Popover Mode for Table Cell Comments](#218-use-popover-mode-for-table-cell-comments)
   - 2.19 [Use Prebuilt Video Player for Quick Setup](#219-use-prebuilt-video-player-for-quick-setup)
   - 2.20 [Use Stream Mode for Google Docs-Style Comments](#220-use-stream-mode-for-google-docs-style-comments)
   - 2.21 [Use Text Mode for Text Highlight Comments](#221-use-text-mode-for-text-highlight-comments)

3. [Standalone Components](#3-standalone-components) — **MEDIUM-HIGH**
   - 3.1 [Use Comment Pin for Manual Position Control](#31-use-comment-pin-for-manual-position-control)
   - 3.2 [Use Comment Composer for Custom Comment Input](#32-use-comment-composer-for-custom-comment-input)
   - 3.3 [Use Comment Thread to Render Existing Comments](#33-use-comment-thread-to-render-existing-comments)

4. [Comment Surfaces](#4-comment-surfaces) — **MEDIUM-HIGH**
   - 4.1 [Comments Sidebar Setup, Modes, and Configuration](#41-comments-sidebar-setup-modes-and-configuration)
   - 4.2 [Use Comments Sidebar for Comment Navigation](#42-use-comments-sidebar-for-comment-navigation)
   - 4.3 [Use Sidebar Button to Toggle Comments Panel](#43-use-sidebar-button-to-toggle-comments-panel)
   - 4.4 [Use VeltCommentsSidebarV2 for Primitive-Architecture Sidebar Customization](#44-use-veltcommentssidebarv2-for-primitive-architecture-sidebar-customization)

5. [UI Customization](#5-ui-customization) — **MEDIUM**
   - 5.1 [Customize Comment Bubble Display](#51-customize-comment-bubble-display)
   - 5.2 [Customize Comment Dialog Appearance](#52-customize-comment-dialog-appearance)
   - 5.3 [Set defaultCondition on V2 Primitive Sub-Components to Control Default Rendering](#53-set-defaultcondition-on-v2-primitive-sub-components-to-control-default-rendering)
   - 5.4 [Use Standalone Autocomplete Primitives for Custom Autocomplete UIs](#54-use-standalone-autocomplete-primitives-for-custom-autocomplete-uis)
   - 5.5 [Use VeltCommentDialogAgentSuggestion Primitives for Custom AI Suggestion UIs](#55-use-veltcommentdialogagentsuggestion-primitives-for-custom-ai-suggestion-uis)
   - 5.6 [Use Wireframe Components for Custom UI](#56-use-wireframe-components-for-custom-ui)

6. [Data Model](#6-data-model) — **MEDIUM**
   - 6.1 [Filter and Group Comments](#61-filter-and-group-comments)
   - 6.2 [Work with Comment Annotations Data](#62-work-with-comment-annotations-data)
   - 6.3 [Add Custom Metadata to Comments with Context](#63-add-custom-metadata-to-comments-with-context)
   - 6.4 [Comments Data Type Reference — Core Models](#64-comments-data-type-reference-core-models)
   - 6.5 [Individual Comment CRUD — Add, Update, Delete, Get Comments Within Threads](#65-individual-comment-crud-add-update-delete-get-comments-within-threads)
   - 6.6 [Mark Comments as Read or Unread](#66-mark-comments-as-read-or-unread)
   - 6.7 [Programmatic Annotation CRUD — Create, Query, Delete Threads](#67-programmatic-annotation-crud-create-query-delete-threads)
   - 6.8 [Programmatic Composer Control — Submit, Clear, Read State](#68-programmatic-composer-control-submit-clear-read-state)
   - 6.9 [Use agentFields on CommentRequestQuery to Filter Annotation Count by Agent](#69-use-agentfields-on-commentrequestquery-to-filter-annotation-count-by-agent)
   - 6.10 [Use CommentActivityActionTypes for Type-Safe Comment Activity Filtering](#610-use-commentactivityactiontypes-for-type-safe-comment-activity-filtering)
   - 6.11 [Use Config-Based URL Endpoints Instead of Placeholder Callbacks in CommentAnnotationDataProvider](#611-use-config-based-url-endpoints-instead-of-placeholder-callbacks-in-commentannotationdataprovider)
   - 6.12 [Use triggerActivities to Create Activity Records via REST API](#612-use-triggeractivities-to-create-activity-records-via-rest-api)

7. [Debugging & Testing](#7-debugging-testing) — **LOW-MEDIUM**
   - 7.1 [Troubleshoot Common Velt Integration Issues](#71-troubleshoot-common-velt-integration-issues)
   - 7.2 [Verify Velt Comments Integration](#72-verify-velt-comments-integration)

8. [Moderation & Permissions](#8-moderation-permissions) — **LOW**
   - 8.1 [Control Comment Visibility with Private Mode and Per-Annotation Updates](#81-control-comment-visibility-with-private-mode-and-per-annotation-updates)
   - 8.2 [Moderation & Permissions](#82-moderation-permissions)
   - 8.3 [Prefer Past-Tense Event Aliases commentToolClicked and sidebarButtonClicked in New Code](#83-prefer-past-tense-event-aliases-commenttoolclicked-and-sidebarbuttonclicked-in-new-code)
   - 8.4 [Register an Anonymous User Data Provider to Resolve Tagged Contact Emails to User IDs](#84-register-an-anonymous-user-data-provider-to-resolve-tagged-contact-emails-to-user-ids)
   - 8.5 [Show a Visibility Banner in the Comment Composer for Multi-Level Visibility Selection](#85-show-a-visibility-banner-in-the-comment-composer-for-multi-level-visibility-selection)
   - 8.6 [Use CommentDialogActionService.isSubmitInFlight() to Guard Against Duplicate Submits](#86-use-commentdialogactionserviceissubmitinflight-to-guard-against-duplicate-submits)
   - 8.7 [Use commentSaveTriggered for Immediate UI Feedback Before Async Save Completes](#87-use-commentsavetriggered-for-immediate-ui-feedback-before-async-save-completes)
   - 8.8 [Use isAnnotationPrivate() for Unified Visibility Routing](#88-use-isannotationprivate-for-unified-visibility-routing)
   - 8.9 [Use the commentSaved Event for Reliable Post-Persist Side-Effects](#89-use-the-commentsaved-event-for-reliable-post-persist-side-effects)

9. [Attachments & Reactions](#9-attachments-reactions) — **MEDIUM**
   - 9.1 [Attachments & Reactions](#91-attachments-reactions)
   - 9.2 [Control Attachment Download Behavior and Intercept Clicks](#92-control-attachment-download-behavior-and-intercept-clicks)

10. [Configuration](#10-configuration) — **MEDIUM**
   - 10.1 [Comment Moderation — Approve, Accept, Reject Workflows](#101-comment-moderation-approve-accept-reject-workflows)
   - 10.2 [Comment Navigation and Deep Linking](#102-comment-navigation-and-deep-linking)
   - 10.3 [Component Props API — VeltComments, VeltCommentDialog, VeltCommentsSidebar, VeltInlineCommentsSection](#103-component-props-api-veltcomments-veltcommentdialog-veltcommentssidebar-veltinlinecommentssection)
   - 10.4 [Configure @Mentions, Contacts, and User Assignment](#104-configure-mentions-contacts-and-user-assignment)
   - 10.5 [Configure Comment Attachments and File Uploads](#105-configure-comment-attachments-and-file-uploads)
   - 10.6 [Configure Comment Status and Priority Levels](#106-configure-comment-status-and-priority-levels)
   - 10.7 [Configure Emoji Reactions on Comments](#107-configure-emoji-reactions-on-comments)
   - 10.8 [Configure Rich Text Formatting in Comment Composer](#108-configure-rich-text-formatting-in-comment-composer)
   - 10.9 [Programmatic Sidebar Data, Filtering, and Configuration](#109-programmatic-sidebar-data-filtering-and-configuration)
   - 10.10 [Restrict Comment Placement to Specific DOM Elements](#1010-restrict-comment-placement-to-specific-dom-elements)
   - 10.11 [UI/UX Toggle Methods — Comment Display, Interaction, and Behavior](#1011-uiux-toggle-methods-comment-display-interaction-and-behavior)
   - 10.12 [Use accessModes in Sidebar Filters for Privacy-Based Filtering](#1012-use-accessmodes-in-sidebar-filters-for-privacy-based-filtering)

11. [Events](#11-events) — **MEDIUM**
   - 11.1 [Comment Lifecycle Events — Pin Clicks, Add Events, Button Clicks](#111-comment-lifecycle-events-pin-clicks-add-events-button-clicks)

12. [REST API](#12-rest-api) — **HIGH**
   - 12.1 [REST API — Comment Annotation CRUD](#121-rest-api-comment-annotation-crud)
   - 12.2 [REST API — Individual Comment CRUD Within Annotations](#122-rest-api-individual-comment-crud-within-annotations)

13. [Wireframe Variables](#13-wireframe-variables) — **MEDIUM**
   - 13.1 [Bind Autocomplete Wireframe Slots Using Template Variables](#131-bind-autocomplete-wireframe-slots-using-template-variables)
   - 13.2 [Bind Comment Bubble Wireframe Slots Using Template Variables](#132-bind-comment-bubble-wireframe-slots-using-template-variables)
   - 13.3 [Bind Comment Dialog Wireframe Slots Using Template Variables](#133-bind-comment-dialog-wireframe-slots-using-template-variables)
   - 13.4 [Bind Comment Sidebar Button Wireframe Slots Using Template Variables](#134-bind-comment-sidebar-button-wireframe-slots-using-template-variables)
   - 13.5 [Bind Comment Sidebar Wireframe Slots Using Template Variables](#135-bind-comment-sidebar-wireframe-slots-using-template-variables)
   - 13.6 [Bind Comment Tool Wireframe Slots Using Template Variables](#136-bind-comment-tool-wireframe-slots-using-template-variables)
   - 13.7 [Bind Inline Comments Section Wireframe Slots Using Template Variables](#137-bind-inline-comments-section-wireframe-slots-using-template-variables)
   - 13.8 [Bind Multithread Comments Wireframe Slots Using Template Variables](#138-bind-multithread-comments-wireframe-slots-using-template-variables)
   - 13.9 [Bind Text Comment Wireframe Slots Using Template Variables](#139-bind-text-comment-wireframe-slots-using-template-variables)

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

> **Note:** The legacy `useIdentify()` hook is deprecated. Always use `authProvider` on `VeltProvider` for production applications.

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

**Correct (with SetDocumentsRequestOptions — v5.0.2-beta.10):**

```jsx
import { useEffect } from 'react';
import { VeltProvider, VeltComments, useVeltClient } from '@veltdev/react';

function DocumentSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (client) {
      client.setDocuments(
        [{ id: 'unique-document-id', metadata: { documentName: 'My Document' } }],
        {
          debounceTime: 1000,          // Override global 5000ms debounce for this call
          optimisticPermissions: false // Await permission validation before returning
        }
      );
    }
  }, [client]);

  return null;
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

Different comment presentation and interaction modes for various use cases. Includes Freestyle, Popover, Stream, Text, Page, Inline, rich text editor integrations (TipTap, SlateJS, Lexical, Plate, Quill, CodeMirror, Ace), media player comments, and chart comments.

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

### 2.6 Integrate Comments with Ace Editor

**Impact: MEDIUM (Text comments in Ace code editor with highlight marks)**

Add collaborative text comments to an Ace editor using Velt's Ace extension. Users can select text and add comments that persist as marks in the editor.

**Incorrect (using default text mode instead of extension):**

```jsx
// Default text mode doesn't integrate with Ace properly
<VeltComments textMode={true} />
<AceEditor ... />
```

**Correct (with Ace extension):**

```jsx
npm install @veltdev/ace-velt-comments
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
import { useEffect, useRef, useCallback } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/theme-github';
import { AceVeltComments, addComment, renderComments } from '@veltdev/ace-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

function AceEditorComponent() {
  const editorRef = useRef(null);
  const cleanupRef = useRef(null);
  const commentAnnotations = useCommentAnnotations();

  const handleLoad = useCallback((editor) => {
    editorRef.current = editor;
    // Initialize Velt comments - returns a cleanup function
    cleanupRef.current = AceVeltComments(editor);
  }, []);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Render comments when annotations change
  useEffect(() => {
    if (editorRef.current && commentAnnotations?.length) {
      renderComments({
        editor: editorRef.current,
        commentAnnotations,
      });
    }
  }, [commentAnnotations]);

  return (
    <div>
      <button
        onClick={(e) => e.preventDefault()}
        onClick={() => {
          if (editorRef.current) {
            addComment({ editor: editorRef.current });
          }
        }}
      >
        Add Comment
      </button>
      <AceEditor
        mode="markdown"
        theme="github"
        name="ace-editor"
        defaultValue="Your initial content here"
        onLoad={handleLoad}
        width="100%"
        height="100%"
      />
    </div>
  );
}
```

**Step 2: Configure VeltComments**
**Step 3: Initialize Ace editor with Velt extension**

**With Custom Metadata (Context):**

```jsx
addComment({
  editor: editorRef.current,
  editorId: 'my-editor-1',
  context: {
    storyId: 'story-123',
    section: 'intro',
  },
});
```

**Configure Mark Persistence:**

```jsx
const cleanup = AceVeltComments(editor, {
  persistVeltMarks: false, // Set false if storing content yourself
});
```

**Style Commented Text:**

```css
velt-comment-text {
  background-color: rgba(255, 255, 0, 0.3);
  border-bottom: 2px solid #ffcc00;
  cursor: pointer;
}
```

---

### 2.7 Integrate Comments with CodeMirror Editor

**Impact: MEDIUM (Text comments in CodeMirror code editor with highlight decorations)**

Add collaborative text comments to a CodeMirror editor using Velt's CodeMirror extension. Users can select text and add comments that persist as decorations in the editor.

**Incorrect (using default text mode instead of extension):**

```jsx
// Default text mode doesn't integrate with CodeMirror properly
<VeltComments textMode={true} />
<div ref={editorRef} />
```

**Correct (with CodeMirror extension):**

```jsx
npm install @veltdev/codemirror-velt-comments
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
import { useRef, useState, useEffect } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { CodemirrorVeltComments, addComment, renderComments } from '@veltdev/codemirror-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

function CodeMirrorEditorComponent() {
  const editorRef = useRef(null);
  const [editorView, setEditorView] = useState(null);
  const savedSelectionRef = useRef(null);
  const commentAnnotations = useCommentAnnotations();

  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      doc: 'Your initial content here',
      extensions: [
        basicSetup,
        CodemirrorVeltComments(),
      ],
      parent: editorRef.current,
    });

    setEditorView(view);
    return () => view.destroy();
  }, []);

  // Render comments when annotations change
  useEffect(() => {
    if (editorView && commentAnnotations?.length) {
      renderComments({
        editor: editorView,
        commentAnnotations,
      });
    }
  }, [editorView, commentAnnotations]);

  const saveSelection = () => {
    if (editorView) {
      const { from, to } = editorView.state.selection.main;
      if (from !== to) {
        savedSelectionRef.current = { from, to };
      }
    }
  };

  const handleAddComment = () => {
    if (editorView) {
      if (savedSelectionRef.current) {
        const { from, to } = savedSelectionRef.current;
        if (from !== to) {
          editorView.dispatch({
            selection: { anchor: from, head: to },
          });
        }
      }
      addComment({ editor: editorView });
      savedSelectionRef.current = null;
    }
  };

  return (
    <div>
      <button
        onClick={(e) => {
          e.preventDefault();
          saveSelection();
        }}
        onClick={handleAddComment}
      >
        Add Comment
      </button>
      <div ref={editorRef} />
    </div>
  );
}
```

**Step 2: Configure VeltComments**
**Step 3: Add extension to CodeMirror editor**

**With Custom Metadata (Context):**

```jsx
addComment({
  editor: editorView,
  editorId: 'my-editor-1',
  context: {
    storyId: 'story-123',
    section: 'intro',
  },
});
```

**Configure Mark Persistence:**

```jsx
const view = new EditorView({
  extensions: [
    CodemirrorVeltComments({
      persistVeltMarks: false, // Set false if storing content yourself
    }),
  ],
  parent: editorRef.current,
});
```

**Style Commented Text:**

```css
velt-comment-text {
  background-color: rgba(255, 255, 0, 0.3);
  border-bottom: 2px solid #ffcc00;
  cursor: pointer;
}
```

---

### 2.8 Integrate Comments with Lexical Editor

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
    <button onClick={(e) => {
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

### 2.9 Integrate Comments with Plate Editor

**Impact: MEDIUM (Text comments in Plate.js rich text editor with highlight marks)**

Add collaborative text comments to a Plate.js editor using Velt's Plate plugin. Users can select text and add comments that persist as marks in the editor.

**Incorrect (using default text mode instead of plugin):**

```jsx
// Default text mode doesn't integrate with Plate properly
<VeltComments textMode={true} />
<Plate editor={editor}>
  <PlateContent />
</Plate>
```

**Correct (with Plate plugin):**

```jsx
npm install @veltdev/plate-comments-react
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
import { Plate, PlateContent, usePlateEditor } from '@platejs/core/react';
import { VeltCommentsPlugin, addComment, renderComments } from '@veltdev/plate-comments-react';
import { useCommentAnnotations } from '@veltdev/react';

export default function PlateEditorComponent() {
  const commentAnnotations = useCommentAnnotations();

  const editor = usePlateEditor({
    plugins: [VeltCommentsPlugin],
    value: initialValue,
  });

  // Render comments when annotations change
  useEffect(() => {
    if (editor && commentAnnotations) {
      renderComments({
        editor,
        commentAnnotations,
      });
    }
  }, [editor, commentAnnotations]);

  const handleAddComment = () => {
    if (editor) {
      addComment({ editor });
    }
  };

  return (
    <div>
      <button
        onClick={(e) => {
          e.preventDefault();
          handleAddComment();
        }}
      >
        Add Comment
      </button>
      <Plate editor={editor}>
        <PlateContent placeholder="Start typing..." />
      </Plate>
    </div>
  );
}
```

**Step 2: Configure VeltComments**
**Step 3: Add plugin to Plate editor**

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
const editor = usePlateEditor({
  plugins: [
    VeltCommentsPlugin.configure({
      options: {
        persistVeltMarks: false, // Set false if storing HTML yourself
      },
    }),
  ],
});
```

**Style Commented Text:**

```css
velt-comment-text {
  background-color: rgba(255, 255, 0, 0.3);
  border-bottom: 2px solid #ffcc00;
  cursor: pointer;
}
```

---

### 2.10 Integrate Comments with Quill Editor

**Impact: MEDIUM (Text comments in Quill rich text editor with highlight marks)**

Add collaborative text comments to a Quill editor using Velt's Quill module. Users can select text and add comments that persist as marks in the editor.

**Incorrect (using default text mode instead of module):**

```jsx
// Default text mode doesn't integrate with Quill properly
<VeltComments textMode={true} />
<div ref={editorRef} />
```

**Correct (with Quill module):**

```jsx
npm install @veltdev/quill-velt-comments
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
import { useEffect, useRef, useState, useCallback } from 'react';
import Quill from 'quill';
import { QuillVeltComments, addComment, renderComments } from '@veltdev/quill-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

// Register the module with Quill (once, outside component)
Quill.register('modules/veltComments', QuillVeltComments);

function QuillEditorComponent() {
  const editorRef = useRef(null);
  const [quill, setQuill] = useState(null);
  const savedSelectionRef = useRef(null);
  const commentAnnotations = useCommentAnnotations();

  useEffect(() => {
    if (!editorRef.current) return;

    const quillInstance = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        veltComments: {
          persistVeltMarks: true,
        },
      },
    });

    setQuill(quillInstance);
  }, []);

  // Render comments when annotations change
  useEffect(() => {
    if (quill && commentAnnotations?.length) {
      renderComments({
        editor: quill,
        commentAnnotations,
      });
    }
  }, [quill, commentAnnotations]);

  const handleAddComment = useCallback(() => {
    if (quill) {
      if (savedSelectionRef.current) {
        quill.setSelection(savedSelectionRef.current.index, savedSelectionRef.current.length);
      }
      addComment({ editor: quill });
      savedSelectionRef.current = null;
    }
  }, [quill]);

  return (
    <div>
      <button
        onClick={(e) => {
          e.preventDefault();
          const sel = quill?.getSelection();
          if (sel?.length > 0) savedSelectionRef.current = sel;
        }}
        onClick={handleAddComment}
      >
        Add Comment
      </button>
      <div ref={editorRef} />
    </div>
  );
}
```

**Step 2: Configure VeltComments**
**Step 3: Register and configure the Quill module**

**With Custom Metadata (Context):**

```jsx
addComment({
  editor: quill,
  editorId: 'my-doc-1',
  context: {
    storyId: 'story-123',
    section: 'intro',
  },
});
```

**Configure Mark Persistence:**

```jsx
const quill = new Quill(editorRef.current, {
  theme: 'snow',
  modules: {
    veltComments: {
      persistVeltMarks: false, // Set false if storing content yourself
    },
  },
});
```

**Style Commented Text:**

```css
velt-comment-text {
  background-color: rgba(255, 255, 0, 0.3);
  border-bottom: 2px solid #ffcc00;
  cursor: pointer;
}
```

---

### 2.11 Integrate Comments with SlateJS Editor

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
      <button onClick={(e) => {
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

### 2.12 Integrate Comments with TipTap Editor

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
// BubbleMenu MUST be imported from @tiptap/react/menus (NOT @tiptap/react)
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { TiptapVeltComments, addComment, renderComments } from '@veltdev/tiptap-velt-comments';
import { useCommentAnnotations } from '@veltdev/react';

export default function TipTapComponent({ scrollContainerRef }) {
  const commentAnnotations = useCommentAnnotations();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapVeltComments,
    ],
    content: '<p>Hello Velt!</p>',
    immediatelyRender: false,
  });

  // Render comment highlights when annotations change
  useEffect(() => {
    if (editor && commentAnnotations?.length) {
      renderComments({ editor, commentAnnotations });
    }
  }, [editor, commentAnnotations]);

  const handleAddComment = () => {
    if (!editor) return;
    // Preserve scroll position — adding comments can cause the editor to jump
    const scrollContainer = scrollContainerRef?.current;
    const scrollTop = scrollContainer?.scrollTop ?? 0;
    addComment({ editor });
    if (scrollContainer) {
      requestAnimationFrame(() => {
        scrollContainer.scrollTop = scrollTop;
      });
    }
  };

  return (
    <div>
      <EditorContent editor={editor} />

      {editor && (
        <BubbleMenu editor={editor}>
          <button
            onClick={(e) => {
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

### 2.13 Add Frame-by-Frame Comments to Lottie Animations

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

### 2.14 Integrate Comments with Custom Video Player

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

### 2.15 Use Freestyle Mode for Pin-Anywhere Comments

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

**Correct (with VeltCommentTool, sidebar, and recommended props):**

```jsx
import { VeltProvider, VeltComments, VeltCommentTool, VeltCommentsSidebar, VeltSidebarButton } from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments
        shadowDom={false}
        textMode={false}
        allowedElementIds={['main-content']}
        commentToNearestAllowedElement={true}
      />
      <VeltCommentsSidebar />

      <div className="toolbar">
        <VeltCommentTool />
        <VeltSidebarButton />
      </div>

      <main id="main-content">
        {/* Comments can only be pinned inside this element */}
        <YourContent />
      </main>
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

### 2.16 Use Inline Comments for Traditional Thread Style

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

**Correct (with VeltInlineCommentsSection, context, and recommended props):**

```jsx
import { VeltProvider, VeltComments, VeltInlineCommentsSection } from '@veltdev/react';

export default function App() {
  const items = [
    { id: 'task-1', title: 'Design Review', status: 'in-progress' },
    { id: 'task-2', title: 'API Integration', status: 'todo' },
  ];

  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments
        shadowDom={false}
        textMode={false}
      />

      {items.map((item) => (
        <section key={item.id} id={`item-${item.id}`}>
          <h3>{item.title}</h3>
          <p>Status: {item.status}</p>

          <VeltInlineCommentsSection
            targetElementId={`item-${item.id}`}
            multiThread={true}
            shadowDom={false}
            composerPosition="bottom"
            context={{ itemId: item.id, itemTitle: item.title, status: item.status }}
          />
        </section>
      ))}
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

**Correct (React / Next.js — message truncation enabled):**

```jsx
<VeltInlineCommentsSection
  targetElementId="article0"
  messageTruncation={true}
  messageTruncationLines={3}
/>
```

**Correct (Other Frameworks — message truncation enabled):**

```html
<velt-inline-comments-section
  target-element-id="article0"
  message-truncation="true"
  message-truncation-lines="3">
</velt-inline-comments-section>
```

**Wireframe `context` Variable Resolution (v5.0.2-beta.11+):**

```html
// Inside a VeltInlineCommentsSection wireframe template:
// `context` resolves from parentLocalUIState.context (document/location context).
// Use field="context.someProperty" to access location-level context data.
<velt-data field="context.someProperty" />

// For annotation-level context in other (non-Inline-Section) components,
// use field="annotation.context.someProperty" instead.
<velt-data field="annotation.context.someProperty" />
<!-- HTML — same distinction applies in velt-data field expressions -->
<!-- Inside VeltInlineCommentsSection wireframe: context = parentLocalUIState.context -->
<velt-data field="context.someProperty"></velt-data>

<!-- Inside other component wireframes: annotation-level context -->
<velt-data field="annotation.context.someProperty"></velt-data>
```

---

### 2.17 Use Page Mode for Page-Level Comments

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
// PageModeComposerConfig interface
// {
//   context?: { [key: string]: any } | null;
//   targetElementId?: string | null;
//   clearContext?: boolean;  // defaults to true
// }
import { useVeltClient } from '@veltdev/react';

function PageModeControls() {
  const { client } = useVeltClient();

  const openComposerWithContext = () => {
    const commentElement = client.getCommentElement();
    // Set context data before opening composer (context cleared after submission by default)
    commentElement.setContextInPageModeComposer({
      context: { section: 'header', category: 'feedback' },
      targetElementId: 'header-section',
    });
    // Focus the page mode composer
    commentElement.focusPageModeComposer();
  };

  const openComposerPreservingContext = () => {
    const commentElement = client.getCommentElement();
    // Set clearContext: false to preserve context data across submissions
    commentElement.setContextInPageModeComposer({
      context: { documentId: '123', section: 'intro' },
      targetElementId: 'my-element',
      clearContext: false,
    });
    commentElement.focusPageModeComposer();
  };

  const handleClearContext = () => {
    const commentElement = client.getCommentElement();
    commentElement.clearPageModeComposerContext();
  };

  return (
    <>
      <button onClick={openComposerWithContext}>Add Page Comment</button>
      <button onClick={openComposerPreservingContext}>Add Comment (Keep Context)</button>
      <button onClick={handleClearContext}>Clear Context</button>
    </>
  );
}
```

---

### 2.18 Use Popover Mode for Table Cell Comments

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

### 2.19 Use Prebuilt Video Player for Quick Setup

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
  sync="true"
>
</velt-video-player>
```

---

### 2.20 Use Stream Mode for Google Docs-Style Comments

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

### 2.21 Use Text Mode for Text Highlight Comments

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

**Composer Props:**

```jsx
<VeltCommentComposer
  placeholder="Leave a comment..."       // Custom placeholder text
  readOnly={false}                        // Disable input — makes composer view-only
  targetComposerElementId="my-composer"   // Associate with specific element for programmatic submit
  context={{ projectId: 'proj-1', section: 'header' }} // Custom metadata on comments
  documentId="doc-123"                    // Associate comments with specific document
  folderId="folder-1"                     // Associate comments with specific folder
  locationId={1}                          // Associate comments with specific location
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

  const readState = () => {
    const commentElement = client.getCommentElement();
    const data = commentElement.getComposerData();
    // Returns: { text, html, attachments, taggedUsers, ... }
    console.log('Composer state:', data);
  };

  return (
    <>
      <button onClick={submit}>Submit</button>
      <button onClick={clear}>Clear</button>
      <button onClick={readState}>Read State</button>
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

**Pass annotation object directly (cross-document, read-only):**

```jsx
// Alternative: pass the full annotation object instead of just the ID.
// When using annotation prop: comments are READ-ONLY, reactions and recordings don't render.
// Use this for displaying comments from other documents or archived threads.
<VeltCommentThread annotation={annotationObject} />
```

**Handle comment clicks:**

```jsx
<VeltCommentThread
  annotationId={annotation.annotationId}
  onCommentClick={(event) => {
    console.log('Clicked comment:', event.annotationId);
    router.push(`/doc/${event.documentId}#${event.annotationId}`);
  }}
/>
```

**Styling the Thread:**

```jsx
<VeltCommentThread
  annotationId={annotation.annotationId}
  dialogVariant="custom-variant"
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

Navigation and display surfaces for comments. Includes the Comments Sidebar, the V2 primitive-architecture sidebar, and related toggle components.

### 4.1 Comments Sidebar Setup, Modes, and Configuration

**Impact: MEDIUM-HIGH (Sidebar is the primary surface for viewing, filtering, and navigating all comments — incorrect setup leads to missing sidebar or broken navigation)**

The comments sidebar has multiple display modes, each with specific component requirements. Choosing the wrong mode or omitting a required component results in a broken or invisible sidebar.

**Step 1 — Import and place components:**

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
      <div className="toolbar">
        <VeltSidebarButton />
        <VeltCommentTool />
      </div>
    </VeltProvider>
  );
}
```

**Embed mode:**

```jsx
<div className="sidebar-container">
  <VeltCommentsSidebar embedMode={true} />
</div>
```

**Floating mode (on the button, NOT the sidebar):**

```jsx
<VeltSidebarButton floatingMode={true} />
```

**Focused thread mode with navigation callback:**

```jsx
<VeltCommentsSidebar
  focusedThreadMode={true}
  openAnnotationInFocusMode={true}
  onCommentNavigationButtonClick={(event) => {
    const { pageId } = event.location;
    navigateToPage(pageId);
  }}
/>
```

**Step 3 — Configure filters, grouping, and sort:**

```jsx
const filterConfig = {
  location: { enable: true, name: 'Pages', enableGrouping: true, multiSelection: true },
  people: { enable: true, name: 'Author', enableGrouping: true },
  priority: { enable: true, name: 'Priority' },
  status: { enable: true, name: 'Status' },
  category: { enable: true, name: 'Category', enableGrouping: true },
};

<VeltCommentsSidebar
  filterConfig={filterConfig}
  groupConfig={{ enable: true, name: 'Group By' }}
  sortOrder="desc"
  sortBy="lastUpdated"
  filterPanelLayout="menu"
  position="right"
/>
```

**Step 4 — Handle navigation events:**

```jsx
<VeltCommentsSidebar
  onCommentClick={(event) => {
    const { pageId } = event.location;
    navigateToPage(pageId);
  }}
/>
```

**Programmatic open/close:**

```jsx
const commentElement = client.getCommentElement();
commentElement.openCommentSidebar();
commentElement.closeCommentSidebar();
commentElement.toggleCommentSidebar();
```

**V2 Sidebar (primitive-based):**

```jsx
import { VeltCommentsSidebarV2 } from '@veltdev/react';

<VeltCommentsSidebarV2 />
// or
<VeltCommentsSidebar version="2" />
```

V2 replaces the per-category filter panel with a unified `FilterDropdown`. For V2 wireframe customization, see the Comment Sidebar V2 Structure docs.

---

### 4.2 Use Comments Sidebar for Comment Navigation

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

**V1 defers to V2 when both are mounted (v5.0.2-beta.13+):**

```jsx
// Before (no longer valid — version prop removed):
<VeltCommentsSidebar version="2" />

// After — use VeltCommentsSidebarV2 directly:
<VeltCommentsSidebarV2 />
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

### 4.3 Use Sidebar Button to Toggle Comments Panel

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

### 4.4 Use VeltCommentsSidebarV2 for Primitive-Architecture Sidebar Customization

**Impact: MEDIUM-HIGH (Full composability of every sidebar UI section via 27+ independently importable primitives, enabling precise customization without forking the entire component)**

`VeltCommentsSidebarV2` is a complete redesign of the Comments Sidebar built on a flat primitive component architecture. Every section of the UI is an independently importable and composable primitive, so you can replace only the parts you need without reimplementing the whole component. V2 ships with a unified filter model (replacing the legacy `minimalFilter` + `advancedFilters` system), CDK virtual scroll for large comment lists, a focused-thread view, a minimal actions dropdown, and a filter dropdown.

**Incorrect (customizing V1 sidebar by overriding deeply nested internals):**

```jsx
// V1 sidebar requires shadowing deeply nested internal components
// to change layout or filtering — there is no flat primitive tree
<VeltCommentsSidebar />
```

**Correct (React / Next.js — direct V2 component with primitive composition):**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebarV2,
} from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />

      {/* Direct usage — all props are optional */}
      <VeltCommentsSidebarV2
        pageMode={false}
        focusedThreadMode={false}
        readOnly={false}
        position="right"
        variant="sidebar"
        forceClose={false}
        onSidebarOpen={(data) => console.log('sidebar opened', data)}
        onSidebarClose={(data) => console.log('sidebar closed', data)}
        onCommentClick={(data) => console.log('comment clicked', data)}
        onCommentNavigationButtonClick={(data) => console.log('nav button clicked', data)}
      />
    </VeltProvider>
  );
}
```

**Correct (HTML / Other Frameworks):**

```html
<velt-comments-sidebar-v2
  page-mode="false"
  focused-thread-mode="false"
  read-only="false"
  position="right"
  variant="sidebar"
  force-close="false"
></velt-comments-sidebar-v2>
```

---

## 5. UI Customization

**Impact: MEDIUM**

Visual customization patterns for comment components. Includes dialog customization, bubble styling, wireframe component usage, and standalone autocomplete primitives.

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

**React Primitive Sub-Components (v5.0.2-beta.13+):**

```jsx
import {
  VeltCommentBubbleAvatar,
  VeltCommentBubbleCommentsCount,
  VeltCommentBubbleUnreadIcon,
} from '@veltdev/react';

// Each primitive accepts defaultCondition to bypass the SDK's
// default show/hide logic when composing inside a wireframe.
<VeltCommentBubbleAvatar defaultCondition={false} />
<VeltCommentBubbleCommentsCount defaultCondition={false} />
<VeltCommentBubbleUnreadIcon defaultCondition={false} />
```

---

### 5.2 Customize Comment Dialog Appearance

**Impact: MEDIUM (Match comment dialogs to your application design system)**

Customize comment dialog appearance using variants, styling, and wireframe components to match your design system.

**Pre-defined Variants:**

```jsx
<VeltComments dialogVariant="variant-name" />
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
  shadow-dom="false"
></velt-comments>
```

**Inline Comments Section Customization:**

```jsx
<VeltInlineCommentsSection
  targetElementId="container-id"
  dialogVariant="custom-variant"
  variant="inline-section-variant"
  shadowDom={false}
/>
```

---

### 5.3 Set defaultCondition on V2 Primitive Sub-Components to Control Default Rendering

**Impact: MEDIUM (Prevents the SDK's default show/hide logic from conflicting with custom wireframe compositions in V2 primitive component families)**

Six comment component families have been migrated to the V2 primitive architecture: Comment Pin (6 primitives), Comment Bubble (3, HTML-only), Text Comment (7), Inline Comments Section (23), Multi-Thread Comment Dialog (24), and Sidebar Button (3). Every primitive in these families accepts a `defaultCondition` / `default-condition` prop. When a wireframe replaces a section of the UI, set `defaultCondition={false}` to bypass the SDK's built-in default show/hide logic and prevent double-rendering or unintended visibility toggles.

<!-- TODO (v5.0.2-beta.11): Verify the exact primitive component names within each family (e.g., the individual identifiers for the 6 Comment Pin primitives). Release note confirms primitive counts per family and the `defaultCondition` prop name, but does not enumerate individual primitive names. -->

**Incorrect (omitting defaultCondition when overriding a primitive section):**

```jsx
// The SDK's default show/hide logic still runs, causing the primitive
// to render in its default state alongside the custom wireframe content.
<VeltCommentPinWireframe.SomePrimitive>
  <MyCustomContent />
</VeltCommentPinWireframe.SomePrimitive>
```

**Correct (React — set defaultCondition={false} to bypass default rendering logic):**

```jsx
import { VeltWireframe } from '@veltdev/react';

// Inside a VeltWireframe block, pass defaultCondition={false} to any
// V2 primitive whose section is being replaced by custom content.
// Applies to all families: Comment Pin, Comment Bubble, Text Comment,
// Inline Comments Section, Multi-Thread Comment Dialog, Sidebar Button.
<VeltWireframe>
  <VeltCommentPinWireframe.SomePrimitive defaultCondition={false}>
    <MyCustomContent />
  </VeltCommentPinWireframe.SomePrimitive>
</VeltWireframe>
```

**Correct (HTML — use default-condition attribute):**

```html
<!-- Inside a <velt-wireframe style="display:none;"> wrapper -->
<velt-wireframe style="display:none;">
  <velt-comment-pin-primitive-wireframe default-condition="false">
    <!-- Custom content replaces the default primitive rendering -->
  </velt-comment-pin-primitive-wireframe>
</velt-wireframe>
```

**Attachment Download Primitives (edit-mode composer):**

```html
// React — inside a custom wireframe composer
<VeltCommentDialogComposerAttachmentsImageDownload annotationId="abc123" />
<VeltCommentDialogComposerAttachmentsOtherDownload annotationId="abc123" />
<!-- HTML -->
<velt-comment-dialog-composer-attachments-image-download annotation-id="abc123"></velt-comment-dialog-composer-attachments-image-download>
<velt-comment-dialog-composer-attachments-other-download annotation-id="abc123"></velt-comment-dialog-composer-attachments-other-download>
```

---

### 5.4 Use Standalone Autocomplete Primitives for Custom Autocomplete UIs

**Impact: MEDIUM (Build fully custom autocomplete UIs without requiring the full VeltAutocomplete panel, using independently importable primitive components)**

Velt provides 13 standalone autocomplete primitive components that are independently importable and render their corresponding HTML custom elements without requiring the full `<VeltAutocomplete>` panel. Use these primitives to build fully custom autocomplete UIs; use `VeltAutocompleteEmptyWireframe` to customize the empty state.

**Incorrect (using the full panel when only a subset of primitives is needed):**

```jsx
// Importing the full autocomplete panel forces all sub-components to render together.
// Use primitives individually when you need custom layout or partial rendering.
import { VeltAutocomplete } from '@veltdev/react';
```

**Correct (React — import and use primitives independently):**

```jsx
import {
  VeltAutocompleteOption,
  VeltAutocompleteOptionIcon,
  VeltAutocompleteOptionName,
  VeltAutocompleteOptionDescription,
  VeltAutocompleteOptionErrorIcon,
  VeltAutocompleteGroupOption,
  VeltAutocompleteTool,
  VeltAutocompleteEmpty,
  VeltAutocompleteChip,
  VeltAutocompleteChipTooltip,
  VeltAutocompleteChipTooltipIcon,
  VeltAutocompleteChipTooltipName,
  VeltAutocompleteChipTooltipDescription,
} from '@veltdev/react';

// Render a custom chip with tooltip
function CustomChip({ user }) {
  return (
    <VeltAutocompleteChip
      type="user"
      email={user.email}
      userId={user.userId}
      userObject={user}
    >
      <VeltAutocompleteChipTooltip>
        <VeltAutocompleteChipTooltipIcon />
        <VeltAutocompleteChipTooltipName />
        <VeltAutocompleteChipTooltipDescription />
      </VeltAutocompleteChipTooltip>
    </VeltAutocompleteChip>
  );
}

// Render a custom option row
function CustomOption({ user }) {
  return (
    <VeltAutocompleteOption userId={user.userId} userObject={user}>
      <VeltAutocompleteOptionIcon />
      <VeltAutocompleteOptionName />
      <VeltAutocompleteOptionDescription field="email" />
      <VeltAutocompleteOptionErrorIcon />
    </VeltAutocompleteOption>
  );
}
```

**Correct (React — customize the empty state via wireframe):**

```jsx
import { VeltWireframe, VeltAutocompleteEmptyWireframe } from '@veltdev/react';

// Wrap in VeltWireframe so Velt picks up the custom template
<VeltWireframe>
  <VeltAutocompleteEmptyWireframe>
    <div className="my-empty-state">No results found</div>
  </VeltAutocompleteEmptyWireframe>
</VeltWireframe>
```

**Correct (HTML — primitive custom elements):**

```html
<!-- Each primitive renders as its own custom element -->
<velt-autocomplete-option>
  <velt-autocomplete-option-icon></velt-autocomplete-option-icon>
  <velt-autocomplete-option-name></velt-autocomplete-option-name>
  <velt-autocomplete-option-description></velt-autocomplete-option-description>
  <velt-autocomplete-option-error-icon></velt-autocomplete-option-error-icon>
</velt-autocomplete-option>

<velt-autocomplete-chip>
  <velt-autocomplete-chip-tooltip>
    <velt-autocomplete-chip-tooltip-icon></velt-autocomplete-chip-tooltip-icon>
    <velt-autocomplete-chip-tooltip-name></velt-autocomplete-chip-tooltip-name>
    <velt-autocomplete-chip-tooltip-description></velt-autocomplete-chip-tooltip-description>
  </velt-autocomplete-chip-tooltip>
</velt-autocomplete-chip>

<!-- Empty state wireframe -->
<velt-autocomplete-empty-wireframe>
  <div class="my-empty-state">No results found</div>
</velt-autocomplete-empty-wireframe>
```

**`VeltAutocomplete` Panel Props (v5.0.2-beta.5+):**

```html
// React — configure the autocomplete panel
<VeltAutocomplete
  multiSelect={true}
  selectedFirstOrdering={true}
  contacts={myContactList}
/>
<!-- HTML — configure the autocomplete panel (contacts has no HTML attribute) -->
<velt-autocomplete
  multi-select="true"
  selected-first-ordering="true"
></velt-autocomplete>
```

<!-- TODO (v5.0.2-beta.5): Verify default values for readOnly and inline props on VeltAutocomplete. Release note confirms the prop names and types but does not specify default values. -->

---

### 5.5 Use VeltCommentDialogAgentSuggestion Primitives for Custom AI Suggestion UIs

**Impact: MEDIUM (Agent suggestion primitives enable fully custom accept/reject UIs for AI-generated suggestions within comment dialogs)**

The `VeltCommentDialogAgentSuggestion*` primitive family provides 21 composable components for building custom UIs around AI agent suggestions within comment dialogs. These are used when suggestions are created via the Velt Suggestions API and rendered in comment threads.

**Component hierarchy:**

```typescript
VeltCommentDialogAgentSuggestionBanner          — resolution banner (after accept/reject)
├── VeltCommentDialogAgentSuggestionBannerAvatar
│   ├── VeltCommentDialogAgentSuggestionBannerAvatarUserImage
│   └── VeltCommentDialogAgentSuggestionBannerAvatarStatusIcon
├── VeltCommentDialogAgentSuggestionBannerLabel
├── VeltCommentDialogAgentSuggestionBannerSeparator
├── VeltCommentDialogAgentSuggestionBannerResolverUserName
└── VeltCommentDialogAgentSuggestionBannerTimestamp

VeltCommentDialogAgentSuggestionHeaderTimestamp  — relative time in suggestion header
VeltCommentDialogAgentSuggestionHeaderMenu       — overflow menu (3-dot)
├── VeltCommentDialogAgentSuggestionHeaderMenuTrigger
└── VeltCommentDialogAgentSuggestionHeaderMenuContent
    └── VeltCommentDialogAgentSuggestionHeaderMenuContentItem
        ├── VeltCommentDialogAgentSuggestionHeaderMenuContentItemIcon
        └── VeltCommentDialogAgentSuggestionHeaderMenuContentItemLabel

VeltCommentDialogAgentSuggestionBody             — suggestion title + content
VeltCommentDialogAgentSuggestionFooter           — footer container
└── VeltCommentDialogAgentSuggestionFooterOpenComment  — navigate to full thread

VeltCommentDialogAgentSuggestionActions          — accept/reject button group
├── VeltCommentDialogAgentSuggestionActionsActionAccept
└── VeltCommentDialogAgentSuggestionActionsActionReject
```

**Usage pattern — Context Wrapper (recommended):**

```jsx
<VeltCommentDialogContextWrapper annotationId="abc123">
  <VeltCommentDialogAgentSuggestionBody />
  <VeltCommentDialogAgentSuggestionActions>
    <VeltCommentDialogAgentSuggestionActionsActionAccept />
    <VeltCommentDialogAgentSuggestionActionsActionReject />
  </VeltCommentDialogAgentSuggestionActions>
  <VeltCommentDialogAgentSuggestionBanner />
</VeltCommentDialogContextWrapper>
```

**Usage pattern — Standalone (ID-based):**

```jsx
<VeltCommentDialogAgentSuggestionBody annotationId="abc123" />
<VeltCommentDialogAgentSuggestionActions annotationId="abc123" />
```

**Custom resolution banner example:**

```jsx
<VeltCommentDialogAgentSuggestionBanner annotationId="abc123">
  <VeltCommentDialogAgentSuggestionBannerAvatar>
    <VeltCommentDialogAgentSuggestionBannerAvatarUserImage />
    <VeltCommentDialogAgentSuggestionBannerAvatarStatusIcon />
  </VeltCommentDialogAgentSuggestionBannerAvatar>
  <VeltCommentDialogAgentSuggestionBannerLabel />
  <VeltCommentDialogAgentSuggestionBannerSeparator />
  <VeltCommentDialogAgentSuggestionBannerResolverUserName />
  <VeltCommentDialogAgentSuggestionBannerTimestamp />
</VeltCommentDialogAgentSuggestionBanner>
```

**Custom suggestion header with overflow menu:**

```jsx
<VeltCommentDialogAgentSuggestionHeaderTimestamp annotationId="abc123" />
<VeltCommentDialogAgentSuggestionHeaderMenu annotationId="abc123">
  <VeltCommentDialogAgentSuggestionHeaderMenuTrigger />
  <VeltCommentDialogAgentSuggestionHeaderMenuContent>
    <VeltCommentDialogAgentSuggestionHeaderMenuContentItem>
      <VeltCommentDialogAgentSuggestionHeaderMenuContentItemIcon />
      <VeltCommentDialogAgentSuggestionHeaderMenuContentItemLabel />
    </VeltCommentDialogAgentSuggestionHeaderMenuContentItem>
  </VeltCommentDialogAgentSuggestionHeaderMenuContent>
</VeltCommentDialogAgentSuggestionHeaderMenu>
```

**HTML equivalents:** All components have kebab-case HTML custom element counterparts (e.g., `<velt-comment-dialog-agent-suggestion-banner>`). HTML uses string attributes (`annotation-id`, `default-condition="true"`), React uses camelCase props with actual booleans/objects.

---

### 5.6 Use Wireframe Components for Custom UI

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

**VisibilityBanner Wireframe Usage (v5.0.2-beta.5+):**

```html
// React (v5.0.2-beta.5+)
<VeltWireframe>
  <VeltCommentDialogWireframe.VisibilityBanner>
    <VeltCommentDialogWireframe.VisibilityBanner.Icon />
    <VeltCommentDialogWireframe.VisibilityBanner.Text />
    <VeltCommentDialogWireframe.VisibilityBanner.Dropdown>
      <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger>
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.Label />
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.AvatarList>
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.AvatarList.Item />
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.AvatarList.RemainingCount />
        </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.AvatarList>
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger.Icon />
      </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Trigger>
      <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content>
        {/* Supports 4 types: 'public', 'organizationPrivate', 'restrictedSelf', 'restrictedSelectedPeople' */}
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item type="public">
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Icon />
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Label />
        </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item>
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item type="organizationPrivate">
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Icon />
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Label />
        </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item>
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item type="restrictedSelf">
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Icon />
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Label />
        </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item>
        <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item type="restrictedSelectedPeople">
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Icon />
          <VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item.Label />
        </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item>
      </VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content>
    </VeltCommentDialogWireframe.VisibilityBanner.Dropdown>
  </VeltCommentDialogWireframe.VisibilityBanner>
</VeltWireframe>
<!-- Other Frameworks (inside <velt-wireframe style="display:none;"> wrapper) (v5.0.2-beta.5+) -->
<velt-comment-dialog-visibility-banner-wireframe>
  <velt-comment-dialog-visibility-banner-icon-wireframe></velt-comment-dialog-visibility-banner-icon-wireframe>
  <velt-comment-dialog-visibility-banner-text-wireframe></velt-comment-dialog-visibility-banner-text-wireframe>
  <velt-comment-dialog-visibility-banner-dropdown-wireframe>
    <velt-comment-dialog-visibility-banner-dropdown-trigger-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-trigger-label-wireframe></velt-comment-dialog-visibility-banner-dropdown-trigger-label-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-item-wireframe></velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-item-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-remaining-count-wireframe></velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-remaining-count-wireframe>
      </velt-comment-dialog-visibility-banner-dropdown-trigger-avatar-list-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-trigger-icon-wireframe></velt-comment-dialog-visibility-banner-dropdown-trigger-icon-wireframe>
    </velt-comment-dialog-visibility-banner-dropdown-trigger-wireframe>
    <velt-comment-dialog-visibility-banner-dropdown-content-wireframe>
      <!-- Supports 4 types: 'public', 'organizationPrivate', 'restrictedSelf', 'restrictedSelectedPeople' -->
      <velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe type="public">
        <velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe>
      </velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe type="organizationPrivate">
        <velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe>
      </velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe type="restrictedSelf">
        <velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe>
      </velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe>
      <velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe type="restrictedSelectedPeople">
        <velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-icon-wireframe>
        <velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe></velt-comment-dialog-visibility-banner-dropdown-content-item-label-wireframe>
      </velt-comment-dialog-visibility-banner-dropdown-content-item-wireframe>
    </velt-comment-dialog-visibility-banner-dropdown-content-wireframe>
  </velt-comment-dialog-visibility-banner-dropdown-wireframe>
</velt-comment-dialog-visibility-banner-wireframe>
```

**AssigneeBanner Resolve/Unresolve Button Nesting (v5.0.1-beta.2+):**

```html
// Correct: custom content rendered INSIDE the button component (v5.0.1-beta.2+)
<VeltCommentDialogWireframe.AssigneeBanner>
  <VeltCommentDialogWireframe.AssigneeBanner.ResolveButton>
    {/* Custom content rendered inside the resolve button */}
  </VeltCommentDialogWireframe.AssigneeBanner.ResolveButton>
  <VeltCommentDialogWireframe.AssigneeBanner.UnresolveButton>
    {/* Custom content rendered inside the unresolve button */}
  </VeltCommentDialogWireframe.AssigneeBanner.UnresolveButton>
</VeltCommentDialogWireframe.AssigneeBanner>
<!-- HTML equivalents -->
<velt-comment-dialog-assignee-banner-wireframe>
  <velt-comment-dialog-assignee-banner-resolve-button-wireframe>
    <!-- Custom content inside resolve button -->
  </velt-comment-dialog-assignee-banner-resolve-button-wireframe>
  <velt-comment-dialog-assignee-banner-unresolve-button-wireframe>
    <!-- Custom content inside unresolve button -->
  </velt-comment-dialog-assignee-banner-unresolve-button-wireframe>
</velt-comment-dialog-assignee-banner-wireframe>
```

**For HTML:**

```html
<velt-comment-dialog-wireframe>
  <velt-comment-dialog-wireframe-header>
    <velt-comment-dialog-wireframe-status></velt-comment-dialog-wireframe-status>
  </velt-comment-dialog-wireframe-header>
</velt-comment-dialog-wireframe>
```

**Wireframe Data Variables (v5.0.2-beta.11+):**

```html
// React — reference annotation data via the annotations shorthand variable
// inside a wireframe template for a list-level component (e.g., Inline Comments Section)
<VeltWireframe>
  {/* annotations.0.annotationId resolves the first annotation's ID */}
  <velt-data field="annotations.0.annotationId" />

  {/* allAnnotations gives access to all annotations regardless of filter state */}
  <velt-data field="allAnnotations" />
</VeltWireframe>
<!-- HTML — same shorthand variables work inside velt-data field expressions -->
<velt-wireframe style="display:none;">
  <velt-data field="annotations.0.annotationId"></velt-data>
  <velt-data field="allAnnotations"></velt-data>
</velt-wireframe>
```

**Correct (React / Next.js — custom ShowMore / ShowLess inside a wireframe):**

```jsx
<VeltWireframe>
  <VeltCommentDialogWireframe.ThreadCard.Message.ShowMore />
  <VeltCommentDialogWireframe.ThreadCard.Message.ShowLess />
</VeltWireframe>
```

**Correct (Other Frameworks — custom ShowMore / ShowLess inside a wireframe):**

```html
<velt-wireframe>
  <velt-comment-dialog-thread-card-message-show-more-wireframe>
    <!-- custom Show more content -->
  </velt-comment-dialog-thread-card-message-show-more-wireframe>
  <velt-comment-dialog-thread-card-message-show-less-wireframe>
    <!-- custom Show less content -->
  </velt-comment-dialog-thread-card-message-show-less-wireframe>
</velt-wireframe>
```

---

## 6. Data Model

**Impact: MEDIUM**

Patterns for working with comment data structures. Includes CRUD operations, metadata, annotations, composer control, read status, and data type reference.

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
  visibilityConfig?: CommentAnnotationVisibilityConfig; // defaults to { type: 'public' } when not set
  // ... other fields
}

interface CommentAnnotationVisibilityConfig {
  type: CommentVisibilityType;  // 'public' | 'organizationPrivate' | 'restricted'
  organizationId?: string;
  userIds?: string[];
}

type CommentVisibilityType = 'public' | 'organizationPrivate' | 'restricted';
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
    // Use event.addContext() to attach custom metadata
    event?.addContext({
      timestamp: Date.now(),
      pageSection: 'main-content',
    });
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

**Method 2: Via onCommentAdd Callback (using addContext)**
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

### 6.4 Comments Data Type Reference — Core Models

**Impact: MEDIUM (Type definitions for comment annotations, comments, status, priority, attachments)**

Complete type definitions for all core comment data models used across hooks, API methods, and REST endpoints.

**CommentAnnotation (thread container):**

```typescript
interface CommentAnnotation {
  annotationId: string;                // Unique thread ID
  documentId?: string;                 // Document this thread belongs to
  organizationId?: string;             // Organization scope
  location?: Location;                 // Location within document
  targetElement?: TargetElement;       // DOM element being commented on
  commentData: Comment[];              // Array of comments in this thread
  status?: Status;                     // Thread status (open, resolved, etc.)
  priority?: Priority;                 // Priority level
  assignedTo?: User[];                 // Assigned users
  context?: Record<string, any>;       // Custom metadata
  visibilityConfig?: {                 // Privacy settings
    type: 'public' | 'organizationPrivate' | 'restricted';
    userIds?: string[];
  };
  createdAt?: number;                  // Creation timestamp (ms)
  lastUpdated?: number;                // Last update timestamp (ms)
  resolved?: boolean;                  // Whether thread is resolved
  resolvedByUser?: User;               // Who resolved it
  commentType?: string;                // Secondary discriminator, e.g. 'suggestion' for agent suggestions
  sourceType?: string;                 // Origin of annotation — selects agent-identity vs human-author header
  agent?: CommentAnnotationAgent;      // Present when annotation was authored by an AI agent
  suggestion?: CommentAnnotationSuggestion; // Suggestion state for typed-suggestion annotations
  basicAnchorData?: {                  // Client-safe anchor data derived from target element xpath
    xpath: string;                     // From targetElement.anchor.fXPath (fallback: targetElement.fXpath)
    topPercentage: number;             // Defaults to 0 when not set
    leftPercentage: number;            // Defaults to 0 when not set
  };
}
```

**Comment (individual message):**

```typescript
interface Comment {
  commentId: number;                   // Unique comment ID (number, not string)
  commentText: string;                 // Plain text content
  commentHtml?: string;                // Rich text HTML content
  from: User;                          // Author
  context?: Record<string, any>;       // Custom metadata per comment
  attachments?: Attachment[];           // File attachments
  taggedUserContacts?: TaggedContact[]; // @mentioned users
  reactionAnnotations?: ReactionAnnotation[]; // Emoji reactions
  createdAt?: number;                  // Creation timestamp
  lastUpdated?: number;                // Last update timestamp
  isEdited?: boolean;                  // Whether comment was edited
  type?: string;                       // Comment type
}
```

**Status:**

```typescript
interface Status {
  id: string;                          // Unique status ID (e.g., 'open', 'resolved')
  name: string;                        // Display name
  type: 'default' | 'ongoing' | 'terminal'; // Status category
  color?: string;                      // Hex color for badge
  lightColor?: string;                 // Light variant for backgrounds
  svg?: string;                        // SVG icon string
  iconUrl?: string;                    // Icon URL
}
// Built-in: OPEN (default), IN_PROGRESS (ongoing), RESOLVED (terminal)
```

**Priority:**

```typescript
interface Priority {
  id: string;                          // Unique priority ID (e.g., 'p0', 'high')
  name: string;                        // Display name
  color?: string;                      // Hex color
  lightColor?: string;                 // Light variant
}
// Built-in: P0/Critical, P1/High, P2/Medium, P3/Low
```

**Attachment:**

```typescript
interface Attachment {
  attachmentId: string | number;       // Unique attachment ID
  name?: string;                       // File name
  url?: string;                        // Download/access URL
  bucketPath?: string;                 // Storage path
  size?: number;                       // File size in bytes
  type?: string;                       // File type category
  mimeType?: string;                   // MIME type
  thumbnail?: string;                  // Thumbnail URL
  metadata?: Record<string, any>;      // Custom metadata
}
```

**Location:**

```typescript
interface Location {
  id: number;                          // Unique location ID (number)
  locationName?: string;               // Display name for the location
}
```

**TargetElement:**

```typescript
interface TargetElement {
  elementId?: string;                  // DOM element ID
  targetText?: string;                 // Selected text (for text mode)
  occurrence?: number;                 // Which occurrence of text
  selectAllContent?: boolean;          // Whether all content selected
}
```

**TaggedContact:**

```typescript
interface TaggedContact {
  text: string;                        // Display text (e.g., '@bob')
  userId: string;                      // User ID
  contact: {
    userId: string;
    name?: string;
    email?: string;
  };
}
```

**CommentSidebarData:**

```typescript
interface CommentSidebarData {
  documentId: string;
  location?: Location;
  annotations: CommentAnnotation[];
  metadata?: Record<string, any>;
}
```

**CommentAnnotationAgent (AI agent identity on agent-authored annotations):**

```typescript
interface CommentAnnotationAgent {
  name?: string;            // Agent display name shown in suggestion header
  photoUrl?: string;        // Agent avatar URL (falls back to default icon)
  result?: AgentResult;     // Structured output produced by the agent
  agentFields?: string[];   // Tags for filtering via agentFields on CommentRequestQuery
}

interface AgentResult {
  title?: string;           // Bold title at top of Agent Suggestion card body
}
```

**CommentAnnotationSuggestion (suggestion state for typed-suggestion annotations):**

```typescript
interface CommentAnnotationSuggestion {
  status?: 'pending' | 'accepted' | 'rejected';
  acceptedByUserId?: string;
  rejectedByUserId?: string;
}
```

Suggestion state is mutated by `acceptSuggestion()` / `rejectSuggestion()` API methods. The `commentType` field on the parent annotation is `'suggestion'` for agent suggestion comments. The `sourceType` field selects the agent-identity vs human-author header variant rendered in the UI.

Reference: https://docs.velt.dev/api-reference/sdk/models/data-models - Comments

---

### 6.5 Individual Comment CRUD — Add, Update, Delete, Get Comments Within Threads

**Impact: HIGH (Required for programmatic comment management within annotation threads)**

Use these methods to manage individual comments within an existing annotation thread — add replies, edit messages, delete comments, and track unread counts.

**API Methods (via getCommentElement()):**

```tsx
const commentElement = client.getCommentElement();

// Add comment to existing thread
await commentElement.addComment({
  annotationId: 'ann-123',
  comment: {
    commentText: 'This is a reply',
    commentHtml: '<p>This is a reply</p>',
  },
});

// Update comment content
await commentElement.updateComment({
  annotationId: 'ann-123',
  commentId: 42,
  comment: {
    commentText: 'Updated text',
    commentHtml: '<p>Updated text</p>',
  },
});

// Delete single comment from thread
await commentElement.deleteComment({
  annotationId: 'ann-123',
  commentId: 42,
});

// Get comment data
const comment = await commentElement.getComment({
  annotationId: 'ann-123',
  commentId: 42,
});
```

**Unread Count Methods:**

```tsx
// Unread count on current document
commentElement.getUnreadCommentCountOnCurrentDocument()
  .subscribe((count) => {
    console.log('Unread on doc:', count);
  });

// Unread count by location
commentElement.getUnreadCommentCountByLocationId(locationId)
  .subscribe((count) => {
    console.log('Unread at location:', count);
  });

// Unread count by annotation thread
commentElement.getUnreadCommentCountByAnnotationId(annotationId)
  .subscribe((count) => {
    console.log('Unread in thread:', count);
  });
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - Messages

---

### 6.6 Mark Comments as Read or Unread

**Impact: HIGH (Control read/unread state for notification badges and filtering)**

Use `markAsRead()` and `markAsUnread()` to programmatically control read/unread state of comment annotations — useful for custom notification badges, read receipts, or "mark all as read" actions.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Mark specific annotations as read
commentElement.markAsRead({
  annotationIds: ['ann-123', 'ann-456'],
});

// Mark specific annotations as unread
commentElement.markAsUnread({
  annotationIds: ['ann-123'],
});
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - Comment Status (Read/Unread)

---

### 6.7 Programmatic Annotation CRUD — Create, Query, Delete Threads

**Impact: HIGH (Required for programmatic comment thread management)**

Use these methods to create, query, and delete comment annotation threads programmatically — without requiring user interaction with comment pins or tools.

**React Hooks:**

```tsx
import {
  useAddCommentAnnotation,
  useDeleteCommentAnnotation,
  useGetCommentAnnotations,
  useCommentAnnotationsCount,
  useUnreadCommentAnnotationCountByLocationId,
} from '@veltdev/react';

// Add annotation
const addAnnotation = useAddCommentAnnotation();
await addAnnotation({ targetElementId: 'element-1', context: { key: 'value' } });

// Delete annotation
const deleteAnnotation = useDeleteCommentAnnotation();
await deleteAnnotation({ annotationId: 'ann-123' });

// Query annotations with filters
const { data, loading } = useGetCommentAnnotations({
  documentIds: ['doc-1'],
  locationIds: [1, 2],
  statusIds: ['open'],
  pageSize: 50,
});

// Get annotation counts
const count = useCommentAnnotationsCount({
  organizationId: 'org-1',
  documentIds: ['doc-1'],
  filterGhostComments: true,
});
// Returns: { total: number, unread: number }

// Unread count by location
const unreadByLocation = useUnreadCommentAnnotationCountByLocationId({
  locationId: 1,
});
```

**API Methods (via getCommentElement()):**

```tsx
const commentElement = client.getCommentElement();

// Create annotation on specific element
commentElement.addCommentOnElement(targetElement, commentData, status);

// Create annotation on selected text
commentElement.addCommentOnSelectedText();

// Delete annotation by ID
commentElement.deleteCommentAnnotation({ annotationId: 'ann-123' });

// Delete currently selected comment
commentElement.deleteSelectedComment();

// Get single annotation by ID
const annotation = await commentElement.getCommentAnnotationById('ann-123');

// Get DOM element reference for annotation
const elementRef = commentElement.getElementRefByAnnotationId('ann-123');

// Get selected comments (subscription)
commentElement.getSelectedComments().subscribe((comments) => {
  console.log('Selected:', comments);
});

// Fetch annotations with server query
const result = await commentElement.fetchCommentAnnotations({
  documentIds: ['doc-1'],
  pageSize: 50,
});

// Query annotations (subscription)
commentElement.getCommentAnnotations({
  documentIds: ['doc-1'],
  locationIds: [1],
  statusIds: ['open'],
}).subscribe((annotations) => {
  console.log('Annotations:', annotations);
});

// Get count
commentElement.getCommentAnnotationsCount({
  organizationId: 'org-1',
}).subscribe((count) => {
  // count: { total: number, unread: number }
});

// Unread count by location
commentElement.getUnreadCommentAnnotationCountByLocationId(locationId)
  .subscribe((count) => {
    console.log('Unread at location:', count);
  });
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - Threads

---

### 6.8 Programmatic Composer Control — Submit, Clear, Read State

**Impact: HIGH (Control the comment composer programmatically)**

Use these methods to control the comment composer without user interaction — submit comments programmatically, clear the composer, or read its current state.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Submit the current composer content
commentElement.submitComment({
  targetComposerElementId: 'composer-1', // Matches the VeltCommentComposer's targetComposerElementId prop
});

// Clear the composer (reset to empty)
commentElement.clearComposer();

// Read current composer state
const composerData = commentElement.getComposerData();
// Returns: { text, html, attachments, taggedUsers, ... }
```

**Usage with VeltCommentComposer:**

```tsx
import { VeltCommentComposer } from '@veltdev/react';

function CustomSubmitForm() {
  const { client } = useVeltClient();

  const handleSubmit = () => {
    const commentElement = client?.getCommentElement();
    commentElement?.submitComment({ targetComposerElementId: 'my-composer' });
  };

  return (
    <>
      <VeltCommentComposer targetComposerElementId="my-composer" />
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={() => client?.getCommentElement()?.clearComposer()}>
        Clear
      </button>
    </>
  );
}
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - Composer

---

### 6.9 Use agentFields on CommentRequestQuery to Filter Annotation Count by Agent

**Impact: MEDIUM (Enables precise comment count queries scoped to agent-tagged annotations, avoiding full-collection scans)**

`CommentRequestQuery.agentFields` filters `getCommentAnnotationCount()` to only annotations where `agent.agentFields` contains any of the provided values. This is useful when a document has a mix of human and agent-authored annotations and you want a count scoped to a specific agent. Due to a Firestore `array-contains` limitation, when `agentFields` is set the unread count query is skipped and the unread count is treated as equal to the total count.

**Incorrect (querying all annotation counts without agent scoping):**

```jsx
// Returns total + unread counts across all annotations,
// including those not authored by the target agent
const commentElement = client.getCommentElement();
commentElement.getCommentAnnotationCount({
  organizationId: 'org-123',
});
```

**Correct (React / Next.js — scoped count query with agentFields):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect, useState } from 'react';

function AgentCommentCount() {
  const { client } = useVeltClient();
  const [count, setCount] = useState(null);

  useEffect(() => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Filters to annotations where agent.agentFields contains
    // 'agent-1' or 'agent-2'. Unread count equals total count
    // when agentFields is set (Firestore array-contains constraint).
    const subscription = commentElement.getCommentAnnotationCount({
      organizationId: 'org-123',
      agentFields: ['agent-1', 'agent-2'],
    }).subscribe((result) => {
      setCount(result);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  return <div>Agent annotations: {count?.totalCount ?? 0}</div>;
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
const commentElement = client.getCommentElement();

const subscription = commentElement.getCommentAnnotationCount({
  organizationId: 'org-123',
  agentFields: ['agent-1', 'agent-2'],
}).subscribe((result) => {
  console.log('Agent annotation count:', result);
});
```

---

### 6.10 Use CommentActivityActionTypes for Type-Safe Comment Activity Filtering

**Impact: MEDIUM (Eliminates raw-string action type errors when filtering comment activities)**

The `CommentActivityActionTypes` exported constant provides the canonical string values for all comment action types. Use it — and the accompanying `CommentActivityActionType` union type — instead of raw strings when building `ActivitySubscribeConfig.actionTypes` filters, so that typos are caught at compile time and the code self-documents intent.

**Incorrect (raw string values for action type filtering):**

```typescript
// Raw strings are error-prone and not refactor-safe
const activities = activityElement.getAllActivities({
  actionTypes: ['comment_annotation.add', 'comment_annotation.status_change'],
});
```

**Correct (React / Next.js — type-safe filtering with CommentActivityActionTypes):**

```jsx
import { CommentActivityActionTypes } from '@veltdev/react';
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function CommentActivityFilter() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const activityElement = client.getActivityElement();

    // Type-safe filtering of comment activities
    const subscription = activityElement.getAllActivities({
      actionTypes: [
        CommentActivityActionTypes.ANNOTATION_ADD,
        CommentActivityActionTypes.STATUS_CHANGE,
      ],
    }).subscribe((activities) => {
      console.log('Comment activities:', activities);
    });

    return () => subscription.unsubscribe();
  }, [client]);
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
import { CommentActivityActionTypes } from '@veltdev/types';

const activityElement = client.getActivityElement();

const subscription = activityElement.getAllActivities({
  actionTypes: [
    CommentActivityActionTypes.ANNOTATION_ADD,
    CommentActivityActionTypes.STATUS_CHANGE,
  ],
}).subscribe((activities) => {
  console.log('Comment activities:', activities);
});
```

**Full Constant Definition (v5.0.2-beta.7):**

```typescript
import { CommentActivityActionTypes, CommentActivityActionType } from '@veltdev/react';

const CommentActivityActionTypes = {
  ANNOTATION_ADD: 'comment_annotation.add',
  ANNOTATION_DELETE: 'comment_annotation.delete',
  COMMENT_ADD: 'comment.add',
  COMMENT_UPDATE: 'comment.update',
  COMMENT_DELETE: 'comment.delete',
  STATUS_CHANGE: 'comment_annotation.status_change',
  PRIORITY_CHANGE: 'comment_annotation.priority_change',
  ASSIGN: 'comment_annotation.assign',
  ACCESS_MODE_CHANGE: 'comment_annotation.access_mode_change',
  CUSTOM_LIST_CHANGE: 'comment_annotation.custom_list_change',
  APPROVE: 'comment_annotation.approve',
  ACCEPT: 'comment.accept',
  REJECT: 'comment.reject',
  REACTION_ADD: 'comment.reaction_add',
  REACTION_DELETE: 'comment.reaction_delete',
  SUBSCRIBE: 'comment_annotation.subscribe',
  UNSUBSCRIBE: 'comment_annotation.unsubscribe',
} as const;

type CommentActivityActionType =
  typeof CommentActivityActionTypes[keyof typeof CommentActivityActionTypes];
```

<!-- TODO (v5.0.2-beta.7): Verify the complete member list for CommentActivityActionTypes. Release note confirms ANNOTATION_ADD and STATUS_CHANGE and that the constant exists; all 17 members above are supplied in the release delta but should be validated against SDK source before shipping to production. -->

---

### 6.11 Use Config-Based URL Endpoints Instead of Placeholder Callbacks in CommentAnnotationDataProvider

**Impact: MEDIUM (Eliminates boilerplate callback stubs when using URL-based data provider endpoints, reducing integration errors)**

As of v5.0.2-beta.8, the `get`, `save`, and `delete` methods on `CommentAnnotationDataProvider` (and the parallel `ReactionAnnotationDataProvider` and `AttachmentDataProvider`) are optional. When using config-based URL endpoints (`config.getConfig`, `config.saveConfig`, `config.deleteConfig`), you no longer need to supply empty placeholder callbacks alongside them. `ResolverConfig` accepts `additionalFields?: string[]` to copy custom fields to your resolver endpoint payload while retaining them in Velt's storage, and `fieldsToRemove?: string[]` to strip fields from Velt's DB entirely before storage (e.g. for PII removal). Both can coexist on the same config object.

**Incorrect (supplying unnecessary placeholder callbacks alongside config-based endpoints):**

```tsx
// Before v5.0.2-beta.8: developers had to supply stub callbacks
// even when using config-based URL endpoints — now redundant
client.setDataProviders({
  comment: {
    get: async (request) => ({ data: null }), // unnecessary stub
    save: async (request) => ({ data: null }), // unnecessary stub
    delete: async (request) => ({ data: null }), // unnecessary stub
    config: {
      getConfig:    { url: 'https://api.yourapp.com/comments/get' },
      saveConfig:   { url: 'https://api.yourapp.com/comments/save' },
      deleteConfig: { url: 'https://api.yourapp.com/comments/delete' },
    },
  },
});
```

**Correct (config-based endpoints with no placeholder callbacks required):**

```tsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function DataProviderSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    // Config-based URL endpoints — get/save/delete callbacks are optional
    client.setDataProviders({
      comment: {
        config: {
          getConfig:        { url: 'https://api.yourapp.com/comments/get' },
          saveConfig:       { url: 'https://api.yourapp.com/comments/save' },
          deleteConfig:     { url: 'https://api.yourapp.com/comments/delete' },
          // Copied to resolver payload but kept in Velt's storage
          additionalFields: ['tenantId', 'projectId'],
          // Stripped from Velt's DB before storage (PII removal)
          fieldsToRemove: ['sensitiveField'],
        },
      },
    });
  }, [client]);
}

// Callback-based form is still valid when you need custom logic
function DataProviderSetupCallbackBased() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    client.setDataProviders({
      comment: {
        get:    async (request) => { /* fetch from your backend */ return { data: null }; },
        save:   async (request) => { /* persist to your backend */ return { data: null }; },
        delete: async (request) => { /* delete from your backend */ return { data: null }; },
      },
    });
  }, [client]);
}
```

---

### 6.12 Use triggerActivities to Create Activity Records via REST API

**Impact: MEDIUM (Ensures comment additions via REST API are reflected in the activity feed when workspace-level activity tracking is enabled)**

When adding comments via the `POST /v2/commentannotations/add` REST endpoint, set `triggerActivities: true` on each `CommentData` entry to automatically create an activity record for that comment. Without this flag the comment is persisted but no activity record is generated, even if the workspace has `activityServiceConfig` enabled.

Note: `triggerActivities` creates activity records; `triggerNotification` sends notifications. These are independent flags — one does not imply the other.

**Incorrect (omitting triggerActivities when activity tracking is required):**

```json
// POST /v2/commentannotations/add — activity record will NOT be created
{
  "commentAnnotations": [
    {
      "commentData": [
        {
          "from": { "userId": "user-1", "email": "user@example.com" },
          "commentText": "This needs review",
          "triggerNotification": true
        }
      ]
    }
  ]
}
```

**Correct (set triggerActivities: true on the CommentData entry):**

```json
// POST /v2/commentannotations/add — activity record is created automatically
{
  "commentAnnotations": [
    {
      "commentData": [
        {
          "from": { "userId": "user-1", "email": "user@example.com" },
          "commentText": "This needs review",
          "triggerNotification": true,
          "triggerActivities": true
        }
      ]
    }
  ]
}
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

Access control and moderation features for comments. Includes comment visibility control (private mode), per-annotation visibility updates, and post-persist event handling.

### 8.1 Control Comment Visibility with Private Mode and Per-Annotation Updates

**Impact: LOW (Prevent unintended comment exposure by restricting visibility globally or per annotation to organization members or specific users)**

> **Prerequisite:** Before using any visibility API (`enablePrivateMode`, `updateVisibility`, visibility options), you must first **enable** the visibility feature in [Velt Console](https://console.velt.dev/dashboard/config/appconfig). Without this, visibility API calls will have no effect.

Use `enablePrivateMode()` to set a global visibility default for all new comments in a session, and `updateVisibility()` to change the visibility of a specific existing annotation. Without explicit visibility control, all new comments are public by default.

> **Breaking Change (v5.0.1-beta.4):** `CommentVisibilityType` string literal values were renamed. `'organization'` is now `'organizationPrivate'` and `'self'` is now `'restricted'`. Passing the old values will silently apply incorrect visibility. See the Breaking Change section below.

**Incorrect (no visibility control — all new comments visible to everyone):**

```jsx
// No private mode set — every new comment is public by default.
const { client } = useVeltClient();
useEffect(() => {
  if (!client) return;
  const commentElement = client.getCommentElement();
  // Missing: commentElement.enablePrivateMode(...)
}, [client]);
```

**Correct (React — enable global private mode for organization members):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function PrivateModeController() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Restrict all new comments to members of the same organization
    commentElement.enablePrivateMode({ type: 'organizationPrivate' });

    // organizationId is auto-resolved from the authenticated user — no need to pass it manually.

    return () => {
      // Revert to default public visibility on unmount
      commentElement.disablePrivateMode();
    };
  }, [client]);

  return null;
}
```

**Correct (React — restrict new comments to specific users only):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function RestrictedModeController() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Restrict all new comments to user-a and user-b only.
    // The current user is always auto-appended to userIds — even when an explicit list is provided.
    commentElement.enablePrivateMode({
      type: 'restricted',
      userIds: ['user-a', 'user-b'],
    });

    return () => commentElement.disablePrivateMode();
  }, [client]);

  return null;
}
```

**Correct (React — update visibility of a specific existing annotation):**

```jsx
import { useVeltClient } from '@veltdev/react';

function VisibilityUpdater({ annotationId }: { annotationId: string }) {
  const { client } = useVeltClient();

  const makeOrgPrivate = () => {
    if (!client) return;
    const commentElement = client.getCommentElement();
    commentElement.updateVisibility({
      annotationId,
      type: 'organizationPrivate',
      // organizationId is optional — auto-resolved from authenticated user
    });
  };

  const restrictToUsers = () => {
    if (!client) return;
    const commentElement = client.getCommentElement();
    commentElement.updateVisibility({
      annotationId,
      type: 'restricted',
      userIds: ['user-a'],
    });
  };

  return (
    <>
      <button onClick={makeOrgPrivate}>Make org-private</button>
      <button onClick={restrictToUsers}>Restrict to user-a</button>
    </>
  );
}
```

**Correct (HTML / Other Frameworks — global private mode):**

```typescript
// Global private mode: organization members only
const commentElement = Velt.getCommentElement();
commentElement.enablePrivateMode({ type: 'organizationPrivate' });

// Restrict new comments to specific users
commentElement.enablePrivateMode({
  type: 'restricted',
  userIds: ['user-a', 'user-b'],
});

// Revert to default public visibility
commentElement.disablePrivateMode();
```

**Correct (HTML / Other Frameworks — per-annotation visibility update):**

```typescript
const commentElement = Velt.getCommentElement();

// Update a specific annotation to organization-private
commentElement.updateVisibility({
  annotationId: 'annotation-123',
  type: 'organizationPrivate',
});

// Update a specific annotation to restricted visibility
commentElement.updateVisibility({
  annotationId: 'annotation-123',
  type: 'restricted',
  userIds: ['user-a'],
});
```

**Correct (React — set visibility at comment creation time):**

```jsx
import { useVeltClient } from '@veltdev/react';

function CreateRestrictedComment() {
  const { client } = useVeltClient();

  const addComment = () => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Set visibility at creation time — no post-creation updateVisibility() call needed.
    commentElement.addComment({
      annotationId: 'annotation-id',
      comment: { text: 'Visible only to selected users' },
      visibility: {
        type: 'restricted',
        userIds: ['user1', 'user2'],
      },
    });
  };

  return <button onClick={addComment}>Add restricted comment</button>;
}
```

**Correct (HTML / Other Frameworks — set visibility at comment creation time):**

```typescript
const commentElement = Velt.getCommentElement();

// Set visibility at creation time — no post-creation updateVisibility() call needed.
commentElement.addComment({
  annotationId: 'annotation-id',
  comment: { text: 'Visible only to selected users' },
  visibility: {
    type: 'restricted',
    userIds: ['user1', 'user2'],
  },
});
```

**Type Definitions:**

```typescript
type CommentVisibilityType = 'public' | 'organizationPrivate' | 'restricted';

interface CommentVisibilityConfig {
  type: CommentVisibilityType;
  annotationId?: string;   // Required for updateVisibility(); unused in enablePrivateMode()
  organizationId?: string; // Auto-resolved from authenticated user when omitted
  userIds?: string[];      // Current user always auto-appended for 'restricted' type, even when list is explicitly provided
}

// PrivateModeConfig omits annotationId and organizationId (auto-resolved)
type PrivateModeConfig = Omit<CommentVisibilityConfig, 'annotationId' | 'organizationId'>;

interface AddCommentRequest {
  annotationId?: string;
  comment?: { text?: string; [key: string]: unknown };
  visibility?: CommentVisibilityConfig; // Optional: set visibility at creation time (v5.0.2-beta.4+)
  [key: string]: unknown;
}
```

**Before (v5.0.1-beta.3 and earlier — now broken):**

```typescript
// WRONG — 'organization' and 'self' are no longer valid values
commentElement.updateVisibility({ annotationId: 'a1', type: 'organization' }); // WRONG
commentElement.updateVisibility({ annotationId: 'a1', type: 'self' });         // WRONG
commentElement.enablePrivateMode({ type: 'organization' });                    // WRONG
```

**After (v5.0.1-beta.4+ — correct values):**

```typescript
// CORRECT — use 'organizationPrivate' and 'restricted'
commentElement.updateVisibility({ annotationId: 'a1', type: 'organizationPrivate' }); // CORRECT
commentElement.updateVisibility({ annotationId: 'a1', type: 'restricted' });          // CORRECT
commentElement.enablePrivateMode({ type: 'organizationPrivate' });                    // CORRECT
```

---

### 8.2 Moderation & Permissions

**Impact: LOW (Access control and moderation features for comments)**

Based on documentation search, moderation and permissions are primarily handled through:

1. **User Roles via JWT Token**: Assign Editor or Viewer roles per resource
2. **Organization-based Access**: Users can only access documents within their organization by default
3. **Private Comments**: Comments can be marked as private


- https://docs.velt.dev/key-concepts/overview - Access Control section
- https://docs.velt.dev/get-started/quickstart - Authentication section
- https://docs.velt.dev/api-reference/rest-apis/v2/auth - Auth APIs


### Access Control Roles

From https://docs.velt.dev/get-started/quickstart:
> Assign users as **Editor** or **Viewer** per resource (organization, folder, document) via your JWT token permissions or backend access APIs. Editors can write collaboration data (e.g., add/edit comments); Viewers are read-only.

### JWT Token Permissions

Permissions are configured through the JWT token generated by your backend. See the authentication documentation for details on token structure.

### Organization Isolation

By default, users can only access documents within their own organization. Cross-organization access requires explicit configuration.


The following moderation features were searched but not found in the documentation:
- Comment deletion permissions
- Comment editing restrictions
- Moderation queue/approval workflow
- Content filtering
- User blocking/muting
- Comment flagging/reporting

If these features exist, they may be undocumented or handled through the REST API.


For detailed moderation and permissions setup, consult:
- Velt Console access control settings
- https://docs.velt.dev/api-reference/rest-apis/v2/auth - REST API authentication endpoints
- Contact Velt support for enterprise moderation features

---

### 8.3 Prefer Past-Tense Event Aliases commentToolClicked and sidebarButtonClicked in New Code

**Impact: LOW (Write consistent event subscriptions using the canonical past-tense naming convention that aligns with all other Velt events — both old and new names fire simultaneously so migration is non-breaking)**

Velt v5.0.2-beta.2 introduced `commentToolClicked` and `sidebarButtonClicked` as past-tense aliases for the original `commentToolClick` and `sidebarButtonClick` events. Both old and new names fire simultaneously — use the past-tense aliases in all new code to align with the consistent naming convention used across all other Velt events.

**Incorrect (using present-tense event names in new code — still works but not the canonical pattern):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function InteractionListeners() {
  // Present-tense names still fire, but past-tense aliases are the canonical form.
  const toolClickEvent = useCommentEventCallback('commentToolClick');
  const sidebarClickEvent = useCommentEventCallback('sidebarButtonClick');

  useEffect(() => {
    if (toolClickEvent) {
      console.log('Comment tool clicked:', toolClickEvent);
    }
  }, [toolClickEvent]);

  return null;
}
```

**Correct (React — use past-tense aliases):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function CommentToolClickedListener() {
  const toolClickedEvent = useCommentEventCallback('commentToolClicked');
  const sidebarClickedEvent = useCommentEventCallback('sidebarButtonClicked');

  useEffect(() => {
    if (toolClickedEvent) {
      console.log('Comment tool clicked:', toolClickedEvent);
    }
  }, [toolClickedEvent]);

  useEffect(() => {
    if (sidebarClickedEvent) {
      console.log('Sidebar button clicked:', sidebarClickedEvent);
    }
  }, [sidebarClickedEvent]);

  return null;
}
```

**Correct (HTML / Other Frameworks — subscribe via commentElement):**

```typescript
const commentElement = Velt.getCommentElement();

const sub1 = commentElement.on('commentToolClicked').subscribe((event) => {
  console.log('Comment tool clicked:', event);
});

const sub2 = commentElement.on('sidebarButtonClicked').subscribe((event) => {
  console.log('Sidebar button clicked:', event);
});

// Clean up subscriptions when no longer needed
sub1.unsubscribe();
sub2.unsubscribe();
```

---

### 8.4 Register an Anonymous User Data Provider to Resolve Tagged Contact Emails to User IDs

**Impact: LOW (Enables Velt to automatically map email addresses to userIds at comment save time, so anonymous contacts tagged in comments are correctly associated with their accounts)**

When a user tags a contact in a comment who has an email address but no userId, Velt automatically calls the registered anonymous user data provider at comment save time to resolve the email to a userId. Without a provider, the tagged contact cannot be correctly associated with their account.

Register the provider once at initialization using `client.setAnonymousUserDataProvider()` (React) or `Velt.setAnonymousUserDataProvider()` (other frameworks). The equivalent `setDataProviders({ anonymousUser: resolver })` form may be used interchangeably.

**Incorrect (no provider registered — tagged contacts with only an email remain unresolved):**

```jsx
// No anonymous user data provider registered.
// Comments that tag contacts by email will not resolve to a userId at save time.
const { client } = useVeltClient();
useEffect(() => {
  if (!client) return;
  // Missing: client.setAnonymousUserDataProvider(...)
}, [client]);
```

**Correct (React — register via setAnonymousUserDataProvider):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function AnonymousUserProviderSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    client.setAnonymousUserDataProvider({
      resolveUserIdsByEmail: async (request) => {
        // request: { organizationId: string; emails: string[]; documentId?: string; folderId?: string; }
        const map = {};
        for (const email of request.emails) {
          map[email] = await lookupUserId(email); // your internal lookup
        }
        // Return shape: ResolverResponse<Record<string, string>> (email → userId)
        return { statusCode: 200, success: true, data: map };
      },
    });
  }, [client]);

  return null;
}
```

**Correct (React — equivalent form using setDataProviders):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function AnonymousUserProviderSetup() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;

    client.setDataProviders({
      anonymousUser: {
        resolveUserIdsByEmail: async (request) => {
          const map = {};
          for (const email of request.emails) {
            map[email] = await lookupUserId(email);
          }
          return { statusCode: 200, success: true, data: map };
        },
      },
    });
  }, [client]);

  return null;
}
```

**Correct (HTML / Other Frameworks):**

```typescript
Velt.setAnonymousUserDataProvider({
  resolveUserIdsByEmail: async (request) => {
    const map = {};
    for (const email of request.emails) {
      map[email] = await lookupUserId(email);
    }
    return { statusCode: 200, success: true, data: map };
  },
});

// Equivalent alternative
Velt.setDataProviders({
  anonymousUser: {
    resolveUserIdsByEmail: async (request) => { /* ... */ },
  },
});
```

**Type Definitions:**

```typescript
interface AnonymousUserDataProvider {
  resolveUserIdsByEmail: (
    request: ResolveUserIdsByEmailRequest
  ) => Promise<ResolverResponse<Record<string, string>>>;
  config?: AnonymousUserDataProviderConfig;
}

interface ResolveUserIdsByEmailRequest {
  organizationId: string;
  emails: string[];
  documentId?: string;
  folderId?: string;
}

interface AnonymousUserDataProviderConfig {
  resolveTimeout?: number;
  getRetryConfig?: RetryConfig;
}

interface RetryConfig {
  retryCount: number;
  retryDelay: number;
}

interface ResolverResponse<T> {
  statusCode: number;
  success: boolean;
  data: T;
}
```

---

### 8.5 Show a Visibility Banner in the Comment Composer for Multi-Level Visibility Selection

**Impact: LOW (Let users choose from four visibility levels before submitting a comment, and react to that choice via the visibilityOptionClicked event)**

Enable `visibilityOptions` to render a persistent visibility banner below the comment composer that lets users choose from four visibility levels — `public`, `organizationPrivate`, `restrictedSelf`, and `restrictedSelectedPeople` — before submitting. The feature is off by default; without enabling it, users have no in-UI way to set visibility at comment-creation time.

> **Breaking Change (v5.0.2-beta.4):** `visibilityOptionDropdown` prop has been renamed to `visibilityOptions` / `visibility-options`. The API methods `enableVisibilityOptionDropdown()` / `disableVisibilityOptionDropdown()` have been renamed to `enableVisibilityOptions()` / `disableVisibilityOptions()`. The `VisibilityOptionClickedEvent.visibility` type has widened from `'public' | 'private'` to `CommentVisibilityOptionType` (`'personal' | 'selected-people' | 'org-users' | 'public'`). Replace all `'private'` comparisons with `'personal'`.

> **Breaking Change (v5.0.2-beta.5):** `CommentVisibilityOptionType` values have been renamed to align with the new `CommentVisibilityOption` enum. Replace `'personal'` → `'restrictedSelf'`, `'selected-people'` → `'restrictedSelectedPeople'`, `'org-users'` → `'organizationPrivate'`. The `'public'` value is unchanged.

**Incorrect (no visibility choice for users — visibility banner is hidden by default):**

```jsx
// visibilityOptions defaults to false — the banner is not rendered.
// Users cannot choose visibility from the composer.
<VeltComments />
```

**Correct (React — enable via prop):**

```jsx
import { VeltComments } from '@veltdev/react';

function App() {
  return (
    // Renders the four-option visibility banner below the comment composer.
    <VeltComments visibilityOptions={true} />
  );
}
```

**Correct (React — enable/disable programmatically):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { useEffect } from 'react';

function VisibilityOptionsController() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Show the visibility banner in the composer.
    commentElement.enableVisibilityOptions();

    return () => {
      // Hide the banner on unmount.
      commentElement.disableVisibilityOptions();
    };
  }, [client]);

  return null;
}
```

**Correct (React — subscribe to the visibilityOptionClicked event):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function VisibilityOptionListener() {
  const visibilityEvent = useCommentEventCallback('visibilityOptionClicked');

  useEffect(() => {
    if (!visibilityEvent) return;

    // One of: 'public' | 'organizationPrivate' | 'restrictedSelf' | 'restrictedSelectedPeople'
    console.log('Visibility selected:', visibilityEvent.visibility);
    console.log('Annotation ID:', visibilityEvent.annotationId);
    console.log('Full annotation:', visibilityEvent.commentAnnotation);

    // users is populated when visibility === 'restrictedSelectedPeople'
    if (visibilityEvent.visibility === 'restrictedSelectedPeople') {
      console.log('Selected users:', visibilityEvent.users);
    }
  }, [visibilityEvent]);

  return null;
}
```

**Correct (HTML / Other Frameworks — enable/disable programmatically):**

```typescript
const commentElement = Velt.getCommentElement();

// Show the visibility banner in the composer.
commentElement.enableVisibilityOptions();

// Hide the banner when no longer needed.
commentElement.disableVisibilityOptions();
```

**Correct (HTML / Other Frameworks — subscribe to the visibilityOptionClicked event):**

```typescript
const commentElement = Velt.getCommentElement();

const subscription = commentElement.on('visibilityOptionClicked').subscribe((event) => {
  // One of: 'public' | 'organizationPrivate' | 'restrictedSelf' | 'restrictedSelectedPeople'
  console.log('Visibility selected:', event.visibility);
  console.log('Annotation ID:', event.annotationId);
  // event.users is populated when event.visibility === 'restrictedSelectedPeople'
});

// Clean up subscription when no longer needed.
subscription.unsubscribe();
```

**`CommentVisibilityOptionType` and `VisibilityOptionClickedEvent` Interfaces:**

```typescript
// Added in v5.0.2-beta.5 — enum backing the type union
export declare enum CommentVisibilityOption {
  RESTRICTED_SELF = "restrictedSelf",
  RESTRICTED_SELECTED_PEOPLE = "restrictedSelectedPeople",
  ORGANIZATION_PRIVATE = "organizationPrivate",
  PUBLIC = "public"
}

// Template-literal type derived from the enum
export type CommentVisibilityOptionType = `${CommentVisibilityOption}`;
// = 'restrictedSelf' | 'restrictedSelectedPeople' | 'organizationPrivate' | 'public'

interface VisibilityOptionClickedEvent {
  annotationId: string;                    // ID of the comment annotation
  commentAnnotation: CommentAnnotation;    // Full annotation object
  visibility: CommentVisibilityOptionType; // The visibility option the user selected
  users?: User[];                          // Populated when visibility === 'restrictedSelectedPeople'
  metadata?: VeltEventMetadata;            // Optional event metadata (timestamp, source, etc.)
}
```

---

### 8.6 Use CommentDialogActionService.isSubmitInFlight() to Guard Against Duplicate Submits

**Impact: LOW-MEDIUM (Without in-flight tracking, custom submit actions in sidebar custom-actions hosts can trigger duplicate comment saves or spurious draft events)**

When building custom-actions sidebar hosts that intercept the comment submit flow, `CommentDialogActionService.isSubmitInFlight()` prevents duplicate submits and spurious auto-draft saves that fire before the composer reset signal propagates.

**API:**

```jsx
import { CommentDialogActionService } from '@veltdev/react';

// Check if a submit is currently in flight for a specific dialog instance
const inFlight = CommentDialogActionService.isSubmitInFlight(dialogInstanceId);

// If omitted, returns false — the in-flight flag is only tracked per dialogInstanceId
const inFlightAny = CommentDialogActionService.isSubmitInFlight();
```

**Correct (guard custom submit handler):**

```jsx
function handleCustomSubmit(dialogInstanceId) {
  if (CommentDialogActionService.isSubmitInFlight(dialogInstanceId)) {
    return; // already submitting — skip
  }
  // proceed with submit
  commentElement.submitComment({ targetComposerElementId: dialogInstanceId });
}
```

**Correct (skip auto-draft-save during active submit):**

```jsx
function handleAutoSave(dialogInstanceId) {
  if (CommentDialogActionService.isSubmitInFlight(dialogInstanceId)) {
    return; // suppress draft save during submit
  }
  // save draft
}
```

---

### 8.7 Use commentSaveTriggered for Immediate UI Feedback Before Async Save Completes

**Impact: LOW (Show spinners or disable UI the moment the user clicks save — before the database write — without reacting too late with the post-persist commentSaved event)**

The `commentSaveTriggered` event fires the instant the save button is clicked, before the async database write begins. Use it for immediate UI feedback (spinners, disabled states) and use `commentSaved` — which fires only after the write confirms — for reliable post-persist side-effects such as webhooks or analytics.

**Incorrect (using commentSaved for immediate UI feedback — fires too late):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function SaveFeedback() {
  const savedEvent = useCommentEventCallback('commentSaved');

  useEffect(() => {
    if (!savedEvent) return;
    // commentSaved fires AFTER the database write completes.
    // The UI will feel sluggish — the spinner appears only after the round-trip.
    showSpinner();
  }, [savedEvent]);

  return null;
}
```

**Correct (React — use commentSaveTriggered for immediate feedback):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function CommentSaveTriggeredListener() {
  const triggeredEvent = useCommentEventCallback('commentSaveTriggered');

  useEffect(() => {
    if (!triggeredEvent) return;
    // Fires immediately on button click, before the database write starts.
    console.log('Save triggered, annotationId:', triggeredEvent.annotationId);
    // Use for immediate UI feedback only — not for post-persist side-effects.
    showSpinner();
    disableUI();
  }, [triggeredEvent]);

  return null;
}
```

**Correct (HTML / Other Frameworks — subscribe via commentElement):**

```typescript
const commentElement = Velt.getCommentElement();

const subscription = commentElement.on('commentSaveTriggered').subscribe((event) => {
  // Fires immediately on button click, before the database write starts.
  console.log('Save triggered, annotationId:', event.annotationId);
  showSpinner();
  disableUI();
});

// Clean up subscription when no longer needed
subscription.unsubscribe();
```

**`CommentSaveTriggeredEvent` Interface:**

```typescript
interface CommentSaveTriggeredEvent {
  annotationId: string;                 // ID of the comment annotation being saved
  commentAnnotation: CommentAnnotation; // Full annotation object at save time (v5.0.2-beta.4+)
  metadata: VeltEventMetadata;          // Event metadata (timestamp, source, etc.)
}
```

---

### 8.8 Use isAnnotationPrivate() for Unified Visibility Routing

**Impact: MEDIUM (Without the shared isAnnotationPrivate() utility, privacy checks miss annotations using the new visibilityConfig field and only detect legacy iam.accessMode)**

Velt has two mechanisms for marking comments as private: the legacy `iam.accessMode === 'private'` field and the newer `visibilityConfig.type` field (which can be `'restricted'` or `'organizationPrivate'`). The SDK's shared `isAnnotationPrivate()` utility checks both, so you should always route through it rather than checking a single field.

**Incorrect (only checking legacy field):**

```jsx
// Wrong: misses annotations set via updateVisibility({ type: 'restricted' })
const isPrivate = annotation.iam?.accessMode === 'private';
```

**How to set visibility:**

```jsx
const commentElement = client.getCommentElement();

// Per-annotation: make restricted to specific users
commentElement.updateVisibility({
  annotationId: 'ann-123',
  type: 'restricted',
  userIds: ['user-1', 'user-2']
});

// Per-annotation: organization-private
commentElement.updateVisibility({
  annotationId: 'ann-123',
  type: 'organizationPrivate',
  organizationId: 'org-123'
});

// Per-annotation: public
commentElement.updateVisibility({
  annotationId: 'ann-123',
  type: 'public'
});

// Global default for all new comments in session
commentElement.enablePrivateMode({ type: 'restricted', userIds: ['user-1'] });

// Revert to public default
commentElement.disablePrivateMode();
```

**Visibility options UI (let users choose before submitting):**

```jsx
<VeltComments visibilityOptions={true} />
```

This shows a visibility banner on the composer letting users pick `public`, `organization-private`, `restricted-self`, or `restricted` before submitting.

**Listen for visibility selection:**

```jsx
const event = useCommentEventCallback('visibilityOptionClicked');
useEffect(() => {
  if (event) {
    console.log('User selected visibility:', event);
  }
}, [event]);
```

**Set visibility at comment creation time (programmatic):**

```jsx
const { addComment } = useAddComment();
await addComment({
  annotationId: 'ANNOTATION_ID',
  comment: { commentText: 'Private note', commentHtml: '<p>Private note</p>' },
  visibility: { type: 'restricted', userIds: ['user-1'] }
});
```

**Two enum systems:** The API methods use `CommentVisibilityConfig` with 3 values (`'public'`, `'organizationPrivate'`, `'restricted'`). The UI wireframes use `CommentVisibilityOption` with 4 values (`'restrictedSelf'`, `'restrictedSelectedPeople'`, `'organizationPrivate'`, `'public'`). The API's single `'restricted'` value covers both "self-only" and "selected people" — distinguished by whether `userIds` is provided.

---

### 8.9 Use the commentSaved Event for Reliable Post-Persist Side-Effects

**Impact: LOW (Trigger webhooks, analytics, or external sync only after database write confirmation — not prematurely on optimistic UI updates)**

The `commentSaved` event fires after a comment annotation is successfully written to the database. Use this event — not optimistic UI callbacks — as the trigger for side-effects such as webhooks, audit logging, or syncing external systems.

**Incorrect (triggering side-effects on optimistic callbacks — may fire before persistence):**

```jsx
// onCommentAdd fires optimistically before the comment is persisted.
// Side-effects triggered here can reference data that has not yet been saved.
<VeltComments
  onCommentAdd={(event) => {
    triggerWebhook(event); // Unreliable — may fire before database write
  }}
/>
```

**Correct (React — subscribe via useCommentEventCallback):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function CommentSaveListener() {
  const savedEvent = useCommentEventCallback('commentSaved');

  useEffect(() => {
    if (!savedEvent) return;

    // Fires only after the annotation is confirmed in the database.
    console.log('Comment persisted, annotationId:', savedEvent.annotationId);
    console.log('Full annotation:', savedEvent.commentAnnotation);

    // Safe to trigger webhooks, log analytics, or sync external systems here.
    triggerWebhook(savedEvent);
    logAnalyticsEvent('comment_saved', { annotationId: savedEvent.annotationId });
  }, [savedEvent]);

  return null;
}
```

**Correct (HTML / Other Frameworks — subscribe via commentElement):**

```typescript
const commentElement = Velt.getCommentElement();

const subscription = commentElement.on('commentSaved').subscribe((event) => {
  // Fires only after database write confirmation.
  console.log('Comment persisted, annotationId:', event.annotationId);
  console.log('Full annotation:', event.commentAnnotation);

  // Trigger webhook, log analytics, or sync external systems.
  triggerWebhook(event);
});

// Clean up subscription when no longer needed
subscription.unsubscribe();
```

**`CommentSavedEvent` Interface:**

```typescript
interface CommentSavedEvent {
  annotationId: string;                  // ID of the persisted comment annotation
  commentAnnotation: CommentAnnotation;  // Full annotation object as stored in the database
  metadata: VeltEventMetadata;           // Event metadata (timestamp, source, etc.)
}
```

---

## 9. Attachments & Reactions

**Impact: MEDIUM**

File attachment control and emoji reaction features. Includes attachment download behavior, click interception events, and CSS state classes for attachment loading and edit-mode states.

### 9.1 Attachments & Reactions

**Impact: MEDIUM (File attachment control and emoji reaction features)**

### Reactions (VeltReactionTool)

Found in video player documentation at https://docs.velt.dev/async-collaboration/comments/setup/video-player-setup/custom-video-player-setup:

**For HTML:**

```html
<velt-reaction-tool video-player-id="videoPlayerId"></velt-reaction-tool>
```

- https://docs.velt.dev/async-collaboration/comments/setup/video-player-setup/custom-video-player-setup - VeltReactionTool
- https://docs.velt.dev/async-collaboration/comments - General comments features
The following features were searched but not documented:
- Attaching files to comments
- Supported file types
- File size limits
- File storage configuration
- Emoji reactions on comments (non-video)
- Reaction customization
- Reaction counts
For attachments and reactions features:
- Check if your Velt plan includes these features
- Consult Velt support for availability
- Review the latest SDK release notes
If you need reaction functionality outside of video players, or file attachments, these may require:
- Custom implementation using comment context/metadata
- Third-party file upload integration
- Contact with Velt for feature availability

---

### 9.2 Control Attachment Download Behavior and Intercept Clicks

**Impact: MEDIUM (Prevent automatic downloads and intercept attachment clicks for custom viewers, analytics, or access control)**

By default, clicking an attachment in a comment triggers a file download. Use `attachmentDownload` / `enableAttachmentDownload()` / `disableAttachmentDownload()` to suppress that behavior, and subscribe to the `attachmentDownloadClicked` event to handle every attachment click regardless of the download setting.

**Incorrect (no click interception, download cannot be suppressed):**

```jsx
// No control over attachment download — browser always triggers a download on click.
// Cannot open files in a custom viewer or log analytics.
<VeltComments />
```

**Correct (disable download, intercept clicks in React):**

```jsx
import { VeltComments, useVeltClient, useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

// Option A: Declarative prop — disable download via prop on <VeltComments>
<VeltComments attachmentDownload={false} />

// Option B: Imperative API — toggle download via commentElement methods
function AttachmentDownloadController() {
  const { client } = useVeltClient();

  useEffect(() => {
    if (!client) return;
    const commentElement = client.getCommentElement();

    // Disable automatic download on attachment click
    commentElement.disableAttachmentDownload();

    return () => {
      // Re-enable when component unmounts if needed
      commentElement.enableAttachmentDownload();
    };
  }, [client]);

  return null;
}

// Listening to the attachmentDownloadClicked event (fires on every click)
function AttachmentClickListener() {
  const attachmentClickedEvent = useCommentEventCallback('attachmentDownloadClicked');

  useEffect(() => {
    if (attachmentClickedEvent) {
      const { annotationId, attachment } = attachmentClickedEvent;
      console.log('Attachment clicked on annotation:', annotationId);
      console.log('Attachment ID:', attachment.attachmentId);
      // Open in custom viewer, log analytics, or enforce access control here
    }
  }, [attachmentClickedEvent]);

  return null;
}
```

**Correct (disable download in HTML / Other Frameworks):**

```typescript
<!-- Declarative attribute -->
<velt-comments attachment-download="false"></velt-comments>
// Imperative API methods (non-React)
const commentElement = Velt.getCommentElement();
commentElement.disableAttachmentDownload();
commentElement.enableAttachmentDownload();

// Event subscription
commentElement.on('attachmentDownloadClicked').subscribe((event) => {
  console.log('Attachment clicked on annotation:', event.annotationId);
  console.log('Attachment ID:', event.attachment.attachmentId);
});
```

**`AttachmentDownloadClickedEvent` Interface:**

```typescript
interface AttachmentDownloadClickedEvent {
  annotationId: string;               // ID of the comment annotation containing the attachment
  commentAnnotation: CommentAnnotation; // Full comment annotation object
  attachment: Attachment;             // Attachment object that was clicked
  metadata?: VeltEventMetadata;       // Optional event metadata
}
```

**CSS State Classes:**

```css
/* Base container class applied to every composer attachment wrapper */
.velt-composer-attachment-container {
  display: flex;
  gap: 8px;
}

/* Applied while the attachment is uploading or in a loading state */
.velt-composer-attachment--loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Applied when the comment composer is in edit mode */
.velt-composer-attachment--edit-mode {
  border: 1px solid var(--velt-edit-color);
}
```

<!-- TODO (v5.0.1-beta.2): Verify exact DOM element hierarchy for .velt-composer-attachment-container and whether shadowDom must be disabled to target these classes, or whether CSS custom properties suffice. Release note confirms classes exist and their semantic meaning but does not specify DOM depth or shadow DOM requirements. -->

---

## 10. Configuration

**Impact: MEDIUM**

Advanced configuration methods for comment features — mentions/contacts, status/priority, reactions, attachments, text formatting, navigation/deep linking, DOM controls, sidebar management, UI behavior toggles, and moderation.

### 10.1 Comment Moderation — Approve, Accept, Reject Workflows

**Impact: LOW (Moderation workflows for comment review and approval)**

Enable moderation workflows for comment review, approval, and rejection.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Enable moderator mode (moderator can approve/reject all comments)
commentElement.enableModeratorMode();

// Restrict resolve/status changes to admin users only
commentElement.enableResolveStatusAccessAdminOnly();

// Approval workflow
commentElement.approveCommentAnnotation({ annotationId: 'ann-123' });
commentElement.acceptCommentAnnotation({ annotationId: 'ann-123' });
commentElement.rejectCommentAnnotation({ annotationId: 'ann-123' });

// Suggestion mode (comments are suggestions that can be accepted/rejected)
commentElement.enableSuggestionMode();

// Read-only mode (view comments but cannot add/edit)
commentElement.enableReadOnly();

// "Seen by" indicator (shows who has viewed the comment)
commentElement.enableSeenByUsers();
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - Moderation

---

### 10.2 Comment Navigation and Deep Linking

**Impact: MEDIUM (Navigate to comments programmatically and generate shareable links)**

Navigate to specific comments, track selection changes, and generate shareable deep links.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Scroll to a comment pin on the page
commentElement.scrollToCommentByAnnotationId('ann-123');

// Select a comment bubble programmatically (e.g. from a deep link or notification)
commentElement.selectCommentByAnnotationId('ann-123');

// Clear the current comment selection (omit the argument or pass an unknown ID)
commentElement.selectCommentByAnnotationId();

// Listen to comment selection changes
commentElement.onCommentSelectionChange().subscribe((event) => {
  console.log('Selected annotation:', event?.annotationId);
});

// Enable auto-scroll to comment on page load (from URL hash)
commentElement.enableScrollToComment();

// Generate a shareable link to a comment
const link = await commentElement.getLink({ annotationId: 'ann-123' });
console.log('Link:', link); // https://yourapp.com/page?commentId=ann-123

// Copy comment link to clipboard
commentElement.copyLink({ annotationId: 'ann-123' });
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - Navigation, Deep Linking

---

### 10.3 Component Props API — VeltComments, VeltCommentDialog, VeltCommentsSidebar, VeltInlineCommentsSection

**Impact: MEDIUM (Enables typed prop-level customization (placeholder overrides, assignment mode, focus behavior) without imperative API calls)**

Four Velt comment components accept typed props interfaces that cover placeholder text overrides (including edit-mode variants), assignment UI configuration, and sidebar focus behavior. Props set on the root `VeltComments` container propagate to all child dialogs automatically — set them once at the root rather than on every dialog.

Do not rely on imperative `commentElement.*` methods for features covered by these typed props — the prop interface is the canonical way to configure placeholder text and assignment mode.

**Correct (typed props on each component):**

```jsx
import {
  VeltComments,
  VeltCommentDialog,
  VeltCommentsSidebar,
  VeltInlineCommentsSection,
} from '@veltdev/react';

// Root container — props propagate to all dialogs automatically.
// editCommentPlaceholder / editReplyPlaceholder take precedence over editPlaceholder.
// Priority: editCommentPlaceholder | editReplyPlaceholder → editPlaceholder → placeholder → SDK defaults.
<VeltComments
  assignToType="dropdown"          // 'dropdown' (default) | 'checkbox'
  editPlaceholder="Edit your comment…"
  editCommentPlaceholder="Edit your first comment…"
  editReplyPlaceholder="Edit your reply…"
/>

// Individual dialog — same edit-placeholder props, no assignToType
<VeltCommentDialog
  editPlaceholder="Edit your comment…"
  editCommentPlaceholder="Edit your first comment…"
  editReplyPlaceholder="Edit your reply…"
/>

// Sidebar — adds add/reply/page-mode placeholders and focus behavior
<VeltCommentsSidebar
  commentPlaceholder="Add a comment…"
  replyPlaceholder="Add a reply…"
  pageModePlaceholder="Add a page comment…"
  editPlaceholder="Edit your comment…"
  editCommentPlaceholder="Edit your first comment…"
  editReplyPlaceholder="Edit your reply…"
  openAnnotationInFocusMode={true}  // requires focusedThreadMode to be enabled
/>

// Inline Comments Section — adds composerPlaceholder and readOnly
<VeltInlineCommentsSection
  commentPlaceholder="Add a comment…"
  replyPlaceholder="Add a reply…"
  composerPlaceholder="Start a conversation…"
  editPlaceholder="Edit your comment…"
  editCommentPlaceholder="Edit your first comment…"
  editReplyPlaceholder="Edit your reply…"
  readOnly={false}
/>
```

---

### 10.4 Configure @Mentions, Contacts, and User Assignment

**Impact: MEDIUM (Control @mention behavior, contact lists, and comment assignment)**

Configure how @mentions, contact lists, and user assignment work in comments.

**API Methods (via getCommentElement()):**

```tsx
const commentElement = client.getCommentElement();

// Assign user to annotation
commentElement.assignUser({ annotationId: 'ann-123', userId: 'user-2' });

// Configure assignee list scope
commentElement.setAssignToType('dropdown'); // or 'checkbox'

// Enable/disable @mentions
commentElement.enableUserMentions();
commentElement.disableUserMentions();

// Enable @here (notify all users on document)
commentElement.enableAtHere();
commentElement.disableAtHere();
commentElement.setAtHereLabel('Notify All');
commentElement.setAtHereDescription('Send to everyone on this document');

// Contact list management
commentElement.enablePaginatedContactList();
commentElement.disablePaginatedContactList();

const contacts = await commentElement.getContactList();
commentElement.updateContactList(updatedContacts);
commentElement.updateContactListScopeForOrganizationUsers();

// Listen to contact selection
commentElement.onContactSelected().subscribe((contact) => {
  console.log('Selected:', contact);
});

// Mention group options
commentElement.showMentionGroupsFirst();
commentElement.showMentionGroupsOnly();
commentElement.expandMentionGroups();

// Custom autocomplete search
commentElement.customAutocompleteSearch(async (query) => {
  const results = await myBackend.searchUsers(query);
  return results;
});

// Thread subscriptions
commentElement.subscribeCommentAnnotation({ annotationId: 'ann-123' });
commentElement.unsubscribeCommentAnnotation({ annotationId: 'ann-123' });

// Autocomplete scroll behavior
<VeltComments autoCompleteScrollConfig={{ itemSize: 28 }} />
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - @Mentions & Contacts

---

### 10.5 Configure Comment Attachments and File Uploads

**Impact: MEDIUM (Enable file attachments, screenshots, and manage uploaded files)**

Enable file uploads in comments and control attachment behavior.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Enable/disable attachments feature
commentElement.enableAttachments();
commentElement.disableAttachments();

// Enable/disable screenshot capture
commentElement.enableScreenshot();
commentElement.disableScreenshot();

// Restrict allowed file types
commentElement.allowedFileTypes(['image/png', 'image/jpeg', 'application/pdf']);

// Add attachment programmatically
commentElement.addAttachment({
  annotationId: 'ann-123',
  commentId: 1,
  attachment: {
    name: 'design.png',
    url: 'https://example.com/design.png',
    mimeType: 'image/png',
    size: 204800,
  },
});

// Delete attachment
commentElement.deleteAttachment({
  annotationId: 'ann-123',
  commentId: 1,
  attachmentId: 'att-1',
});

// Get attachment data
const attachment = commentElement.getAttachment({
  annotationId: 'ann-123',
  commentId: 1,
  attachmentId: 'att-1',
});

// Pre-populate composer with attachments
commentElement.setComposerFileAttachments([file1, file2]);

// Show attachment filename in comment message
<VeltComments attachmentNameInMessage={true} />
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - Attachments

---

### 10.6 Configure Comment Status and Priority Levels

**Impact: MEDIUM (Enable and customize comment status tracking and priority levels)**

Enable status tracking (open, in progress, resolved) and priority levels (P0-P3) on comment annotations.

**Status Configuration:**

```tsx
const commentElement = client.getCommentElement();

// Enable/disable status feature
commentElement.enableStatus();
commentElement.disableStatus();

// Enable quick resolve button on comment dialog
commentElement.enableResolveButton();

// Define custom status values
commentElement.setCustomStatus([
  { id: 'open', name: 'Open', type: 'default', color: '#3b82f6' },
  { id: 'in_progress', name: 'In Progress', type: 'ongoing', color: '#f59e0b' },
  { id: 'needs_attention', name: 'Needs Attention', type: 'ongoing', color: '#ef4444' },
  { id: 'resolved', name: 'Resolved', type: 'terminal', color: '#22c55e' },
  { id: 'approved', name: 'Approved', type: 'terminal', color: '#10b981' },
  { id: 'rejected', name: 'Rejected', type: 'terminal', color: '#dc2626' },
]);

// Update annotation status programmatically
commentElement.updateStatus({
  annotationId: 'ann-123',
  status: { id: 'resolved', name: 'Resolved', type: 'terminal' },
});

// Mark as resolved (shortcut)
commentElement.resolveCommentAnnotation({ annotationId: 'ann-123' });
```

**Priority Configuration:**

```tsx
// Enable/disable priority feature
commentElement.enablePriority();
commentElement.disablePriority();

// Define custom priority levels
commentElement.setCustomPriority([
  { id: 'critical', name: 'Critical', color: '#dc2626', lightColor: '#fef2f2' },
  { id: 'high', name: 'High', color: '#f59e0b', lightColor: '#fffbeb' },
  { id: 'medium', name: 'Medium', color: '#3b82f6', lightColor: '#eff6ff' },
  { id: 'low', name: 'Low', color: '#6b7280', lightColor: '#f9fafb' },
]);

// Update annotation priority programmatically
commentElement.updatePriority({
  annotationId: 'ann-123',
  priority: { id: 'high', name: 'High' },
});
```

**Or via component props:**

```tsx
// Enable priority on VeltComments
<VeltComments priority={true} />
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - Status, Priority

---

### 10.7 Configure Emoji Reactions on Comments

**Impact: MEDIUM (Enable and customize emoji reactions for comment feedback)**

Enable emoji reactions on comments for quick feedback without full replies.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Enable/disable reactions
commentElement.enableReactions();
commentElement.disableReactions();

// Define custom emoji list (replaces defaults)
commentElement.setCustomReactions([
  { id: 'thumbsup', emoji: '👍', label: 'Like' },
  { id: 'heart', emoji: '❤️', label: 'Love' },
  { id: 'check', emoji: '✅', label: 'Done' },
  { id: 'eyes', emoji: '👀', label: 'Looking' },
  { id: 'rocket', emoji: '🚀', label: 'Ship it' },
]);

// Add reaction programmatically
commentElement.addReaction({
  annotationId: 'ann-123',
  commentId: 1,
  reactionId: 'thumbsup',
});

// Remove reaction
commentElement.deleteReaction({
  annotationId: 'ann-123',
  commentId: 1,
  reactionId: 'thumbsup',
});

// Toggle reaction (add if missing, remove if exists)
commentElement.toggleReaction({
  annotationId: 'ann-123',
  commentId: 1,
  reactionId: 'thumbsup',
});
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - Reactions

---

### 10.8 Configure Rich Text Formatting in Comment Composer

**Impact: LOW (Control which text formatting options are available in the comment composer)**

Control which rich text formatting options appear in the comment composer toolbar.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Enable rich text toolbar
commentElement.enableFormatOptions();

// Configure which formats are available
commentElement.setFormatConfig({
  bold: true,
  italic: true,
  link: true,
  blockquote: true,
  strikethrough: true,
  codeBlock: true,
  heading: false,       // Disable headings
  list: true,           // Bullet list
  orderedList: true,    // Numbered list
});
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - Text Formatting

---

### 10.9 Programmatic Sidebar Data, Filtering, and Configuration

**Impact: MEDIUM (Control sidebar content, filters, and behavior programmatically)**

Control the comments sidebar programmatically — set custom data, manage filters, configure sorting and grouping.

**Sidebar Data Management:**

```tsx
const commentElement = client.getCommentElement();

// Set sidebar data programmatically (for custom grouping/filtering)
commentElement.setCommentSidebarData(sidebarData, options);

// Enable/disable custom action buttons in sidebar
commentElement.enableSidebarCustomActions();
commentElement.disableSidebarCustomActions();

// Enable/disable URL-based navigation on comment click
commentElement.enableSidebarUrlNavigation();
commentElement.disableSidebarUrlNavigation();

// Set filters programmatically
commentElement.setCommentSidebarFilters({
  statusIds: ['open'],
  priority: ['high'],
});
```

**Sidebar Events:**

```tsx
// Listen to sidebar data initialization
commentElement.on('commentSidebarDataInit').subscribe((event) => {
  console.log('Sidebar data loaded:', event);
});

// Listen to sidebar data updates
commentElement.on('commentSidebarDataUpdate').subscribe((event) => {
  console.log('Sidebar data updated:', event);
});

// Navigation button click
<VeltCommentsSidebar onCommentNavigationButtonClick={(event) => {
  router.push(`/page/${event.documentId}#${event.annotationId}`);
}} />
```

**Edit Composer Placeholders:**

```html
// React — set on root VeltComments; propagates to all dialogs automatically
<VeltComments
  editPlaceholder="Edit your message…"
  editCommentPlaceholder="Edit the original comment…"
  editReplyPlaceholder="Edit your reply…"
/>
<!-- HTML -->
<velt-comments
  edit-placeholder="Edit your message…"
  edit-comment-placeholder="Edit the original comment…"
  edit-reply-placeholder="Edit your reply…"
></velt-comments>
```

Reference: https://docs.velt.dev/async-collaboration/comments-sidebar/customize-behavior

---

### 10.10 Restrict Comment Placement to Specific DOM Elements

**Impact: LOW (Control where users can place comments on the page)**

Control which elements on the page can receive comment pins.

**API Methods:**

```tsx
const commentElement = client.getCommentElement();

// Restrict by element IDs
commentElement.allowedElementIds(['editor-area', 'design-canvas', 'content-panel']);

// Restrict by CSS class names
commentElement.allowedElementClassNames(['commentable', 'reviewable']);

// Restrict by CSS selectors
commentElement.allowedElementQuerySelectors(['[data-commentable]', '.content-area > div']);

// Auto-snap pin to nearest allowed element
commentElement.commentToNearestAllowedElement(true);

// Custom cursor icon when in comment mode
commentElement.setPinCursorImage('https://example.com/custom-cursor.svg');
```

**HTML attribute to disable comments on specific elements:**

```html
<!-- This element cannot receive comments -->
<div data-velt-comment-disabled="true">
  Protected content
</div>
```

**Source ID for tracking:**

```tsx
// Identify which source element generated a comment
<VeltCommentTool sourceId="toolbar-button" />
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - DOM Controls

---

### 10.11 UI/UX Toggle Methods — Comment Display, Interaction, and Behavior

**Impact: LOW (Fine-tune comment UI appearance and interaction behavior)**

Fine-tune comment UI appearance and user interaction patterns. All methods are on `getCommentElement()`.

**Display & Layout:**

```tsx
const commentElement = client.getCommentElement();

// Collapsed/expanded view
commentElement.enableCollapsedComments();     // Collapse all threads
commentElement.enableFullExpanded();          // Always show expanded

// Floating dialog positioning
commentElement.enableFloatingCommentDialog(); // Dialog floats near pin

// Dialog behavior
commentElement.enableDialogOnHover();         // Open dialog on hover (not click)
commentElement.enableCommentPinHighlighter(); // Highlight pin on hover

// Show/hide comments on page
commentElement.showCommentsOnDom(true);       // Show all comment pins
commentElement.showResolvedCommentsOnDom(true); // Include resolved
commentElement.filterCommentsOnDom(filterFn); // Custom filter function
commentElement.excludeLocationIds([1, 2]);    // Hide specific locations

// Custom dialog position
commentElement.updateCommentDialogPosition({ x: 100, y: 200 });
```

**Comment Numbering & Info:**

```tsx
commentElement.enableCommentIndex();          // Show comment numbers (#1, #2, ...)
commentElement.enableDeviceInfo();            // Show device used for comment
commentElement.enableDeviceIndicatorOnCommentPins(); // Device icon on pins
commentElement.enableShortUserName();         // Shorten display names
commentElement.enableReplyAvatars();          // Show avatars on replies
commentElement.enableSeenByUsers();           // "Seen by" indicator
```

**Ghost Comments (orphaned comments):**

```tsx
commentElement.enableGhostComments();         // Show ghost comments
commentElement.enableGhostCommentsIndicator(); // Visual indicator for ghosts
```

**Draft Mode:**

```tsx
commentElement.enableDraftMode();             // Save drafts before submit
```

**Keyboard & Input:**

```tsx
commentElement.enableHotkey();                // Enable keyboard shortcuts
commentElement.enableEnterKeyToSubmit();      // Enter to submit (Shift+Enter for newline)
commentElement.enableDeleteOnBackspace();     // Backspace to delete
commentElement.enablePersistentCommentMode(); // Keep comment mode active after placing
commentElement.forceCloseAllOnEsc();          // ESC closes all dialogs
```

**Mobile & Auth:**

```tsx
commentElement.enableMobileMode();            // Mobile-optimized UI
commentElement.enableSignInButton();          // Show sign-in button for unauthenticated
commentElement.onSignIn((event) => {          // Auth callback
  router.push('/login');
});
```

**Minimap:**

```tsx
commentElement.enableMinimap();               // Overview minimap of all comments
```

**Sidebar Button on Dialog:**

```tsx
commentElement.enableSidebarButtonOnCommentDialog(); // Add sidebar button to dialog header
commentElement.onSidebarButtonOnCommentDialogClick((event) => {
  // Open sidebar when button clicked
});
```

**Composer Mode:**

```tsx
// Control how the composer appears
// 'inline' — composer inline in thread
// 'popup' — composer in popup
// 'dialog' — composer in dialog
commentElement.composerMode('inline');
```

**Delete Behavior:**

```tsx
// Delete entire thread when first comment is deleted
commentElement.deleteThreadWithFirstComment(true);

// Show confirmation before deleting replies
commentElement.enableDeleteReplyConfirmation();
```

**Confirm Dialog Variant CSS Classes:**

```css
/* Base class — always present */
.velt-confirm-dialog { }

/* Automatically added when deleting a top-level comment */
.velt-confirm-dialog--comment { border-left: 4px solid red; }

/* Automatically added when deleting a reply */
.velt-confirm-dialog--reply { border-left: 4px solid orange; }

/* For a custom type string supplied via ConfirmDialogComponentConfig.type */
.velt-confirm-dialog--archive { /* custom logic */ }
```

**Page Mode:**

```tsx
// Auto-focus page mode composer
commentElement.focusPageModeComposer();
```

**Comment Modes & Selection:**

```tsx
// Area/box comment selection
commentElement.enableAreaComment();

// Multiple threads per element
commentElement.enableMultithread();

// Detect DOM changes while in comment mode
commentElement.enableChangeDetectionInCommentMode();

// Treat SVG elements as images for commenting
commentElement.svgAsImg(true);
```

**PDF & Iframe Support:**

```tsx
// Enable PDF viewer comment support
// Add data-velt-pdf-viewer="true" attribute to your PDF container element:
<div data-velt-pdf-viewer="true">
  <PDFViewer />
</div>

// Iframe support — comments work inside iframes automatically
// when VeltProvider is loaded in the iframe
```

**AI Auto-Categorization:**

```tsx
// Auto-categorize comments (Question, Feedback, Bug, Other)
commentElement.enableAutoCategorize();
commentElement.disableAutoCategorize();

// Define custom categories
commentElement.setCustomCategory([
  { id: 'question', name: 'Question' },
  { id: 'feedback', name: 'Feedback' },
  { id: 'bug', name: 'Bug Report' },
  { id: 'feature', name: 'Feature Request' },
]);
```

**Comment Aggregation & Grouping:**

```tsx
// Group comments that match by context (e.g., same row in a table)
commentElement.enableGroupMatchedComments();
commentElement.disableGroupMatchedComments();
```

**Custom Lists (Autocomplete Chips):**

```tsx
// Add custom data to annotation-level autocomplete
commentElement.createCustomListDataOnAnnotation({
  listId: 'labels',
  data: [
    { id: 'label-1', name: 'Design' },
    { id: 'label-2', name: 'Engineering' },
  ],
});

// Add custom data to comment-level autocomplete
commentElement.createCustomListDataOnComment({
  listId: 'tags',
  data: [
    { id: 'tag-1', name: 'Urgent' },
    { id: 'tag-2', name: 'Nice to have' },
  ],
});
```

**Recording in Comments:**

```tsx
// Delete a recording from a comment
commentElement.deleteRecording({ annotationId: 'ann-123', recordingId: 'rec-1' });

// Get recording data
const recording = commentElement.getRecording({ annotationId: 'ann-123', recordingId: 'rec-1' });

// Restrict recording types (default: all)
commentElement.setAllowedRecordings(['audio', 'video']); // exclude 'screen'

// Show countdown before recording starts
commentElement.enableRecordingCountdown();

// Enable auto-transcription of recordings
commentElement.enableRecordingTranscription();
commentElement.disableRecordingTranscription();
```

Reference: https://docs.velt.dev/async-collaboration/comments/customize-behavior - UI/UX

---

### 10.12 Use accessModes in Sidebar Filters for Privacy-Based Filtering

**Impact: MEDIUM (Without accessModes, sidebar cannot distinguish public from private comments — custom privacy filters will not work)**

The sidebar system filter `accessModes` lets you filter comments by privacy level. It accepts `'public'` and/or `'private'` and works with both the legacy `iam.accessMode` field and the new `visibilityConfig` field — `restricted` and `organizationPrivate` map to `'private'`; `public` or unset maps to `'public'`.

**Incorrect (trying to filter private comments by status or custom logic):**

```jsx
// Wrong: there is no "private" status — privacy is not a status filter
const filters = { status: ['PRIVATE'] };
commentElement.setCommentSidebarFilters(filters);
```

**Correct (filter sidebar to show only private comments):**

```jsx
const filters = {
  accessModes: ['private'],
};

// Via prop
<VeltCommentsSidebar filters={filters} />

// Via API
const commentElement = client.getCommentElement();
commentElement.setCommentSidebarFilters(filters);
```

**Correct (filter sidebar to show only public comments):**

```jsx
const filters = {
  accessModes: ['public'],
};
commentElement.setCommentSidebarFilters(filters);
```

**Correct (combine accessModes with other filters):**

```jsx
const filters = {
  status: ['OPEN'],
  people: [{ userId: 'user-1' }],
  accessModes: ['private'],
};
commentElement.setCommentSidebarFilters(filters);
```

**Custom filter dropdown in wireframe:** If you build a custom privacy filter dropdown inside `<velt-comments-sidebar-wireframe>`, drive `accessModes` through the same `setCommentSidebarFilters()` API. The filter is resolved server-side by the sidebar pipeline, so your custom UI only needs to write the array.

---

## 11. Events

**Impact: MEDIUM**

Comment lifecycle event subscriptions for custom workflows.

### 11.1 Comment Lifecycle Events — Pin Clicks, Add Events, Button Clicks

**Impact: MEDIUM (Subscribe to comment lifecycle events for custom workflows)**

Subscribe to comment lifecycle events for custom navigation, context injection, and workflow triggers.

**Events via on() method:**

```tsx
const commentElement = client.getCommentElement();

// Pin clicked — navigate to comment or show custom UI
commentElement.on('commentPinClicked').subscribe((event) => {
  // event: { annotationId, location, targetElement, ... }
  console.log('Pin clicked:', event.annotationId);
  router.push(`/doc/${event.documentId}#${event.annotationId}`);
});

// Custom button clicked (from wireframe custom buttons)
commentElement.on('veltButtonClick').subscribe((event) => {
  // event: { buttonId, annotationId, ... }
  console.log('Custom button:', event.buttonId);
});

// Autocomplete search (for custom contact search)
commentElement.on('autocompleteSearch').subscribe((query) => {
  console.log('Searching for:', query);
});
```

**onCommentAdd event with addContext():**

```tsx
// React hook
import { useCommentEventCallback } from '@veltdev/react';

function CommentHandler() {
  const onCommentAdd = useCommentEventCallback('onCommentAdd');

  useEffect(() => {
    if (!onCommentAdd) return;
    // Inject custom context BEFORE the comment is saved
    onCommentAdd.addContext({
      pageSection: 'header',
      projectId: 'proj-123',
      timestamp: Date.now(),
    });
  }, [onCommentAdd]);

  return null;
}

// Or via API
commentElement.on('onCommentAdd').subscribe((event) => {
  event.addContext({ key: 'value' });
});
```

**React hooks for events:**

```tsx
import { useCommentEventCallback, useVeltEventCallback } from '@veltdev/react';

// Comment-specific events
const pinClicked = useCommentEventCallback('commentPinClicked');
const commentSaved = useCommentEventCallback('commentSaved');
const visibilityClicked = useCommentEventCallback('visibilityOptionClicked');

// Generic Velt UI events
const veltEvent = useVeltEventCallback('veltButtonClick');
```

**Correct (React — subscribe to abandoned draft):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function DraftHandler() {
  const draftEvent = useCommentEventCallback('addCommentDraft');

  useEffect(() => {
    if (!draftEvent) return;
    // draftEvent.comment.commentText — unsaved text
    // draftEvent.comment.commentHtml — unsaved HTML
    // draftEvent.annotationId — parent thread ID
    // draftEvent.commentAnnotation — full parent thread object
    console.log('User abandoned reply:', draftEvent.comment.commentText);
    console.log('Annotation:', draftEvent.annotationId);
  }, [draftEvent]);

  return null;
}
```

**Correct (Other frameworks — subscribe to abandoned draft):**

```typescript
const commentElement = client.getCommentElement();
const subscription = commentElement.on('addCommentDraft').subscribe((event) => {
  // event: AddCommentDraftEvent
  // event.annotationId, event.commentAnnotation, event.comment, event.metadata
  console.log('User abandoned reply:', event.comment.commentText);
  console.log('Annotation:', event.annotationId);
});

// Clean up on teardown
subscription.unsubscribe();
```

References:
- https://docs.velt.dev/async-collaboration/comments/customize-behavior - Events
- https://docs.velt.dev/api-reference/sdk/models/data-models#addcommentdraftevent

---

## 12. REST API

**Impact: HIGH**

Server-side comment management via REST API.

### 12.1 REST API — Comment Annotation CRUD

**Impact: HIGH (Server-side comment annotation management via REST)**

Use Velt's REST APIs to manage comment annotations from your backend. All endpoints require `x-velt-api-key` and `x-velt-auth-token` headers.

**Add Annotations:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/add
const response = await fetch('https://api.velt.dev/v2/commentannotations/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      location: { id: 1, locationName: 'Page 1' },
      targetElement: { elementId: 'element-1', targetText: 'Selected text' },
      commentData: [{
        commentText: 'This needs review',
        commentHtml: '<p>This needs review</p>',
        from: { userId: 'user-1' },
        taggedUserContacts: [{ text: '@bob', userId: 'user-2', contact: { userId: 'user-2', name: 'Bob', email: 'bob@example.com' } }],
      }],
      status: { id: 'open', name: 'Open', type: 'default' },
      priority: { id: 'high', name: 'High' },
      context: { projectId: 'proj-1', section: 'header' },
      triggerNotification: true,
      triggerActivities: true,
      verifyUserPermissions: false,
    },
  }),
});
```

**Get Annotations (with filters):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/get
const response = await fetch('https://api.velt.dev/v2/commentannotations/get', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',           // Optional
      locationIds: [1, 2],           // Optional
      annotationIds: ['ann-1'],      // Optional
      userIds: ['user-1'],           // Optional
      statusIds: ['open'],           // Optional
      folderId: 'folder-1',         // Optional
      updatedAfter: 1700000000000,   // Optional: timestamp ms
      createdBefore: 1700100000000,  // Optional: timestamp ms
      pageSize: 50,                  // Default: 1000
      pageToken: 'next-token',      // For pagination
    },
  }),
});
// Response: { result: { status, data: CommentAnnotation[], pageToken } }
```

**Update Annotations:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/update
const response = await fetch('https://api.velt.dev/v2/commentannotations/update', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotations: [{
        annotationId: 'ann-123',
        status: { id: 'resolved', name: 'Resolved', type: 'terminal' },
        priority: { id: 'low', name: 'Low' },
      }],
    },
  }),
});
```

**Delete Annotations:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/delete
const response = await fetch('https://api.velt.dev/v2/commentannotations/delete', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotationIds: ['ann-123', 'ann-456'],
    },
  }),
});
```

**Get Counts (total + unread):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/count/get
const response = await fetch('https://api.velt.dev/v2/commentannotations/count/get', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
    },
  }),
});
// Response: { result: { data: { total: number, unread: number } } }
```

Reference: https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/

---

### 12.2 REST API — Individual Comment CRUD Within Annotations

**Impact: HIGH (Server-side individual comment management via REST)**

Manage individual comments within annotation threads from your backend. All endpoints require `x-velt-api-key` and `x-velt-auth-token` headers.

**Add Comments to Annotation:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/add
const response = await fetch('https://api.velt.dev/v2/commentannotations/comments/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
  },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotationId: 'ann-123',
      commentData: [{
        commentText: 'Looks good to me',
        commentHtml: '<p>Looks good to me</p>',
        from: { userId: 'user-1' },
        context: { reviewType: 'approval' },
        taggedUserContacts: [],
        attachments: [{
          attachmentId: 'att-1',
          name: 'screenshot.png',
          url: 'https://example.com/screenshot.png',
          mimeType: 'image/png',
          size: 102400,
        }],
      }],
    },
  }),
});
```

**Get Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/get
const response = await fetch('https://api.velt.dev/v2/commentannotations/comments/get', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotationId: 'ann-123',
      userIds: ['user-1'],       // Required
      commentIds: [1, 2, 3],     // Optional: specific comment IDs
    },
  }),
});
// Response includes: commentHtml, commentText, status, reactionAnnotations[]
```

**Update Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/update
const response = await fetch('https://api.velt.dev/v2/commentannotations/comments/update', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotationId: 'ann-123',
      commentIds: [1],
      updatedData: {
        commentText: 'Updated review text',
        commentHtml: '<p>Updated review text</p>',
        context: { reviewType: 'revision' },
      },
    },
  }),
});
```

**Delete Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/delete
const response = await fetch('https://api.velt.dev/v2/commentannotations/comments/delete', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'org-1',
      documentId: 'doc-1',
      annotationId: 'ann-123',
      commentIds: [1, 2],  // Optional — if omitted, deletes all comments in annotation
    },
  }),
});
```

Reference: https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/

---

## 13. Wireframe Variables

**Impact: MEDIUM**

Template-variable binding patterns for the Comment Bubble, Comment Dialog, Comment Tool, Text Comment, Inline Comments Section, Multithread Comments, Comment Sidebar, and Comment Sidebar Button wireframes. Documents the `velt-data` / `velt-if` / `velt-class` directive system layered on top of the structural wireframe catalog in `ui/ui-wireframes.md` — variable namespaces (App / Data / UI / Feature State), loop-scope iteration variables, `defaultCondition` overrides, Angular signal inputs, and common `shouldShow` gates.

### 13.1 Bind Autocomplete Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives the @-mention picker — option rows, group rows, chips, empty state — inside Autocomplete wireframes without re-implementing search / filtering on top of the composer)**

The Autocomplete primitive is the @-mention picker rendered inside `<velt-autocomplete-panel>` / `<velt-autocomplete-tool>`, mounted by composers — most prominently the Comment Dialog Composer. Variables are available inside any `<velt-autocomplete-...-wireframe>` tag via the standard `<velt-data field="...">` / `velt-if="{...}"` / `velt-class="'cls': {...}"` directives.

Unlike the Comment Bubble / Comment Dialog families, Autocomplete uses the **flat-config** access pattern — panel-level state is referenced with the explicit `componentConfig.<path>` form. Only the per-row iteration variables (`option`, `chip`) resolve as bare names.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top.

Do not filter or group the mention list yourself using `useContacts`. The panel already produces `componentConfig.flattenedItems` with the correct ordering and grouping applied. Reimplementing flattening breaks the virtual-scroll contract and produces stale results.

**Correct (let the wireframe iterate, read `option` / `chip` per row, gate empty-state with `componentConfig.flattenedItems.length`):**

```jsx
import {
  VeltAutocompletePanelWireframe,
  VeltAutocompleteOptionWireframe,
  VeltAutocompleteGroupOptionWireframe,
  VeltAutocompleteEmptyWireframe,
} from '@veltdev/react';

<VeltAutocompletePanelWireframe>
  <VeltAutocompleteOptionWireframe>
    <div className="my-option" veltClass="'is-group': {option.group}">
      <img className="my-option__avatar" />
      <strong><VeltData field="option.name" /></strong>
      <span><VeltData field="option.email" /></span>
    </div>
  </VeltAutocompleteOptionWireframe>

  <VeltAutocompleteGroupOptionWireframe veltIf="{componentConfig.customGroupsEnabled}">
    <div className="my-group">
      <VeltData field="option.group.name" />
      (<VeltData field="option.group.userCount" />)
    </div>
  </VeltAutocompleteGroupOptionWireframe>

  <VeltAutocompleteEmptyWireframe>
    <p>No matches.</p>
  </VeltAutocompleteEmptyWireframe>
</VeltAutocompletePanelWireframe>
```

Available inside every Autocomplete primitive. **Always read via the full `componentConfig.<path>` form.**
| Variable | Type | Notes |
|---|---|---|
| `componentConfig.flattenedItems` | `FlattenedItem[]` | Visible options after grouping / filtering. `length === 0` drives the empty-state gate. |
| `componentConfig.newUserContact` | `SelectorDataListItem \| undefined` | In-progress new-contact entry. |
| `componentConfig.newUserContactError` | `string \| undefined` | Validation error for the new-contact entry. Gate the error slot with `velt-if="{componentConfig.newUserContactError}"`. |
| `componentConfig.customAutocompleteSearch` | `boolean` | Custom-search mode active. |
| `componentConfig.variant` | `string` | Per-instance variant tag. |
| `componentConfig.contactsWithoutGroup` | `SelectorDataListItem[]` | Contacts not assigned to any group. |
| `componentConfig.groups` | `GroupData[]` | Available mention groups. |
| `componentConfig.expandMentionGroups` | `boolean` | Render group rows as expanded. |
| `componentConfig.showMentionGroupsFirst` | `boolean` | Group rows render above contact rows. |
| `componentConfig.showMentionGroupsOnly` | `boolean` | Only group rows render. |
| `componentConfig.customGroupsEnabled` | `boolean` | Custom-groups feature enabled. Gates `<velt-autocomplete-group-option-wireframe>`. |
| `componentConfig.onOptionClick` | `Function` | Click handler for a custom option — wire this from your custom option markup. |
| `componentConfig.trackByFlattenedItem` | `Function` | Internal virtual-scroll track-by. |
| `componentConfig.autoCompleteScrollConfig.itemSize` | `number` | Internal virtual-scroll item-size config. |
These resolve as **bare names** — only inside the iteration tag that owns them.
| Variable | Type | Available in | Notes |
|---|---|---|---|
| `option` | `SelectorDataListItem` | `<velt-autocomplete-option-wireframe>`, `<velt-autocomplete-group-option-wireframe>`, and their child tags | Current row. |
| `option.user` | `User` | Same as above | Set when the option represents a user. |
| `option.group` | `GroupData` | Same as above | Set when the option represents a group. Use `velt-class="'is-group': {option.group}"` to branch. |
| `chip` | `AutocompleteChipConfig` | `<velt-autocomplete-chip-wireframe>` and its tooltip child tags | Inline chip in the composer. |
| Wireframe tag | React component | Notes |
|---|---|---|
| `<velt-autocomplete-panel-wireframe>` | `<VeltAutocompletePanelWireframe>` | Root menu — hosts every other tag. No extra variables at the panel level. |
| `<velt-autocomplete-empty-wireframe>` | `<VeltAutocompleteEmptyWireframe>` | Empty-state. `shouldShow` requires `componentConfig.flattenedItems.length === 0`. |
| `<velt-autocomplete-option-wireframe>` | `<VeltAutocompleteOptionWireframe>` | Option row. Composes `*-option-name` / `*-option-description` / `*-option-icon` / `*-option-error-icon`. |
| `<velt-autocomplete-group-option-wireframe>` | `<VeltAutocompleteGroupOptionWireframe>` | Group-of-users row — only when `customGroupsEnabled` is true or mention groups are present. |
| `<velt-autocomplete-chip-wireframe>` | `<VeltAutocompleteChipWireframe>` | Inline chip in the contenteditable composer. Composes `*-chip-tooltip` / `*-chip-tooltip-name` / `*-chip-tooltip-description` / `*-chip-tooltip-icon`. |
| `<velt-autocomplete-panel-search-icon-wireframe>` | — | Magnifying-glass icon in the panel's search input. |
The `<velt-autocomplete-tool>` trigger button itself has **no** `<velt-autocomplete-tool-wireframe>` registration — its appearance is controlled by the parent composer's wireframe (e.g. the comment-dialog composer-action-button).
**Option child tags** (resolve parent `option` context):
| Tag | Bind |
|---|---|
| `<velt-autocomplete-option-name-wireframe>` | `<velt-data field="option.name" />` |
| `<velt-autocomplete-option-description-wireframe>` | `<velt-data field="option.email" />` |
| `<velt-autocomplete-option-icon-wireframe>` | `<velt-data field="option.user.photoUrl" />` |
| `<velt-autocomplete-option-error-icon-wireframe>` | `velt-if="{option.invalid}"` |
**Chip tooltip tags** (resolve parent `chip` context): `*-chip-tooltip-wireframe`, `*-chip-tooltip-name-wireframe`, `*-chip-tooltip-description-wireframe`, `*-chip-tooltip-icon-wireframe` — bind `chip.name` / `chip.description` / `chip.icon`.
**1. DO NOT bare-name panel-level state.** This family uses flat-config access. `<velt-data field="flattenedItems.length" />` resolves to nothing — use `<velt-data field="componentConfig.flattenedItems.length" />`. The bare-name exception is the loop-scope variables `option` and `chip`.
**2. DO NOT re-implement filtering / grouping over `useContacts`.** The panel already produces `componentConfig.flattenedItems`. Read it; don't rebuild it.
**3. DO NOT nest `<velt-autocomplete-group-option-wireframe>` inside `<velt-autocomplete-option-wireframe>`.** They are sibling iteration roots — the panel decides which to render based on `option.group` / `customGroupsEnabled`.
**4. DO NOT bind `chip.*` outside a chip wireframe.** The `chip` iteration context only exists inside `<velt-autocomplete-chip-wireframe>` and its tooltip descendants.

---

### 13.2 Bind Comment Bubble Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives unread/selected styling, author content, and conditional pin decorations inside Comment Bubble and Comment Pin wireframes without re-subscribing to annotation state)**

The Comment Bubble wireframe family (`<velt-comment-bubble-...-wireframe>` / `<VeltCommentBubbleWireframe.*>`) exposes a fixed set of template variables that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing annotation selection / unread tracking on top of `useCommentAnnotations`. Variables are mapped — reference them by their short name, **never** as `componentConfig.var` (with the documented feature-state exception below).

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top of that structure.

Do not rebuild bubble state from `useCommentAnnotations` and conditionally mount wireframe slots. The wireframe already exposes `annotation.unread`, `selectedAnnotationsMap`, and `annotation.from.name` as injected variables. Reimplementing this breaks the wireframe contract and causes double state tracking.

**Correct (read the slot's injected variables via `velt-data` / `veltIf` / `veltClass`):**

```jsx
import { VeltCommentBubbleWireframe } from '@veltdev/react';

<VeltCommentBubbleWireframe
  veltClass="'unread': {annotation.unread}, 'selected': {selectedAnnotationsMap[annotation.annotationId]}">
  <div className="my-bubble">
    <VeltCommentBubbleWireframe.Avatar>
      <img className="my-bubble__avatar" src="{annotation.from.photoUrl}" />
    </VeltCommentBubbleWireframe.Avatar>
    <span className="my-bubble__name">
      <VeltData field="annotation.from.name" />
    </span>
    <VeltCommentBubbleWireframe.CommentsCount>
      <VeltIf condition="{annotation.comments.length} > 1">
        <span className="my-bubble__count">
          <VeltData field="annotation.comments.length" />
        </span>
      </VeltIf>
    </VeltCommentBubbleWireframe.CommentsCount>
    <VeltCommentBubbleWireframe.UnreadIcon>
      <VeltIf condition="{annotation.unread}">
        <span className="my-bubble__dot" />
      </VeltIf>
    </VeltCommentBubbleWireframe.UnreadIcon>
  </div>
</VeltCommentBubbleWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-comment-bubble-wireframe
  velt-class="'unread': {annotation.unread}, 'selected': {selectedAnnotationsMap[annotation.annotationId]}">
  <div class="my-bubble">
    <velt-comment-bubble-avatar-wireframe>
      <img class="my-bubble__avatar" />
    </velt-comment-bubble-avatar-wireframe>
    <span class="my-bubble__name">
      <velt-data field="annotation.from.name"></velt-data>
    </span>
    <velt-comment-bubble-comments-count-wireframe>
      <span velt-if="{annotation.comments.length} > 1">
        <velt-data field="annotation.comments.length"></velt-data>
      </span>
    </velt-comment-bubble-comments-count-wireframe>
    <velt-comment-bubble-unread-icon-wireframe>
      <span velt-if="{annotation.unread}"></span>
    </velt-comment-bubble-unread-icon-wireframe>
  </div>
</velt-comment-bubble-wireframe>
```

The Comment Bubble injects four namespaces at the root of every slot.
**App State** — globally resolved identity:
| Variable | Type | Notes |
|---|---|---|
| `globalConfigSignal.appState.user` | `User \| null` | Currently identified end-user. Use the explicit path — `user` is *not* aliased here. |
**Data State** — annotation context for this bubble:
| Variable | Type | Notes |
|---|---|---|
| `annotation` | `CommentAnnotation \| null` | Annotation this bubble represents. Gate everything with `velt-if="{annotation}"`. |
| `annotation.from` | `User` | Author of the annotation's first comment. |
| `annotation.comments` | `Comment[]` | Comments in the thread. Length drives the count badge. |
| `annotation.status.id` | `string` | Status id (`"open"`, `"resolved"`, custom-status ids). |
| `annotation.unread` | `boolean` | Annotation has unread comments for the current user. |
| `annotation.iam.accessMode` | `'public' \| 'private'` | Visibility mode. |
| `annotation.ghostComment` | `GhostComment \| null` | Set when the pin has lost its DOM target (ghost-comment state). |
| `annotation.annotationIndex` | `number` | Place-order index (used by `comment-pin-index` slot). |
| `annotation.annotationNumber` | `number` | Auto-generated annotation number (used by `comment-pin-number` slot). |
| `annotations` | `CommentAnnotation[]` | All annotations currently in scope. |
| `unresolvedAnnotationsCount` | `number` | Unresolved annotations across the document. |
| `unreadCount` | `number` | Unread-comment count for this bubble's annotation. |
| `data.folderId` | `string` | Folder id the annotation belongs to. |
| `data.context` | `Record<string, any>` | Free-form annotation context (read via bracket / dotted paths). |
**UI State** — per-bubble flags driven by the bubble itself:
| Variable | Type | Notes |
|---|---|---|
| `uiState.commentPinSelected` | `boolean` | Pin associated with this bubble is currently selected. |
| `selectedAnnotationsMap` | `Record<string, boolean>` | Map keyed by `annotationId` → selected flag. Use bracket lookup: `{selectedAnnotationsMap[annotation.annotationId]}`. |
| `selectedAnnotationsLocationMap` | `Record<string, any>` | Internal selection bookkeeping by location — read individual entries via bracket notation if needed. |
| `darkMode` | `boolean` | Dark mode is active for this bubble. |
| `variant` | `string` | Per-instance variant tag from the host element. |
| `parentLocalUIState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled (host attribute). |
| `commentBubbleTargetPinHover` | `boolean` | The bubble's anchor pin is currently hovered. |
| `openDialog` | `boolean` | A comment dialog is open for this bubble's annotation. |
| `readOnly` | `boolean` | Per-render read-only flag. |
| `showAvatar` | `boolean` | Avatar should render. |
| `commentCountType` | `'total' \| 'unread'` | Which count drives the badge. |
**Feature State** — workspace capability flags. These names collide with mappings used elsewhere, so they must be read via the **full path**:
| Variable | Type | Notes |
|---|---|---|
| `globalConfigSignal.featureState.customStatusesShown` | `boolean` | Custom-status decoration enabled on bubbles. |
| `globalConfigSignal.featureState.groupMatchedComments` | `boolean` | Matched comments are grouped on the page. |
| `globalConfigSignal.featureState.resolvedCommentsOnDom` | `boolean` | Resolved annotations still render bubbles. |
| `globalConfigSignal.featureState.readOnly` | `boolean` | Workspace read-only mode is active (distinct from the per-render `readOnly`). |
The Comment Bubble proper has 4 slots; the related Comment Pin has 7 deeply-nested tags. Pin tags read from the *same* `annotation` context.

**Comment Bubble slots:**

```typescript
// On any <velt-comment-bubble-...-wireframe> in an Angular template
[componentConfigSignal]="config()"      // annotation, selectedAnnotationsMap,
                                         // unreadCount, openDialog
[parentLocalUIState]="localUI()"         // darkMode, variant, shadowDom,
                                         // readOnly, showAvatar, commentCountType
```

The root `<velt-comment-bubble>` element additionally accepts host attributes that map onto local UI state: `dark-mode`, `variant`, `show-avatar`, `comment-count-type`, `shadow-dom`.
| Slot | `shouldShow` |
|---|---|
| `comment-bubble-wireframe` (root) | One per non-resolved annotation. Resolved annotations render only when `globalConfigSignal.featureState.resolvedCommentsOnDom === true`. |
| `comment-bubble-comments-count-wireframe` | `annotation.comments.length > 1` |
| `comment-bubble-unread-icon-wireframe` | `unreadCount > 0` (or `annotation.unread === true`, depending on `commentCountType`) |
| `comment-pin-unread-comment-indicator-wireframe` | `annotation.unread === true` |
| `comment-pin-private-comment-indicator-wireframe` | `annotation.iam.accessMode === 'private'` |
| `comment-pin-ghost-comment-indicator-wireframe` | `annotation.ghostComment != null` |
Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.
Three names collide with mappings used by other features. Inside a Comment Bubble wireframe, prefer the explicit path:
| Conflicting name | Use this in Comment Bubble |
|---|---|
| `customStatusesShown` | `globalConfigSignal.featureState.customStatusesShown` |
| `resolvedCommentsOnDom` | `globalConfigSignal.featureState.resolvedCommentsOnDom` |
| `readOnly` | `globalConfigSignal.featureState.readOnly` (workspace) **or** `{readOnly}` (per-render local) |
**1. DO NOT prefix mapped variables with `componentConfig.`** Variables are mapped to short names. `<velt-data field="componentConfig.annotation.from.name" />` resolves to nothing — use `<velt-data field="annotation.from.name" />`. The exception is the *feature-state* names listed above, which **require** the `globalConfigSignal.featureState.<name>` path.
**2. DO NOT confuse `annotation.unread` with `uiState.commentPinSelected`.** `annotation.unread` is data-state (this annotation has unread comments for me). `uiState.commentPinSelected` is UI-state (this bubble's pin is the currently selected one). They drive different visuals.
**3. DO NOT compare `selectedAnnotationsMap` to a boolean directly.** It is a map. Bracket-lookup the current annotation: `{selectedAnnotationsMap[annotation.annotationId]}`.
**4. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal gate (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.
**5. DO NOT bind to `parentLocalUIState.shadowDom` from inside the wireframe to *enable* shadow-DOM.** Shadow-DOM is set via the host attribute `shadow-dom="true"` on `<velt-comment-bubble>`. The variable only reports the current state.

---

### 13.3 Bind Comment Dialog Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives layout-mode styling, capability gating, composer state, thread-card iteration, and banner visibility inside the Comment Dialog wireframe family without re-subscribing to annotation state)**

The Comment Dialog wireframe family (`<velt-comment-dialog-...-wireframe>` / `<VeltCommentDialogWireframe.*>`) is the largest wireframe surface in the Velt SDK — roughly 110 slot tags covering the header, body, threads, thread-card, composer (and its attachments / format-toolbar / assign-user / private-badge / recordings subtree), the four banners, status/priority/custom dropdowns, and the auxiliary buttons (resolve, unresolve, private, delete, suggestion accept/reject, copy-link, sign-in, upgrade, navigation, all-comment).

You read the wireframe's exposed variables with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing capability gating, draft state, or thread iteration on top of `useCommentAnnotations` / `useVeltClient`.

Most variables are mapped — reference them by their short name (`{annotation}`, `{enableResolve}`, `{composerContent}`). A small set lives at the root of `componentConfigSignal` and is **not** mapped — those require the full `componentConfigSignal.<name>` path (see the [Root-Level Properties](#root-level-properties-use-full-path) section).

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. For the dialog's customization layer (CSS, custom-content slots), see `ui/ui-comment-dialog.md`. This rule documents the *variable-binding* layer on top of both.

**Incorrect (rebuilding dialog state from `useCommentAnnotations` and gating slots from the host component):**

```jsx
import { useCommentAnnotations, useVeltClient } from '@veltdev/react';
import { VeltCommentDialogWireframe } from '@veltdev/react';

function Dialog({ annotationId }) {
  const annotations = useCommentAnnotations();
  const annotation = annotations?.find(a => a.annotationId === annotationId);
  const client = useVeltClient();
  // Reimplements enableResolve + canResolveAnnotation tracking
  // and editComment state the wireframe already exposes as variables.
  const [canResolve, setCanResolve] = useState(false);
  const [editing, setEditing] = useState(false);
  useEffect(() => { /* manual subscriptions ... */ }, [client, annotation]);
  if (!annotation) return null;
  return (
    <VeltCommentDialogWireframe>
      <div className={editing ? 'my-dialog is-editing' : 'my-dialog'}>
        {canResolve && <button>Resolve</button>}
        {annotation.comments.map((c, i) => (
          <article key={c.commentId}>
            <strong>{c.from?.name}</strong>
            <p>{c.commentText}</p>
          </article>
        ))}
      </div>
    </VeltCommentDialogWireframe>
  );
}
```

**Correct (read the slot's injected variables via `velt-data` / `velt-if` / `velt-class`; let `ThreadCard` iterate for you):**

```jsx
import { VeltCommentDialogWireframe } from '@veltdev/react';

<VeltCommentDialogWireframe>
  <div className="my-dialog" veltClass="'is-editing': {editComment}, 'is-private': {isPrivateComment}, 'dark': {darkMode}">
    <VeltCommentDialogWireframe.Header>
      <VeltCommentDialogWireframe.ResolveButton
        veltIf="{enableResolve} && {canResolveAnnotation} && (!{resolveStatusAccessAdminOnly} || {isUserAdmin})">
        Resolve
      </VeltCommentDialogWireframe.ResolveButton>
      <VeltCommentDialogWireframe.CloseButton />
    </VeltCommentDialogWireframe.Header>

    <VeltCommentDialogWireframe.Body>
      <VeltCommentDialogWireframe.Threads>
        <VeltCommentDialogWireframe.ThreadCard>
          <article className="my-comment" veltClass="'is-first': '{commentIndex} === 0'">
            <strong><VeltData field="comment.from.name" /></strong>
            <p><VeltData field="comment.commentText" /></p>
            <VeltCommentDialogWireframe.ThreadCardEdited />
          </article>
        </VeltCommentDialogWireframe.ThreadCard>
      </VeltCommentDialogWireframe.Threads>
    </VeltCommentDialogWireframe.Body>

    <VeltCommentDialogWireframe.Composer />
  </div>
</VeltCommentDialogWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-comment-dialog-wireframe>
  <div class="my-dialog" velt-class="'is-editing': {editComment}, 'is-private': {isPrivateComment}">
    <velt-comment-dialog-header-wireframe>
      <velt-comment-dialog-resolve-button-wireframe
        velt-if="{enableResolve} && {canResolveAnnotation}">
        Resolve
      </velt-comment-dialog-resolve-button-wireframe>
      <velt-comment-dialog-close-button-wireframe></velt-comment-dialog-close-button-wireframe>
    </velt-comment-dialog-header-wireframe>

    <velt-comment-dialog-threads-wireframe>
      <velt-comment-dialog-thread-card-wireframe>
        <strong><velt-data field="comment.from.name"></velt-data></strong>
        <p><velt-data field="comment.commentText"></velt-data></p>
      </velt-comment-dialog-thread-card-wireframe>
    </velt-comment-dialog-threads-wireframe>

    <velt-comment-dialog-composer-wireframe></velt-comment-dialog-composer-wireframe>
  </div>
</velt-comment-dialog-wireframe>
```

The dialog injects four root namespaces plus context-specific (loop-scoped) variables.
**App State** — identity:
| Variable | Type | Notes |
|---|---|---|
| `user` | `User` | Currently identified end-user. |
| `isUserAdmin` | `boolean` | `user.isAdmin === true`. |
| `isKnownUser` | `boolean` | User has been identified (vs. anonymous). |
| `repliesUniqueUsers` | `User[]` | Distinct authors of replies on the current annotation. |
**Data State** — annotation, composer staging, edit state, attachments, recordings:
| Variable | Type | Notes |
|---|---|---|
| `annotation` | `CommentAnnotation` | Annotation this dialog represents. Aliased as `commentAnnotation`. |
| `annotations` | `CommentAnnotation[]` | All annotations in scope. Aliased as `commentAnnotations`. |
| `allAnnotations` | `CommentAnnotation[]` | Unfiltered annotation list. |
| `ghostComment` | `GhostComment \| null` | Set when the annotation has lost its DOM target. |
| `assignTo` | `UserContact` | Currently selected assignee. |
| `selectedUserContacts` | `UserContact[]` | Selected user contacts (assign / mention). |
| `customList` | `any[]` | Autocomplete reference list. |
| `toOrganizationUserGroup` | `any[]` | Organization user-group contacts. |
| `taggedUserContacts` | `AutocompleteUserContactReplaceData[]` | Users tagged via @mention in the active composer. |
| `taggedGroups` | `any[]` | Groups tagged via @mention. |
| `customChipData` | `CustomAnnotationDropdownData \| null` | Custom-chip dropdown config. |
| `selectedCustomChipSet` | `Set<string>` | IDs currently selected in the custom-chip dropdown. |
| `currentDialogView` | `Record<string, any>` | Seen-by aggregation keyed by `commentId`. |
| `selectedFiles` | `FileData[]` | Files staged in the composer. |
| `invalidSelectedFiles` | `InvalidFileData[]` | Files rejected by validation. |
| `selectedAttachments` | `any[]` | Attachments staged for the new comment. |
| `editComment` | `Comment \| null` | Comment currently being edited. |
| `editCommentIndex` | `number \| null` | Index of the comment being edited. |
| `localRecordedData` | `RecordedData[]` | Recordings staged in the composer. |
| `attachmentsToDelete` | `any[]` | Attachments queued for deletion on save. |
**UI State — layout modes** (mutually-styled, sometimes co-active):
| Variable | Type | Notes |
|---|---|---|
| `sidebarMode` | `boolean` | Rendered inside the comments sidebar. |
| `inboxMode` | `boolean` | Rendered inside the inbox layout. |
| `dialogMode` | `boolean` | Default popup-dialog layout. |
| `inlineCommentMode` | `boolean` | Inline-comment-pin styling. |
| `inlineCommentSectionMode` | `boolean` | Inline comments section layout. |
| `focusedThreadMode` | `boolean` | Focused-thread layout. |
| `isFocusedThreadEnabled` | `boolean` | Focused-thread navigation is allowed. |
| `pageModeComposer` | `boolean` | Page-level composer mode. |
| `bottomSheetMode` | `boolean` | Bottom-sheet layout. |
| `commentComposerMode` | `boolean` | Composer-only layout (no thread). |
| `multiThreadAnnotationId` | `string \| null` | Multi-thread context id. |
| `dialogOpenedInSidebar` | `boolean` | Dialog opened in sidebar context. |
| `dialogShadowDOM` | `boolean` | Shadow-DOM rendering enabled. |
| `containerComponentId` | `string` | Owning container id. |
| `commentDialogUniqueId` | `string` | Unique id for this dialog instance. |
| `deviceType` | `string` | `'desktop'` / `'mobile'` / … |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string` | Per-instance variant tag. |
| `disabled` | `boolean` | Dialog is disabled. |
| `readOnly` | `boolean` | Per-instance read-only mode. |
| `commentPinSelected` | `boolean` | Pin associated with this dialog is selected. |
| `commentDialogSelected` | `boolean` | This dialog is the currently selected one. |
| `fullExpanded` | `boolean` | Dialog is fully expanded (sidebar). |
| `expandOnSelection` | `boolean` | Sidebar expands on click vs. visually selecting. |
| `composerPosition` | `'top' \| 'bottom'` | Composer position. |
| `selectedVisibility` | `CommentVisibilityOptionType` | Selected visibility option. |
| `selectedVisibilityUsers` | `any[]` | Users selected when `selectedVisibility === 'selected_people'`. |
| `locationVersion` | `string` | Annotation location version. |
**UI State — composer state** (driven by the composer):
| Variable | Type | Notes |
|---|---|---|
| `composerContent` | `string` | Plain-text composer draft. Aliased as `newComment`. |
| `composerContentHTML` | `string` | Rich-text composer draft. Aliased as `newCommentHTML`. |
| `composerInOpenState` | `boolean` | Composer is expanded. |
| `composerMode` | `'default' \| 'expanded'` | Current composer mode. |
| `isInputFocused` | `boolean` | Composer input has keyboard focus. |
| `showCommentButtons` | `boolean` | Composer's action-button row should render. |
| `isAutocompleteDropdownOpen` | `boolean` | @-mention autocomplete dropdown is open. |
| `uploadingAttachments` | `boolean` | One or more attachments are uploading. |
| `recorderInitConfig` | `any` | Active recorder configuration (or `null`). |

**UI State — reactions, replies, dropdowns:**

```typescript
// On any <velt-comment-dialog-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // shared per-annotation config signal
[parentLocalUIState]="localUI()"     // per-instance UI state
```

The root `<velt-comment-dialog>` element additionally accepts host attributes that map onto local UI state — `dark-mode`, `variant`, `disabled`, `read-only`, `composer-position`, `dialog-shadow-dom`, etc.
**1. DO NOT prefix mapped variables with `componentConfig.` or `componentConfigSignal.`.** The dialog exposes ~250 mapped names. `<velt-data field="componentConfigSignal.annotation.from.name" />` resolves to nothing — use `<velt-data field="annotation.from.name" />`. The exception is the **eight unmapped root-level properties** (`componentConfigSignal.unreadCommentsMap`, the five `*placeholder` strings, `componentConfigSignal.unreadIndicatorMode`, `componentConfigSignal.placeholder`) which **must** use the full path.
**2. DO NOT reference loop-scope variables outside their slot.** `{comment}` / `{commentObj}` / `{commentIndex}` are defined only inside `<velt-comment-dialog-thread-card-wireframe>` and its descendants. Referencing them from the header or composer returns `undefined`.
**3. DO NOT gate the resolve button with only `{enableResolve}` or only `{canResolveAnnotation}`.** Both are required, plus the admin-only override: `velt-if="{enableResolve} && {canResolveAnnotation} && (!{resolveStatusAccessAdminOnly} || {isUserAdmin})"`.
**4. DO NOT compare `reactionToolOpenIndex` / `openDropdownIndexValue` directly to a boolean.** They are numeric indices (`-1` when closed). Compare to `{commentIndex}`: `velt-class="'reaction-open': '{reactionToolOpenIndex} === {commentIndex}'"`.
**5. DO NOT bracket-lookup `hasReactionsByCommentId` / `unreadCommentsMap` without the `commentId` / `annotationId` in scope.** Inside thread-card use `{hasReactionsByCommentId[comment.commentId]}`. Inside the dialog root use `{componentConfigSignal.unreadCommentsMap[annotation.annotationId]}`.
**6. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.
**7. DO NOT remount the dialog wireframe to switch layout modes.** `sidebarMode` / `inboxMode` / `dialogMode` / `inlineCommentMode` / `focusedThreadMode` are exposed as variables — toggle a class with `velt-class`, do not unmount.
**8. DO NOT depend on legacy `commentDialogOptionsDropdownConfigSignal.*` / `commentDialogStatusDropdownConfigSignal.*` prefixes in new code.** They are kept working by the resolver but the v5 short names (`enableAssignment`, `enableEdit`, `statusOptions`, …) are canonical.

---

### 13.4 Bind Comment Sidebar Button Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives active/floating styling, total-vs-unread badge swapping, and the unread dot inside the Comment Sidebar Button wireframe without re-subscribing to sidebar visibility or annotation counts)**

The Comment Sidebar Button wireframe family (`<velt-sidebar-button-...-wireframe>` / `<VeltSidebarButtonWireframe.*>`) is the toolbar button that opens the Comment Sidebar — with built-in unread-count and total-count indicators. You read its exposed variables with three directives: `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling.

Unlike Comment Bubble / Comment Dialog (which expose mapped short names at the root), the Sidebar Button uses the **flat-config** access pattern — variables span three explicit namespaces (`globalConfig.featureState.*`, `componentConfig.<data|uiState>.*`, `parentLocalUIState.*`) and **must** be referenced via their full path. There is no `{annotation}` / `{user}` alias here.

For the structural catalog of which wireframe tags exist, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top.

Do not rebuild visibility or unread state from hooks and alias flat-config variables as if they were mapped. The wireframe already exposes `globalConfig.featureState.sidebarVisible`, `componentConfig.data.unreadCount`, and `componentConfig.data.annotations.length` as flat-config variables.

**Correct (read the slot's injected flat-config variables via `velt-data` / `veltIf` / `veltClass`):**

```jsx
import { VeltSidebarButtonWireframe } from '@veltdev/react';

<VeltSidebarButtonWireframe veltClass="'active': {globalConfig.featureState.sidebarVisible}">
  <button className="my-sidebar-trigger">
    <VeltSidebarButtonWireframe.Icon />
    <VeltSidebarButtonWireframe.CommentsCount>
      <VeltIf condition="{componentConfig.uiState.commentCountType} === 'total'">
        <span><VeltData field="componentConfig.data.annotations.length" /></span>
      </VeltIf>
      <VeltIf condition="{componentConfig.uiState.commentCountType} === 'unread'">
        <span><VeltData field="componentConfig.data.unreadCount" /></span>
      </VeltIf>
    </VeltSidebarButtonWireframe.CommentsCount>
    <VeltSidebarButtonWireframe.UnreadIcon veltIf="{componentConfig.data.unreadCount} > 0">
      <span className="my-unread-dot">
        <VeltData field="componentConfig.data.unreadCount" />
      </span>
    </VeltSidebarButtonWireframe.UnreadIcon>
  </button>
</VeltSidebarButtonWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-sidebar-button-wireframe>
  <button class="my-trigger"
          velt-class="'is-active': {globalConfig.featureState.sidebarVisible}, 'floating': {componentConfig.uiState.floatingMode}">
    <velt-sidebar-button-icon-wireframe></velt-sidebar-button-icon-wireframe>
    <velt-sidebar-button-comments-count-wireframe>
      <span velt-if="{componentConfig.uiState.commentCountType} === 'unread'">
        <velt-data field="componentConfig.data.unreadCount"></velt-data>
      </span>
    </velt-sidebar-button-comments-count-wireframe>
    <velt-sidebar-button-unread-icon-wireframe
      velt-if="{componentConfig.data.unreadCount} > 0"></velt-sidebar-button-unread-icon-wireframe>
  </button>
</velt-sidebar-button-wireframe>
```

**Global Feature State** — cross-document:
| Variable | Type | Notes |
|---|---|---|
| `globalConfig.featureState.sidebarVisible` | `boolean` | Linked sidebar is currently open. Drives the active state on the button. |
**Per-instance Data** — counts for this button:
| Variable | Type | Notes |
|---|---|---|
| `componentConfig.data.annotations` | `CommentAnnotation[] \| undefined` | All annotations in scope. `.length` drives the total-count badge. |
| `componentConfig.data.unreadCount` | `number \| null` | Unread-count badge value. Also gates the unread-icon slot. |
**Per-instance UI State** — layout flags:
| Variable | Type | Notes |
|---|---|---|
| `componentConfig.uiState.showDefaultBtn` | `boolean` | Default built-in button should render. Set to `false` when a wireframe overrides the button entirely. |
| `componentConfig.uiState.floatingMode` | `boolean` | Button is rendering in floating mode. |
| `componentConfig.uiState.floatingModeSidebarVisible` | `boolean` | Floating-mode sidebar is currently open. |
| `componentConfig.uiState.darkMode` | `boolean` | Dark mode is active for this instance. |
| `componentConfig.uiState.commentCountType` | `'total' \| 'unread'` | Which count drives the badge. Compare with `===`, do not coerce to boolean. |
**Per-instance Local UI State** — host-attribute reflections:
| Variable | Type | Notes |
|---|---|---|
| `parentLocalUIState.darkMode` | `boolean` | Local dark-mode flag (host attribute). |
| `parentLocalUIState.variant` | `string` | Per-instance variant tag set on the host element. |
| `parentLocalUIState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled (read-only — set via the host attribute). |
| Wireframe tag | React component | `shouldShow` |
|---|---|---|
| `<velt-sidebar-button-wireframe>` | `<VeltSidebarButtonWireframe>` | Root. |
| `<velt-sidebar-button-icon-wireframe>` | `<VeltSidebarButtonWireframe.Icon>` | Default chat icon. |
| `<velt-sidebar-button-comments-count-wireframe>` | `<VeltSidebarButtonWireframe.CommentsCount>` | Branches on `componentConfig.uiState.commentCountType` — `'total'` shows `annotations.length`, `'unread'` shows `unreadCount`. |
| `<velt-sidebar-button-unread-icon-wireframe>` | `<VeltSidebarButtonWireframe.UnreadIcon>` | `componentConfig.data.unreadCount > 0`. |
Override any gate with `defaultCondition={false}` (React) / `default-condition="false"` (HTML).
**1. DO NOT drop the namespace prefix.** This wireframe is flat-config — `<velt-data field="unreadCount" />` resolves to nothing. Use the full path: `<velt-data field="componentConfig.data.unreadCount" />`.
**2. DO NOT confuse `globalConfig.featureState.sidebarVisible` with `componentConfig.uiState.floatingModeSidebarVisible`.** The first is the global linked-sidebar state; the second is the floating-overlay variant. They are independent — the floating mode can be open while the docked sidebar is closed.
**3. DO NOT compare `commentCountType` to a boolean.** It is a string enum (`'total'` / `'unread'`). Compare explicitly: `velt-if="{componentConfig.uiState.commentCountType} === 'total'"`.
**4. DO NOT bind to `parentLocalUIState.shadowDom` to *enable* shadow-DOM.** Shadow-DOM is set via the host attribute `shadow-dom="true"` on `<velt-sidebar-button>`. The variable only reports the current state.

---

### 13.5 Bind Comment Sidebar Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives layout-mode styling, filter / list / focused-thread iteration, empty-state and skeleton gating, and nested-dialog scope across the Comment Sidebar wireframe family without re-subscribing to sidebar state)**

The Comment Sidebar wireframe family (`<velt-comments-sidebar-...-wireframe>` / `<velt-comment-sidebar-...-wireframe>` — **both prefixes are used**) is the largest wireframe surface after Comment Dialog. It covers the panel root, wrapper, header, filter panel (and its per-category sub-panels + per-option rows + filter-search tags), the minimal filter/sort + actions dropdowns, the standalone status / location / document dropdowns, the virtual-scroll list (with grouped sections), skeleton + empty-state placeholders, the page-mode composer, and the focused-thread view.

You read the wireframe's exposed variables with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing filter, focused-thread, or unread state on top of `useCommentAnnotations` / `useVeltClient`.

The sidebar uses a **hybrid access pattern**, distinct from Comment Dialog:

- A small set of **mapped** sidebar-specific names resolve via bare short names — `{focusedAnnotation}`, `{selectedMinimalFilterDropdownOption}`, `{appliedFiltersCount}`, `{filteredCommentAnnotationsCount}`, `{unreadCommentAnnotationCount}`.
- Inherited mapped names from Comment Dialog also resolve as short names — `{user}`, `{isUserAdmin}`, `{isKnownUser}`, `{darkMode}`, `{variant}`, `{annotation}`, `{annotations}`, `{allAnnotations}`, `{commentAnnotation}`, `{commentAnnotations}`.
- Everything else is **flat** on `componentConfig` and **must** be referenced via the full path: `{componentConfig.skeletonLoading}`, `{componentConfig.virtualScrollData}`, `{componentConfig.filterConfig.layout}`, …

For the structural catalog of all sidebar tags see `ui/ui-wireframes.md`. For the surface itself see `surface/surface-sidebar.md`. This rule documents the *variable-binding* layer on top.

**Incorrect (rebuilding sidebar state from hooks and gating slots from the host component):**

```jsx
import { useCommentAnnotations, useVeltClient } from '@veltdev/react';
import { VeltCommentsSidebarWireframe } from '@veltdev/react';

function Sidebar() {
  const annotations = useCommentAnnotations();
  // Reimplements filtered count + skeleton + empty + focused-thread state
  // the wireframe already exposes.
  const [filtered, setFiltered] = useState(annotations ?? []);
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(null);
  useEffect(() => { /* manual subscriptions ... */ }, [annotations]);
  return (
    <VeltCommentsSidebarWireframe>
      {loading ? <Skeleton /> : filtered.length === 0 ? <Empty /> : <List items={filtered} />}
      {focused && <FocusedThread annotation={focused} />}
    </VeltCommentsSidebarWireframe>
  );
}
```

**Correct (read the slot's injected variables; let the wireframe iterate / gate for you):**

```jsx
import { VeltCommentsSidebarWireframe } from '@veltdev/react';

<VeltCommentsSidebarWireframe>
  <VeltCommentsSidebarWrapperWireframe>
    <VeltCommentSidebarHeaderWireframe>
      <h2>Comments</h2>
      <VeltCommentsSidebarFilterButtonWireframe
        veltClass="'has-filters': {appliedFiltersCount} > 0">
        Filter
        <VeltIf condition="{appliedFiltersCount} > 0">
          <span><VeltData field="appliedFiltersCount" /></span>
        </VeltIf>
      </VeltCommentsSidebarFilterButtonWireframe>
      <VeltCommentSidebarCloseButtonWireframe />
    </VeltCommentSidebarHeaderWireframe>

    <VeltCommentSidebarSkeletonWireframe />
    <VeltCommentSidebarListWireframe />

    <VeltCommentsSidebarEmptyPlaceholderWireframe
      veltIf="{componentConfig.noCommentsFound} || {componentConfig.noCommentsFoundForAppliedFilters}">
      <p>No comments to show.</p>
      <VeltCommentsSidebarResetFilterButtonWireframe
        veltIf="{appliedFiltersCount} > 0">
        Clear filters
      </VeltCommentsSidebarResetFilterButtonWireframe>
    </VeltCommentsSidebarEmptyPlaceholderWireframe>

    <VeltCommentsSidebarFocusedThreadWireframe>
      <VeltIf condition="{focusedAnnotation}">
        <div className="my-focused">
          <button>Back</button>
          <h3><VeltData field="focusedAnnotation.from.name" /></h3>
          <p><VeltData field="focusedAnnotation.comments.0.commentText" /></p>
        </div>
      </VeltIf>
    </VeltCommentsSidebarFocusedThreadWireframe>
  </VeltCommentsSidebarWrapperWireframe>
</VeltCommentsSidebarWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-comments-sidebar-wireframe>
  <velt-comments-sidebar-wrapper-wireframe>
    <velt-comment-sidebar-header-wireframe>
      <velt-comments-sidebar-filter-button-wireframe
        velt-class="'has-filters': {appliedFiltersCount} > 0">
        Filter
      </velt-comments-sidebar-filter-button-wireframe>
    </velt-comment-sidebar-header-wireframe>
    <velt-comment-sidebar-list-wireframe></velt-comment-sidebar-list-wireframe>
    <velt-comments-sidebar-empty-placeholder-wireframe
      velt-if="{componentConfig.noCommentsFound} || {componentConfig.noCommentsFoundForAppliedFilters}">
    </velt-comments-sidebar-empty-placeholder-wireframe>
  </velt-comments-sidebar-wrapper-wireframe>
</velt-comments-sidebar-wireframe>
```

**List data:**

```typescript
// On any <velt-comments-sidebar-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // shared per-sidebar config signal
```

**1. DO NOT drop the `componentConfig.` prefix on flat properties.** The sidebar is hybrid — mapped names (`focusedAnnotation`, `appliedFiltersCount`, `annotation`, `user`, `darkMode`, `variant`, `unreadCommentAnnotationCount`, …) resolve as bare short names; **everything else** lives flat on `componentConfig`. `<velt-data field="skeletonLoading" />` returns nothing — use `<velt-data field="componentConfig.skeletonLoading" />`. Similarly: `componentConfig.virtualScrollData`, `componentConfig.moreFiltersVisible`, `componentConfig.filterConfig.layout`, `componentConfig.noCommentsFound`, …
**2. DO NOT reference `focusedAnnotation` outside the focused-thread subtree.** It's loop-scope — only resolves inside `<velt-comments-sidebar-focused-thread-wireframe>` (and the focused-thread-dialog container). Referencing it from the list or filter panel returns `undefined`.
**3. DO NOT confuse `componentConfig.noCommentsFound` with `componentConfig.noCommentsFoundForAppliedFilters`.** The first is "no annotations exist on the document"; the second is "filters reduced the list to zero". Empty-state copy + the reset-filter button should branch on the second.
**4. DO NOT confuse the two prefixes.** Both `<velt-comments-sidebar-...>` (plural, sidebar-level) and `<velt-comment-sidebar-...>` (singular, header / search / list-level) appear in the catalog. The format guide is consistent inside each subtree — copy the tag name exactly from the docs source; don't infer.
**5. DO NOT bind `componentConfig.openMoreFilters` / `toggleMoreFilters` with `velt-data`.** They are callback functions — wire them into a custom click handler in your host code, not into the template-variable resolver.
**6. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.
**7. DO NOT compare `selectedMinimalFilterDropdownOption.filter` directly to a boolean.** It is a string (`'all'`, `'open'`, `'resolved'`, `'read'`, `'unread'`, `'assigned-to-me'`). Compare with `===` inside the per-row gate: `velt-class="'selected': '{selectedMinimalFilterDropdownOption.filter} === \'open\''"`.
**8. DO NOT remount the sidebar to switch between docked / floating / page-mode / embed layouts.** `componentConfig.floatingMode` / `componentConfig.pageMode` / `componentConfig.embedMode` / `componentConfig.fullScreen` are exposed as variables — toggle classes with `velt-class`, don't unmount.

---

### 13.6 Bind Comment Tool Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives dynamic content, conditional rendering, and class toggling inside the Comment Tool wireframe without reimplementing add-comment-mode state on top of the SDK)**

The Comment Tool wireframe (`<velt-comment-tool-wireframe>` / `<VeltCommentToolWireframe>`) exposes a flat-config variable surface that you read with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these to drive add-comment-mode styling instead of subscribing to SDK state and re-rendering from your component.

The Comment Tool uses the **explicit-path** form of the variable system: read values via `globalConfig.featureState.<name>` (cross-document) and `componentConfig.data.<name>` / `componentConfig.uiState.<name>` (per-instance). A flat compatibility shape is also exposed — `{commentToolEnabled}`, `{addCommentMode}`, and `{disabled}` resolve with no prefix — but the full path is canonical and never ambiguous.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer that sits on top of that structure.

**Incorrect (rebuilding tool state from `useVeltClient` and conditionally remounting the wireframe):**

```jsx
import { useVeltClient } from '@veltdev/react';
import { VeltCommentToolWireframe } from '@veltdev/react';

function CommentToolButton() {
  const client = useVeltClient();
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Reimplements addCommentMode + commentToolEnabled tracking
    // that the wireframe already exposes as variables.
    const sub = client?.getCommentElement().getAddCommentModeState().subscribe(setActive);
    return () => sub?.unsubscribe();
  }, [client]);

  if (!enabled) return null;
  return (
    <VeltCommentToolWireframe>
      <button className={active ? 'my-tool active' : 'my-tool'}>
        {active ? 'Click anywhere…' : 'Add comment'}
      </button>
    </VeltCommentToolWireframe>
  );
}
```

**Correct (read the slot's variables via `velt-data` / `veltIf` / `veltClass`):**

```jsx
import { VeltCommentToolWireframe } from '@veltdev/react';

<VeltCommentToolWireframe veltClass="'active': {addCommentMode}, 'disabled': '!{commentToolEnabled}'">
  <button className="my-comment-button">
    <VeltIf condition="{addCommentMode}"><span>Click anywhere…</span></VeltIf>
    <VeltIf condition="!{addCommentMode}"><span>Add comment</span></VeltIf>
  </button>
</VeltCommentToolWireframe>
```

**HTML / web-component equivalent:**

```typescript
<velt-comment-tool-wireframe>
  <button class="my-tool"
          velt-class="'is-active': {addCommentMode}, 'is-off': '!{commentToolEnabled}'">
    <svg class="my-tool__icon"></svg>
    <span velt-if="!{addCommentMode}">Add comment</span>
    <span velt-if="{addCommentMode}">Click anywhere to comment</span>
  </button>
</velt-comment-tool-wireframe>
// On <velt-comment-tool-wireframe> in an Angular template
[componentConfigSignal]="config()"      // featureState, data, uiState
[parentLocalUIState]="localUI()"        // darkMode, variant, shadowDom
```

The Comment Tool exposes a flat-config surface with three explicit prefixes. The flat compatibility names (right column) resolve to the same values.
**Global feature state** (`globalConfig.featureState.*` — workspace-level capability flags):
| Variable | Type | Flat alias | Notes |
|---|---|---|---|
| `globalConfig.featureState.commentToolEnabled` | `boolean` | `{commentToolEnabled}` | Tool enabled at the workspace level. Gate the inner button with `velt-class="'is-off': '!{commentToolEnabled}'"`. |
| `globalConfig.featureState.addCommentMode` | `boolean` | `{addCommentMode}` | Add-comment mode is active — next click anywhere drops a pin. |
| `globalConfig.featureState.popoverMode` | `boolean` | — | Popover comment mode is enabled. |
| `globalConfig.featureState.groupMatchedComments` | `boolean` | — | Matched comments are grouped on the page. |
**Per-instance data** (`componentConfig.data.*` — annotation context bound to this tool instance):
| Variable | Type | Notes |
|---|---|---|
| `componentConfig.data.commentAnnotationAvailable` | `boolean` | An annotation is currently associated with this tool instance. |
| `componentConfig.data.context` | `object \| null` | Free-form annotation context (read sub-fields with bracket / dotted paths). |
| `componentConfig.data.contextOptions` | `ContextOptions \| null` | Context-options config for the next annotation. |
| `componentConfig.data.folderId` | `string \| null` | Folder this tool drops annotations into. |
| `componentConfig.data.veltFolderId` | `string \| null` | Velt-managed folder id (when no client folder is set). |
| `componentConfig.data.clientDocumentId` | `string \| null` | Client-supplied document id. |
| `componentConfig.data.documentId` | `string \| null` | Resolved document id for this instance. |
| `componentConfig.data.locationId` | `string \| null` | Location id this tool is scoped to. |
| `componentConfig.data.targetElementId` | `string \| null` | DOM target the next annotation will anchor onto. |
| `componentConfig.data.sourceId` | `string \| null` | Source id from the host application. |
| `componentConfig.data.disabled` | `boolean` | Tool is disabled by host configuration. Flat alias: `{disabled}`. |
**Per-instance UI state** (`componentConfig.uiState.*`):
| Variable | Type | Notes |
|---|---|---|
| `componentConfig.uiState.showDefaultBtn` | `boolean` | Default built-in button should render. Set to `false` when a wireframe overrides the button. |
| `componentConfig.uiState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled. Set on the host element, not from inside the wireframe. |
| `componentConfig.uiState.darkMode` | `boolean` | Dark mode is active for this instance. |
| `componentConfig.uiState.addCommentMode` | `boolean` | Per-instance mirror of the global add-comment-mode flag. |
| `componentConfig.uiState.contextInPageModeComposer` | `boolean` | Tool is rendering inside a page-mode composer. |
| `componentConfig.uiState.commentToolEnabled` | `boolean` | Per-instance mirror of the global enabled flag. |
**Parent local UI state** (`parentLocalUIState.*` — host-attribute mirrors):
| Variable | Type | Notes |
|---|---|---|
| `parentLocalUIState.darkMode` | `boolean` | Local dark-mode flag (set on the host element). |
| `parentLocalUIState.variant` | `string` | Per-instance variant tag from the host element. |
| `parentLocalUIState.shadowDom` | `boolean` | Local shadow-DOM flag. |
The Comment Tool has a single wireframe primitive — the tool button itself.
| Public element | Wireframe tag | React component |
|---|---|---|
| `<velt-comments-tool>` | `<velt-comment-tool-wireframe>` *(singular)* | `<VeltCommentToolWireframe>` |
Children of `<VeltCommentToolWireframe>` are the host-app markup the customer supplies — there are no sub-component slots. The inner default button paints these classes automatically: `velt-comment-tool`, `velt-tool--action-btn`, `active` (when `addCommentMode`), `velt-tool--action-btn-disabled` (when `!commentToolEnabled`), `velt-tool--action-btn-icon`, `velt-comment-tool--custom-btn`.
| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. The root tool always renders by default; the disabled state is rendered via a CSS class, not an unmount, so `defaultCondition` is rarely needed here. |
**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):
The root `<velt-comments-tool>` element additionally accepts host attributes that map onto local UI state: `dark-mode`, `variant`, `shadow-dom`.
| Slot | `shouldShow` |
|---|---|
| `comment-tool-wireframe` (root) | Always renders. The *inner default button* visually disables (does not unmount) when `commentToolEnabled === false`. |
If you want the tool to disappear entirely when disabled, gate it yourself: `velt-if="{commentToolEnabled}"`.
**1. DO NOT confuse `commentToolEnabled` with `addCommentMode`.** `commentToolEnabled` is the workspace capability flag (can the tool be used at all). `addCommentMode` is the transient state (is the user about to drop a pin). Style with `addCommentMode`; gate visibility with `commentToolEnabled`.
**2. DO NOT subscribe to SDK state to drive the button.** The wireframe injects `addCommentMode` and `commentToolEnabled` automatically. Reading them via the host signal and re-rendering breaks the wireframe contract and double-paints state.
**3. DO NOT pass `componentConfig.uiState.shadowDom` through the wireframe.** `shadowDom` is a host-element attribute (`shadow-dom="true"` on `<velt-comments-tool>`), not a wireframe-bound knob.
**4. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal gate (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

---

### 13.7 Bind Inline Comments Section Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives skeleton-loader state, filter/sort dropdown rendering, per-status filter rows, composer placeholders, and target-element wiring inside the Inline Comments Section wireframe without re-subscribing to annotation state)**

The Inline Comments Section wireframe family (`<velt-inline-comments-section-...-wireframe>` / `<VeltInlineCommentsSectionWireframe.*>`) renders a list of annotations scoped to a target DOM element, plus its filter / sort dropdowns and a per-section composer. It iterates `annotations` and mounts the standard Comment Dialog primitives for each — variables that resolve inside those nested dialog tags are documented in `wireframe-variables-comment-dialog.md`.

Read the wireframe's exposed variables with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing skeleton tracking, filter/sort state, or annotation iteration on top of `useCommentAnnotations`. Variables are mapped — reference them by their short name, except for the four conflicting names that **must** be read via their explicit path.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. For the Inline Comments mode itself (setup, target-element wiring, multi-thread layout), see `mode/mode-inline-comments.md`.

**Incorrect (rebuilding section state from `useCommentAnnotations` and conditionally mounting slots):**

```jsx
import { useCommentAnnotations } from '@veltdev/react';
import { VeltInlineCommentsSectionWireframe } from '@veltdev/react';
import { useState } from 'react';

function Section({ targetElementId }) {
  const all = useCommentAnnotations();
  // Reimplements filter + sort + skeleton tracking the wireframe already exposes.
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');
  const annotations = all?.filter(a => a.targetElementId === targetElementId);
  if (loading) return <div className="skel" />;
  return (
    <VeltInlineCommentsSectionWireframe>
      <span>{annotations.length} comments</span>
      {annotations.map(a => <div key={a.annotationId}>{a.comments[0]?.commentText}</div>)}
    </VeltInlineCommentsSectionWireframe>
  );
}
```

**Correct (read the slot's injected variables; let `List` iterate for you):**

```jsx
import { VeltInlineCommentsSectionWireframe } from '@veltdev/react';

<VeltInlineCommentsSectionWireframe
  veltClass="'dark': {darkMode}, 'readonly': {featureState.readOnly}, 'composer-{composerPosition}': true">
  <VeltInlineCommentsSectionWireframe.Skeleton veltIf="{skeletonLoading}" />

  <header className="my-section__header">
    <VeltInlineCommentsSectionWireframe.CommentCount>
      <VeltData field="annotations.length" /> comments
    </VeltInlineCommentsSectionWireframe.CommentCount>

    <VeltInlineCommentsSectionWireframe.FilterDropdown.Trigger
      veltClass="'open': {filterState.filterDropdownOpen}">
      <span>Filter (<VeltData field="filterState.filters.length" />)</span>
    </VeltInlineCommentsSectionWireframe.FilterDropdown.Trigger>

    <VeltInlineCommentsSectionWireframe.SortingDropdown.Trigger>
      <span>Sort: <VeltData field="sortState.activeSortOption" /></span>
    </VeltInlineCommentsSectionWireframe.SortingDropdown.Trigger>
  </header>

  <VeltInlineCommentsSectionWireframe.List />
  <VeltInlineCommentsSectionWireframe.ComposerContainer />
</VeltInlineCommentsSectionWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-inline-comments-section-wireframe>
  <velt-inline-comments-section-skeleton-wireframe velt-if="{skeletonLoading}"></velt-inline-comments-section-skeleton-wireframe>
  <header class="my-section__header">
    <velt-inline-comments-section-comment-count-wireframe>
      <velt-data field="annotations.length"></velt-data> comments
    </velt-inline-comments-section-comment-count-wireframe>
    <velt-inline-comments-section-filter-dropdown-trigger-wireframe
      velt-class="'open': {filterState.filterDropdownOpen}">
      <span>Filter (<velt-data field="filterState.filters.length"></velt-data>)</span>
    </velt-inline-comments-section-filter-dropdown-trigger-wireframe>
  </header>
  <velt-inline-comments-section-list-wireframe></velt-inline-comments-section-list-wireframe>
  <velt-inline-comments-section-composer-container-wireframe></velt-inline-comments-section-composer-container-wireframe>
</velt-inline-comments-section-wireframe>
```

**App State** — identity:
| Variable | Type | Notes |
|---|---|---|
| `user` | `User` | Currently identified end-user. |
**Data State** — annotations + composer + statuses:
| Variable | Type | Notes |
|---|---|---|
| `annotations` | `CommentAnnotation[]` | Annotations rendered after filter / sort. Drives the count badge and the `List` iteration. |
| `allAnnotations` | `CommentAnnotation[]` | Unfiltered list scoped to the section's target element. |
| `composerCommentAnnotation` | `CommentAnnotation \| undefined` | Draft annotation being composed in this section. Gate the composer with `velt-if="{composerCommentAnnotation}"` when you need to know it exists. |
| `statuses` | `CustomStatus[]` | Available status options for the filter dropdown. |

**Root + structural:**

```typescript
// On any <velt-inline-comments-section-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // annotations, statuses, filterState, sortState, ...
[parentLocalUIState]="localUI()"     // darkMode, variant, shadowDom, dialogVariant, ...
```

The root `<velt-inline-comments-section>` element additionally accepts host attributes that map onto config and local UI state: `target-element-id`, `folder-id`, `document-id`, `location-id`, `context`, `dialog-variant`, `composer-variant`, `composer-position`, `comment-placeholder` / `reply-placeholder` / `composer-placeholder` / `edit-placeholder`, `multi-thread`, `full-expanded`, `read-only`, `message-truncation`, `message-truncation-lines`, `dark-mode`, `variant`, `shadow-dom`.
**1. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.annotations.length" />` resolves to nothing — use `<velt-data field="annotations.length" />`. The exception is the four conflicting names above, which **require** their explicit path.
**2. DO NOT read `readOnly` / `messageTruncation` / `messageTruncationLines` at the short name when you mean the workspace-wide flag.** The short names are the per-instance local copies; the workspace flags live under `featureState.*`. They can disagree.
**3. DO NOT remount the section to switch between filter values.** `filterState.filters`, `sortState.sortBy`, and `sortState.sortOrder` are exposed as variables — toggle classes with `velt-class`, do not unmount.
**4. DO NOT iterate `annotations` yourself.** The `<velt-inline-comments-section-list-wireframe>` iterates and mounts the standard Comment Dialog primitives per annotation, injecting the per-annotation context that nested dialog tags read.
**5. DO NOT compare `selectedAnnotationsMap` to a boolean directly.** It is a map. Bracket-lookup the current annotation: `{selectedAnnotationsMap[annotation.annotationId]}` (inside an iteration where `annotation` is in scope).
**6. DO NOT reference `filter` / `sortOption` / `sortOptionText` / `isActive` / `isAscending` outside their owning dropdown row tag.** They are loop-scoped — referencing them from the header or the list returns `undefined`.
**7. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

---

### 13.8 Bind Multithread Comments Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives thread-count display, empty-state placeholders, minimal filter/sort + bulk-actions dropdown rendering, and anchor-annotation composer gating inside the Multithread Comments wireframe without re-implementing thread iteration)**

The Multithread Comments wireframe family (`<velt-multi-thread-comment-dialog-...-wireframe>` / `<VeltMultiThreadCommentDialogWireframe.*>`) hosts multiple comment threads in a single panel — it iterates `filteredAnnotations` and mounts the standard Comment Dialog primitives for each. Variables that resolve inside those nested dialog tags are documented in `wireframe-variables-comment-dialog.md`.

Read the wireframe's exposed variables with three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of re-implementing thread counts, filter/sort rows, or composer visibility on top of `useCommentAnnotations`. Variables are mapped — reference them by their short name, except for two conflicting names that **must** be read via their explicit path.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`.

**Incorrect (rebuilding the panel state from `useCommentAnnotations`):**

```jsx
import { useCommentAnnotations } from '@veltdev/react';
import { VeltMultiThreadCommentDialogWireframe } from '@veltdev/react';
import { useState } from 'react';

function Panel() {
  const all = useCommentAnnotations();
  // Reimplements filter + sort + non-draft count the wireframe already exposes.
  const [filter, setFilter] = useState('all');
  const filtered = all?.filter(a => filter === 'all' || (filter === 'unread' && a.unread));
  const count = filtered?.filter(a => !a.draft).length ?? 0;
  return (
    <VeltMultiThreadCommentDialogWireframe>
      <span>{count} threads</span>
      {filtered?.length === 0 && <p>No threads to show.</p>}
      {filtered?.map(a => <div key={a.annotationId}>{a.comments[0]?.commentText}</div>)}
    </VeltMultiThreadCommentDialogWireframe>
  );
}
```

**Correct (read the slot's injected variables; let `List` iterate for you):**

```jsx
import { VeltMultiThreadCommentDialogPanelWireframe, VeltMultiThreadCommentDialogWireframe } from '@veltdev/react';

<VeltMultiThreadCommentDialogPanelWireframe
  veltClass="'dark': {darkMode}, 'readonly': {readOnly}, 'inbox': {inboxMode}, 'filter-{minimalFilter}': true">
  <header className="my-mt__header">
    <VeltMultiThreadCommentDialogWireframe.CommentCount>
      <VeltData field="nonDraftCommentsCount" /> threads
    </VeltMultiThreadCommentDialogWireframe.CommentCount>
    <VeltMultiThreadCommentDialogWireframe.MinimalFilterDropdown.Trigger
      veltClass="'open': {minimalFilterDropdownOpen}">
      <span><VeltData field="minimalFilter" /></span>
    </VeltMultiThreadCommentDialogWireframe.MinimalFilterDropdown.Trigger>
  </header>

  <VeltMultiThreadCommentDialogWireframe.List />

  <VeltMultiThreadCommentDialogWireframe.EmptyPlaceholder
    veltIf="{noCommentsFound} || {noCommentsFoundForAppliedFilters}">
    <p>No threads to show.</p>
    <VeltMultiThreadCommentDialogWireframe.ResetFilterButton />
  </VeltMultiThreadCommentDialogWireframe.EmptyPlaceholder>

  <VeltMultiThreadCommentDialogWireframe.ComposerContainer
    veltIf="!{hideMultiThreadAnnotationComposer}" />
</VeltMultiThreadCommentDialogPanelWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-multi-thread-comment-dialog-panel-wireframe>
  <header class="my-mt__header">
    <velt-multi-thread-comment-dialog-comment-count-wireframe>
      <velt-data field="nonDraftCommentsCount"></velt-data> threads
    </velt-multi-thread-comment-dialog-comment-count-wireframe>
    <velt-multi-thread-comment-dialog-minimal-filter-dropdown-trigger-wireframe
      velt-class="'open': {minimalFilterDropdownOpen}">
      <span><velt-data field="minimalFilter"></velt-data></span>
    </velt-multi-thread-comment-dialog-minimal-filter-dropdown-trigger-wireframe>
  </header>
  <velt-multi-thread-comment-dialog-list-wireframe></velt-multi-thread-comment-dialog-list-wireframe>
  <velt-multi-thread-comment-dialog-empty-placeholder-wireframe
    velt-if="{noCommentsFound} || {noCommentsFoundForAppliedFilters}">
    <p>No threads to show.</p>
    <velt-multi-thread-comment-dialog-reset-filter-button-wireframe></velt-multi-thread-comment-dialog-reset-filter-button-wireframe>
  </velt-multi-thread-comment-dialog-empty-placeholder-wireframe>
  <velt-multi-thread-comment-dialog-composer-container-wireframe
    velt-if="!{hideMultiThreadAnnotationComposer}"></velt-multi-thread-comment-dialog-composer-container-wireframe>
</velt-multi-thread-comment-dialog-panel-wireframe>
```

**Data State** — annotation list + focus + host wiring:
| Variable | Type | Notes |
|---|---|---|
| `annotation` / `annotation.annotationId` | `CommentAnnotation \| null` | Currently focused annotation. Gate with `velt-if="{annotation}"`. |
| `annotations` | `CommentAnnotation[]` | All annotations in scope. |
| `filteredAnnotations` | `CommentAnnotation[]` | Annotations after filter / sort. Drives the `List` iteration. |
| `multiThreadAnnotationId` | `string \| null` | Id of the multi-thread anchor annotation. |
| `multiThreadCommentAnnotation` | `CommentAnnotation` | Anchor annotation object. |
| `nonDraftCommentsCount` | `number` | Count of non-draft threads — drives the count label. |
| `data.user` | `User \| null` | Currently identified end-user. Use the explicit `data.user` path — `user` is a conflicting name. |
| `containerComponentId` | `string \| null` | Owning container id (host wiring). |
| `context` | `any` | Free-form annotation context. |
| `data.contextId` | `string \| null` | Context id linking this dialog to a host context. |

**Root + structural:**

```typescript
// On any <velt-multi-thread-comment-dialog-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // annotations, filteredAnnotations, minimalFilter, ...
[parentLocalUIState]="localUI()"     // darkMode, variant, shadowDom
```

| Slot | `shouldShow` |
|---|---|
| `empty-placeholder-wireframe` | `noCommentsFound \|\| noCommentsFoundForAppliedFilters` |
| `reset-filter-button-wireframe` | `noCommentsFoundForAppliedFilters` |
| `composer-container-wireframe` | `!hideMultiThreadAnnotationComposer` |
Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML).
**1. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.nonDraftCommentsCount" />` resolves to nothing — use `<velt-data field="nonDraftCommentsCount" />`. The exception is the two conflicting names above, which **require** their explicit path (`data.user`, `parentLocalUIState.shadowDom` / `uiState.shadowDom`).
**2. DO NOT read `user` directly inside a Multithread Comments wireframe.** `user` is a conflicting name — use `data.user` (and `data.user.name`, `data.user.photoUrl`).
**3. DO NOT compute the thread count from `annotations.length` or `filteredAnnotations.length`.** The display value is `nonDraftCommentsCount` — it excludes in-progress drafts and matches what the default UI shows.
**4. DO NOT show the empty placeholder with only `velt-if="{noCommentsFound}"`.** It must also cover the filtered case: `velt-if="{noCommentsFound} || {noCommentsFoundForAppliedFilters}"`. Otherwise the placeholder disappears as soon as the user applies a filter that yields zero results.
**5. DO NOT show the reset-filter button outside the filtered-empty case.** Its `shouldShow` is specifically `noCommentsFoundForAppliedFilters` — `noCommentsFound` (truly empty) should not offer "reset filter" since no filter is to blame.
**6. DO NOT reference `isSelected` outside a filter / sort row tag.** It is loop-scoped — referencing it from the panel root or trigger returns `undefined`.
**7. DO NOT iterate `filteredAnnotations` yourself.** The `<velt-multi-thread-comment-dialog-list-wireframe>` iterates and mounts the standard Comment Dialog primitives per annotation, injecting the per-annotation context that nested dialog tags read.
**8. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

---

### 13.9 Bind Text Comment Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives word/character-count display, capability gating, position offsets, and AI-rewriter visibility inside the Text Comment toolbar wireframes without re-implementing selection tracking)**

The Text Comment wireframe family (`<velt-text-comment-...-wireframe>` / `<VeltTextCommentToolWireframe>`, `<VeltTextCommentToolbarWireframe>`) powers the floating toolbar that appears next to selected text. Read its injected variables with the three directives — `<velt-data field="...">` for text, `velt-if="{var} ..."` for conditional rendering, and `velt-class="'cls': {var}"` for class toggling. Use these instead of subscribing to selection / rewriter state by hand. Variables are mapped — reference them by their short name (`selectedWordsCount`, `showAdder`, `rewriterEnabled`), with a small set of conflicting names that **must** be read via their explicit path.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. For the Text Comment mode itself (setup, allowed elements, rewriter wiring), see `mode/mode-text-comments.md` if present, or the Text Comment overview docs.

Do not re-implement selection state and gate the toolbar from the host component. The wireframe already exposes `showAdder`, `selectedWordsCount`, `isUserAllowed`, and `rewriterEnabled` as injected variables. Manual `selectionchange` subscriptions break the wireframe contract.

**Correct (read the slot's injected variables via `velt-data` / `veltIf` / `veltClass`):**

```jsx
import { VeltTextCommentToolWireframe, VeltTextCommentToolbarWireframe } from '@veltdev/react';

<VeltTextCommentToolWireframe
  veltClass="'has-words': {selectedWordsCount} > 0">
  <span><VeltData field="selectedWordsCount" /> words selected</span>
  <VeltTextCommentToolbarWireframe>
    <VeltTextCommentToolbarWireframe.CommentAnnotation>
      Comment
    </VeltTextCommentToolbarWireframe.CommentAnnotation>
    <VeltTextCommentToolbarWireframe.Copywriter veltIf="{rewriterEnabled}">
      Rewrite with AI
    </VeltTextCommentToolbarWireframe.Copywriter>
  </VeltTextCommentToolbarWireframe>
</VeltTextCommentToolWireframe>
```

**HTML / web-component equivalent:**

```typescript
<velt-text-comment-tool-wireframe
  velt-if="{isUserAllowed} && {enableTextComments}"
  velt-class="'has-words': {selectedWordsCount} > 0">
  <span class="my-tool__count">
    <velt-data field="selectedWordsCount"></velt-data> words
  </span>
  <velt-text-comment-toolbar-wireframe>
    <velt-text-comment-toolbar-comment-annotation-wireframe>
      Comment
    </velt-text-comment-toolbar-comment-annotation-wireframe>
    <velt-text-comment-toolbar-copywriter-wireframe velt-if="{rewriterEnabled}">
      Rewrite with AI
    </velt-text-comment-toolbar-copywriter-wireframe>
  </velt-text-comment-toolbar-wireframe>
</velt-text-comment-tool-wireframe>
// On any <velt-text-comment-...-wireframe> in an Angular template
[componentConfigSignal]="config()"      // position, selectedWordsCount,
                                         // selectedCharactersCount, data.user,
                                         // allowedElementIds, contextId
[parentLocalUIState]="localUI()"         // darkMode, variant, shadowDom
```

**Data State** — selection metrics, position, identity:
| Variable | Type | Notes |
|---|---|---|
| `position` / `position.top` / `position.left` | `{ top: number, left: number }` | Absolute viewport position of the floating toolbar. |
| `selectedWordsCount` | `number` | Words in the active selection. |
| `selectedCharactersCount` | `number` | Characters in the active selection. |
| `allowedElementIds` | `string[]` | Element ids the selection must originate from for the tool to render. |
| `contextId` | `string \| null` | Context id linking this tool to a host context. |
| `data.user` | `User \| null` | Currently identified end-user. Use the explicit `data.user` path — `user` is a conflicting name (see below). |
**UI State** — per-instance flags + min/max thresholds:
| Variable | Type | Notes |
|---|---|---|
| `showAdder` | `boolean` | Floating "add comment" adder is visible for the current selection. |
| `commentToolEnabled` | `boolean` | Comment Tool is enabled at the workspace level. |
| `isUserAllowed` | `boolean` | Current user has permission to add text comments. |
| `enableTextComments` | `boolean` | Text Comments feature is enabled by config. |
| `rewriterEnabled` | `boolean` | AI rewriter feature is enabled. |
| `rewriterDefaultUIEnabled` | `boolean` | Default rewriter UI should render (vs. a custom one). |
| `MIN_ALLOWED_WORDS_COUNT` | `number` | Minimum words before the toolbar shows. |
| `MIN_ALLOWED_CHARACTERS_COUNT` | `number` | Minimum characters before the toolbar shows. |
| `MAX_ALLOWED_CHARACTERS_COUNT` | `number` | Maximum characters before the toolbar hides. |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string` | Per-instance variant tag from the host element. |
| `uiState.disabled` | `boolean` | Tool is disabled by host configuration. Use the full path — `disabled` is conflicting. |
| `uiState.left` | `number` | Raw horizontal offset (before `position` resolution). Use the full path — `left` is conflicting. |
| `uiState.isPlanExpired` | `boolean` | Workspace plan is expired. Use the full path — `isPlanExpired` is conflicting. |
| `parentLocalUIState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled. Set via the `shadow-dom` host attribute — the variable only reports state. |
Five names collide with mappings used by Comment Dialog. Inside a Text Comment wireframe, prefer the explicit path:
| Conflicting name | Use this in Text Comment |
|---|---|
| `user` | `data.user` |
| `disabled` | `uiState.disabled` |
| `left` | `uiState.left` |
| `isPlanExpired` | `uiState.isPlanExpired` |
| `shadowDom` | `parentLocalUIState.shadowDom` |
The Text Comment family has a root tool plus a toolbar with four action slots.
| Wireframe tag | React component | Notes |
|---|---|---|
| `<velt-text-comment-wireframe>` | — | Outer wireframe — wraps the tool. |
| `<velt-text-comment-tool-wireframe>` | `<VeltTextCommentToolWireframe>` | The floating tool. `shouldShow` requires an active selection inside an allowed element with word/char counts in range. |
| `<velt-text-comment-toolbar-wireframe>` | `<VeltTextCommentToolbarWireframe>` | Toolbar wrapper that hosts the action buttons. |
| `<velt-text-comment-toolbar-comment-annotation-wireframe>` | `<VeltTextCommentToolbarWireframe.CommentAnnotation>` | "Comment" action — attaches a new annotation to the selection. |
| `<velt-text-comment-toolbar-copywriter-wireframe>` | `<VeltTextCommentToolbarWireframe.Copywriter>` | AI-rewrite action. `shouldShow` requires `rewriterEnabled === true`. |
| `<velt-text-comment-toolbar-generic-wireframe>` | `<VeltTextCommentToolbarWireframe.Generic>` | Generic, customizable position for an extra button. |
| `<velt-text-comment-toolbar-divider-wireframe>` | `<VeltTextCommentToolbarWireframe.Divider>` | Vertical separator between toolbar items. |
| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show the Copywriter button when `rewriterEnabled` is false, or the tool itself outside the min/max range. |
**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):
The root `<velt-text-comment>` element additionally accepts host attributes that map onto local UI state: `dark-mode`, `variant`, `shadow-dom`.
| Slot | `shouldShow` |
|---|---|
| `text-comment-tool-wireframe` (root) | Active selection inside an `allowedElementIds` element **and** `selectedWordsCount >= MIN_ALLOWED_WORDS_COUNT` **and** `selectedCharactersCount` between `MIN_ALLOWED_CHARACTERS_COUNT` and `MAX_ALLOWED_CHARACTERS_COUNT`. |
| `text-comment-toolbar-copywriter-wireframe` | `rewriterEnabled === true` |
Override either with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.
**1. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.selectedWordsCount" />` resolves to nothing — use `<velt-data field="selectedWordsCount" />`. The exception is the five conflicting names above, which **require** their explicit path (`data.user`, `uiState.disabled`, `uiState.left`, `uiState.isPlanExpired`, `parentLocalUIState.shadowDom`).
**2. DO NOT read `user` directly inside a Text Comment wireframe.** `user` is mapped elsewhere — use `data.user` (and `data.user.name`, `data.user.photoUrl`, etc.) to read the identified end-user here.
**3. DO NOT gate the Copywriter button with only `velt-if="{rewriterEnabled}"` when you also want the default UI hidden.** The toolbar slot's own `shouldShow` covers `rewriterEnabled`. If you are providing a custom rewriter UI, check `rewriterDefaultUIEnabled` separately — they are not the same flag.
**4. DO NOT compute the toolbar position from `uiState.left` directly.** `uiState.left` is the raw value before resolution; the placed `position` / `position.left` is what the tool actually uses for layout.
**5. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.
**6. DO NOT bind to `parentLocalUIState.shadowDom` from inside the wireframe to *enable* shadow-DOM.** Shadow-DOM is set via the host attribute `shadow-dom="true"` on `<velt-text-comment>`. The variable only reports the current state.

---

## References

- https://docs.velt.dev
- https://docs.velt.dev/async-collaboration/comments/overview
- https://docs.velt.dev/get-started/quickstart
- https://docs.velt.dev/ui-customization/overview
- https://console.velt.dev
- https://docs.velt.dev/ui-customization/features/async/comments/comment-bubble/wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/comments/comment-tool-wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/comments/inline-comments-section/wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/comments/multithread-comments/wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/comments/text-comment-wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/comments/autocomplete-wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar-button/wireframe-variables
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-wireframe-variables
