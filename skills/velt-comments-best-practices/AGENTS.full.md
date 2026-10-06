# Velt Comments Best Practices

**Version 1.4.2**  
Velt  
October 2026

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

2. [REST API](#2-rest-api) — **HIGH**
   - 2.1 [REST API — Agent Comment Annotations (Create, Read, Filter)](#21-rest-api-agent-comment-annotations-create-read-filter)
   - 2.2 [REST API — Comment Annotation CRUD](#22-rest-api-comment-annotation-crud)
   - 2.3 [REST API — Individual Comment CRUD Within Annotations](#23-rest-api-individual-comment-crud-within-annotations)

3. [Comment Modes](#3-comment-modes) — **HIGH**
   - 3.1 [Add Comments to Canvas/Drawing Applications](#31-add-comments-to-canvasdrawing-applications)
   - 3.2 [Add Comments to ChartJS Charts](#32-add-comments-to-chartjs-charts)
   - 3.3 [Add Comments to Custom Charts with Manual Positioning](#33-add-comments-to-custom-charts-with-manual-positioning)
   - 3.4 [Add Comments to Nivo Charts](#34-add-comments-to-nivo-charts)
   - 3.5 [Add Data Point Comments to Highcharts](#35-add-data-point-comments-to-highcharts)
   - 3.6 [Integrate Comments with Ace Editor](#36-integrate-comments-with-ace-editor)
   - 3.7 [Integrate Comments with Apryse WebViewer](#37-integrate-comments-with-apryse-webviewer)
   - 3.8 [Integrate Comments with CodeMirror Editor](#38-integrate-comments-with-codemirror-editor)
   - 3.9 [Integrate Comments with Lexical Editor](#39-integrate-comments-with-lexical-editor)
   - 3.10 [Integrate Comments with Plate Editor](#310-integrate-comments-with-plate-editor)
   - 3.11 [Integrate Comments with Quill Editor](#311-integrate-comments-with-quill-editor)
   - 3.12 [Integrate Comments with SlateJS Editor](#312-integrate-comments-with-slatejs-editor)
   - 3.13 [Integrate Comments with TipTap Editor](#313-integrate-comments-with-tiptap-editor)
   - 3.14 [Add Frame-by-Frame Comments to Lottie Animations](#314-add-frame-by-frame-comments-to-lottie-animations)
   - 3.15 [Integrate Comments with Custom Video Player](#315-integrate-comments-with-custom-video-player)
   - 3.16 [Use Freestyle Mode for Pin-Anywhere Comments](#316-use-freestyle-mode-for-pin-anywhere-comments)
   - 3.17 [Use Inline Comments for Traditional Thread Style](#317-use-inline-comments-for-traditional-thread-style)
   - 3.18 [Use Page Mode for Page-Level Comments](#318-use-page-mode-for-page-level-comments)
   - 3.19 [Use Popover Mode for Table Cell Comments](#319-use-popover-mode-for-table-cell-comments)
   - 3.20 [Use Prebuilt Video Player for Quick Setup](#320-use-prebuilt-video-player-for-quick-setup)
   - 3.21 [Use Stream Mode for Google Docs-Style Comments](#321-use-stream-mode-for-google-docs-style-comments)
   - 3.22 [Use Text Mode for Text Highlight Comments](#322-use-text-mode-for-text-highlight-comments)

4. [Standalone Components](#4-standalone-components) — **MEDIUM-HIGH**
   - 4.1 [Use Comment Pin for Manual Position Control](#41-use-comment-pin-for-manual-position-control)
   - 4.2 [Use Comment Composer for Custom Comment Input](#42-use-comment-composer-for-custom-comment-input)
   - 4.3 [Use Comment Thread to Render Existing Comments](#43-use-comment-thread-to-render-existing-comments)
   - 4.4 [Use VeltCommentText to Attach a Known Annotation to Text in Your Markup](#44-use-veltcommenttext-to-attach-a-known-annotation-to-text-in-your-markup)

5. [Comment Surfaces](#5-comment-surfaces) — **MEDIUM-HIGH**
   - 5.1 [Comments Sidebar Setup, Modes, and Configuration](#51-comments-sidebar-setup-modes-and-configuration)
   - 5.2 [Use Comments Sidebar for Comment Navigation](#52-use-comments-sidebar-for-comment-navigation)
   - 5.3 [Use Sidebar Button to Toggle Comments Panel](#53-use-sidebar-button-to-toggle-comments-panel)
   - 5.4 [Use VeltCommentsSidebarV2 for Primitive-Architecture Sidebar Customization](#54-use-veltcommentssidebarv2-for-primitive-architecture-sidebar-customization)

6. [UI Customization](#6-ui-customization) — **MEDIUM**
   - 6.1 [Customize Comment Bubble Display](#61-customize-comment-bubble-display)
   - 6.2 [Customize Comment Dialog Appearance](#62-customize-comment-dialog-appearance)
   - 6.3 [Customize the Suggestion Card with Exported Primitives and Wireframes Only](#63-customize-the-suggestion-card-with-exported-primitives-and-wireframes-only)
   - 6.4 [Set defaultCondition on V2 Primitive Sub-Components to Control Default Rendering](#64-set-defaultcondition-on-v2-primitive-sub-components-to-control-default-rendering)
   - 6.5 [Use Standalone Autocomplete Primitives for Custom Autocomplete UIs](#65-use-standalone-autocomplete-primitives-for-custom-autocomplete-uis)
   - 6.6 [Use Wireframe Components for Custom UI](#66-use-wireframe-components-for-custom-ui)

7. [Data Model](#7-data-model) — **MEDIUM**
   - 7.1 [Filter and Group Comments](#71-filter-and-group-comments)
   - 7.2 [Work with Comment Annotations Data](#72-work-with-comment-annotations-data)
   - 7.3 [Add Custom Metadata to Comments with Context](#73-add-custom-metadata-to-comments-with-context)
   - 7.4 [Comments Data Type Reference — Core Models](#74-comments-data-type-reference-core-models)
   - 7.5 [Individual Comment CRUD — Add, Update, Delete, Get Comments Within Threads](#75-individual-comment-crud-add-update-delete-get-comments-within-threads)
   - 7.6 [Mark Comments as Read or Unread](#76-mark-comments-as-read-or-unread)
   - 7.7 [Programmatic Annotation CRUD — Create, Query, Delete Threads](#77-programmatic-annotation-crud-create-query-delete-threads)
   - 7.8 [Programmatic Composer Control — Submit, Clear, Read State](#78-programmatic-composer-control-submit-clear-read-state)
   - 7.9 [Render Custom Action Chips with Comment.actions and Handle commentActionClicked](#79-render-custom-action-chips-with-commentactions-and-handle-commentactionclicked)
   - 7.10 [Stream Multi-Step Work into a Comment with Comment.progress](#710-stream-multi-step-work-into-a-comment-with-commentprogress)
   - 7.11 [Use agentFields on CommentRequestQuery to Filter Annotation Count by Agent](#711-use-agentfields-on-commentrequestquery-to-filter-annotation-count-by-agent)
   - 7.12 [Use CommentActivityActionTypes for Type-Safe Comment Activity Filtering](#712-use-commentactivityactiontypes-for-type-safe-comment-activity-filtering)
   - 7.13 [Use Config-Based URL Endpoints Instead of Placeholder Callbacks in CommentAnnotationDataProvider](#713-use-config-based-url-endpoints-instead-of-placeholder-callbacks-in-commentannotationdataprovider)
   - 7.14 [Use triggerActivities to Create Activity Records via REST API](#714-use-triggeractivities-to-create-activity-records-via-rest-api)

8. [Debugging & Testing](#8-debugging-testing) — **LOW-MEDIUM**
   - 8.1 [Troubleshoot Common Velt Integration Issues](#81-troubleshoot-common-velt-integration-issues)
   - 8.2 [Verify Velt Comments Integration](#82-verify-velt-comments-integration)

9. [Moderation & Permissions](#9-moderation-permissions) — **LOW**
   - 9.1 [Combine Private Comments with Access Context as Two Independent Checks](#91-combine-private-comments-with-access-context-as-two-independent-checks)
   - 9.2 [Control Comment Visibility with Private Mode and Per-Annotation Updates](#92-control-comment-visibility-with-private-mode-and-per-annotation-updates)
   - 9.3 [Moderation & Permissions](#93-moderation-permissions)
   - 9.4 [Prefer Past-Tense Event Aliases commentToolClicked and sidebarButtonClicked in New Code](#94-prefer-past-tense-event-aliases-commenttoolclicked-and-sidebarbuttonclicked-in-new-code)
   - 9.5 [Register an Anonymous User Data Provider to Resolve Tagged Contact Emails to User IDs](#95-register-an-anonymous-user-data-provider-to-resolve-tagged-contact-emails-to-user-ids)
   - 9.6 [Show a Visibility Banner in the Comment Composer for Multi-Level Visibility Selection](#96-show-a-visibility-banner-in-the-comment-composer-for-multi-level-visibility-selection)
   - 9.7 [Use CommentDialogActionService.isSubmitInFlight() to Guard Against Duplicate Submits](#97-use-commentdialogactionserviceissubmitinflight-to-guard-against-duplicate-submits)
   - 9.8 [Use commentSaveTriggered for Immediate UI Feedback Before Async Save Completes](#98-use-commentsavetriggered-for-immediate-ui-feedback-before-async-save-completes)
   - 9.9 [Use isAnnotationPrivate() for Unified Visibility Routing](#99-use-isannotationprivate-for-unified-visibility-routing)
   - 9.10 [Use the commentSaved Event for Reliable Post-Persist Side-Effects](#910-use-the-commentsaved-event-for-reliable-post-persist-side-effects)

10. [Attachments & Reactions](#10-attachments-reactions) — **MEDIUM**
   - 10.1 [Attachments & Reactions](#101-attachments-reactions)
   - 10.2 [Control Attachment Download Behavior and Intercept Clicks](#102-control-attachment-download-behavior-and-intercept-clicks)

11. [Configuration](#11-configuration) — **MEDIUM**
   - 11.1 [Comment Moderation — Approve, Read-Only, and Suggestion Workflows](#111-comment-moderation-approve-read-only-and-suggestion-workflows)
   - 11.2 [Comment Navigation and Deep Linking](#112-comment-navigation-and-deep-linking)
   - 11.3 [Component Props API — VeltComments, VeltCommentDialog, VeltCommentsSidebar, VeltInlineCommentsSection](#113-component-props-api-veltcomments-veltcommentdialog-veltcommentssidebar-veltinlinecommentssection)
   - 11.4 [Configure @Mentions, Contacts, and User Assignment](#114-configure-mentions-contacts-and-user-assignment)
   - 11.5 [Configure Comment Attachments and File Uploads](#115-configure-comment-attachments-and-file-uploads)
   - 11.6 [Configure Comment Status and Priority Levels](#116-configure-comment-status-and-priority-levels)
   - 11.7 [Configure Emoji Reactions on Comments](#117-configure-emoji-reactions-on-comments)
   - 11.8 [Configure Rich Text Formatting in Comment Composer](#118-configure-rich-text-formatting-in-comment-composer)
   - 11.9 [Programmatic Sidebar Data, Filtering, and Configuration](#119-programmatic-sidebar-data-filtering-and-configuration)
   - 11.10 [Restrict Comment Placement to Specific DOM Elements](#1110-restrict-comment-placement-to-specific-dom-elements)
   - 11.11 [UI/UX Toggle Methods — Comment Display, Interaction, and Behavior](#1111-uiux-toggle-methods-comment-display-interaction-and-behavior)
   - 11.12 [Use accessModes in Sidebar Filters for Privacy-Based Filtering](#1112-use-accessmodes-in-sidebar-filters-for-privacy-based-filtering)

12. [Events](#12-events) — **MEDIUM**
   - 12.1 [Comment Lifecycle Events — Pin Clicks, Add Events, Button Clicks](#121-comment-lifecycle-events-pin-clicks-add-events-button-clicks)

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

> **Note:** The recommended path is `authProvider` on `VeltProvider`. The `useIdentify()` hook still exists, but prefer `authProvider` so token refresh is handled for you.

**Required User Object Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Unique user identifier |
| `organizationId` | string | Yes | Organization identifier |
| `name` | string | Yes | Display name |
| `email` | string | Yes | User email |
| `photoUrl` | string | No | Avatar URL |
| `color` | string | No | User color (e.g., "#FF6B6B") |
| `textColor` | string | No | Text color for contrast |

**Verification Checklist:**
- [ ] User object includes userId, organizationId, name, email
- [ ] authProvider is configured on VeltProvider
- [ ] Token generation is set up for production
- [ ] Authentication happens before document setup

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart - "Step 5: Authenticate Users"

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

**`SetDocumentsRequestOptions` fields:**

<!-- TODO (v5.0.2-beta.10): Verify exact type and default value of debounceTime and precise semantics of optimisticPermissions against the API reference once released. Release note text: "SetDocumentsRequestOptions — New debounceTime and optimisticPermissions fields". -->

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `locationId` | string | No | Scopes documents to a specific location |
| `rootDocumentId` | string | No | Sets a root document for hierarchical contexts |
| `context` | SetDocumentsContext | No | Additional context passed with the document set |
| `debounceTime` | number | No | Per-call debounce window in ms (default: 5000). Overrides the global debounce for this call only. |
| `optimisticPermissions` | boolean | No | When `false`, awaits server permission validation before returning permitted documents. When `true` (default), applies permissions optimistically. |

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

**Document ID Best Practices:**
- Use unique, stable identifiers (e.g., database record IDs)
- Keep IDs consistent across sessions for the same content
- Different document IDs create separate comment contexts

**Repeated calls (v6.0.5+):** Calling `setDocuments()` again with the same documents and options is ignored, so calling it on every render no longer re-initializes documents or refetches comments. An identical repeat also does not refresh permissions. Passing a different set, including a narrower one, re-runs the pipeline.

**Verification Checklist:**
- [ ] Document is set after user authentication
- [ ] Document ID is unique and stable
- [ ] setDocuments or useSetDocument is called
- [ ] Metadata includes descriptive documentName

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart - "Step 6: Initialize Document"
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setdocuments - setDocuments() (identical repeat calls ignored)

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

Add `'use client'` directive at the top of files containing Velt components:

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

**API Key Setup:**
1. Go to [console.velt.dev](https://console.velt.dev)
2. Create an account and get your API key
3. Add your domain to "Managed Domains" to whitelist it

**Verification Checklist:**
- [ ] VeltProvider wraps the entire app
- [ ] API key is valid and from Velt Console
- [ ] Domain is safelisted in Velt Console
- [ ] Next.js files have `'use client'` directive

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart - "Step 4: Initialize Velt"

---

## 2. REST API

**Impact: HIGH**

Server-side comment management via REST API, including agent comment annotations.

### 2.1 REST API — Agent Comment Annotations (Create, Read, Filter)

**Impact: HIGH (Let AI agents leave comments via REST API with the agent block, and read them back with agent-specific filters)**

Agent comments let AI agents participate in collaboration by leaving findings via the Add Comment Annotations REST API. The server stamps `sourceType: "agent"` on the annotation and renders it with Accept/Reject buttons in the Velt UI. Any agent that can make an HTTP request can do this — a built-in Velt agent, a custom agent created via the Review Agents API (`POST /v2/agents/create`, owned by `velt-rest-apis-best-practices`), or an external agent running in your own framework.

#### Creating agent annotations

Attach an `agent` object to `commentData[0]` (the root comment). Set the annotation `type` to `"suggestion"` so the finding renders as a reviewable agent suggestion rather than a regular comment.

**The `agent` block:**

| Field | Required | Description |
|-------|----------|-------------|
| `agentSource` | Yes | Origin of the agent: `"velt"` or `"external"` |
| `agentId` | Yes | The agent's ID. Must be non-empty. Verified server-side for `velt` agents; opaque (never validated) for `external` agents. |
| `agentName` | Required for `external` | Display name for the agent. For `velt` agents, the name is resolved server-side. |
| `executionId` | No | Execution / run ID for this agent invocation. Used to query all findings from a single run. |
| `url` | No | Page URL associated with the finding. |
| `reason` | Yes | Finding details object — `title`, `description`, `severity`, `findingType`, `confidence`, `suggestedFix`, etc. Custom fields are preserved. |

**Correct (external agent leaving a finding via REST):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/add
const response = await fetch('https://api.velt.dev/v2/commentannotations/add', {
  method: 'POST',
  headers: {
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      commentAnnotations: [
        {
          type: 'suggestion',
          commentData: [
            {
              commentText: 'This button has insufficient color contrast.',
              from: { userId: 'a11y-bot' },
              agent: {
                agentSource: 'external',
                agentName: 'Accessibility Bot',
                agentId: 'a11y-bot',
                executionId: 'run_8f21',
                url: 'https://example.com/design-mockup-v2',
                reason: {
                  title: 'Low color contrast',
                  description: 'Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.',
                  severity: 'high',
                  findingType: 'pin',
                },
              },
            },
          ],
        },
      ],
    },
  }),
});
```

**Correct (Python — external agent):**

```python
import os
import requests

response = requests.post(
    "https://api.velt.dev/v2/commentannotations/add",
    headers={
        "x-velt-api-key": os.environ["VELT_API_KEY"],
        "x-velt-auth-token": os.environ["VELT_AUTH_TOKEN"],
        "Content-Type": "application/json",
    },
    json={
        "data": {
            "organizationId": "acme-corp",
            "documentId": "design-mockup-v2",
            "commentAnnotations": [
                {
                    "type": "suggestion",
                    "commentData": [
                        {
                            "commentText": "This button has insufficient color contrast.",
                            "from": {"userId": "a11y-bot"},
                            "agent": {
                                "agentSource": "external",
                                "agentName": "Accessibility Bot",
                                "agentId": "a11y-bot",
                                "executionId": "run_8f21",
                                "url": "https://example.com/design-mockup-v2",
                                "reason": {
                                    "title": "Low color contrast",
                                    "description": "Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.",
                                    "severity": "high",
                                    "findingType": "pin",
                                },
                            },
                        }
                    ],
                }
            ],
        }
    },
)
```

Attaching the `agent` block to `commentData[0]` (the root comment) marks the whole annotation as agent-authored: the server stamps `sourceType: "agent"` on both that comment and the annotation, and generates the annotation-level `agent` block (the `CommentAnnotationAgent` type from `data-types-reference`). Attaching an `agent` block to a reply instead (see "Replying as an agent" below) marks only that individual comment as agent-authored — the annotation root stays a normal comment and is not reclassified. The finding renders in Velt as a suggestion with Accept and Reject buttons on the comment dialog.

#### The `reason` object

`reason` carries the finding's details. Three fields are required; the remaining ten are optional. Any extra custom fields beyond this list are preserved by the server.

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `title` | Yes | string | Short finding title — a quick label for the issue (e.g. `"Low color contrast"`). |
| `description` | Yes | string | Fuller explanation of what the agent found. |
| `severity` | Yes | string | One of `critical`, `high`, `medium`, `low`, `info`. |
| `findingId` | No | string | Your own unique ID for the finding, useful for dedup / tracking. |
| `findingType` | No | string | What kind of target the finding is on. One of `text`, `pin`, `page`. |
| `issueType` | No | string | Custom classification you define for your own taxonomy (e.g. `"accessibility"`). |
| `confidence` | No | number | How confident the agent is. Integer 0–100. |
| `suggestion` | No | string | Suggested change in plain text — **human-readable prose** (e.g. `"Darken the button background to at least #1A1A1A."`). |
| `suggestedFix` | No | string | **The concrete literal replacement value** to apply (e.g. for a spelling correction, just `"Welcome"` — the corrected word itself, not a sentence about it). |
| `htmlSnippet` | No | string | The relevant chunk of HTML where the issue lives. |
| `htmlSelector` | No | string | CSS / HTML selector pointing to the finding's location. |
| `source` | No | string | Where the triggering rule came from. One of `instructions`, `knowledge`. |
| `knowledgeSection` | No | string | Which knowledge section fired (pairs with `source: "knowledge"`). |

**Do not conflate `suggestion` and `suggestedFix`.** `suggestion` is prose meant for a human reviewer to read in the comment; `suggestedFix` is the literal replacement value your code would apply on Accept. For a spelling fix, `suggestion` might read `"Did you mean 'Welcome'?"` while `suggestedFix` is just `"Welcome"`.

**Correct (fully-populated `reason`):**

```json
"reason": {
  "title": "Low color contrast",
  "description": "Contrast ratio is 2.1:1, below the 4.5:1 WCAG AA threshold.",
  "severity": "high",
  "findingId": "finding_a11y_0427",
  "findingType": "pin",
  "issueType": "accessibility",
  "confidence": 92,
  "suggestion": "Darken the button background to at least #1A1A1A.",
  "suggestedFix": "#1A1A1A",
  "htmlSnippet": "<button class='cta'>Buy now</button>",
  "htmlSelector": ".cta-primary > button",
  "source": "knowledge",
  "knowledgeSection": "brand-guidelines/accessibility"
}
```

#### Replying as an agent

An agent can also post a reply into an existing thread. Use the Add Comments API (`POST /v2/commentannotations/comments/add`, base contract in `rest-comments-api`) and attach an `agent` block to the reply comment — same shape as when creating the root comment.

Annotation-level fields such as `type` are set **only when the annotation is created**. They are **not accepted** on the Add Comments endpoint — the reply inherits its parent annotation's type. Sending `type` here is a common contract error; the field is silently ignored.

**Correct (external agent replying to an existing thread):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/add
const response = await fetch('https://api.velt.dev/v2/commentannotations/comments/add', {
  method: 'POST',
  headers: {
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      annotationId: 'annotation_abc123',
      commentData: [
        {
          commentText: 'Follow-up: contrast is now 2.7:1 — still below WCAG AA.',
          from: { userId: 'a11y-bot' },
          agent: {
            agentSource: 'external',
            agentName: 'Accessibility Bot',
            agentId: 'a11y-bot',
            executionId: 'run_9c02',
            reason: {
              title: 'Low color contrast (follow-up)',
              description: 'Ratio moved from 2.1:1 to 2.7:1 after the last commit.',
              severity: 'high',
            },
          },
        },
      ],
    },
  }),
});
```

Each entry in the Add response map echoes `findingId` (from `commentData[0].agent.reason.findingId`). The map order does not match your input, so correlate results by `findingId` or `entry.annotationId`, never by the map key.

#### Reading agent annotations back

Use the Get Comment Annotations API with agent-specific filters to fetch whole agent-authored threads. Only one agent filter may be supplied per request.

| Filter | Description |
|--------|-------------|
| `agentId` | Annotations created by a specific agent. |
| `executionId` | Annotations from a specific agent run. |
| `agentType` | Annotations of a given agent type: `"built-in"`, `"custom"`, or `"external"`. |
| `agentSource` | `"velt"` or `"external"`. |
| `agentSuggestions` | When `true`, returns only fresh (unaccepted) agent suggestions. |
| `agentComments` | When `true`, returns all agent annotations regardless of status. |

**Correct (fetch all findings from a specific agent run):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/get
const response = await fetch('https://api.velt.dev/v2/commentannotations/get', {
  method: 'POST',
  headers: {
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      executionId: 'run_8f21',
    },
  }),
});
```

Agent annotations in the response carry `type: "suggestion"` and `sourceType: "agent"` at the annotation root, an annotation-root `agent` block (`CommentAnnotationAgent`), and an `agent` block on each agent-authored comment (`comments[].agent`).

**Correct (fetch only pending agent suggestions):**

```javascript
const response = await fetch('https://api.velt.dev/v2/commentannotations/get', {
  method: 'POST',
  headers: {
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      agentSuggestions: true,
    },
  }),
});
```

**Correct (fetch all annotations from external agents):**

```javascript
const response = await fetch('https://api.velt.dev/v2/commentannotations/get', {
  method: 'POST',
  headers: { /* same headers */ },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      agentSource: 'external',
    },
  }),
});
```

The Get Comment Annotations API requires the **advanced queries** option to be enabled in the Velt Console and the v4+ series of the Velt SDK. Confirm the current prerequisite against the API reference before assuming this still applies.

To fetch **individual comments within a specific annotation** (rather than whole threads), use the Get Comments API (`POST /v2/commentannotations/comments/get`) instead — see `rest-comments-api` for the base contract. Get Comment Annotations returns the thread with its full `comments[]` payload; Get Comments is the tool for pulling a single comment out of an existing thread by id.

#### Updating agent annotations and comments

Agent comments are updated through the same endpoints as any other comment — the split is by scope:

- **Annotation-level fields** (status, assignee, location, resolved state, etc.) go through the Update Comment Annotations API (`POST /v2/commentannotations/update`). See `rest-comment-annotations-api` for the base contract.
- **Individual comment content** within the thread goes through the Update Comments API (`POST /v2/commentannotations/comments/update`). See `rest-comments-api`.

There is no agent-specific update endpoint; the `agent` block on the comment is carried through unchanged.

#### Deleting agent annotations and comments

Two scopes, same split:

- **Whole-thread deletion** goes through the Delete Comment Annotations API (`POST /v2/commentannotations/delete`). Filter by `annotationIds` for specific threads, by the agent's `userIds` (the idiomatic pattern for **purging every annotation a given agent created** — e.g. wiping a bot's findings before a re-run), or by the **combinable agent filters** `agentId`, `agentSuggestions`, and `agentUrls`, which are AND-combined to scope deletion (e.g. delete only one agent's still-pending suggestions on a specific set of pages). See `rest-comment-annotations-api`.
- **Single-comment deletion** within a thread goes through the Delete Comments API (`POST /v2/commentannotations/comments/delete`). See `rest-comments-api`.

The combinable agent filters target only annotations that still match the filter — suggestions already accepted, rejected, or resolved are left untouched when `agentSuggestions: true` is set (it selects only still-pending suggestions).

**Correct (purge one agent's pending suggestions on two specific pages):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/delete
const response = await fetch('https://api.velt.dev/v2/commentannotations/delete', {
  method: 'POST',
  headers: {
    'x-velt-api-key': process.env.VELT_API_KEY,
    'x-velt-auth-token': process.env.VELT_AUTH_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: {
      organizationId: 'acme-corp',
      documentId: 'design-mockup-v2',
      agentId: 'a11y-bot',
      agentSuggestions: true,
      agentUrls: [
        'https://example.com/design-mockup-v2/page-1',
        'https://example.com/design-mockup-v2/page-2',
      ],
    },
  }),
});
```

#### Handling accept/reject on the client

Agent findings render with Accept and Reject buttons. Subscribe to `suggestionAccepted` and `suggestionRejected` on the comment element to apply the change to your own data or trigger follow-up logic. The SDK records the outcome and persists the suggestion status — applying the actual change is your code's responsibility.

**Correct (React — subscribe to agent suggestion events):**

```tsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

export function AgentSuggestionListener() {
  const accepted = useCommentEventCallback('suggestionAccepted');
  const rejected = useCommentEventCallback('suggestionRejected');

  useEffect(() => {
    if (!accepted) return;
    // accepted.commentAnnotation contains the full agent finding
    console.log('Suggestion accepted', accepted.commentAnnotation);
  }, [accepted]);

  useEffect(() => {
    if (!rejected) return;
    // rejected.rejectReason contains the reviewer's reason (if provided)
    console.log('Suggestion rejected', rejected.rejectReason);
  }, [rejected]);

  return null;
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```javascript
const commentElement = Velt.getCommentElement();

commentElement.on('suggestionAccepted').subscribe(({ commentAnnotation }) => {
  console.log('Suggestion accepted', commentAnnotation);
});

commentElement.on('suggestionRejected').subscribe(({ commentAnnotation, rejectReason }) => {
  console.log('Suggestion rejected', rejectReason);
});
```

#### UI rendering

Annotations created with `sourceType: "agent"` render with an agent-identity header (agent name + avatar from the `agent` block) instead of the standard human-author header. Because the annotation `type` is `"suggestion"`, the comment dialog shows Accept and Reject buttons.

To restyle the agent suggestion card, use the comment dialog wireframes or the suggestion action primitives:

- `VeltCommentDialogSuggestionActions`, `VeltCommentDialogSuggestionActionAccept`, and `VeltCommentDialogSuggestionActionReject` are available primitives for custom Accept / Reject controls.
- The `VeltCommentDialogAgentSuggestion*` primitive family is Beta and is not exported by `@veltdev/react` yet, so importing it fails today.

To resolve a suggestion from your own UI (for example, a custom chip), call `commentElement.acceptSuggestion({ annotationId })` / `rejectSuggestion({ annotationId })`. See `ui-agent-suggestion-primitives.md`.

**Verification:**
- [ ] `agent` block is on `commentData[0]` (the root comment) when creating a thread, or on the reply comment when replying via `/v2/commentannotations/comments/add` — not on the annotation wrapper
- [ ] `agentSource` is set — `"external"` for your own agents, `"velt"` for built-in agents or custom agents created via the Review Agents API
- [ ] `agentId` is set to a non-empty string for **both** `velt` and `external` agents (required regardless of `agentSource`)
- [ ] `agentName` is provided when `agentSource` is `"external"` (server cannot resolve it)
- [ ] Annotation `type` is `"suggestion"` when **creating** so Accept/Reject buttons render — do **not** send `type` on the Add Comments (`/v2/commentannotations/comments/add`) reply endpoint; it is ignored
- [ ] `reason` object is provided with all three required fields (`title`, `description`, `severity`)
- [ ] `severity` is one of `critical`, `high`, `medium`, `low`, `info`
- [ ] `suggestion` is human-readable prose; `suggestedFix` is the literal replacement value (not conflated)
- [ ] `findingType`, if set, is one of `text`, `pin`, `page`
- [ ] `source`, if set, is `instructions` or `knowledge` (and `knowledgeSection` is set when `source` is `knowledge`)
- [ ] Only one agent filter is used per Get request (`agentId`, `executionId`, `agentType`, `agentSource`, `agentSuggestions`, or `agentComments`)
- [ ] `agentType`, if used, is one of `"built-in"`, `"custom"`, or `"external"`
- [ ] Updates route by scope — annotation-level fields via Update Comment Annotations, per-comment content via Update Comments
- [ ] Deletes route by scope — whole threads via Delete Comment Annotations (use the agent's `userIds` to purge everything one agent created, or the combinable `agentId` + `agentSuggestions` + `agentUrls` filters to scope deletion to one agent's still-pending suggestions on specific pages), single comments via Delete Comments
- [ ] When deleting with `agentSuggestions: true`, understand that already-accepted / rejected / resolved suggestions are left untouched — the filter selects only still-pending suggestions
- [ ] Individual-comment reads use Get Comments (`/v2/commentannotations/comments/get`); whole-thread reads use Get Comment Annotations
- [ ] Client-side `suggestionAccepted`/`suggestionRejected` handlers apply changes to your data (the SDK only persists the status)

**Source Pointers:**
- https://docs.velt.dev/ai/agent-comments
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/update-comment-annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/delete-comment-annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/add-comments
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/get-comments
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/update-comments
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/delete-comments
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/create

---

### 2.2 REST API — Comment Annotation CRUD

**Impact: HIGH (Server-side comment annotation management via REST)**

Use Velt's V2 REST APIs to manage comment annotations from your backend. Every endpoint is a `POST` with a `{ data: {...} }` body and the `x-velt-api-key` and `x-velt-auth-token` headers. Update requests select annotations with filters (`annotationIds`, `locationIds`, `userIds`) and apply one `updatedData` object; there is no per-annotation `annotations[]` array.

> **Agent annotations?** If the task involves AI agents, agent comments, agent suggestions, agentSource, executionId, or accept/reject: the agent block goes on `commentData[0]` with `type: "suggestion"`, `agentName` (required for external), and a `reason` object. See `rest-agent-comments-api.md`. Use `suggestionAccepted` / `suggestionRejected` events on the client to handle reviewer decisions.

**Incorrect (invented update and count shapes):**

```javascript
// Update: there is no `annotations` array
body: JSON.stringify({ data: { organizationId: 'org-1', documentId: 'doc-1',
  annotations: [{ annotationId: 'ann-123', status: { id: 'resolved' } }] } });

// Count: requires documentIds (max 30) and userId, not a single documentId
body: JSON.stringify({ data: { organizationId: 'org-1', documentId: 'doc-1' } });
```

**Add Annotations:**

The request body uses `data.commentAnnotations`, an array of annotation objects that each contain a `commentData` array.

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
      commentAnnotations: [{
        location: { id: 'locationId', locationName: 'Page 1' },       // optional
        visibility: { type: 'restricted', userIds: ['user-1'] },       // optional, default public
        context: { access: { dashboardId: 'myDashboard' } },           // optional Access Context
        commentData: [{
          commentText: 'This needs review',
          commentHtml: '<p>This needs review</p>',
          from: { userId: 'user-1', name: 'User One' },                // required
          triggerNotification: true,  // in-app + email notifications and webhooks (default false)
          triggerActivities: true,    // activity log record (default false)
        }],
      }],
    },
  }),
});
const { result } = await response.json();
// result.data is a MAP keyed per annotation, not an array, and its order does not match your input.
for (const entry of Object.values(result.data)) {
  console.log(entry.success, entry.annotationId, entry.commentIds, entry.findingId);
}
```

Response handling:
- Read `entry.annotationId` from each value, never the map key. Keys for permission-denied entries without your own `annotationId` fall back to `__velt_denied:<index>`.
- On a failure response, `error.details` carries the same per-annotation map. Entries with `"success": true` **were created**, so treat a failed request as a partial write.
- For agent annotations, `findingId` echoes `commentData[0].agent.reason.findingId`; use it to correlate results with your own records.

**Optional annotation fields on add:**

| Field | Notes |
|-------|-------|
| `type` | `'comment'` (default) or `'suggestion'`. Use `'suggestion'` for agent findings and reviewable proposed changes. The legacy `commentType: "suggestion"` no longer drives classification. |
| `suggestion` | Proposed-change payload for `type: 'suggestion'`: `targetId`, `targetType`, `oldValue`, `newValue`, `summary`, `driftDetected`, plus any custom fields. `status` is server-owned and stamped `pending` on create. |
| `visibility` | `{ type: 'public' \| 'organizationPrivate' \| 'restricted', organizationId?, userIds? }`. `organizationPrivate` requires `organizationId`; `restricted` requires non-empty `userIds`. |
| `actions` | Annotation-level default action chips (`CommentAction[]`, max 20). See `data-comment-actions.md`. |
| `commentData[].progress` | Live progress row (`CommentProgress`, `steps` max 100). See `data-comment-progress.md`. |
| `commentData[].actions` | Row-level action chips that override the annotation default. |
| `createOrganization` / `createDocument` | Create the org or document if missing. |
| `verifyUserPermissions` | Check the author can access the document (default `false`). |

**Get Annotations (with filters):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/get
body: JSON.stringify({
  data: {
    organizationId: 'org-1',          // required
    documentIds: ['doc-1'],           // optional, max 30; or documentId
    locationIds: ['locationx'],       // optional
    annotationIds: ['ann-1'],         // optional
    userIds: ['user-1'],              // optional: authors
    mentionedUserIds: ['user-2'],     // optional: annotations that tag these users
    resolvedBy: 'user-3',             // optional: matches resolvedByUserId
    statusIds: ['OPEN'],              // optional
    updatedAfter: 1700000000000,      // optional, ms
    order: 'desc',                    // 'asc' | 'desc' on lastUpdated
    pageSize: 50,                     // default 1000
    pageToken: 'next-token',
  },
}),
// Response: { result: { status, message, data: CommentAnnotation[], nextPageToken } }
```

Agent filters (`agentId`, `executionId`, `agentType`, `agentSource`, `agentSuggestions`, `agentComments`) are covered in `rest-agent-comments-api.md`; only one agent filter is allowed per Get request.

**Update Annotations:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/update
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentId: 'doc-1',
    annotationIds: ['ann-123', 'ann-456'],   // and/or locationIds, userIds
    updatedData: {
      status: { id: 'resolved', name: 'Resolved', type: 'terminal' },
      statusUpdatedByUserId: 'user-1',       // who made the status change; null clears it
      resolvedByUserId: 'user-1',            // matched by the Get `resolvedBy` filter
      priority: { id: 'P1', name: 'P1' },
    },
  },
}),
```

- A non-`terminal` status automatically clears `resolvedByUserId` and `resolvedByUser`; `statusUpdatedByUserId` is kept so you still know who reopened it. Omit a field to leave it unchanged.
- `updatedData.suggestion` **replaces** the stored `suggestion` object; include existing fields when changing one value. Unlike create, `status` (`pending` / `accepted` / `rejected`) is honored here.
- `updatedData.actions` replaces the stored array outright.
- `updateUsers: [{ oldUser, newUser }]` rewrites user references.

**Delete Annotations:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/delete
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentId: 'doc-1',                     // required
    annotationIds: ['ann-123', 'ann-456'],   // optional; also locationIds, userIds
  },
}),
```

With only `organizationId` + `documentId`, every annotation on the document is deleted. The combinable agent filters (`agentId`, `agentSuggestions`, `agentUrls`) are covered in `rest-agent-comments-api.md`.

**Get Counts (total + unread):**

```javascript
// POST https://api.velt.dev/v2/commentannotations/count/get
// Requires advanced queries enabled in the Velt Console
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentIds: ['doc-1', 'doc-2'],   // required, max 30
    userId: 'user-1',                  // required: whose unread count
    statusIds: ['OPEN'],               // optional
  },
}),
// Response: { result: { data: { 'doc-1': { total: 4, unread: 2 }, 'doc-2': { total: 2, unread: 0 } } } }
```

**Verification:**
- [ ] API key and auth token read from server-side environment variables
- [ ] Add responses iterated with `Object.values(result.data)` and `entry.annotationId`, and failed requests checked for partial writes in `error.details`
- [ ] Updates use `annotationIds` / filters plus a single `updatedData` object
- [ ] Status changes send `statusUpdatedByUserId` (and `resolvedByUserId` for terminal statuses)
- [ ] Count requests send `documentIds` (max 30) and `userId`
- [ ] Pagination reads `nextPageToken` and sends it back as `pageToken`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations - Add Comment Annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-v2 - Get Comment Annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/update-comment-annotations - Update Comment Annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/delete-comment-annotations - Delete Comment Annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/get-comment-annotations-count - Get Comment Annotations Count

---

### 2.3 REST API — Individual Comment CRUD Within Annotations

**Impact: HIGH (Server-side individual comment management via REST)**

Manage individual comments inside an existing annotation thread from your backend. The endpoints live under `/v2/commentannotations/comments/*` (not `/v2/comments/*`). All require `x-velt-api-key` and `x-velt-auth-token` headers and a `{ data: {...} }` body.

**Incorrect (wrong path, missing `from` on update, notification flag in the wrong place):**

```javascript
await fetch('https://api.velt.dev/v2/comments/update', {   // wrong path
  method: 'POST',
  body: JSON.stringify({ data: { organizationId: 'org-1', documentId: 'doc-1', annotationId: 'ann-123',
    commentIds: [1],
    updatedData: { commentText: 'Done', triggerNotification: true } } }), // `from` missing; flag must be at data root
});
```

**Add Comments to an Annotation:**

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
        commentText: 'Looks good to me {{user-2}}',
        commentHtml: '<p>Looks good to me {{user-2}}</p>',
        from: { userId: 'user-1' },                         // required
        context: { reviewType: 'approval' },
        taggedUserContacts: [{
          text: '@Jane',
          userId: 'user-2',
          contact: { userId: 'user-2', name: 'Jane', email: 'jane@example.com' },
        }],
        attachments: [{
          attachmentId: 1001,                                // number
          name: 'screenshot.png',
          url: 'https://example.com/screenshot.png',
          mimeType: 'image/png',
          size: 102400,
        }],
        triggerNotification: true,                           // one notification for this reply; never persisted
      }],
    },
  }),
});
// Response: { result: { status, message, data: [778115] } }  // new commentIds
```

`commentData[]` also accepts `progress` (live progress row, `steps` max 100), `actions` (row-level action chips, max 20), and an `agent` block for agent replies. Annotation-level fields such as `type` are not accepted here; the reply inherits its annotation's type.

**Get Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/get
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentId: 'doc-1',
    annotationId: 'ann-123',
    userIds: ['user-1'],       // required
    commentIds: [1, 2, 3],     // optional
  },
}),
```

**Update Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/update
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentId: 'doc-1',
    annotationId: 'ann-123',
    commentIds: [153783],                 // required
    triggerNotification: true,            // root level only; sends exactly one notification
    updatedData: {
      from: { userId: 'agent-1' },        // required
      commentText: 'Here is the answer.',
      progress: { state: 'completed' },   // replaces stored progress outright
      actions: [{ id: 'approve', label: 'Approve' }], // replaces stored actions outright
    },
  },
}),
```

Every update rewrites the whole annotation document, so keep `progress` updates to roughly one write per second per comment and send a step's final label instead of every token.

**Delete Comments:**

```javascript
// POST https://api.velt.dev/v2/commentannotations/comments/delete
body: JSON.stringify({
  data: {
    organizationId: 'org-1',
    documentId: 'doc-1',
    annotationId: 'ann-123',
    commentIds: [1, 2],  // optional: omit to delete all comments in the annotation
  },
}),
```

**Key details:**
- `commentIds` and `attachmentId` are numbers, not strings.
- `userIds` is required on Get; `from` is required in `updatedData` on Update.
- `triggerNotification` on Update must sit at the `data` root, not inside `updatedData`; on Add it sits on each `commentData` entry.
- `progress` and `actions` in `updatedData` replace the stored values; they are not deep-merged.

**Verification:**
- [ ] Paths use `/v2/commentannotations/comments/{add|get|update|delete}`
- [ ] `organizationId`, `documentId`, and `annotationId` included in every request
- [ ] Update payload includes `updatedData.from` and puts `triggerNotification` at the root
- [ ] Delete without `commentIds` understood as "delete all comments in the annotation"
- [ ] Tagged users appear as `{{userId}}` in text/HTML with a matching `taggedUserContacts` entry

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/add-comments - Add Comments
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/get-comments - Get Comments
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/update-comments - Update Comments
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/delete-comments - Delete Comments

---

## 3. Comment Modes

**Impact: HIGH**

Different comment presentation and interaction modes for various use cases. Includes Freestyle, Popover, Stream, Text, Page, Inline, rich text editor integrations (TipTap, SlateJS, Lexical, Plate, Quill, CodeMirror, Ace), media player comments, and chart comments.

### 3.1 Add Comments to Canvas/Drawing Applications

**Impact: HIGH (Manual comment positioning for HTML5 canvas and drawing apps)**

Add collaborative comments to HTML5 canvas or drawing applications using manual comment positioning with VeltCommentPin.

**Setup Overview:**

Canvas comments follow the manual positioning pattern - handle click events, store coordinates in context, and render pins at stored positions.

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

**Key Implementation Details:**

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

**Verification Checklist:**
- [ ] Container has data-velt-manual-comment-container="true"
- [ ] Container has position: relative
- [ ] Click position calculated relative to canvas
- [ ] Context includes canvasId for filtering
- [ ] Pins rendered at stored coordinates

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/canvas - Canvas setup
- https://docs.velt.dev/async-collaboration/comments/setup/canvas-comments/overview - Overview

---

### 3.2 Add Comments to ChartJS Charts

**Impact: HIGH (Data point comments for Chart.js using manual positioning pattern)**

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

---

### 3.3 Add Comments to Custom Charts with Manual Positioning

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
- https://docs.velt.dev/async-collaboration/comments/setup/chart-comments-setup/custom-charts - Complete setup

---

### 3.4 Add Comments to Nivo Charts

**Impact: HIGH (Data point comments for Nivo charts using manual positioning pattern)**

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
- https://docs.velt.dev/async-collaboration/comments/setup/chart-comments-setup/nivo-charts - Setup reference
- https://docs.velt.dev/async-collaboration/comments/setup/chart-comments-setup/custom-charts - Pattern details

---

### 3.5 Add Data Point Comments to Highcharts

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
- https://docs.velt.dev/async-collaboration/comments/setup/chart-comments-setup/highcharts - Complete setup

---

### 3.6 Integrate Comments with Ace Editor

**Impact: MEDIUM (Text comments in Ace code editor with highlight marks)**

Add collaborative text comments to an Ace editor using Velt's Ace extension. Users can select text and add comments that persist as marks in the editor.

**Incorrect (using default text mode instead of extension):**

```jsx
// Default text mode doesn't integrate with Ace properly
<VeltComments textMode={true} />
<AceEditor ... />
```

**Correct (with Ace extension):**

**Step 1: Install the extension**
```bash
npm install @veltdev/ace-velt-comments
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Initialize Ace editor with Velt extension**
```jsx
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

**Key Functions:**
- `AceVeltComments(editor)` - Initialize extension, returns cleanup function
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `useCommentAnnotations()` - Hook to get comment data

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

**Verification Checklist:**
- [ ] @veltdev/ace-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] AceVeltComments() called with editor instance on load
- [ ] Cleanup function called on component unmount
- [ ] renderComments called when annotations change

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/ace - Complete setup

---

### 3.7 Integrate Comments with Apryse WebViewer

**Impact: HIGH (PDF and DOCX text comments in Apryse WebViewer with durable anchors and cleanup)**

Use `@veltdev/apryse-velt-comments` when adding Velt text comments to Apryse WebViewer documents. The integration attaches to one WebViewer instance, renders existing Velt annotations back into Apryse, and stores durable text anchors that survive document edits and viewer/docxEditor mode switches.

**Incorrect (using default text comments without the Apryse extension):**

```jsx
// Default text mode cannot render selections inside the Apryse canvas.
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={true} />
  <div ref={viewerRef} />
</VeltProvider>
```

**Correct (React / Next.js with the Apryse extension):**

**Step 1: Install both packages**

```bash
npm install @veltdev/apryse-velt-comments @pdftron/webviewer
```

`@pdftron/webviewer` is a peer dependency. Copy its `public/core` and `public/ui` runtime folders into your app's public assets, then point WebViewer's `path` option at that location.

**Step 2: Mount Velt comments with default text mode disabled**

```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Dynamically create WebViewer and attach the Velt extension**

```jsx
import { useEffect, useRef, useState } from 'react';
import { useCommentAnnotations } from '@veltdev/react';
import {
  ApryseVeltComments,
  addComment,
  renderComments,
} from '@veltdev/apryse-velt-comments';

function ApryseEditor() {
  const viewerRef = useRef(null);
  const instanceRef = useRef(null);
  const extensionRef = useRef(null);
  const [instance, setInstance] = useState(null);
  const annotations = useCommentAnnotations();

  useEffect(() => {
    if (!viewerRef.current || instanceRef.current) return;
    let cancelled = false;

    import('@pdftron/webviewer').then(({ default: WebViewer }) => {
      if (cancelled) return;
      WebViewer(
        {
          path: 'lib/webviewer',
          licenseKey: 'YOUR_APRYSE_LICENSE_KEY',
          initialDoc: '/your-document.docx',
          initialMode: 'docxEditor',
        },
        viewerRef.current,
      ).then((webViewerInstance) => {
        if (cancelled) return;
        instanceRef.current = webViewerInstance;
        extensionRef.current = ApryseVeltComments
          .configure({ editorId: 'contract-viewer' })
          .attach(webViewerInstance);
        setInstance(webViewerInstance);
      });
    });

    return () => {
      cancelled = true;
      extensionRef.current?.detach();
      extensionRef.current = null;
      instanceRef.current = null;
      setInstance(null);
    };
  }, []);

  useEffect(() => {
    if (instance && annotations) {
      renderComments({ instance, commentAnnotations: annotations });
    }
  }, [instance, annotations]);

  return (
    <>
      <button
        onClick={async () => {
          if (!instance) return;
          const result = await addComment({ instance });
          if (!result) {
            console.warn('Select text in the WebViewer before adding a comment.');
          }
        }}
      >
        Add Comment
      </button>
      <div ref={viewerRef} style={{ width: '100%', height: '100vh' }} />
    </>
  );
}
```

**Key APIs:**

| API | Purpose |
|-----|---------|
| `ApryseVeltComments.configure({ editorId }).attach(instance)` | Attach Velt comment handling to one WebViewer instance. |
| `addComment({ instance })` | Create a Velt annotation from the current Apryse text selection. Returns `null` when nothing is selected or the SDK is not loaded. |
| `renderComments({ instance, commentAnnotations })` | Re-render Velt annotations as Apryse text highlights. |
| `AttachedExtension.detach()` | Remove Apryse listeners and clear per-instance caches during cleanup. |

**Important details:**
- Import `@pdftron/webviewer` dynamically in browser-only code; WebViewer touches the DOM.
- Clicking a host-page button does not clear Apryse's canvas selection, so no selection-preservation `mousedown` workaround is needed.
- Set `editorId` when the page hosts multiple WebViewer instances; `renderComments()` only paints annotations whose stored editor id matches.
- The library stores `annotation.context.textEditorConfig` with `editorId`, selected `text`, `pageNumber`, and `occurrence`; physical positions are re-derived at render time.
- If the WebViewer loads a new document in the same instance, keep the extension attached. It listens for Apryse document lifecycle events and re-syncs highlights.

**Style Apryse highlights:**

```css
velt-comment-text .velt-apryse-highlight {
  background-color: rgba(60, 130, 246, 0.30) !important;
  border-bottom: 2px solid rgba(60, 130, 246, 0.95) !important;
}

velt-comment-text:hover .velt-apryse-highlight {
  background-color: rgba(60, 130, 246, 0.50) !important;
}
```

**Verification Checklist:**
- [ ] `@veltdev/apryse-velt-comments` and `@pdftron/webviewer` are installed
- [ ] WebViewer runtime assets are copied to a public HTTP path used by `WebViewer({ path })`
- [ ] `VeltComments` is mounted with `textMode={false}`
- [ ] `ApryseVeltComments.configure(...).attach(instance)` runs once per WebViewer instance
- [ ] `renderComments({ instance, commentAnnotations })` runs when annotations change
- [ ] `extension.detach()` runs on unmount
- [ ] Multi-viewer pages set stable `editorId` values

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/apryse - "Apryse Setup"
- https://docs.velt.dev/api-reference/sdk/models/data-models#apryseveltcommentsconfig - "ApryseVeltCommentsConfig"
- https://docs.velt.dev/api-reference/sdk/models/data-models#addcommentargs - "AddCommentArgs"
- https://docs.velt.dev/api-reference/sdk/models/data-models#attachedextension - "AttachedExtension"

---

### 3.8 Integrate Comments with CodeMirror Editor

**Impact: MEDIUM (Text comments in CodeMirror code editor with highlight decorations)**

Add collaborative text comments to a CodeMirror editor using Velt's CodeMirror extension. Users can select text and add comments that persist as decorations in the editor.

**Incorrect (using default text mode instead of extension):**

```jsx
// Default text mode doesn't integrate with CodeMirror properly
<VeltComments textMode={true} />
<div ref={editorRef} />
```

**Correct (with CodeMirror extension):**

**Step 1: Install the extension**
```bash
npm install @veltdev/codemirror-velt-comments
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Add extension to CodeMirror editor**
```jsx
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

**Key Functions:**
- `CodemirrorVeltComments()` - Extension to add to the editor
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `useCommentAnnotations()` - Hook to get comment data

**Important: Selection Preservation**

When clicking a button, the browser moves focus and clears the editor selection. You must save the selection on `mousedown` (before focus changes) and restore it via `editorView.dispatch()` before adding the comment.

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

**Verification Checklist:**
- [ ] @veltdev/codemirror-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] CodemirrorVeltComments() added to editor extensions
- [ ] renderComments called when annotations change
- [ ] Selection is saved on mousedown and restored before addComment

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/codemirror - Complete setup

---

### 3.9 Integrate Comments with Lexical Editor

**Impact: HIGH (Text comments in Lexical rich text editor with CommentNode)**

Add collaborative text comments to Lexical editor using Velt's Lexical extension. Users can select text and add comments that integrate with Lexical's node system.

**Incorrect (using default text mode):**

```jsx
// Default text mode doesn't integrate with Lexical properly
<VeltComments textMode={true} />
<LexicalComposer ... />
```

**Correct (with Lexical extension):**

**Step 1: Install the extension**
```bash
npm install @veltdev/lexical-velt-comments @veltdev/client lexical
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Register CommentNode in editor config**
```jsx
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
```

**Step 4: Add comment functionality**
```jsx
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

**Key Functions:**
- `CommentNode` - Node type to register with Lexical
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `exportJSONWithoutComments(editor)` - Export clean editor state

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

**Verification Checklist:**
- [ ] @veltdev/lexical-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] CommentNode registered in editor config
- [ ] renderComments called on annotation changes
- [ ] Comment button triggers addComment

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/lexical - Complete setup

---

### 3.10 Integrate Comments with Plate Editor

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

**Step 1: Install the extension**
```bash
npm install @veltdev/plate-comments-react
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Add plugin to Plate editor**
```jsx
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

**Key Functions:**
- `VeltCommentsPlugin` - Plugin to add to the Plate editor's plugins array
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `useCommentAnnotations()` - Hook to get comment data

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

**Verification Checklist:**
- [ ] @veltdev/plate-comments-react is installed
- [ ] VeltComments has textMode={false}
- [ ] VeltCommentsPlugin added to editor plugins
- [ ] renderComments called when annotations change
- [ ] Comment button uses onClick with preventDefault

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/plate - Complete setup

---

### 3.11 Integrate Comments with Quill Editor

**Impact: MEDIUM (Text comments in Quill rich text editor with highlight marks)**

Add collaborative text comments to a Quill editor using Velt's Quill module. Users can select text and add comments that persist as marks in the editor.

**Incorrect (using default text mode instead of module):**

```jsx
// Default text mode doesn't integrate with Quill properly
<VeltComments textMode={true} />
<div ref={editorRef} />
```

**Correct (with Quill module):**

**Step 1: Install the extension**
```bash
npm install @veltdev/quill-velt-comments
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Register and configure the Quill module**
```jsx
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

**Key Functions:**
- `QuillVeltComments` - Module to register with Quill
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `useCommentAnnotations()` - Hook to get comment data

**Important: Selection Preservation**

When clicking a button, the browser moves focus and clears the editor selection. You must save the selection on `mousedown` (before focus changes) and restore it before adding the comment.

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

**Verification Checklist:**
- [ ] @veltdev/quill-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] QuillVeltComments registered with Quill.register()
- [ ] renderComments called when annotations change
- [ ] Selection is saved on mousedown and restored before addComment

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/quill - Complete setup

---

### 3.12 Integrate Comments with SlateJS Editor

**Impact: HIGH (Text comments in SlateJS rich text editor with custom elements)**

Add collaborative text comments to SlateJS editor using Velt's SlateJS extension. Users can select text and add comments that integrate with Slate's document model.

**Incorrect (using default text mode):**

```jsx
// Default text mode doesn't integrate with SlateJS properly
<VeltComments textMode={true} />
<Slate ... />
```

**Correct (with SlateJS extension):**

**Step 1: Install the extension**
```bash
npm install @veltdev/slate-velt-comments
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Configure editor with extension**
```jsx
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
```

**Step 4: Register custom type**
```typescript
import type { VeltCommentsElement } from '@veltdev/slate-velt-comments';

type CustomElement = VeltCommentsElement;

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
  }
}
```

**Step 5: Render comments and add button**
```jsx
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

**Key Functions:**
- `withVeltComments(editor, options)` - Augment editor with Velt support
- `addComment({ editor })` - Create comment on selected text
- `renderComments({ editor, commentAnnotations })` - Render existing comments
- `SlateVeltComment` - Component to render comment elements

**Style Commented Text:**
```css
velt-comment-text[comment-available="true"] {
  background-color: #ffff00;
}
```

**Verification Checklist:**
- [ ] @veltdev/slate-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] withVeltComments wraps editor creation
- [ ] VeltCommentsElement type registered
- [ ] renderComments called on annotation changes

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/slatejs - Complete setup

---

### 3.13 Integrate Comments with TipTap Editor

**Impact: HIGH (Text comments in TipTap rich text editor with highlight marks)**

Add collaborative text comments to TipTap editor using Velt's TipTap extension. Users can select text and add comments that persist as marks in the editor.

> **Required since v6.0.16-beta.1:** Velt's default text comments and pin comments are disabled on TipTap and other ProseMirror-based editors (writing into them could freeze the page). Commenting inside these editors only works through the dedicated plugin: `@veltdev/tiptap-velt-comments` for TipTap, `@veltdev/prosemirror-velt-comments` (`VeltCommentsPlugin`) for plain ProseMirror.

**Incorrect (using default text mode instead of extension):**

```jsx
// Default text and pin comments are disabled inside TipTap/ProseMirror editors (v6.0.16-beta.1+)
<VeltComments textMode={true} />
<Editor ... />
```

**Correct (with TipTap extension):**

**Step 1: Install the extension**
```bash
npm install @veltdev/tiptap-velt-comments
```

**Step 2: Configure VeltComments**
```jsx
import { VeltProvider, VeltComments } from '@veltdev/react';

// Disable default text mode when using editor integration
<VeltProvider apiKey="API_KEY">
  <VeltComments textMode={false} />
</VeltProvider>
```

**Step 3: Add extension to TipTap editor**
```jsx
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

**Key Functions:**

| Function | Purpose |
|----------|---------|
| `TiptapVeltComments` | Extension to add to editor config |
| `addComment({ editor })` | Create comment on selected text |
| `renderComments({ editor, commentAnnotations })` | Render existing comment highlights |
| `useCommentAnnotations()` | Hook to get comment annotation data |

> Note: Older v4 packages exported `triggerAddComment` and `highlightComments` — these are deprecated. Use `addComment` and `renderComments` instead.

**Tiptap v3 notes:**
- `BubbleMenu` import: `@tiptap/react/menus` (NOT `@tiptap/react`)
- `tippyOptions` prop was removed in v3 — do not use it
- `@floating-ui/dom` is a required peer dependency for BubbleMenu

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

**Verification Checklist:**
- [ ] Commenting inside the editor goes through the Velt plugin, not default text or pin comments
- [ ] @veltdev/tiptap-velt-comments is installed
- [ ] VeltComments has textMode={false}
- [ ] TiptapVeltComments extension added to editor
- [ ] renderComments called when annotations change
- [ ] BubbleMenu has comment button

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/tiptap - Complete setup
- https://docs.velt.dev/async-collaboration/comments/setup/prosemirror - ProseMirror plugin
- https://docs.velt.dev/release-notes/version-6/sdk-changelog - 6.0.16-beta.1 (default comments disabled on ProseMirror-based editors)

---

### 3.14 Add Frame-by-Frame Comments to Lottie Animations

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

**Key Implementation Steps:**

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

**Verification Checklist:**
- [ ] Timeline parent has non-static position
- [ ] totalMediaLength matches animation frame count
- [ ] Location set with currentMediaPosition on comment
- [ ] Location removed when animation plays
- [ ] Comment clicks seek to correct frame

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/lottie-player-setup - Complete setup

---

### 3.15 Integrate Comments with Custom Video Player

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

**Key Concepts:**

**1. Location Management:**
- `currentMediaPosition` - Required field for timeline positioning
- `videoPlayerId` - Associates comments with specific player

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

**Verification Checklist:**
- [ ] Timeline parent has non-static position
- [ ] videoPlayerId matches on player and timeline
- [ ] totalMediaLength set correctly
- [ ] Location set when comment mode activates
- [ ] Location cleared when video plays
- [ ] Comment clicks seek video and set location

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/video-player-setup/custom-video-player-setup - Complete setup

---

### 3.16 Use Freestyle Mode for Pin-Anywhere Comments

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

**Why these props matter:**
- `shadowDom={false}` — lets your CSS styles apply to Velt comment components (nearly always needed)
- `textMode={false}` — disables the default text selection comment mode, which conflicts with freestyle pin mode
- `allowedElementIds` — restricts where comment pins can be placed. Without this, users can pin comments on headers, navbars, and other UI elements you don't want annotated
- `commentToNearestAllowedElement={true}` — if a user clicks near the edge of the allowed area, the comment attaches to the nearest allowed element instead of failing

**How Freestyle Works:**
1. User clicks the `VeltCommentTool` button
2. Cursor changes to a comment pin
3. User clicks anywhere on the page
4. Comment dialog appears at click location
5. Comment is attached to the clicked element

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

**Verification Checklist:**
- [ ] VeltComments is added with `shadowDom={false}` and `textMode={false}`
- [ ] VeltCommentTool is placed in accessible location (toolbar/header)
- [ ] VeltCommentsSidebar is included for viewing all comments
- [ ] VeltSidebarButton is available to toggle the sidebar
- [ ] `allowedElementIds` restricts commenting to the intended content area
- [ ] Clicking tool changes cursor to comment pin
- [ ] Clicking inside allowed area creates comment at that location

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/freestyle - Complete setup

---

### 3.17 Use Inline Comments for Traditional Thread Style

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

**Why these props matter:**
- `context={{}}` — attaches metadata to every comment in this section. Essential for filtering, grouping, and knowing which item a comment belongs to. Without this, comments are only tied to a DOM element ID which can break if your UI changes.
- `composerPosition="bottom"` — places the comment composer below existing threads, which is the natural position for inline discussions (like GitHub PR comments)
- `shadowDom={false}` — lets your CSS styles apply to inline comment components
- `textMode={false}` on VeltComments — prevents conflicts with inline comment sections

**Key Requirements:**
1. Container element needs unique `id`
2. `VeltInlineCommentsSection` inside the container
3. `targetElementId` matches the container's ID
4. `context` prop with item-specific metadata for filtering/grouping

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

**Message Truncation (v5.0.2-beta.18+):**

`VeltInlineCommentsSection` supports per-comment message truncation. When enabled, long messages are clipped to the specified line count and a **Show more** button appears. Each comment tracks its own expand/collapse state independently. The Show more and Show less controls are full wireframe primitives — see `ui-wireframes.md` for customization.

| Prop (React) | Attribute (HTML) | Type | Default | Description |
|---|---|---|---|---|
| `messageTruncation` | `message-truncation` | `boolean` | `false` | Enable per-comment truncation with expand/collapse |
| `messageTruncationLines` | `message-truncation-lines` | `number` | `4` | Lines visible before truncation |

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

Inside wireframe templates for `VeltInlineCommentsSection`, the `context` data variable resolves from `parentLocalUIState.context` — the document/location context for the section. This is the corrected behavior as of v5.0.2-beta.11.

```jsx
// Inside a VeltInlineCommentsSection wireframe template:
// `context` resolves from parentLocalUIState.context (document/location context).
// Use field="context.someProperty" to access location-level context data.
<velt-data field="context.someProperty" />

// For annotation-level context in other (non-Inline-Section) components,
// use field="annotation.context.someProperty" instead.
<velt-data field="annotation.context.someProperty" />
```

```html
<!-- HTML — same distinction applies in velt-data field expressions -->
<!-- Inside VeltInlineCommentsSection wireframe: context = parentLocalUIState.context -->
<velt-data field="context.someProperty"></velt-data>

<!-- Inside other component wireframes: annotation-level context -->
<velt-data field="annotation.context.someProperty"></velt-data>
```

**Verification Checklist:**
- [ ] VeltComments has `shadowDom={false}` and `textMode={false}`
- [ ] Container has unique ID
- [ ] VeltInlineCommentsSection is inside container with matching `targetElementId`
- [ ] `context` prop includes item-specific metadata (IDs, status, etc.)
- [ ] `composerPosition="bottom"` is set for natural thread layout
- [ ] `shadowDom={false}` is set on VeltInlineCommentsSection
- [ ] multiThread setting matches requirements
- [ ] If long comment bodies are expected, `messageTruncation={true}` and `messageTruncationLines` are set to improve readability

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/inline-comments - Complete setup
- https://docs.velt.dev/ui-customization/overview - Wireframe data variable resolution

---

### 3.18 Use Page Mode for Page-Level Comments

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

**Key Components:**
- `VeltComments` - Enables comments feature
- `VeltCommentsSidebar` - The sidebar panel (with `pageMode={true}`)
- `VeltSidebarButton` - Toggles the sidebar open/closed

**How Page Mode Works:**
1. User clicks VeltSidebarButton to open sidebar
2. Comment composer appears at bottom of sidebar
3. User types page-level comment
4. Comment is associated with the page, not a specific element

**For HTML:**

```html
<velt-comments></velt-comments>
<velt-comments-sidebar page-mode="true"></velt-comments-sidebar>

<div class="toolbar">
  <velt-sidebar-button></velt-sidebar-button>
</div>
```

**Programmatic Page Mode Composer Control (v4.7.7+):**

`setContextInPageModeComposer()` accepts a `PageModeComposerConfig` object. By default, context is cleared after each submission (`clearContext: true`). Set `clearContext: false` to preserve context data across multiple submissions.

```tsx
// PageModeComposerConfig interface
// {
//   context?: { [key: string]: any } | null;
//   targetElementId?: string | null;
//   clearContext?: boolean;  // defaults to true
// }
```

```jsx
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

**Verification Checklist:**
- [ ] VeltCommentsSidebar has `pageMode={true}`
- [ ] VeltSidebarButton is placed in UI
- [ ] Sidebar shows comment composer at bottom
- [ ] Comments appear without element association

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/page - Complete setup

---

### 3.19 Use Popover Mode for Table Cell Comments

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

**Pattern A: Comment Tool per Element**
```jsx
<div className="cell" id="cell-id-1">
  <VeltCommentTool targetElementId="cell-id-1" />
</div>
```

**Pattern B: Single Comment Tool with data attributes**
```jsx
<VeltCommentTool />  {/* Single tool in toolbar */}

<div className="cell"
     id="cell-A"
     data-velt-target-comment-element-id="cell-A">
  Content
</div>
```

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

**Verification Checklist:**
- [ ] VeltComments has `popoverMode={true}`
- [ ] Each commentable element has unique ID
- [ ] VeltCommentTool has matching `targetElementId`
- [ ] Comments appear attached to target element

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/popover - Complete setup

---

### 3.20 Use Prebuilt Video Player for Quick Setup

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

**VeltVideoPlayer Props:**

| Prop | Type | Description |
|------|------|-------------|
| `src` | string | Video source URL |
| `sync` | boolean | Enable synchronized playback across users |
| `darkMode` | boolean | Enable dark mode styling |

**For HTML:**

```html
<velt-video-player
  src="https://example.com/video.mp4"
  sync="true"
>
</velt-video-player>
```

**When to Use Prebuilt vs Custom:**

| Use Prebuilt When | Use Custom When |
|-------------------|-----------------|
| Quick implementation | Custom player UI needed |
| Standard video features | Specific player library required |
| Don't need custom controls | Advanced playback features |
| Simple commenting needs | Custom timeline/seeking |

**Verification Checklist:**
- [ ] VeltVideoPlayer is inside VeltProvider
- [ ] src prop points to valid video URL
- [ ] sync enabled if collaborative playback needed

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/video-player-setup/video-player-setup - Complete setup

---

### 3.21 Use Stream Mode for Google Docs-Style Comments

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

**Key Requirements:**
1. `streamMode={true}` enables stream layout
2. `streamViewContainerId` must match the scrolling container's ID
3. `VeltComments` should be inside the scrolling container
4. Text mode is enabled by default (works well with Stream)

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

**How Stream Mode Works:**
1. User selects text (Text mode enabled by default)
2. Comment tool appears near selection
3. User clicks to add comment
4. Comment dialog appears in right-side stream
5. Stream scrolls with document content

**Verification Checklist:**
- [ ] `streamMode={true}` is set
- [ ] `streamViewContainerId` matches container ID
- [ ] Container element is scrollable
- [ ] VeltComments is inside the scrolling container

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/stream - Complete setup

---

### 3.22 Use Text Mode for Text Highlight Comments

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

**How Text Mode Works:**
1. User selects text on the page
2. Comment Tool button appears near the selection
3. User clicks to add a comment
4. Comment is attached to the highlighted text
5. Text selection is visually marked

**For HTML:**

```html
<velt-comments text-mode="true"></velt-comments>

<article>
  <p>Select any text to add a comment...</p>
</article>
```

**Disable Text Mode (when using editor integrations):**

When using TipTap, SlateJS, Lexical, or other editor integrations, disable native text mode. Since v6.0.16-beta.1, default text and pin comments are disabled inside TipTap and other ProseMirror-based editors regardless, so use the dedicated plugin there.

```jsx
// Disable for editor integrations
<VeltComments textMode={false} />
```

**Combining with Stream Mode:**

Text mode works well with Stream mode for a Google Docs-like experience:

```jsx
<VeltComments
  textMode={true}
  streamMode={true}
  streamViewContainerId="document-container"
/>
```

**Keep highlights on their original anchor (`restrictTextSearchToAnchor`, v6.0.0-beta.3+):**

When the commented text can no longer be found in its anchor element, the SDK by default searches wider (`document.body`, or the location element for location-scoped comments) before ghosting the comment. Turn this off when the same text appears in several regions and a comment must never re-bind elsewhere:

```jsx
<VeltComments restrictTextSearchToAnchor={true} />
// or
const commentElement = client.getCommentElement();
commentElement.enableRestrictTextSearchToAnchor();
```

```html
<velt-comments restrict-text-search-to-anchor="true"></velt-comments>
```

**Programmatic text comments:** `commentElement.addCommentOnSelectedText()` comments on the current selection; `addCommentOnElement({ targetElement: { elementId, targetText, occurrence } })` targets a specific occurrence. To attach a known annotation to text in your own markup, wrap it in `VeltCommentText` (see `standalone-comment-text.md`).

**Verification Checklist:**
- [ ] `restrictTextSearchToAnchor` enabled only when wider re-binding would attach comments to the wrong text
- [ ] `textMode={true}` (or omitted - it's default)
- [ ] Selecting text shows Comment Tool
- [ ] Comments attach to selected text
- [ ] Highlighted text is visually marked

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/text - Complete setup
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#restricttextsearchtoanchor - restrictTextSearchToAnchor

---

## 4. Standalone Components

**Impact: MEDIUM-HIGH**

Individual comment components for building custom implementations. Includes Comment Pin, Comment Thread, Comment Composer, and Comment Text for DIY comment interfaces.

### 4.1 Use Comment Pin for Manual Position Control

**Impact: MEDIUM-HIGH (Full control over comment pin placement in complex UIs)**

VeltCommentPin gives you complete control over where comment pins appear. Use this for complex UIs, canvas applications, or when automatic positioning doesn't meet your needs.

**When to Use Standalone Components:**

Standalone components (Pin, Thread, Composer) are recommended when:
- **You need direct API access** - Work with comment data programmatically
- **You have complex UI requirements** - 3D canvas, WebGL, custom rendering engines
- **Default components don't fit your layout** - Kanban boards, custom sidebars, split views
- **You need custom positioning logic** - Comments on non-DOM elements, virtual lists

**When to Use Comment Pin Specifically:**
- Custom chart/canvas implementations
- 3D applications and WebGL scenes
- Complex drag-and-drop interfaces
- When automatic pin placement doesn't work
- Building custom comment UIs with full control

**Implementation Steps:**

**1. Add Comments with Custom Metadata:**

Option A: Using onCommentAdd callback
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
```

Option B: Using addManualComment API
```jsx
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

**VeltCommentPin Props:**

| Prop | Type | Description |
|------|------|-------------|
| `annotationId` | string | ID of the comment annotation to display |

**Verification Checklist:**
- [ ] Container has data-velt-manual-comment-container="true"
- [ ] Context includes position data
- [ ] annotationId passed to VeltCommentPin
- [ ] Pin positioned with absolute CSS

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-pin/overview - Overview
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-pin/setup - Setup

---

### 4.2 Use Comment Composer for Custom Comment Input

**Impact: MEDIUM-HIGH (Add comment input anywhere in your application)**

The Comment Standalone Composer lets you add comment input anywhere in your application. Combine with Comment Thread and Comment Pin for fully custom comment interfaces.

**When to Use Standalone Components:**

Standalone components (Pin, Thread, Composer) are recommended when:
- **You need direct API access** - Work with comment data programmatically
- **You have complex UI requirements** - 3D canvas, WebGL, custom rendering engines
- **Default components don't fit your layout** - Kanban boards, custom sidebars, split views
- **You need custom positioning logic** - Comments on non-DOM elements, virtual lists

**When to Use Comment Composer Specifically:**
- Building custom comment sidebars with your own layout
- Adding comment input in overlays/popovers/modals
- Creating inline comment forms in custom locations
- Custom comment creation flows (e.g., multi-step wizards)
- Combining with Thread and Pin for fully custom interfaces

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

**Integration Points:**

| Component | Purpose |
|-----------|---------|
| VeltCommentComposer | Input for creating new comments |
| VeltCommentThread | Display existing comment threads |
| VeltCommentPin | Position comment pins manually |
| useCommentAnnotations | Fetch comment data |

**Verification Checklist:**
- [ ] VeltComments added to app root
- [ ] VeltCommentComposer placed in desired location
- [ ] Use `targetComposerElementId` (not `targetElementId`) for element association
- [ ] Combined with Thread/Pin as needed

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-composer/overview - Overview
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-composer/setup - Setup

---

### 4.3 Use Comment Thread to Render Existing Comments

**Impact: MEDIUM-HIGH (Render comment threads in custom locations like kanban boards)**

The Standalone Comment Thread component renders existing comment data in custom locations. Use this to build custom UIs like kanban boards or your own sidebar implementation.

**When to Use Standalone Components:**

Standalone components (Pin, Thread, Composer) are recommended when:
- **You need direct API access** - Work with comment data programmatically
- **You have complex UI requirements** - 3D canvas, WebGL, custom rendering engines
- **Default components don't fit your layout** - Kanban boards, custom sidebars, split views
- **You need custom positioning logic** - Comments on non-DOM elements, virtual lists

**When to Use Comment Thread Specifically:**
- **Kanban boards** - Display comment threads as cards in columns (see example below)
- Creating a custom comments sidebar
- Rendering comments in a custom layout (split views, panels)
- Displaying comments outside the default dialog
- Building task/issue tracking interfaces with threaded discussions

**Note:** This component only renders existing comments. It's a thin wrapper around the Comment Dialog component.

**Implementation:**

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

**Verification Checklist:**
- [ ] VeltComments added to app root
- [ ] useCommentAnnotations retrieves comments
- [ ] annotationId passed to VeltCommentThread
- [ ] Comments display in custom location

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-thread/overview - Overview
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-thread/setup - Setup

---

### 4.4 Use VeltCommentText to Attach a Known Annotation to Text in Your Markup

**Impact: MEDIUM (Highlights and attaches an existing comment to text you render yourself, without selection-driven text mode)**

`VeltCommentText` (`<velt-comment-text>`) wraps any text and attaches an existing comment annotation to it: it highlights the wrapped text and links the comment. Use it when the text lives in your own components and you already know which annotation belongs to it, for example when re-rendering comments in a rich-text editor. For user-driven selection, use text comments instead. Do not confuse it with `VeltTextComment`, the selection toolbar used by text mode.

**Incorrect (using the text-mode toolbar component to wrap content):**

```jsx
// VeltTextComment is the selection toolbar, not a wrapper for known annotations
<VeltTextComment annotationId="ANNOTATION_ID">
  The quarterly numbers look off.
</VeltTextComment>
```

**Correct (React / Next.js):**

```jsx
import { VeltCommentText } from '@veltdev/react';

<VeltCommentText annotationId="ANNOTATION_ID">
  The quarterly numbers look off.
</VeltCommentText>

{/* Multi-thread annotation */}
<VeltCommentText multiThreadAnnotationId="MULTI_THREAD_ANNOTATION_ID">
  Revenue by region
</VeltCommentText>
```

**Correct (Other Frameworks):**

```html
<velt-comment-text annotation-id="ANNOTATION_ID">
  The quarterly numbers look off.
</velt-comment-text>

<velt-comment-text multi-thread-annotation-id="MULTI_THREAD_ANNOTATION_ID">
  Revenue by region
</velt-comment-text>
```

**Props:**

| Prop | HTML attribute | Type | Description |
|------|----------------|------|-------------|
| `annotationId` | `annotation-id` | `string` | Comment annotation to attach to the wrapped text |
| `multiThreadAnnotationId` | `multi-thread-annotation-id` | `string` | Multi-thread annotation to attach to the wrapped text |

Pass one of the two. Style highlighted text with the `velt-comment-text[comment-available="true"]` selector, as editor integrations do.

**Verification Checklist:**
- [ ] `VeltComments` is mounted so the annotation data and dialog are available
- [ ] Each wrapper receives the `annotationId` (or `multiThreadAnnotationId`) of an existing annotation
- [ ] `VeltCommentText` is used for known annotations; selection-driven commenting uses text mode
- [ ] HTML uses a closing `</velt-comment-text>` tag, not a self-closing element

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-text/overview - Comment Text
- https://docs.velt.dev/async-collaboration/comments/setup/text - Text comments (selection-driven)

---

## 5. Comment Surfaces

**Impact: MEDIUM-HIGH**

Navigation and display surfaces for comments. Includes the Comments Sidebar, the V2 primitive-architecture sidebar, and related toggle components.

### 5.1 Comments Sidebar Setup, Modes, and Configuration

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

**Step 2 — Choose a display mode:**

| Mode | Prop | Behavior |
|------|------|----------|
| Default | _(none)_ | Slides in from the right edge |
| Embed | `embedMode={true}` | Fills its parent container; no close button — you manage open/close |
| Floating | `floatingMode={true}` on **VeltSidebarButton** | Overlay panel over the button. Do NOT render `<VeltCommentsSidebar>` separately |
| Page Mode | `pageMode={true}` | Adds a composer for page-level comments (not pinned to an element) |
| Focused Thread | `focusedThreadMode={true}` | Clicking a comment expands it in-place; adds a navigation button |
| Full Screen | `fullScreen={true}` | Expands to fill the viewport (default mode only, not floating/embed) |

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

**Additional props reference:**

| Prop | Default | Description |
|------|---------|-------------|
| `position` | `'right'` | `'left'` or `'right'` |
| `readOnly` | `false` | Prevent editing in sidebar |
| `currentLocationSuffix` | `false` | Adds "(This page)" to matching group |
| `excludeLocationIds` | `[]` | Hide comments from specific locations |
| `filterGhostCommentsInSidebar` | `false` | Hide ghost/orphan comments |
| `dialogSelection` | `true` | When false, sidebar clicks emit event instead of opening dialog inline |
| `expandOnSelection` | `true` | Auto-expand dialogs on selection |
| `forceClose` | V1: off unless set; V2: `true` | Force close on outside click even when opened via API (no effect in embed mode) |
| `searchPlaceholder` | - | Custom search input placeholder text |
| `commentPlaceholder` | - | Custom dialog composer placeholder |
| `replyPlaceholder` | - | Custom reply input placeholder |
| `pageModePlaceholder` | - | Custom page mode composer placeholder |
| `commentCountType` | `'total'` | `'total'` or `'unread'` (V1 sidebar and `VeltSidebarButton`) |
| `sidebarButtonCountType` | `'default'` | `'default'` or `'filter'` |
| `context` | - | Custom context metadata for page mode comments |
| `defaultMinimalFilter` | `'all'` | `'all'` \| `'read'` \| `'unread'` \| `'resolved'` \| `'open'` \| `'reset'` \| `null` |
| `systemFiltersOperator` | `'and'` | `'and'` or `'or'` for combining system filters |

**V2 Sidebar (primitive-based):**

`VeltComments` must be mounted alongside `VeltCommentsSidebarV2` — pin rendering lives inside `VeltComments`, and mounting the sidebar alone leaves pages without on-page pins.

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebarV2,
  VeltSidebarButton,
  VeltCommentTool,
} from '@veltdev/react';

export default function App() {
  return (
    <VeltProvider apiKey="API_KEY">
      <VeltComments />
      <VeltCommentsSidebarV2 />
      <div className="toolbar">
        <VeltSidebarButton />
        <VeltCommentTool />
      </div>
    </VeltProvider>
  );
}
```

**Incorrect (sidebar mounted without VeltComments — pins do not render):**

```jsx
<VeltProvider apiKey="API_KEY">
  {/* Missing <VeltComments /> — page-level pins will not render */}
  <VeltCommentsSidebarV2 />
</VeltProvider>
```

V2 replaces the per-category filter panel with declarative `filters` / `miniFilters` / `minimalFilters`, and delivers navigation through events instead of props:

```jsx
// V2 navigation: subscribe to the comment event bus
const commentNav = useCommentEventCallback('commentNavigationButtonClick');
useEffect(() => {
  const pageId = commentNav?.location?.pageId;
  if (pageId) navigateToPage(pageId);
}, [commentNav]);
```

For V2 wireframe customization, see the [Comment Sidebar V2 Wireframes](https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-v2-wireframes) page and the component catalog sidebar slot trees.

**Verification Checklist:**
- [ ] `VeltComments` is mounted alongside the sidebar so on-page pins render
- [ ] Floating mode is set on `VeltSidebarButton`, and the sidebar is not rendered separately
- [ ] V1 navigation uses `onCommentClick` / `onCommentNavigationButtonClick`; V2 uses the `commentClick` / `commentNavigationButtonClick` events
- [ ] Embed mode has its own open/close control on the host

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/setup - V1 setup
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior - V1 customize behavior
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/setup - V2 setup
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior#commentnavigationbuttonclick - V2 navigation events

---

### 5.2 Use Comments Sidebar for Comment Navigation

**Impact: MEDIUM-HIGH (Central panel for viewing, filtering, and navigating all comments)**

`VeltCommentsSidebar` provides a panel displaying all comments with search, filter, and navigation capabilities. Essential for any non-trivial commenting implementation. Most layout, placeholder, and virtual-scroll props below are shared with `VeltCommentsSidebarV2` (see `VeltCommentsSidebarV2Props`); V2 drops the `on*` event props in favor of the comment event bus. For the V2-only declarative filter / sort surface, see `surface/surface-sidebar-v2.md`.

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

**Handle Comment Clicks (V1 prop):**

```jsx
<VeltCommentsSidebar
  onCommentClick={(event) => {
    const { location, documentId, targetElementId, context } = event;
    // Navigate to comment location
    // e.g., scroll to element, seek video, etc.
  }}
/>
```

The same clicks are also emitted on the comment element event bus as `commentClick` (and `commentNavigationButtonClick`), which is the only path for `VeltCommentsSidebarV2`:

```jsx
const commentClick = useCommentEventCallback('commentClick');
useEffect(() => {
  if (commentClick) navigateTo(commentClick.location);
}, [commentClick]);
```

**V2 Sidebar Entry:**

For the primitive-based V2 sidebar, import `VeltCommentsSidebarV2` directly in React or mount `<velt-comments-sidebar-v2>` in other frameworks. The current V2 setup docs no longer document the V1 component prop opt-in as a setup path.

```jsx
import { VeltCommentsSidebarV2 } from '@veltdev/react';

<VeltCommentsSidebarV2 />
```

```html
<velt-comments-sidebar-v2></velt-comments-sidebar-v2>
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

#### `VeltCommentsSidebarProps` (layout props shared with `VeltCommentsSidebarV2`)

The React TypeScript interface; HTML attributes use the same names in kebab-case. All props are optional. Defaults reflect the current SDK surface — note in particular: `position` is narrowed from `string` to `'right' | 'left'`, and `forceClose` now defaults to `true` (the sidebar force-closes on outside click unless you explicitly set `forceClose={false}` — embed mode is unaffected).

**Layout / mode:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageMode` | boolean | `false` | Page-level comments mode (composer in the sidebar, no element attachment). |
| `focusedThreadMode` | boolean | `false` | Open individual threads in a focused view inside the sidebar. |
| `readOnly` | boolean | `false` | Render the sidebar in read-only mode. |
| `embedMode` | boolean | not set | Embed the sidebar inline within a host container (`embed-mode="false"` on HTML means not embedded). |
| `floatingMode` | boolean | `false` | Floating overlay layout. |
| `position` | `'right' \| 'left'` | `'right'` | Side of the viewport the sidebar opens from. Narrowed from `string`. |
| `variant` | string | `'sidebar'` | Layout variant id. |
| `forceClose` | boolean | `true` | Force-close on outside click, even when opened via API. Does not affect embed mode. (V2 default flipped from `false` → `true`.) |
| `fullScreen` | boolean | `false` | Add a fullscreen toggle button to the header. |
| `fullExpanded` | boolean | `false` | Render the sidebar fully expanded. |
| `shadowDom` | boolean | input `false`; shadow-DOM isolation is on by default | Render the sidebar body inside a shadow root for style isolation. Opt out via `shadow-dom="false"` or `disableSidebarShadowDOM()`. |
| `groupConfig` | `{ enable?: boolean; name?: string; groupBy?: string }` | — | Grouping config; defaults to grouping by location when enabled. |
| `currentLocationSuffix` | boolean | `false` | Append a "(This page)" suffix when a group matches the current location. |
| `dialogVariant` | string | `'sidebar'` | Variant for the embedded comment dialog rendered in the list. |
| `focusedThreadDialogVariant` | string | `'sidebar'` | Variant for the focused-thread dialog. |
| `pageModeComposerVariant` | string | `'sidebar'` | Variant for the page-mode composer. |
| `dialogSelection` | boolean | `true` | Clicking a comment opens its dialog inline; with `false`, a click emits `commentClick` only (no selection, inline expansion, or focused-thread view). |
| `expandOnSelection` | boolean | `true` | Expand the dialog automatically on selection. |
| `openAnnotationInFocusMode` | boolean | `false` | Open annotations in focus mode when `focusedThreadMode={true}` and a reply / `selectCommentByAnnotationId()` is used. |
| `excludeLocationIds` | `string[]` | `[]` | Hide comments from these locations. |
| `customActions` | boolean | `false` | Enable host-driven wireframe actions in the sidebar. |
| `sidebarButtonCountType` | `'default' \| 'filter'` | — | What the sidebar-button badge tracks — total open/in-progress (default) vs filtered count. |
| `context` | object | `null` | Context attached to comments added via the page-mode composer (serialized JSON on the HTML attribute). |

**Placeholders (V2 surface; also accepted by V1):**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchPlaceholder` | string | `'Search comments'` | Placeholder in the search input. |
| `pageModePlaceholder` | string | `''` | Placeholder for the page-mode composer. |
| `commentPlaceholder` | string | `''` | Placeholder for the dialog composer (new comment input). |
| `replyPlaceholder` | string | `''` | Placeholder for reply input fields. |
| `editPlaceholder` | string | `''` | Fallback edit placeholder. |
| `editCommentPlaceholder` | string | `''` | Placeholder when editing the first comment (takes precedence over `editPlaceholder`). |
| `editReplyPlaceholder` | string | `''` | Placeholder when editing a reply (takes precedence over `editPlaceholder`). |

**Virtual scrolling:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `measuredSize` | number | `220` | Estimated row size (px). |
| `minBufferPx` | number | `1000` | Minimum virtual-scroll buffer (px). |
| `maxBufferPx` | number | `2000` | Maximum virtual-scroll buffer (px). |

**URL navigation:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `urlNavigation` | boolean | `false` | Automatically update the URL when navigating between comments. |
| `queryParamsComments` | boolean | `false` | Sync the selected comment to URL query params. |

**Events / callbacks:**

| V1 prop | Event bus equivalent (V1 + V2) | Description |
|---------|-------------------------------|-------------|
| `onCommentClick` | `commentClick` | A comment in the list was clicked. |
| `onCommentNavigationButtonClick` | `commentNavigationButtonClick` | The navigation ("go to") button was clicked. |
| — | `sidebarOpen` / `sidebarClose` | Sidebar opened / closed (`sidebarClose` fires exactly once per close). |
| `onFullscreenClick` | `fullscreenClick` | Fullscreen toggle clicked; `fullScreen` is the new state. |

Subscribe to the event bus with `useCommentEventCallback('commentClick')` or `commentElement.on('commentClick')`. `VeltCommentsSidebarV2` does not take the `on*` click / open / close props.

For the V2-only declarative filter / sort surface (`filters`, `miniFilters`, `minimalFilters`, `filterOperator`, `filterPanelLayout`, `filterOptionLayout`, `filterCount`, `filterGhostCommentsInSidebar`, `systemFiltersOperator`, `sortBy`, `sortOrder`, `defaultMinimalFilter`) and the `applyCommentSidebarClientFilters()` API, see `surface/surface-sidebar-v2.md`.

**`setCommentSidebarFilters()` semantics (V1 + V2):**

`setCommentSidebarFilters()` applies values as selected filters in the sidebar UI — the values render as checked options and are cleared by **Reset**. The call is a partial update, not a full overwrite:

- Included keys replace their current selections.
- Omitted keys are preserved.
- A present-but-empty array clears one field (e.g. `{ location: [] }`).
- An empty object `{}` clears every client-provided selection.

This wording is aligned across V1 (`/async-collaboration/comments-sidebar/v1/customize-behavior#setcommentsidebarfilters`) and V2 (`/async-collaboration/comments-sidebar/v2/customize-behavior#setcommentsidebarfilters`), so the same guidance applies regardless of which sidebar version the app mounts. For the V2 `CommentSidebarFilters` payload shape (object identities for `people` / `location` etc.) and facet-count coupling, see `surface/surface-sidebar-v2.md`.

**Verification Checklist:**
- [ ] `VeltCommentsSidebar` mounted for V1/sidebar-prop usage, or `VeltCommentsSidebarV2` / `<velt-comments-sidebar-v2>` mounted directly for V2 setup
- [ ] `VeltSidebarButton` provides toggle
- [ ] `embedMode` set if using a custom container
- [ ] `position` is `'right'` or `'left'` (no other strings — the union is narrowed)
- [ ] `forceClose` is explicitly set when the default (`true`) is not desired — do not assume the old default of `false`
- [ ] Navigation is handled via `onCommentClick` (V1) or the `commentClick` / `commentNavigationButtonClick` events (V1 + V2)
- [ ] V2 code does not pass `onSidebarOpen` / `onCommentClick` props; it subscribes to the event bus

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/overview - Overview
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior - V1 setup + customize-behavior (`/customize-behavior` paths re-rooted to `/v1/customize-behavior`)
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/setup - V2 entry (direct `VeltCommentsSidebarV2` / `<velt-comments-sidebar-v2>` setup)
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentssidebarprops - `VeltCommentsSidebarProps`
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentssidebarv2props - `VeltCommentsSidebarV2Props`
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior#commentclick - `commentClick` event

---

### 5.3 Use Sidebar Button to Toggle Comments Panel

**Impact: MEDIUM-HIGH (User control for showing/hiding comments sidebar)**

`VeltSidebarButton` opens and closes the Comments Sidebar. Place it in your toolbar. To change its look, use the `VeltSidebarButtonWireframe` slots (`Icon`, `CommentsCount`, `UnreadIcon`); arbitrary children placed inside `<VeltSidebarButton>` are not a documented customization path.

**Incorrect (custom children instead of a wireframe):**

```jsx
<VeltSidebarButton>
  <button className="my-custom-button">Comments</button>
</VeltSidebarButton>
```

**Correct (basic setup):**

```jsx
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebar,
  VeltSidebarButton,
  VeltCommentTool,
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
    </VeltProvider>
  );
}
```

```html
<velt-comments></velt-comments>
<velt-comments-sidebar></velt-comments-sidebar>
<velt-sidebar-button></velt-sidebar-button>
```

**Badge count and floating mode:**

```jsx
// 'total' (default) | 'unread'
<VeltSidebarButton commentCountType="unread" />

// 'default' (open + in-progress) | 'filter' (the sidebar's filtered list, including 0)
<VeltSidebarButton sidebarButtonCountType="filter" />

// Overlay sidebar anchored to the button; do not render the sidebar separately
<VeltSidebarButton floatingMode={true} />
```

```html
<velt-sidebar-button comment-count-type="unread"></velt-sidebar-button>
```

Programmatic alternative for the badge source: `commentElement.setSidebarButtonCountType('filter')`. When a `setCommentSidebarData()` id set is active, the filter badge counts that set.

**Custom appearance (wireframe):**

```jsx
<VeltWireframe>
  <VeltSidebarButtonWireframe>
    <VeltSidebarButtonWireframe.Icon />
    <VeltSidebarButtonWireframe.CommentsCount />
    <VeltSidebarButtonWireframe.UnreadIcon />
  </VeltSidebarButtonWireframe>
</VeltWireframe>
```

```html
<velt-wireframe style="display:none;">
  <velt-sidebar-button-wireframe>
    <velt-sidebar-button-icon-wireframe></velt-sidebar-button-icon-wireframe>
    <velt-sidebar-button-comments-count-wireframe></velt-sidebar-button-comments-count-wireframe>
    <velt-sidebar-button-unread-icon-wireframe></velt-sidebar-button-unread-icon-wireframe>
  </velt-sidebar-button-wireframe>
</velt-wireframe>
```

Clicks emit `sidebarButtonClicked` on the comment element (see `permissions-comment-interaction-events.md`).

**Verification Checklist:**
- [ ] A sidebar (`VeltCommentsSidebar` or `VeltCommentsSidebarV2`) is mounted, unless `floatingMode` is on
- [ ] Button customization uses `VeltSidebarButtonWireframe`, not custom children
- [ ] Badge source chosen deliberately (`commentCountType` / `sidebarButtonCountType`)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/setup - Setup with sidebar button
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior#floatingmode - floatingMode
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior#commentcounttype - commentCountType
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar-button/wireframes - Sidebar button wireframes

---

### 5.4 Use VeltCommentsSidebarV2 for Primitive-Architecture Sidebar Customization

**Impact: MEDIUM-HIGH (Full composability of every sidebar UI section via 56+ independently importable primitives, enabling precise customization without forking the entire component)**

`VeltCommentsSidebarV2` is a complete redesign of the Comments Sidebar built on a flat primitive component architecture. Every section of the UI is an independently importable and composable primitive, so you can replace only the parts you need without reimplementing the whole component. V2 ships with a declarative filter / sort / group model (three filter surfaces — main panel, mini funnel dropdown, multi-dropdown minimal bar), CDK virtual scroll for large comment lists, a focused-thread view, a fullscreen toggle, and a header search.

**Incorrect (customizing V1 sidebar by overriding deeply nested internals):**

```jsx
// V1 sidebar requires shadowing deeply nested internal components
// to change layout or filtering — there is no flat primitive tree
<VeltCommentsSidebar />
```

**Correct (React / Next.js — direct V2 component with primitive composition):**

```jsx
import { useEffect } from 'react';
import {
  VeltProvider,
  VeltComments,
  VeltCommentsSidebarV2,
  useCommentEventCallback,
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
        forceClose={true}
      />
      <SidebarEvents />
    </VeltProvider>
  );
}

// V2 delivers open/close/click/navigation through the comment event bus, not props
function SidebarEvents() {
  const commentClick = useCommentEventCallback('commentClick');
  const sidebarClose = useCommentEventCallback('sidebarClose');

  useEffect(() => {
    if (commentClick) {
      // { annotation, documentId, location, targetElementId, context }
      const pageId = commentClick.location?.pageId;
      if (pageId) navigateToPage(pageId);
    }
  }, [commentClick]);

  useEffect(() => {
    if (sidebarClose) console.log('closed', sidebarClose);
  }, [sidebarClose]);

  return null;
}
```

```js
// Other Frameworks
const commentElement = Velt.getCommentElement();
const subscription = commentElement.on('commentNavigationButtonClick').subscribe((event) => {
  const pageId = event?.location?.pageId;
  if (pageId) navigateToPage(pageId);
});
subscription?.unsubscribe();
```

**Correct (HTML / Other Frameworks — dedicated V2 web-component tag):**

```html
<velt-comments-sidebar-v2
  page-mode="false"
  focused-thread-mode="false"
  read-only="false"
  position="right"
  variant="sidebar"
  force-close="true"
></velt-comments-sidebar-v2>
```

`<velt-comments-sidebar-v2>` / `VeltCommentsSidebarV2` is the only entry point documented by the V2 setup page. The old V1 component prop opt-in is no longer shown in `async-collaboration/comments-sidebar/v2/setup`. Mount the dedicated V2 tag directly; do not pair it with a V1 tag.

**VeltCommentsSidebarV2 Props (core layout / event surface):**

| Prop | Type | Optional | Description |
|------|------|----------|-------------|
| `pageMode` | boolean | Yes | Enable page-level comments mode. |
| `focusedThreadMode` | boolean | Yes | Open individual threads in a focused view inside the sidebar. |
| `readOnly` | boolean | Yes | Render the sidebar in read-only mode. |
| `embedMode` | boolean | Yes | Embed the sidebar inside a custom container (fills it, no close button). The HTML attribute takes a string; `embed-mode="false"` means not embedded. |
| `floatingMode` | boolean | Yes | Render the sidebar in floating mode. |
| `position` | `'right' \| 'left'` | Yes | Anchor position of the sidebar panel. Narrowed from `string`. |
| `variant` | string | Yes | Display variant (e.g. `"sidebar"`). |
| `forceClose` | boolean | Yes | Force the sidebar to close on outside click, even when opened via API. Default `true`. |
| `fullScreen` | boolean | Yes | Add a fullscreen toggle to the header. Default `false`. |
| `onFullscreenClick` | (data: any) => void | Yes | Fires when the fullscreen toggle is clicked (component output). |
| `urlNavigation` | boolean | Yes | Update the URL when navigating between comments. Default `false`. |
| `queryParamsComments` | boolean | Yes | Sync the selected comment to URL query params. Default `false`. |
| `dialogSelection` | boolean | Yes | Default `true`. With `false`, a list click emits `commentClick` only: no selection, inline expansion, or focused-thread view. |

**V2 events (comment element event bus):**

| Event | Payload | Notes |
|-------|---------|-------|
| `sidebarOpen` | `SidebarOpenEvent` | Fired when the sidebar opens. Reopening starts with no comment selected but keeps expanded/collapsed groups. |
| `sidebarClose` | `SidebarCloseEvent` | Fired exactly once per close (close button, outside click, `closeCommentSidebar()`, `toggleCommentSidebar()`). |
| `commentClick` | `CommentClickEvent` | `annotation`, `documentId`, `location`, `targetElementId`, `context`. |
| `commentNavigationButtonClick` | `CommentNavigationButtonClickEvent` | Same fields as `commentClick`. |
| `fullscreenClick` | `FullscreenClickEvent` | `fullScreen` is the state after the toggle. |

The V1-era `onSidebarOpen` / `onSidebarClose` / `onCommentClick` / `onCommentNavigationButtonClick` props are no longer part of `VeltCommentsSidebarV2Props`. Subscribe with `useCommentEventCallback(...)` or `commentElement.on(...)`. Open, close, or toggle programmatically with `openCommentSidebar()` / `closeCommentSidebar()` / `toggleCommentSidebar()`.

#### Declarative filter surfaces (V2)

V2 exposes filter / sort / group / search as data. The sidebar renders the matching UI and applies the selections client-side via the new `applyCommentSidebarClientFilters()` API method. Three filter surface props drive three distinct surfaces — they only make sense together, so configure them as one unit:

| Prop | Surface | Shape |
|------|---------|-------|
| `filters` | Main Filter bottom-sheet / menu panel | `FilterField[]` defines sections; a `CommentSidebarFilters` object (e.g. `{ status: ['OPEN'] }`) applies active selections directly — included keys replace their values, omitted keys are preserved. Default `[]`. |
| `miniFilters` | Single header funnel dropdown | `FilterField[]` — one section per field. Default `[]`. |
| `minimalFilters` | Multiple header dropdowns (replaces the single funnel) | `SidebarMinimalFilterConfig[]` — one dropdown per entry. The entry's `type` (`filter` / `sort` / `quick` / `actions`) decides what the dropdown contains; matching input (`fields` / `sorts` / `actions`) provides its content. Default `[]`. |

```jsx
// React — main filter panel + a multi-dropdown minimal bar
<VeltCommentsSidebarV2
  filters={[
    { field: 'status' },
    { field: 'assigned' },
    { field: 'authorName', label: 'Written By', valuePath: 'from.name' },
  ]}
  minimalFilters={[
    { type: 'filter', fields: [{ field: 'status' }] },
    { type: 'sort', sorts: ['date', 'unread'] },
    { type: 'quick', actions: ['open', 'resolved', { label: 'Mine', path: 'from.userId', value: '1.1' }] },
  ]}
  filterOperator="and"
  filterPanelLayout="bottomSheet"
  filterOptionLayout="dropdown"
  filterCount={true}
  filterGhostCommentsInSidebar={false}
  systemFiltersOperator="and"
  defaultMinimalFilter="open"
/>
```

```html
<!-- HTML — same shape, kebab-cased attributes; multi-value props as JSON strings -->
<velt-comments-sidebar-v2
  minimal-filters='[{"type":"filter","fields":[{"field":"status"}]},{"type":"sort","sorts":["date","unread"]}]'
  filter-operator="and"
  filter-panel-layout="bottomSheet"
  filter-option-layout="dropdown"
  filter-count="true"
  filter-ghost-comments-in-sidebar="false"
  system-filters-operator="and"
  default-minimal-filter="open"
></velt-comments-sidebar-v2>
```

**Active-selections form (`CommentSidebarFilters`)** — pass an object keyed by field instead of a `FilterField[]` to apply selected values directly. User/location identities are objects, not bare id strings. Included keys replace their current selections; omitted keys are preserved; a present-but-empty array clears one field; `{}` clears all client-provided selections; **Reset** in the Main Filter panel clears them too:

```jsx
<VeltCommentsSidebarV2
  filters={{
    status: ['OPEN'],
    people: [{ userId: '1.1' }, { userId: '2.3' }],
    location: [{ locationName: 'Home' }],
  }}
/>
```

```html
<velt-comments-sidebar-v2></velt-comments-sidebar-v2>
<script>
  const sidebar = document.querySelector('velt-comments-sidebar-v2');
  sidebar.filters = {
    status: ['OPEN'],
    people: [{ userId: '1.1' }, { userId: '2.3' }],
    location: [{ locationName: 'Home' }],
  };
</script>
```

**Incorrect (V1-style bare-id selections):**

```jsx
// Bare id strings for people/location no longer match the CommentSidebarFilters shape
<VeltCommentsSidebarV2
  filters={{ status: ['open'], people: ['1.1', '2.3'] }}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `string \| FilterField[] \| CommentSidebarFilters` | `[]` | Main Filter panel sections, OR a `CommentSidebarFilters` object of active selections. Included selection keys replace their values, omitted keys are preserved, and **Reset** clears the client-provided selections. |
| `miniFilters` | `string \| FilterField[]` | `[]` | Single header funnel dropdown. |
| `minimalFilters` | `string \| SidebarMinimalFilterConfig[]` | `[]` | Multiple configurable header dropdowns. Replaces the single mini-filter funnel when present. |
| `filterOperator` | `'and' \| 'or'` | `'and'` | Cross-field combination of active filter selections. Directly configures the V2 filter engine and shares its effective value with the `systemFiltersOperator` input / API. |
| `filterPanelLayout` | `'bottomSheet' \| 'menu'` | `'bottomSheet'` | Main Filter panel layout. |
| `filterOptionLayout` | `'dropdown' \| 'checkbox'` | `'dropdown'` | How options render within a filter section. |
| `filterCount` | boolean | `true` | Per-option facet counts. Counts remain **absolute** within the current page-scoped annotation set and do **not** shrink around selections supplied through `setCommentSidebarFilters()`. Disabling improves performance. |
| `filterGhostCommentsInSidebar` | boolean | `false` | Hide ghost comments from the list. |
| `systemFiltersOperator` | `'and' \| 'or'` | `'and'` (effective) | Combines selections across **different** filter fields; values within one field always use OR. Also applies to client filters set via `setCommentSidebarFilters()` and is mirrored by `applyCommentSidebarClientFilters()`. An explicit `filterOperator` set at init is preserved over the shared operator's default. |
| `defaultMinimalFilter` | `'all' \| 'read' \| 'unread' \| 'resolved' \| 'open' \| 'assignedToMe' \| 'reset'` | — | Default active quick filter applied on load. `all` / `unread` / `read` / `open` / `assignedToMe` hide terminal statuses unless a terminal status is explicitly selected; the `resolved` quick filter is additive (reveals resolved comments on top of the visible statuses). |

#### Default sort and quick-filter (V2)

| Prop | Type | Description |
|------|------|-------------|
| `sortBy` | [`SortBy`](#) | Default sort key — built-in preset (`'date'`, `'unread'`) or a dot-path (e.g. `'comments.createdAt'`). Sets the default sort; does not render a sort dropdown on its own. |
| `sortOrder` | [`SortOrder`](#) — `'asc' \| 'desc'` | Default sort direction. |

```jsx
<VeltCommentsSidebarV2 sortBy="comments.createdAt" sortOrder="desc" defaultMinimalFilter="open" />
```

#### `applyCommentSidebarClientFilters()` — programmatic filter pipeline

Apply a `CommentSidebarFilters` payload to an annotation array client-side, honoring the current `systemFiltersOperator`. Backs the V2 declarative filter pipeline; reach for it when filtering annotations outside the sidebar (custom previews, off-screen counts, exports).

```typescript
const commentElement = client.getCommentElement();
const filtered: CommentAnnotation[] = commentElement.applyCommentSidebarClientFilters(
  annotations,
  filters,
);
```

- Params: `annotations: CommentAnnotation[]`, `filters: CommentSidebarFilters`.
- Returns: `CommentAnnotation[]`.
- No React hook — call on `commentElement`.

#### `setCommentSidebarFilters()` — merge / replace / clear semantics (V2)

`setCommentSidebarFilters()` writes into the sidebar's active selections; the values render as checked options in the Main Filter panel and are cleared by **Reset**. Each call is a partial update, not a full overwrite: keys included in the payload replace their current selections, while omitted keys are preserved. A present-but-empty array clears one field, and an empty object clears all client-provided selections.

```typescript
const commentElement = client.getCommentElement();

// Apply / replace selections for specific fields
commentElement.setCommentSidebarFilters({
  status: ['OPEN'],
  involved: [{ userId: 'user-123' }],
  location: [{ locationName: 'Home' }],
});

// Clear a single field — other client-provided selections stay
commentElement.setCommentSidebarFilters({ location: [] });

// Clear everything the client has supplied
commentElement.setCommentSidebarFilters({});
```

Normalization used by the sidebar's active selections:

- `location`: matched by `id` (numeric `id` compares to string filter values; `id: 0` is valid), with `locationName` as fallback when `id` is `null` / `undefined` / empty.
- `people` / `assigned` / `tagged` / `involved`: matched by `userId`, with `email` as fallback when `userId` is absent. Email-only records do not create duplicate filter options.
- `status` / `priority` / `category`: matched by the provided ids without further normalization.
- `accessModes`: `'public'` or `'private'` — recognizes both legacy `iam.accessMode` and new `visibilityConfig` (`restricted` / `organizationPrivate` → `'private'`).
- `version`: matched by `id`.
- Custom fields (`[key: string]`): string values or `{ id?, name? }` objects.

A non-empty client selection filters even when its field is not declared in the Main Filter panel; empty undeclared fields are ignored, and declared fields are not duplicated. Facet counts stay absolute — see `filterCount` above.

#### `setSystemFiltersOperator()` — cross-field combinator (V2)

Set how selections from **different** sidebar filter fields are combined. Values within one field always use OR.

```typescript
const commentElement = client.getCommentElement();
commentElement.setSystemFiltersOperator('or');   // 'and' | 'or'
```

- Params: `operator: 'and' | 'or'`.
- Returns: `void`.
- Effective default: `'and'`.
- Also applies to client filters set via `setCommentSidebarFilters()`, including any value written before the sidebar initializes.
- An explicit `filterOperator` set at init is preserved over the shared operator's default.

#### `setSidebarButtonCountType()` — sidebar-button badge source (V2)

Change what the sidebar button count badge reflects.

```typescript
const commentElement = client.getCommentElement();
commentElement.setSidebarButtonCountType('filter');   // 'default' | 'filter'
```

- `'default'` — count of comments in open and in-progress states.
- `'filter'` — count of the sidebar's currently filtered list, including `0` for an empty result. Updates when comments are deleted. When `filterCommentsOnDom` is enabled, the same filtered list also gates which pins render on the page. The current filtered result is preserved while the sidebar is loading and is cleared when the sidebar is destroyed, so a removed sidebar no longer gates the badge or on-page pins.

#### Default status selection (V2)

On first load, the Status field starts with **Open** plus every **In Progress** status selected; the sidebar shows active comments by default. The default selection is skipped when:

- Filter state was restored from `sessionStorage`.
- A caller supplied a status selection through `setCommentSidebarFilters()`.
- The user has already changed the Status selection.

If the status catalog loads after the sidebar renders and the user hasn't touched Status, the default selection refreshes to match the catalog's current Open + In Progress statuses. **Reset** does not re-apply the default statuses — clear the Status field or select **All** to show resolved / terminal comments.

#### Priority "Not set" option (`includeUnset`)

The default Priority field includes a **Not set** option for comments without a priority. Opt out by supplying a custom `FilterField` with `includeUnset: false`:

```jsx
<VeltCommentsSidebarV2
  filters={[
    { field: 'status' },
    { field: 'priority', includeUnset: false },
  ]}
/>
```

#### Location identity + people filter identity (V2)

The sidebar identifies a location by its `id`, falling back to `locationName` when `id` is `null`, `undefined`, or an empty string. `id: 0` is valid, numeric annotation ids compare with equivalent string filter values, and `id` takes precedence when both fields are present. This identity is used consistently by grouping, location filter options and matching, page mode, and client filters (`setCommentSidebarFilters()`). Comments without any location context appear in the **Others** group.

People / Involved / Assigned / Tagged options are keyed by `userId` with the user's display name as the label and email as fallback. Records containing only an email do not create filter options — this prevents duplicate options when another record for the same person contains a `userId`.

#### Grouping expansion defaults (V2)

- **Location grouping** — the current + additional-location groups start expanded; other location groups start collapsed.
- **Document grouping** — the current document starts expanded; other documents start collapsed.
- **Status / priority / custom-field grouping** — all groups start expanded.
- Precedence: explicit expand > explicit collapse > grouping default. Both overrides persist in `sessionStorage`.
- A real location change resets overrides so the new current group expands. The initial location emitted during a reload preserves restored overrides.

`CommentSidebarGroup.isExpanded` is no longer just a boolean default: an omitted value is resolved from the user's overrides plus the current grouping default per the precedence above.

#### `pageMode` uses location identity (V2)

The page-mode composer list is scoped by the current location identity, so a location supplied with only `locationName` behaves like an id-based location.

#### Pages filter and current page (V2)

The Pages filter floats the current page to the top of its option list. With `currentLocationSuffix={true}`, the option and its selected chip show "(This page)". Filter option, option name, and selected-chip wireframes receive `isCurrentPage` for custom treatment via `velt-if` / `velt-class`. The option name is nested inside `.velt-filter-option-name-wrap`, so direct-child CSS selectors from its former parent no longer match.

#### Virtual-scroll row clipping (V2)

Rows wider than the sidebar viewport are clipped to sidebar width rather than producing a horizontal scrollbar. Tune the virtual-scroll window via `measuredSize` / `minBufferPx` / `maxBufferPx` (defaults `220` / `1000` / `2000`).

#### V2 type vocabulary

V2-only types that back the declarative pipeline. They are consumed exclusively through V2 props (filter / sort / group / list / facet) — keep them co-located with this surface rule rather than mixing them into the core type reference.

```typescript
// Active-selection payload consumed by `filters={...}`, setCommentSidebarFilters(),
// and applyCommentSidebarClientFilters(). Included keys REPLACE; omitted keys are preserved.
interface CommentSidebarFilters {
  location?:   { id?: string | number; locationName?: string }[];
  document?:   { id: string }[];
  people?:     { userId?: string; email?: string }[];
  tagged?:     { userId?: string; email?: string }[];
  assigned?:   { userId?: string; email?: string }[];
  involved?:   { userId?: string; email?: string }[];
  priority?:   string[];
  status?:     string[];
  category?:   string[];
  version?:    { id: string }[];
  accessModes?: CommentAccessMode[];             // 'public' | 'private'
  // Custom fields — string values or { id?, name? } objects
  [key: string]: string[] | { id?: string; name?: string }[] | undefined;
}

// Filter field definition (panel sections + minimal-filter `filter` dropdowns)
interface FilterField {
  field: string;                              // BuiltInFilterFieldId or custom id
  label?: string;
  select?: 'single' | 'multi';
  searchable?: boolean;
  showCounts?: boolean;
  icon?: string;
  valuePath?: string;                         // dot-path for custom fields
  includeUnset?: boolean;
  placeholder?: string;
  groupable?: boolean;
  order?: string[];
  options?: SidebarFilterValue[];
}

// Single selectable option inside a FilterField — { id, label, count?, icon? }
interface SidebarFilterValue { /* id + display + optional count/icon */ }

// One dropdown in the minimalFilters bar
interface SidebarMinimalFilterConfig {
  type?: SidebarFilterDropdownType;           // 'filter' | 'sort' | 'quick' | 'actions'
  label?: string;
  field?: string;
  fields?: FilterField[];                     // for type === 'filter'
  sorts?: (string | SidebarSortConfig)[];     // for type === 'sort' or 'actions'
  actions?: (string | SidebarQuickFilterConfig)[]; // for type === 'quick' or 'actions'
}

// One sort option
interface SidebarSortConfig {
  label?: string;
  preset?: string;                            // 'date' | 'unread' | ...
  path?: string;
  field?: string;
  order?: 'asc' | 'desc';
}

// One quick-filter predicate
interface SidebarQuickFilterConfig {
  label?: string;
  preset?: string;                            // 'open' | 'resolved' | 'unread' | ...
  path?: string;
  field?: string;
  value?: any;
  conditions?: SidebarQuickCondition[];
  operator?: 'and' | 'or';
}

interface SidebarQuickCondition {
  path?: string;
  field?: string;
  value: any;
}

// List grouping + flattened virtual-scroll rows.
// `isExpanded` in V2 is resolved from user overrides (persisted in sessionStorage)
// combined with the current grouping default — not a plain "default true" flag.
interface SidebarAnnotationGroup {
  id: string;
  label: string;
  count: number;
  isExpanded: boolean;
  isCurrentPage?: boolean;
  annotations: CommentAnnotation[];
}

type SidebarListRow =
  | { type: 'group'; group: SidebarAnnotationGroup }
  | { type: 'annotation'; annotation: CommentAnnotation; groupId: string };

// Operators + dropdown kinds
type FilterFieldOperator = 'and' | 'or';
type SidebarFilterDropdownType = 'filter' | 'sort' | 'quick' | 'actions';

// Built-in field ids — recognized natively by the V2 filter pipeline
const BUILT_IN_FILTER_FIELD_IDS = [
  'status', 'priority', 'category', 'people', 'assigned',
  'tagged', 'involved', 'location', 'version', 'document',
] as const;
type BuiltInFilterFieldId = typeof BUILT_IN_FILTER_FIELD_IDS[number];

// Section header chips + "All" toggle (panel-level controls)
type SectionControlChip = { id: string; label: string; isAll: boolean };
type SectionAllOption = { show: boolean; label: string };

// Helper types for the resolved sort / quick pipelines
type SidebarSortCriterion = unknown;   // resolved from SidebarSortConfig
type SidebarQuickPredicate = unknown;  // resolved from SidebarQuickFilterConfig

// Default sort surface (props sortBy / sortOrder)
type SortBy = string;
type SortOrder = 'asc' | 'desc';

// Custom-field resolver registration
interface FacetContext {
  annotations: CommentAnnotation[];
  field: FilterField;
}

interface FilterFieldResolver {
  id: string;
  optionSource: 'catalog' | 'scan';
  buildOptions: (ctx: FacetContext) => SidebarFilterValue[];
  matches: (annotation: CommentAnnotation, selectedValueIds: string[]) => boolean;
}
```

**Key V2 Differences from V1:**

- **Declarative filter / sort model** — `filters` / `miniFilters` / `minimalFilters` (+ `sortBy` / `sortOrder` / `defaultMinimalFilter`) replace the legacy `minimalFilter` + `advancedFilters` system.
- **CDK virtual scroll** — built-in for large comment lists; tune via `measuredSize` / `minBufferPx` / `maxBufferPx`.
- **Focused-thread view** — when `focusedThreadMode={true}`, clicking a comment opens the thread inline inside the sidebar.
- **Primitive tree** — every section (header, search, filter button, filter container, list group header, fullscreen button, list, thread view, page-mode composer) is an independently importable primitive that accepts `parentLocalUIState` and supports `velt-class` conditional styling. See `ui/ui-v2-primitives.md`.
- **`MinimalActionsDropdown` removed** — replaced by the combined `actions` filter-dropdown configured via `minimalFilters`.

**Verification Checklist:**
- [ ] `VeltCommentsSidebarV2` (or `<velt-comments-sidebar-v2>`) is mounted directly for per-section customization — the V2 setup docs no longer cover the legacy V1 component prop opt-in
- [ ] `focusedThreadMode` is set explicitly when inline thread expansion is needed
- [ ] `forceClose` is driven by state when not using the new default of `true` (V2 default flipped from `false` to `true`)
- [ ] Filter / sort props are configured together (`filters` + `minimalFilters` for visible UI, `sortBy` / `sortOrder` for default ordering)
- [ ] Active-selection payloads use the `CommentSidebarFilters` shape — `people`/`involved`/`assigned`/`tagged` are `{ userId?, email? }[]`, `location` is `{ id?, locationName? }[]`; do **not** pass bare id strings
- [ ] `setCommentSidebarFilters()` calls are treated as partial updates (included keys replace, omitted keys preserved); use `{ field: [] }` to clear one field and `{}` to clear all
- [ ] `systemFiltersOperator` is set explicitly when the sidebar needs `'or'` combination across fields (effective default is `'and'`); `setSystemFiltersOperator()` is used for runtime changes
- [ ] `filterOperator` is set explicitly at init when it must differ from the shared `systemFiltersOperator` default
- [ ] Sidebar button badge source is chosen via `sidebarButtonCountType` / `setSidebarButtonCountType('default' | 'filter')`; `filterCommentsOnDom` coupling is understood when `'filter'` is used
- [ ] `applyCommentSidebarClientFilters()` is used for off-sidebar filtering instead of reimplementing the predicate pipeline
- [ ] Built-in filter fields are referenced via `BuiltInFilterFieldId` ids; custom fields supply `valuePath` (and a `FilterFieldResolver` when option sourcing is non-trivial)
- [ ] Priority field opts out of the **Not set** option via `includeUnset: false` on its `FilterField` when unset priorities should be hidden
- [ ] Grouping code does not assume `CommentSidebarGroup.isExpanded` is a plain "default true" — expansion resolves from user overrides (persisted in `sessionStorage`) combined with the current grouping default
- [ ] Sidebar events (`sidebarOpen`, `sidebarClose`, `commentClick`, `commentNavigationButtonClick`, `fullscreenClick`) are consumed via `useCommentEventCallback` / `commentElement.on()`, not V1-style props, and subscriptions are cleaned up
- [ ] With `lazyLoadResolvedComments` on, terminal status options show no count until resolved comments are unlocked

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/setup — "V2 Setup"
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior#events — "V2 Events" (`sidebarOpen`, `sidebarClose`, `fullscreenClick`)
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior#commentclick — `commentClick`
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior — "V2 Customize Behavior" (declarative filters / sort / `applyCommentSidebarClientFilters` / `setCommentSidebarFilters` / grouping defaults / location + people identity / virtual-scroll clipping)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#applycommentsidebarclientfilters — `applyCommentSidebarClientFilters()`
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setcommentsidebarfilters — `setCommentSidebarFilters()` (V2 merge/replace semantics)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setsystemfiltersoperator — `setSystemFiltersOperator()`
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setsidebarbuttoncounttype — `setSidebarButtonCountType()`
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentsidebarfilters — `CommentSidebarFilters` payload shape
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentssidebarv2props — V2 props reference (incl. `FilterField`, `SidebarMinimalFilterConfig`, `SortBy` / `SortOrder`)

---

## 6. UI Customization

**Impact: MEDIUM**

Visual customization patterns for comment components. Includes dialog customization, bubble styling, wireframe component usage, and standalone autocomplete primitives.

### 6.1 Customize Comment Bubble Display

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

**VeltCommentBubble Props:**

| Prop | Type | Description |
|------|------|-------------|
| `targetElementId` | string | ID of associated element |
| `commentCountType` | string | "total" or "unread" |
| `context` | object | Custom metadata for matching |

**Using with Context (complex matching):**

```jsx
<VeltCommentBubble
  context={{ rowId: 'row-1', columnId: 'col-A' }}
  commentCountType="unread"
/>
```

**Disable Triangle (Popover Mode):**

When using bubbles, you may want to disable the default triangle indicator:

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

`VeltCommentBubble` now exposes three independently importable React primitives for fine-grained composition. Previously only available as HTML elements, these now have React wrappers:

<!-- TODO (v5.0.2-beta.13): Verify full prop signatures for VeltCommentBubbleAvatar, VeltCommentBubbleCommentsCount, and VeltCommentBubbleUnreadIcon. Release note confirms component names, import path, and defaultCondition prop, but full prop tables are not specified in the release notes. -->

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

**Verification Checklist:**
- [ ] targetElementId matches element ID
- [ ] commentCountType set appropriately
- [ ] Bubble displays in correct location
- [ ] Triangle disabled if using bubble as indicator
- [ ] React primitive sub-components imported from `@veltdev/react` (v5.0.2-beta.13+)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/popover - "Step 5: Add the Comment Bubble component"
- https://docs.velt.dev/ui-customization/features/async/comments/comment-bubble/wireframes - Customization

---

### 6.2 Customize Comment Dialog Appearance

**Impact: MEDIUM (Match comment dialogs to your application design system)**

Customize comment dialog appearance using variants, styling, and wireframe components to match your design system.

**Pre-defined Variants:**

```jsx
<VeltComments dialogVariant="variant-name" />
```

**Dark Mode:**

```jsx
<VeltCommentDialog darkMode={true} />
```

**Disable Shadow DOM (for CSS access):**

```jsx
<VeltComments shadowDom={false} />
```

**`VeltCommentDialogProps` — full prop surface (v5.0.2-beta.11+):**

The React interface mirrors the underlying `<velt-comment-dialog>` HTML element's full attribute set. Use these props to control rendering modes, layout, sort, edit-mode placeholders, target binding for programmatic submission, and visual styling.

```typescript
interface VeltCommentDialogProps {
  annotationId?: string;
  multiThreadAnnotationId?: string;

  // Display & mode flags
  darkMode?: boolean;
  readOnly?: boolean;
  sidebarMode?: boolean;
  isFocusedThreadEnabled?: boolean;
  openAnnotationInFocusMode?: boolean;
  expandOnSelection?: boolean;
  inlineCommentMode?: boolean;
  inboxMode?: boolean;
  isInsidePdfViewer?: boolean;
  multiThread?: boolean;
  commentComposerMode?: boolean;
  dialogSelection?: boolean;
  dialogMode?: boolean;
  focusedThreadMode?: boolean;
  pageModeComposer?: boolean;
  messageTruncation?: boolean;
  initialEditCommentIndex?: number | string | null;
  messageTruncationLines?: number | string;

  // Layout & styling
  variant?: string;
  composerPosition?: string;
  sortBy?: string;
  sortOrder?: string;
  commentPinType?: 'bubble' | 'pin' | 'chart' | 'text';

  // Target & context binding
  containerComponentId?: string;
  targetElementId?: string;
  targetComposerElementId?: string; // For programmatic submitComment()
  locationVersion?: string;
  locationDisplayName?: string;
  context?: any;

  // Placeholders (paired with config-component-props edit-mode rule)
  commentPlaceholder?: string;
  replyPlaceholder?: string;
  editPlaceholder?: string;
  editCommentPlaceholder?: string;
  editReplyPlaceholder?: string;
}
```

```jsx
// Common combinations
<VeltCommentDialog
  darkMode={true}
  readOnly={false}
  multiThread={true}
  sortBy="timestamp"
  sortOrder="desc"
  targetComposerElementId="my-composer"
/>
```

**Wireframe Customization (full control):**

Velt provides wireframe components for complete UI customization:

```jsx
import { VeltCommentDialogWireframe } from '@veltdev/react';

<VeltCommentDialogWireframe.Header>
  {/* Custom header content */}
</VeltCommentDialogWireframe.Header>

<VeltCommentDialogWireframe.Body>
  {/* Custom body content */}
</VeltCommentDialogWireframe.Body>
```

**Available Wireframe Components:**

| Component | Purpose |
|-----------|---------|
| `GhostBanner` | Banner for ghost/anonymous comments |
| `PrivateBanner` | Banner for private comments |
| `AssigneeBanner` | Shows assigned user |
| `Header` | Dialog header section |
| `Status` | Comment status indicator |
| `Priority` | Priority selector |
| `Options` | Comment options menu |

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

**Thread-Card Primitives (v5.0.2-beta.11+):**

Three new primitives let you place reaction pins, the assign-to button, and an inline edit composer directly inside a custom thread-card composition.

```jsx
import {
  VeltCommentDialogThreadCardReactionPin,
  VeltCommentDialogThreadCardAssignButton,
  VeltCommentDialogThreadCardEditComposer,
} from '@veltdev/react';

// Reaction pin inside a thread card
<VeltCommentDialogThreadCardReactionPin
  annotationId="abc123"
  reactionId="reaction-1"
  commentIndex={0}
/>

// Assign-to button inside a thread card
<VeltCommentDialogThreadCardAssignButton
  annotationId="abc123"
  commentId="456"
/>

// Inline edit composer inside a thread card
<VeltCommentDialogThreadCardEditComposer
  annotationId="abc123"
  commentId="456"
/>
```

```html
<!-- HTML — primitive custom elements -->
<velt-comment-dialog-thread-card-reaction-pin
  annotation-id="abc123"
  reaction-id="reaction-1"
  comment-index="0">
</velt-comment-dialog-thread-card-reaction-pin>

<velt-comment-dialog-thread-card-assign-button
  annotation-id="abc123"
  comment-id="456">
</velt-comment-dialog-thread-card-assign-button>

<velt-comment-dialog-thread-card-edit-composer
  annotation-id="abc123"
  comment-id="456">
</velt-comment-dialog-thread-card-edit-composer>
```

| Primitive | Extra Props (beyond Common Inputs) |
|-----------|-----------------------------------|
| `VeltCommentDialogThreadCardReactionPin` | `reactionId`, `commentObj`, `commentIndex`, `index` |
| `VeltCommentDialogThreadCardAssignButton` | `commentObj`, `commentId`, `commentIndex` |
| `VeltCommentDialogThreadCardEditComposer` | `commentObj`, `commentId`, `commentIndex` |

**`VeltCommentDialogOptionsDropdownContent` — show/hide individual options (v5.0.2-beta.11+):**

Previously documented as common-inputs-only; now exposes per-option enable flags so you can selectively render the assign / edit / notifications / private-mode / mark-as-read items inside the options dropdown.

```jsx
// React — show only the edit option
<VeltCommentDialogOptionsDropdownContent
  annotationId="abc123"
  enableEdit={true}
  enableAssignment={false}
  enableNotifications={false}
  enablePrivateMode={false}
  enableMarkAsRead={false}
/>
```

```html
<!-- HTML — same shape, kebab-case string attrs -->
<velt-comment-dialog-options-dropdown-content
  annotation-id="abc123"
  enable-edit="true"
  enable-assignment="false"
  enable-notifications="false"
  enable-private-mode="false"
  enable-mark-as-read="false">
</velt-comment-dialog-options-dropdown-content>
```

| Prop | Type | Description |
|------|------|-------------|
| `commentObj` | `any \| string` | Comment data object (or serialized JSON string for HTML) |
| `commentIndex` | `number \| string` | Index of comment in the array |
| `enableAssignment` | `boolean` | Shows the assign option |
| `enableEdit` | `boolean` | Shows the edit option |
| `enableNotifications` | `boolean` | Shows the notifications option |
| `enablePrivateMode` | `boolean` | Shows the private mode option |
| `enableMarkAsRead` | `boolean` | Shows the mark-as-read option |

**Collapsed-Replies-Preview Primitives (v5.0.2-beta.37+):**

Two primitives render the "Show N replies…" divider in a comment dialog's collapsed teaser (shown in the non-selected/preview state when `collapsedRepliesPreview` is enabled). They appear only when a thread has more than two comments.

```jsx
import {
  VeltCommentDialogMoreReplyCount,
  VeltCommentDialogMoreReplyText,
} from '@veltdev/react';

// Hidden-reply count: annotation.comments.length - 2, clamped to >= 0
<VeltCommentDialogMoreReplyCount annotationId="abc123" />

// Pluralized noun: "reply" when one reply is hidden, otherwise "replies"
<VeltCommentDialogMoreReplyText annotationId="abc123" />
```

```html
<velt-comment-dialog-more-reply-count annotation-id="abc123"></velt-comment-dialog-more-reply-count>
<velt-comment-dialog-more-reply-text annotation-id="abc123"></velt-comment-dialog-more-reply-text>
```

Both accept Common Inputs only. In React wireframe mode the public primitive is also exposed as the named sub-properties `VeltCommentDialogMoreReply.Count` and `.Text`; see `wireframe-variables-comment-dialog` for the separate wireframe-tree names.

**Verification Checklist:**
- [ ] Variant applied if using pre-defined styles
- [ ] shadowDom={false} if using custom CSS
- [ ] Wireframes used for complex customization
- [ ] `VeltCommentDialogProps` flags use React camelCase (e.g. `darkMode`, `readOnly`, `pageModeComposer`); HTML attributes use kebab-case
- [ ] Thread-card primitives (`VeltCommentDialogThreadCard{ReactionPin,AssignButton,EditComposer}`) receive `annotationId` (+ `commentId` or `commentIndex` where relevant)
- [ ] `VeltCommentDialogOptionsDropdownContent` sets `enable*` flags for any individual options it should show; omitted flags default to the SDK's built-in behavior
- [ ] `VeltCommentDialogMoreReply{Count,Text}` used only inside the collapsed-replies-preview divider (threads with more than two comments); both take Common Inputs only

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Structure
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/wireframes#styling - Styling
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/wireframes#pre-defined-variants - Variants
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentdialogprops - VeltCommentDialogProps full attribute set
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/primitives - Thread-card primitives and options-dropdown enable flags

---

### 6.3 Customize the Suggestion Card with Exported Primitives and Wireframes Only

**Impact: MEDIUM (Importing a primitive that @veltdev/react does not export breaks the build; use the shipped suggestion action primitives and wireframe slots instead)**

Suggestion annotations (`type: 'suggestion'`, from agents or humans) render as a suggestion card with Accept / Reject controls and, once resolved, a resolution banner. The generated primitives catalog is the source of truth for what exists: the `VeltCommentDialogAgentSuggestion*` family (29 components) is **Beta and not exported by `@veltdev/react` yet**, so importing one today fails. Earlier names such as `VeltCommentDialogAgentSuggestionActionsActionAccept` or `VeltCommentDialogAgentSuggestionHeaderMenu` never existed.

**Incorrect (importing the unexported Beta family or invented names):**

```jsx
import {
  VeltCommentDialogAgentSuggestionBody,               // Beta: not exported yet
  VeltCommentDialogAgentSuggestionActionsActionAccept, // never existed
} from '@veltdev/react';
```

**Correct (exported suggestion action primitives):**

```jsx
import {
  VeltCommentDialogSuggestionActions,
  VeltCommentDialogSuggestionActionAccept,
  VeltCommentDialogSuggestionActionReject,
} from '@veltdev/react';

function SuggestionControls({ annotationId }) {
  return (
    <VeltCommentDialogSuggestionActions annotationId={annotationId}>
      <VeltCommentDialogSuggestionActionAccept annotationId={annotationId} />
      <VeltCommentDialogSuggestionActionReject annotationId={annotationId} />
    </VeltCommentDialogSuggestionActions>
  );
}
```

**Correct (custom buttons that resolve the suggestion through the API):**

```jsx
const commentElement = client.getCommentElement();

// Same action as the built-in buttons: sets suggestion.status, flips annotation.type to 'comment',
// and emits suggestionAccepted / suggestionRejected
await commentElement.acceptSuggestion({ annotationId });
await commentElement.rejectSuggestion({ annotationId });
```

```js
// Other Frameworks
const commentElement = Velt.getCommentElement();
await commentElement.acceptSuggestion({ annotationId: 'ANNOTATION_ID' });
```

**Wireframe slots for the suggestion card:**

The registered wireframe slot elements for the card are the `velt-comment-dialog-agent-suggestion-*-wireframe` family. The slot tree under the Comment Dialog wireframe is:

```
AgentSuggestion
├── Body / Header / Footer(.OpenComment) / Actions(.Accept, .Reject)
├── Header → Agent(.Avatar, .Name) / Author(.Avatar, .Name) / Timestamp
│            Menu(.Trigger, .Content → Item(.Icon, .Label))
└── Banner → Avatar(.UserImage, .StatusIcon) / Label / Separator / Timestamp / ResolverUserName
```

```html
<velt-wireframe style="display:none;">
  <velt-comment-dialog-agent-suggestion-actions-wireframe>
    <velt-comment-dialog-agent-suggestion-action-accept-wireframe></velt-comment-dialog-agent-suggestion-action-accept-wireframe>
    <velt-comment-dialog-agent-suggestion-action-reject-wireframe></velt-comment-dialog-agent-suggestion-action-reject-wireframe>
  </velt-comment-dialog-agent-suggestion-actions-wireframe>
</velt-wireframe>
```

The Comment Dialog wireframes feature page shows the same card under `VeltCommentDialogWireframe.Suggestion.*` (`Header`, `Body`, `Footer`, `Actions.ActionAccept` / `Actions.ActionReject`, `Banner`). Before shipping wireframe markup, confirm the exact slot name against the Wireframe components reference, which lists every registered slot element.

**Replacing the Accept / Reject row with your own chips:**

Set `actions` on the comment or annotation to render customer-defined chips in place of the built-in Accept / Reject row, then handle `commentActionClicked`. See `data-comment-actions.md`.

**Verification Checklist:**
- [ ] No imports from the `VeltCommentDialogAgentSuggestion*` family until it ships in `@veltdev/react`
- [ ] Custom Accept / Reject controls use `VeltCommentDialogSuggestionAction*` primitives or call `acceptSuggestion()` / `rejectSuggestion()`
- [ ] Wireframe slot names checked against the Wireframe components reference
- [ ] HTML wireframe wrapper uses `style="display:none;"` and no self-closing custom elements

**Source Pointers:**
- https://docs.velt.dev/ui-customization/reference/primitives - Primitives catalog (Beta note on `VeltCommentDialogAgentSuggestion*`)
- https://docs.velt.dev/ui-customization/reference/wireframe-components - Wireframe slot elements (agent suggestion sub-family)
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/wireframes#suggestion - Suggestion wireframes
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/primitives#veltcommentdialogsuggestionactionaccept - VeltCommentDialogSuggestionActionAccept
- https://docs.velt.dev/async-collaboration/suggestions/overview - Suggestions lifecycle

---

### 6.4 Set defaultCondition on V2 Primitive Sub-Components to Control Default Rendering

**Impact: MEDIUM (Prevents the SDK's default show/hide logic from conflicting with custom wireframe compositions in V2 primitive component families)**

Seven comment component families use the V2 primitive architecture: Comment Pin (6 primitives), Comment Bubble (3, HTML-only), Text Comment (7), Inline Comments Section (24), Multi-Thread Comment Dialog (25), Sidebar Button (3), and Comments Sidebar V2 (56+ — expanded with the new Search / FilterButton / FilterContainer / FullscreenButton families this release). Every primitive in these families accepts a `defaultCondition` / `default-condition` prop. When a wireframe replaces a section of the UI, set `defaultCondition={false}` to bypass the SDK's built-in default show/hide logic and prevent double-rendering or unintended visibility toggles.

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
  <VeltCommentPinWireframe.UnreadCommentIndicator defaultCondition={false}>
    <MyCustomContent />
  </VeltCommentPinWireframe.UnreadCommentIndicator>
</VeltWireframe>
```

**Correct (HTML — use default-condition attribute):**

```html
<!-- Inside a <velt-wireframe style="display:none;"> wrapper -->
<velt-wireframe style="display:none;">
  <velt-comment-pin-unread-comment-indicator-wireframe default-condition="false">
    <!-- Custom content replaces the default primitive rendering -->
  </velt-comment-pin-unread-comment-indicator-wireframe>
</velt-wireframe>
```

**V2-Migrated Component Families:**

| Family | Primitive Count | Notes |
|--------|----------------|-------|
| Comment Pin | 6 | React + HTML |
| Comment Bubble | 3 | HTML-only primitives |
| Text Comment | 7 | React + HTML |
| Inline Comments Section | 24 | React + HTML (ApplyButton promoted to React in v5.0.2-beta.11) |
| Multi-Thread Comment Dialog | 25 | React + HTML (`VeltMultiThreadCommentDialog` root added in v5.0.2-beta.11) |
| Sidebar Button | 3 | React + HTML |
| Comments Sidebar V2 | 56+ | React + HTML; standalone HTML sub-primitive tags use the singular `velt-comment-sidebar-*-v2` form (root stays plural `velt-comments-sidebar-v2`); React identifiers are also singular `VeltCommentSidebarV2*` |
| Comment Dialog Composer — Attachment Downloads | 2 | React + HTML; edit-mode only |

**Attachment Download Primitives (edit-mode composer):**

Two new primitives enable download buttons for attachments inside the edit-mode comment dialog composer. Non-wireframe integrations receive download buttons automatically; use these primitives only when building a custom wireframe composer.

- `VeltCommentDialogComposerAttachmentsImageDownload` — download button for image attachments
- `VeltCommentDialogComposerAttachmentsOtherDownload` — download button for non-image file attachments

Both accept an `annotationId` prop (required, `string`) providing the attachment context.

```jsx
// React — inside a custom wireframe composer
<VeltCommentDialogComposerAttachmentsImageDownload annotationId="abc123" />
<VeltCommentDialogComposerAttachmentsOtherDownload annotationId="abc123" />
```

```html
<!-- HTML -->
<velt-comment-dialog-composer-attachments-image-download annotation-id="abc123"></velt-comment-dialog-composer-attachments-image-download>
<velt-comment-dialog-composer-attachments-other-download annotation-id="abc123"></velt-comment-dialog-composer-attachments-other-download>
```

#### Comments Sidebar V2 — naming convention

> **Note:** The root container `VeltCommentsSidebarV2` / `<velt-comments-sidebar-v2>` is plural. **Every** standalone sub-primitive — React identifier *and* HTML custom-element tag — uses the singular form `VeltCommentSidebarV2*` / `<velt-comment-sidebar-*-v2>`. The HTML tag rename (plural → singular for sub-primitives) is the current release; React identifiers were already singular.

**Incorrect (old plural HTML / React identifiers):**

```jsx
<VeltCommentsSidebarV2>
  <VeltCommentsSidebarV2Skeleton />
  <VeltCommentsSidebarV2Panel>
    <VeltCommentsSidebarV2Header />
    <VeltCommentsSidebarV2List />
  </VeltCommentsSidebarV2Panel>
</VeltCommentsSidebarV2>
```

```html
<!-- Old plural HTML sub-primitive tags — no longer valid -->
<velt-comments-sidebar-v2>
  <velt-comments-sidebar-skeleton-v2></velt-comments-sidebar-skeleton-v2>
  <velt-comments-sidebar-panel-v2>
    <velt-comments-sidebar-header-v2></velt-comments-sidebar-header-v2>
    <velt-comments-sidebar-list-v2></velt-comments-sidebar-list-v2>
  </velt-comments-sidebar-panel-v2>
</velt-comments-sidebar-v2>
```

**Correct (singular sub-primitive names for React *and* HTML; root stays plural):**

```jsx
<VeltCommentsSidebarV2>
  <VeltCommentSidebarV2Skeleton />
  <VeltCommentSidebarV2Panel>
    <VeltCommentSidebarV2Header>
      <VeltCommentSidebarV2CloseButton />
      <VeltCommentSidebarV2FullscreenButton />
      <VeltCommentSidebarV2Search>
        <VeltCommentSidebarV2SearchIcon />
        <VeltCommentSidebarV2SearchInput />
      </VeltCommentSidebarV2Search>
      <VeltCommentSidebarV2FilterButton>
        <VeltCommentSidebarV2FilterButtonAppliedIcon />
      </VeltCommentSidebarV2FilterButton>
      <VeltCommentSidebarV2FilterDropdown />
    </VeltCommentSidebarV2Header>
    <VeltCommentSidebarV2List />
    <VeltCommentSidebarV2EmptyPlaceholder>
      <VeltCommentSidebarV2ResetFilterButton />
    </VeltCommentSidebarV2EmptyPlaceholder>
    <VeltCommentSidebarV2PageModeComposer />
    <VeltCommentSidebarV2FocusedThread>
      <VeltCommentSidebarV2FocusedThreadBackButton />
      <VeltCommentSidebarV2FocusedThreadDialogContainer />
    </VeltCommentSidebarV2FocusedThread>
  </VeltCommentSidebarV2Panel>
</VeltCommentsSidebarV2>
```

```html
<velt-comments-sidebar-v2>
  <velt-comment-sidebar-skeleton-v2></velt-comment-sidebar-skeleton-v2>
  <velt-comment-sidebar-panel-v2>
    <velt-comment-sidebar-header-v2>
      <velt-comment-sidebar-close-button-v2></velt-comment-sidebar-close-button-v2>
      <velt-comment-sidebar-fullscreen-button-v2></velt-comment-sidebar-fullscreen-button-v2>
      <velt-comment-sidebar-search-v2>
        <velt-comment-sidebar-search-v2-icon></velt-comment-sidebar-search-v2-icon>
        <velt-comment-sidebar-search-v2-input></velt-comment-sidebar-search-v2-input>
      </velt-comment-sidebar-search-v2>
      <velt-comment-sidebar-filter-button-v2>
        <velt-comment-sidebar-filter-button-v2-applied-icon></velt-comment-sidebar-filter-button-v2-applied-icon>
      </velt-comment-sidebar-filter-button-v2>
      <velt-comment-sidebar-filter-dropdown-v2></velt-comment-sidebar-filter-dropdown-v2>
    </velt-comment-sidebar-header-v2>
    <velt-comment-sidebar-list-v2></velt-comment-sidebar-list-v2>
  </velt-comment-sidebar-panel-v2>
</velt-comments-sidebar-v2>
```

| Identifier family (React + HTML) | Identifier | HTML element |
|----------------------------------|-----------|--------------|
| Skeleton | `VeltCommentSidebarV2Skeleton` | `velt-comment-sidebar-skeleton-v2` |
| Panel | `VeltCommentSidebarV2Panel` | `velt-comment-sidebar-panel-v2` |
| Header | `VeltCommentSidebarV2Header` | `velt-comment-sidebar-header-v2` |
| CloseButton | `VeltCommentSidebarV2CloseButton` | `velt-comment-sidebar-close-button-v2` |
| FullscreenButton (new) | `VeltCommentSidebarV2FullscreenButton` | `velt-comment-sidebar-fullscreen-button-v2` |
| Search (new) | `VeltCommentSidebarV2Search` (+ `Icon`, `Input`) | `velt-comment-sidebar-search-v2` (+ `-icon`, `-input`) |
| FilterButton (new) | `VeltCommentSidebarV2FilterButton` (+ `AppliedIcon`) | `velt-comment-sidebar-filter-button-v2` (+ `-applied-icon`) |
| FilterDropdown (+ subtree, incl. new `Content.List.Item.Count` and `Content.List.Category.Label` leaves) | `VeltCommentSidebarV2FilterDropdown*` | `velt-comment-sidebar-filter-dropdown-*-v2` |
| FilterContainer (new — Main Filter bottom-sheet subtree) | `VeltCommentSidebarV2FilterContainer*` | `velt-comment-sidebar-filter-container-*-v2` |
| List / ListItem | `VeltCommentSidebarV2List` / `*ListItem` | `velt-comment-sidebar-list-v2` / `velt-comment-sidebar-list-item-v2` |
| EmptyPlaceholder | `VeltCommentSidebarV2EmptyPlaceholder` | `velt-comment-sidebar-empty-placeholder-v2` |
| ResetFilterButton | `VeltCommentSidebarV2ResetFilterButton` | `velt-comment-sidebar-reset-filter-button-v2` |
| PageModeComposer | `VeltCommentSidebarV2PageModeComposer` | `velt-comment-sidebar-page-mode-composer-v2` |
| FocusedThread (+ subtree) | `VeltCommentSidebarV2FocusedThread*` | `velt-comment-sidebar-focused-thread-*-v2` |

> **Breaking change (Comment Sidebar V2 — current release):** `VeltCommentSidebarV2MinimalActionsDropdown` (and the `Trigger` / `Content` / `MarkAllRead` / `MarkAllResolved` children) plus the corresponding `velt-comments-sidebar-minimal-actions-dropdown-v2` HTML family have been **removed**. The bulk actions are now exposed by the combined `actions` filter-dropdown, configured via the `minimalFilters` input on `VeltCommentsSidebarV2`. Replace any `MinimalActionsDropdown` usage with a `FilterDropdown` configured as `{ type: 'actions', sorts: [...], actions: [...] }` — see `surface/surface-sidebar-v2.md`.

#### New V2 primitive families (current release)

- **Search** — header search container holding the icon + input leaves (`VeltCommentSidebarV2Search`, `*SearchIcon`, `*SearchInput`).
- **FilterButton** — header button that opens the Main Filter container; child `*FilterButtonAppliedIcon` surfaces the active-filter indicator.
- **FullscreenButton** — header leaf that emits `onFullscreenClick` when clicked.
- **FilterContainer** — root container for the Main Filter bottom-sheet / menu, holding:
  - `Title`, `GroupBy`, `ResetButton`, `ApplyButton`, `CloseButton` leaves.
  - `SectionList` → `Section` → `SectionLabel` (leaf) and `SectionField` → `SectionControl` (+ `SectionControlChevron`, `SectionControlValue`, `SectionControlChipList` → `SectionControlChip`, `SectionControlSearch`) and `SectionOptionList` → `SectionOption` (+ `SectionOptionCheckbox`, `SectionOptionName`, `SectionOptionCount`).

The `Search`, `FilterButton`, `FilterContainer`, and `FullscreenButton` families replace the customization surface previously occupied by `MinimalActionsDropdown`. Use the `actions` dropdown type on `minimalFilters` for bulk mark-all-read / mark-all-resolved — these primitive families are the new shape for that surface.

**`VeltInlineCommentsSectionFilterDropdownContentApplyButton` — React promotion (v5.0.2-beta.11+):**

Previously HTML-only; now exposed as a React component with `targetElementId` and `defaultCondition` props. This brings the Inline Comments Section primitive family count to 24.

```jsx
<VeltInlineCommentsSectionFilterDropdownContentApplyButton
  targetElementId="my-section"
  defaultCondition={true}
/>
```

```html
<velt-inline-comments-section-filter-dropdown-content-apply-button
  target-element-id="my-section"
  default-condition="true">
</velt-inline-comments-section-filter-dropdown-content-apply-button>
```

**`VeltMultiThreadCommentDialog` — new root primitive (v5.0.2-beta.11+):**

A new root component for the multi-thread comment dialog family, with a matching standalone `<velt-multi-thread-comment-dialog>` custom element. Multi-thread primitives can now also be used standalone by passing `multiThreadAnnotationId` to render with real annotation data without a parent root.

```jsx
<VeltMultiThreadCommentDialog
  multiThreadAnnotationId="thread-123"
  readOnly={false}
  defaultCondition={true}
  onSaveComment={(e) => console.log(e)}
/>
```

```html
<velt-multi-thread-comment-dialog
  multi-thread-annotation-id="thread-123"
  read-only="false"
  default-condition="true">
</velt-multi-thread-comment-dialog>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `annotationId` | `string` | — | The annotation ID |
| `multiThreadAnnotationId` | `string` | — | The multi-thread annotation ID |
| `annotation` | `any` | — | Annotation data object (serialized JSON in HTML) |
| `readOnly` | `boolean` | `false` | Disables user interaction |
| `defaultCondition` | `boolean` | `true` | When `false`, the component always renders regardless of internal state |
| `variant` | `string` | — | Visual variant for the component |
| `inboxMode` | `boolean` | `false` | Renders the dialog in inbox mode |
| `onSaveComment` | `Function` | — | Callback fired when a comment is saved (HTML: listen via `addEventListener('onSaveComment', ...)`) |

**Verification Checklist:**
- [ ] `defaultCondition={false}` is set on any V2 primitive whose section is fully replaced by a custom wireframe
- [ ] Primitive components are wrapped inside a `<VeltWireframe>` block (React) or `<velt-wireframe style="display:none;">` wrapper (HTML)
- [ ] HTML attributes use kebab-case: `default-condition="false"`
- [ ] Only primitives from the V2-migrated families are targeted (Comment Pin, Comment Bubble, Text Comment, Inline Comments Section, Multi-Thread Comment Dialog, Sidebar Button, Comments Sidebar V2)
- [ ] V2 sidebar sub-primitives use the singular `VeltCommentSidebarV2*` React identifiers **and** singular `velt-comment-sidebar-*-v2` HTML tags; the root component stays `VeltCommentsSidebarV2` / `velt-comments-sidebar-v2`
- [ ] Any `MinimalActionsDropdown` usage is migrated to a `FilterDropdown` configured via `minimalFilters: [{ type: 'actions', sorts: [...], actions: [...] }]`
- [ ] New families (`Search`, `FilterButton`, `FilterContainer`, `FullscreenButton`) are composed inside `Header` for the modern V2 sidebar header layout
- [ ] Multi-thread primitives used standalone pass `multiThreadAnnotationId` to bind real annotation data without the parent `VeltMultiThreadCommentDialog` root

**Source Pointers:**
- https://docs.velt.dev/ui-customization/overview - Wireframe and primitive architecture overview
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Comment dialog primitives reference
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-v2-primitives - V2 sidebar primitive catalog (56+ primitives, singular HTML tag rename, MinimalActionsDropdown removal)
- https://docs.velt.dev/ui-customization/features/async/comments/inline-comments-section/primitives - Inline Comments Section primitives (incl. ApplyButton React promotion)
- https://docs.velt.dev/ui-customization/features/async/comments/multithread-comments/primitives - Multi-Thread Comment Dialog primitives (incl. new root)

---

### 6.5 Use Standalone Autocomplete Primitives for Custom Autocomplete UIs

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

**Primitive Component Reference (v5.0.2-beta.5+):**

| React | HTML | Key Props |
|-------|------|-----------|
| `VeltAutocompleteOption` | `velt-autocomplete-option` | `userObject`, `userId` |
| `VeltAutocompleteOptionIcon` | `velt-autocomplete-option-icon` | — |
| `VeltAutocompleteOptionName` | `velt-autocomplete-option-name` | — |
| `VeltAutocompleteOptionDescription` | `velt-autocomplete-option-description` | `field` |
| `VeltAutocompleteOptionErrorIcon` | `velt-autocomplete-option-error-icon` | — |
| `VeltAutocompleteGroupOption` | `velt-autocomplete-group-option` | — |
| `VeltAutocompleteTool` | `velt-autocomplete-tool` | — |
| `VeltAutocompleteEmpty` | `velt-autocomplete-empty` | — |
| `VeltAutocompleteChip` | `velt-autocomplete-chip` | `type`, `email`, `userObject`, `userId` |
| `VeltAutocompleteChipTooltip` | `velt-autocomplete-chip-tooltip` | — |
| `VeltAutocompleteChipTooltipIcon` | `velt-autocomplete-chip-tooltip-icon` | — |
| `VeltAutocompleteChipTooltipName` | `velt-autocomplete-chip-tooltip-name` | — |
| `VeltAutocompleteChipTooltipDescription` | `velt-autocomplete-chip-tooltip-description` | — |

**`VeltAutocomplete` Panel Props (v5.0.2-beta.5+):**

These props are added to the parent `<VeltAutocomplete>` / `<velt-autocomplete>` panel component when using the full panel:

| React Prop | HTML Attribute | Type | Description |
|------------|---------------|------|-------------|
| `multiSelect` | `multi-select` | `boolean` | Allows selecting multiple contacts |
| `selectedFirstOrdering` | `selected-first-ordering` | `boolean` | Shows selected items first in the list |
| `readOnly` | `read-only` | `boolean` | Disables user interaction |
| `inline` | `inline` | `boolean` | Renders autocomplete inline rather than as a floating panel |
| `contacts` | *(React only)* | `User[]` | Overrides the default contact list with a custom array |

```jsx
// React — configure the autocomplete panel
<VeltAutocomplete
  multiSelect={true}
  selectedFirstOrdering={true}
  contacts={myContactList}
/>
```

```html
<!-- HTML — configure the autocomplete panel (contacts has no HTML attribute) -->
<velt-autocomplete
  multi-select="true"
  selected-first-ordering="true"
></velt-autocomplete>
```

<!-- TODO (v5.0.2-beta.5): Verify default values for readOnly and inline props on VeltAutocomplete. Release note confirms the prop names and types but does not specify default values. -->

**`VeltAutocompletePanel` — standalone panel (v5.0.2-beta.11+):**

Use `VeltAutocompletePanel` when you need an autocomplete panel that is not tied to a text-input @-mention (e.g. an inline user picker, assignee selector, or standalone contact chooser). It accepts all of the `VeltAutocomplete` panel props plus `type`, `hideInput`, `placeholder`, `enableOnFocus`, `position`, and `defaultCondition`.

```jsx
// React — inline user picker that always renders
<VeltAutocompletePanel
  type="contact"
  multiSelect={true}
  selectedFirstOrdering={true}
  inline={true}
  defaultCondition={false}
/>
```

```html
<!-- HTML — same shape, kebab-case attrs -->
<velt-autocomplete-panel
  type="contact"
  multi-select="true"
  selected-first-ordering="true"
  inline="true"
  default-condition="false">
</velt-autocomplete-panel>
```

| React Prop | HTML Attribute | Type | Default | Description |
|------------|---------------|------|---------|-------------|
| `type` | `type` | `'contact' \| 'generic'` | `'contact'` | Type of options the panel renders |
| `hideInput` | `hide-input` | `boolean` | `false` | Hides the search input |
| `placeholder` | `placeholder` | `string` | — | Placeholder text for the search input |
| `multiSelect` | `multi-select` | `boolean` | `false` | Allows selecting multiple contacts |
| `selectedFirstOrdering` | `selected-first-ordering` | `boolean` | `false` | Shows selected items first in the list |
| `readOnly` | `read-only` | `boolean` | `false` | Disables user interaction |
| `inline` | `inline` | `boolean` | `false` | Renders the panel inline |
| `enableOnFocus` | `enable-on-focus` | `boolean` | `false` | Opens the panel when the input receives focus |
| `position` | `position` | `'above' \| 'below' \| 'auto' \| string` | `'auto'` | Position of the panel relative to its anchor |
| `defaultCondition` | `default-condition` | `boolean` | `true` | When `false`, the component always renders regardless of internal state |

**Verification Checklist:**
- [ ] Primitives imported from `'@veltdev/react'` individually (not from the full panel import path)
- [ ] `VeltAutocompleteEmptyWireframe` is wrapped inside `<VeltWireframe>` when customizing the empty state
- [ ] `VeltAutocompleteOptionDescription` uses the `field` prop to specify which user field to display
- [ ] HTML custom elements use separate opening and closing tags (not self-closing)
- [ ] When using `VeltAutocompletePanel` standalone, pick `VeltAutocompletePanel` (not `VeltAutocomplete`) for inline pickers that are not tied to a text-input @-mention

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Autocomplete and dialog customization
- https://docs.velt.dev/api-reference/sdk/models/data-models - User model reference for `userObject` and `contacts` types
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/primitives - VeltAutocompletePanel standalone primitive reference

---

### 6.6 Use Wireframe Components for Custom UI

**Impact: MEDIUM (Build fully custom comment UIs with wireframe building blocks)**

Velt provides wireframe components that give you complete control over comment UI structure while maintaining functionality.

**Naming Conventions:**

| Framework | Pattern | Example |
|-----------|---------|---------|
| React | PascalCase | `VeltCommentDialogWireframe.Header` |
| HTML | kebab-case, `-wireframe` suffix | `velt-comment-dialog-header-wireframe` |

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

**Key Wireframe Components:**

**Dialog Components:**
- `GhostBanner` - Anonymous comment indicator
- `PrivateBanner` - Private comment indicator
- `AssigneeBanner` - Assigned user display
  - `AssigneeBanner.ResolveButton` - Resolve button (template nested **inside** the button component as of v5.0.1-beta.2)
  - `AssigneeBanner.UnresolveButton` - Unresolve button (template nested **inside** the button component as of v5.0.1-beta.2)
- `Header` - Dialog header container
- `Status` - Status selector
- `Priority` - Priority selector
- `Options` - Options menu
- `Body` - Comment content area
- `Composer` - Input composer
- `VisibilityBanner` - Four-option visibility banner below the composer (v5.0.2-beta.4+; replaces the removed `VisibilityDropdown`)
  - `VisibilityBanner.Icon` - Banner icon
  - `VisibilityBanner.Text` - Banner label text
  - `VisibilityBanner.Dropdown` - Visibility selector dropdown
  - `VisibilityBanner.Dropdown.Trigger` - Dropdown trigger button
  - `VisibilityBanner.Dropdown.Trigger.Label` - Trigger label text
  - `VisibilityBanner.Dropdown.Trigger.AvatarList` - Avatar list (shown for `selected-people`)
  - `VisibilityBanner.Dropdown.Trigger.AvatarList.Item` - Individual avatar
  - `VisibilityBanner.Dropdown.Trigger.AvatarList.RemainingCount` - Overflow count badge
  - `VisibilityBanner.Dropdown.Trigger.Icon` - Trigger icon
  - `VisibilityBanner.Dropdown.Content` - Dropdown content panel
  - `VisibilityBanner.Dropdown.Content.Item` - Visibility option item (accepts `type`: `'public'` | `'organizationPrivate'` | `'restrictedSelf'` | `'restrictedSelectedPeople'`) (renamed from `'org-users'` / `'personal'` / `'selected-people'` in v5.0.2-beta.5)
  - `VisibilityBanner.Dropdown.Content.Item.Icon` - Option item icon
  - `VisibilityBanner.Dropdown.Content.Item.Label` - Option item label

> **Breaking Change (v5.0.2-beta.4):** The `velt-comment-dialog-visibility-dropdown-*` wireframe family has been removed. Migrate any custom wireframes to the new `velt-comment-dialog-visibility-banner-*` family shown below.

> **Breaking Change (v5.0.2-beta.5):** The `type` prop values on `VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.Item` (and the HTML equivalent) have been renamed to align with the `CommentVisibilityOption` enum. Replace `type="personal"` → `type="restrictedSelf"`, `type="selected-people"` → `type="restrictedSelectedPeople"`, `type="org-users"` → `type="organizationPrivate"`. The `type="public"` value is unchanged.

> **Breaking Change (v5.0.2-beta.5):** The `VeltCommentDialogWireframe.VisibilityBanner.Dropdown.Content.UserPicker` sub-component hierarchy (11 components) has been removed. The visibility banner now uses the shared autocomplete component internally for user selection. Remove any wireframe usage of `UserPicker` and its descendants.

**VisibilityBanner Wireframe Usage (v5.0.2-beta.5+):**

```jsx
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
```

```html
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

As of v5.0.1-beta.2, the wireframe template for the resolve and unresolve buttons is nested **inside** the button component, not wrapping it. This gives custom content direct access to button state, styling, and event handlers.

```jsx
// Correct: custom content rendered INSIDE the button component (v5.0.1-beta.2+)
<VeltCommentDialogWireframe.AssigneeBanner>
  <VeltCommentDialogWireframe.AssigneeBanner.ResolveButton>
    {/* Custom content rendered inside the resolve button */}
  </VeltCommentDialogWireframe.AssigneeBanner.ResolveButton>
  <VeltCommentDialogWireframe.AssigneeBanner.UnresolveButton>
    {/* Custom content rendered inside the unresolve button */}
  </VeltCommentDialogWireframe.AssigneeBanner.UnresolveButton>
</VeltCommentDialogWireframe.AssigneeBanner>
```

```html
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

**Sidebar Components:**
- `Header` - Sidebar header
- `Filter` - Filter controls
- `Panel` - Main content panel
- `List` - Comment list
- `EmptyPlaceholder` - Empty state

**V2 Sidebar Wireframe Subtrees (`VeltCommentsSidebarV2Wireframe.*` / `velt-comments-sidebar-*-v2-wireframe`):**

The V2 sidebar wireframe catalog gained five new subtrees and lost the MinimalActionsDropdown family. Compose them inside `VeltWireframe` / `<velt-wireframe>`.

- `Search` — header search row (and its `Icon` + `Input` leaves).
- `FilterButton` — opens the Main Filter container; child `AppliedIcon` leaf surfaces the active-filter indicator.
- `FilterContainer` — Main Filter bottom-sheet / menu subtree:
  - `Title`, `GroupBy`, `ResetButton`, `ApplyButton`, `CloseButton` leaves.
  - `SectionList` → `Section` → `SectionLabel` (leaf) and `SectionField` → `SectionControl` (+ `SectionControlChevron`, `SectionControlValue`, `SectionControlChipList` → `SectionControlChip`, `SectionControlSearch`) and `SectionOptionList` → `SectionOption` (+ `SectionOptionCheckbox`, `SectionOptionName`, `SectionOptionCount`).
- `FullscreenButton` — leaf header toggle that emits the new `onFullscreenClick` event.
- `ListGroupHeader` — renders once per group when grouping is enabled; child leaves `Label`, `Count`, `Chevron`, `Separator`.
- `FilterDropdown.Content.List.Item.Count` — new leaf under the existing `FilterDropdown` subtree.
- `FilterDropdown.Content.List.Category.Label` — new leaf alongside the existing `Category.Content`.

> **Breaking change (Comment Sidebar V2 — current release):** `VeltCommentsSidebarV2Wireframe.MinimalActionsDropdown` (Trigger / Content / MarkAllRead / MarkAllResolved) and the `velt-comments-sidebar-minimal-actions-dropdown-v2-wireframe` family are removed from the wireframe catalog. The actions are now exposed by the combined `actions` filter-dropdown, configured via the `minimalFilters` input on `VeltCommentsSidebarV2`. Migrate any custom wireframes to a `FilterDropdown` (or `FilterContainer`) composition.

```jsx
// React — V2 sidebar header composed against the new wireframe subtree
<VeltWireframe>
  <VeltCommentsSidebarV2Wireframe.Header>
    <VeltCommentsSidebarV2Wireframe.CloseButton />
    <VeltCommentsSidebarV2Wireframe.Search>
      <VeltCommentsSidebarV2Wireframe.Search.Icon />
      <VeltCommentsSidebarV2Wireframe.Search.Input />
    </VeltCommentsSidebarV2Wireframe.Search>
    <VeltCommentsSidebarV2Wireframe.FilterButton>
      <VeltCommentsSidebarV2Wireframe.FilterButton.AppliedIcon />
    </VeltCommentsSidebarV2Wireframe.FilterButton>
    <VeltCommentsSidebarV2Wireframe.FilterContainer />
    <VeltCommentsSidebarV2Wireframe.FullscreenButton />
    <VeltCommentsSidebarV2Wireframe.FilterDropdown />
  </VeltCommentsSidebarV2Wireframe.Header>
  <VeltCommentsSidebarV2Wireframe.List>
    <VeltCommentsSidebarV2Wireframe.ListGroupHeader>
      <VeltCommentsSidebarV2Wireframe.ListGroupHeader.Label />
      <VeltCommentsSidebarV2Wireframe.ListGroupHeader.Count />
      <VeltCommentsSidebarV2Wireframe.ListGroupHeader.Chevron />
      <VeltCommentsSidebarV2Wireframe.ListGroupHeader.Separator />
    </VeltCommentsSidebarV2Wireframe.ListGroupHeader>
  </VeltCommentsSidebarV2Wireframe.List>
</VeltWireframe>
```

```html
<!-- HTML / Other Frameworks — matching velt-comments-sidebar-*-v2-wireframe tags -->
<velt-wireframe style="display:none;">
  <velt-comments-sidebar-header-v2-wireframe>
    <velt-comments-sidebar-close-button-v2-wireframe></velt-comments-sidebar-close-button-v2-wireframe>
    <velt-comments-sidebar-search-v2-wireframe>
      <velt-comments-sidebar-search-v2-icon-wireframe></velt-comments-sidebar-search-v2-icon-wireframe>
      <velt-comments-sidebar-search-v2-input-wireframe></velt-comments-sidebar-search-v2-input-wireframe>
    </velt-comments-sidebar-search-v2-wireframe>
    <velt-comments-sidebar-filter-button-v2-wireframe>
      <velt-comments-sidebar-filter-button-v2-applied-icon-wireframe></velt-comments-sidebar-filter-button-v2-applied-icon-wireframe>
    </velt-comments-sidebar-filter-button-v2-wireframe>
    <velt-comments-sidebar-filter-container-v2-wireframe></velt-comments-sidebar-filter-container-v2-wireframe>
    <velt-comments-sidebar-fullscreen-button-v2-wireframe></velt-comments-sidebar-fullscreen-button-v2-wireframe>
    <velt-comments-sidebar-filter-dropdown-v2-wireframe></velt-comments-sidebar-filter-dropdown-v2-wireframe>
  </velt-comments-sidebar-header-v2-wireframe>
  <velt-comments-sidebar-list-v2-wireframe>
    <velt-comments-sidebar-list-group-header-v2-wireframe>
      <velt-comments-sidebar-list-group-header-v2-label-wireframe></velt-comments-sidebar-list-group-header-v2-label-wireframe>
      <velt-comments-sidebar-list-group-header-v2-count-wireframe></velt-comments-sidebar-list-group-header-v2-count-wireframe>
      <velt-comments-sidebar-list-group-header-v2-chevron-wireframe></velt-comments-sidebar-list-group-header-v2-chevron-wireframe>
      <velt-comments-sidebar-list-group-header-v2-separator-wireframe></velt-comments-sidebar-list-group-header-v2-separator-wireframe>
    </velt-comments-sidebar-list-group-header-v2-wireframe>
  </velt-comments-sidebar-list-v2-wireframe>
</velt-wireframe>
```

**For HTML:**

```html
<velt-wireframe style="display:none;">
  <velt-comment-dialog-wireframe>
    <velt-comment-dialog-header-wireframe>
      <velt-comment-dialog-status-wireframe></velt-comment-dialog-status-wireframe>
    </velt-comment-dialog-header-wireframe>
  </velt-comment-dialog-wireframe>
</velt-wireframe>
```

**Wireframe Data Variables (v5.0.2-beta.11+):**

Two shorthand variables are now available inside `<velt-data field="...">` expressions within wireframe templates:

| Variable | Resolves To | Notes |
|----------|-------------|-------|
| `annotations` | `componentConfigSignal.data.annotations` | Supports nested access, e.g. `field="annotations.0.annotationId"` |
| `allAnnotations` | `componentConfigSignal.data.allAnnotations` | All annotations regardless of current filter context |

These variables are useful for list-level UIs such as Inline Comments Section wireframes where you need to iterate over or reference annotation data directly.

```jsx
// React — reference annotation data via the annotations shorthand variable
// inside a wireframe template for a list-level component (e.g., Inline Comments Section)
<VeltWireframe>
  {/* annotations.0.annotationId resolves the first annotation's ID */}
  <velt-data field="annotations.0.annotationId" />

  {/* allAnnotations gives access to all annotations regardless of filter state */}
  <velt-data field="allAnnotations" />
</VeltWireframe>
```

```html
<!-- HTML — same shorthand variables work inside velt-data field expressions -->
<velt-wireframe style="display:none;">
  <velt-data field="annotations.0.annotationId"></velt-data>
  <velt-data field="allAnnotations"></velt-data>
</velt-wireframe>
```

**Thread Card Message — ShowMore / ShowLess Wireframe Primitives (v5.0.2-beta.18+):**

When `messageTruncation` is enabled (on `VeltInlineCommentsSection`, or via `messageTruncation` / `messageTruncationLines` on `VeltCommentDialog`-rendering surfaces), the expand/collapse controls are full wireframe primitives. They live in the comment-dialog thread-card message hierarchy because truncation is implemented at the message level, and the inline-comments section internally renders comment-dialog thread cards.

Wireframes (use inside `VeltWireframe` / `<velt-wireframe>`):

| React | HTML |
|---|---|
| `VeltCommentDialogWireframe.ThreadCard.Message.ShowMore` | `velt-comment-dialog-thread-card-message-show-more-wireframe` |
| `VeltCommentDialogWireframe.ThreadCard.Message.ShowLess` | `velt-comment-dialog-thread-card-message-show-less-wireframe` |

Equivalent standalone primitives (use directly without a wireframe wrapper):

| React | HTML |
|---|---|
| `VeltCommentDialogThreadCardMessageShowMore` | `velt-comment-dialog-thread-card-message-show-more` |
| `VeltCommentDialogThreadCardMessageShowLess` | `velt-comment-dialog-thread-card-message-show-less` |

These controls only render when a message exceeds the `messageTruncationLines` threshold. Both accept the standard Common Inputs props/attributes — no message-specific configuration is required; the primitives bind to the iterating thread card automatically.

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

**Verification Checklist:**
- [ ] Correct wireframe component imported
- [ ] Proper nesting of child components
- [ ] Framework naming convention followed
- [ ] Required subcomponents included
- [ ] When accessing annotation data in wireframe templates, use `annotations` or `allAnnotations` shorthand variables (v5.0.2-beta.11+) instead of long-form signal paths
- [ ] V2 sidebar header compositions use `Search` / `FilterButton` / `FilterContainer` / `FullscreenButton` / `FilterDropdown` — `MinimalActionsDropdown` and its descendants are no longer in the catalog
- [ ] V2 sidebar list compositions place `ListGroupHeader` (+ `Label`, `Count`, `Chevron`, `Separator`) inside `List`

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog-structure - Dialog wireframe
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-components - Sidebar wireframe (V1)
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-v2-wireframes - V2 Sidebar wireframe structure (Search / FilterButton / FilterContainer / FullscreenButton / ListGroupHeader)
- https://docs.velt.dev/ui-customization/reference/wireframe-components - Complete list of wireframe slot elements

---

## 7. Data Model

**Impact: MEDIUM**

Patterns for working with comment data structures. Includes CRUD operations, metadata, annotations, composer control, read status, and data type reference.

### 7.1 Filter and Group Comments

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

When multiple comments can exist on the same element:

```jsx
<VeltComments
  popoverMode={true}
  groupMatchedComments={true}  // Group comments on same element
/>
```

**Verification Checklist:**
- [ ] Filter criteria matches context structure
- [ ] Grouped data structure matches UI needs
- [ ] Sidebar groupConfig set appropriately
- [ ] Empty groups handled gracefully

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior - "Aggregation"

---

### 7.2 Work with Comment Annotations Data

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

**API Method (`getAllCommentAnnotations()` is listed under Legacy Methods; prefer `getCommentAnnotations()` for new code, see `data-annotation-crud.md`):**

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
  organizationIds?: string[];   // multi-org organizationPrivate (display-only mirror)
  userIds?: string[];           // always includes the author for non-public comments
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
  // Request wraps the thread in `annotation`; see data-annotation-crud.md
  commentElement.addCommentAnnotation({
    annotation: {
      comments: [{ commentText: 'This is a comment', commentHtml: '<p>This is a comment</p>' }],
    },
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

**Hooks Available:**

| Hook | Description |
|------|-------------|
| `useCommentAnnotations()` | Get all annotations for current document |
| `useAddCommentAnnotation()` | Add new annotation programmatically |
| `useDeleteCommentAnnotation()` | Delete annotation by ID |
| `useGetCommentAnnotations()` | Advanced query with CommentRequestQuery filters |
| `useCommentAnnotationsCount()` | Get counts (total + unread) with filtering |
| `useUnreadCommentAnnotationCountByLocationId()` | Unread count scoped to a location |
| `useCommentModeState()` | Get comment mode status (active/inactive) |
| `useCommentEventCallback()` | Subscribe to comment events |
| `useVeltEventCallback()` | Subscribe to Velt UI events |

**Verification Checklist:**
- [ ] useCommentAnnotations returns array
- [ ] Annotations have expected structure
- [ ] Subscription cleaned up on unmount
- [ ] Filtering works with annotation properties

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#getcommentannotations - "getCommentAnnotations"
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#getallcommentannotations - "getAllCommentAnnotations" (legacy)
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - Hook documentation

---

### 7.3 Add Custom Metadata to Comments with Context

**Impact: MEDIUM (Attach custom data for filtering, grouping, and processing)**

Add custom metadata (context) to comments for filtering, grouping, rendering, and notification processing.

**Use Cases:**
- Filter comments by category, status, or custom fields
- Group comments by section, element type, etc.
- Pass data to notification processors
- Store position data for manual comment pins

**Method 1: Via Comment Tool**

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
```

**Method 2: Via the addCommentAnnotation event (using addContext)**

`addContext()` is available on the `addCommentAnnotation` and `addCommentAnnotationDraft` events. The legacy `onCommentAdd` prop still works but is listed under Legacy Methods.

```jsx
// Hook
const addEvent = useCommentEventCallback('addCommentAnnotation');
useEffect(() => {
  if (addEvent) {
    addEvent.addContext({ timestamp: Date.now(), pageSection: 'main-content' });
  }
}, [addEvent]);

// API Method
const commentElement = client.getCommentElement();
const subscription = commentElement.on('addCommentAnnotation').subscribe((event) => {
  event.addContext({ pageSection: 'main-content' });
});
subscription?.unsubscribe();
```

**Method 3: Via addManualComment API**

```jsx
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

The provider runs whenever a new comment annotation is created and receives `(documentId, location)`.

```jsx
import { useCallback, useEffect } from 'react';
import { useSetContextProvider } from '@veltdev/react';

function AppWithContextProvider() {
  // The hook returns { setContextProvider }; it does not take the provider directly
  const { setContextProvider } = useSetContextProvider();
  const provider = useCallback((documentId, location) => ({
    appVersion: '2.0',
    currentPage: window.location.pathname,
  }), []);

  useEffect(() => {
    if (setContextProvider) setContextProvider(provider);
  }, [setContextProvider, provider]);

  return <VeltComments />;
}

// Or via API
const commentElement = client.getCommentElement();
commentElement.setContextProvider((documentId, location) => ({ appVersion: '2.0' }));
```

**Method 5: Update context on an existing annotation**

```jsx
// Replace (default) or merge the annotation's context
commentElement.updateContext('ANNOTATION_ID', { dashboardName: 'Q3 Revenue' }, { merge: true });
```

With `{ merge: true }`, the `access` object (Access Context) is merged key by key: adding a key keeps the others, passing `null` for a key deletes it, and removing the last key returns the comment to its default context. Updating context keeps the comment's visibility. See `permissions-private-comments-access-context.md`.

**For HTML:**

```html
<velt-comment-tool
  target-element-id="element-id"
  context='{"category": "feedback", "section": "header"}'
></velt-comment-tool>
```

**Verification Checklist:**
- [ ] Context object passed to comment tool or API
- [ ] Context data accessible in annotations
- [ ] Filtering uses correct context keys
- [ ] JSON format correct for HTML attributes
- [ ] `useSetContextProvider()` destructured to `{ setContextProvider }` and called inside an effect
- [ ] `updateContext()` uses `{ merge: true }` when other context keys must survive

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/setup/popover - "Step 4: Add Metadata to the Comment"
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#addcontext - addContext
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatecontext - updateContext
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#setcontextprovider - setContextProvider

---

### 7.4 Comments Data Type Reference — Core Models

**Impact: MEDIUM (Type definitions for comment annotations, comments, status, priority, attachments)**

Complete type definitions for all core comment data models used across hooks, API methods, and REST endpoints.

**CommentAnnotation (thread container):**

```typescript
interface CommentAnnotation {
  annotationId: string;                // Unique thread ID
  documentId?: string;                 // Document this thread belongs to
  organizationId?: string;             // Organization scope
  location?: Location;                 // Location within document
  targetElementId?: string;            // DOM element being commented on
  comments: Comment[];                 // Comments in this thread (REST create payloads call this `commentData`)
  from: User;                          // Thread author
  status: Status;                      // Thread status (open, resolved, etc.)
  priority?: Priority;                 // Priority level
  assignedTo?: User;                   // Assigned user (single User)
  context?: Record<string, any>;       // Custom metadata (Access Context lives under context.access)
  type?: 'comment' | 'suggestion';     // Annotation kind; 'suggestion' renders the suggestion card
  actions?: CommentAction[];           // Per-row default action chips (see data-comment-actions.md)
  visibilityConfig?: {                 // Privacy settings
    type: 'public' | 'organizationPrivate' | 'restricted';
    organizationId?: string;
    organizationIds?: string[];
    userIds?: string[];
  };
  createdAt?: number;                  // Creation timestamp (ms)
  lastUpdated?: number;                // Last update timestamp (ms)
  resolvedByUserId?: string;           // Who resolved it (matched by REST `resolvedBy` filter)
  resolvedByUser?: User;               // Who resolved it
  commentType?: string;                // Secondary discriminator; legacy 'suggestion' value no longer drives classification
  sourceType?: string;                 // Origin of annotation — selects agent-identity vs human-author header
  agent?: CommentAnnotationAgent;      // Present when annotation was authored by an AI agent
  suggestion?: CommentAnnotationSuggestion; // Suggestion state for typed-suggestion annotations
  basicAnchorData?: {                  // Client-safe anchor data derived from target element xpath
    xpath: string;                     // From targetElement.anchor.fXPath (fallback: targetElement.fXpath)
    topPercentage: number;             // Defaults to 0 when not set
    leftPercentage: number;            // Defaults to 0 when not set
  };
  involvedUserIds?: string[];          // All user IDs involved in the annotation (subscribed + unsubscribed). Read-only, server-derived
  mentionedUserIds?: string[];         // User IDs @mentioned across the annotation's comments. Read-only, server-derived
}
```

**Comment (individual message):**

```typescript
interface Comment {
  commentId: number;                   // Unique comment ID (number, not string)
  type: 'text' | 'voice';              // Content type (default 'text')
  commentText: string;                 // Plain text content
  commentHtml?: string;                // Rich text HTML content
  from: User;                          // Author
  isDraft: boolean;                    // Draft state
  progress?: CommentProgress;          // Live progress row while state is 'active' (see data-comment-progress.md)
  actions?: CommentAction[];           // Row-level action chips, override the annotation default
  context?: Record<string, any>;       // Custom metadata per comment
  attachments?: Attachment[];           // File attachments
  taggedUserContacts?: TaggedContact[]; // @mentioned users
  reactionAnnotations?: ReactionAnnotation[]; // Emoji reactions
  createdAt?: number;                  // Creation timestamp
  lastUpdated?: number;                // Last update timestamp
  isEdited?: boolean;                  // Whether comment was edited
  sourceType?: string;                 // Origin of the comment; 'agent' indicates AI-agent-authored. Read-only
  agent?: AgentData;                   // AI agent identity + output for an agent-authored comment. Read-only. See data-agent-fields-query.md
  metadata?: any;                      // Customer-supplied metadata bag, persisted as-is when provided
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
  id?: string | number;                // Unique location ID; 0 is valid; optional when locationName is set
  locationName?: string;               // Non-empty name identifies the location when id is omitted
  version?: Version;
  [key: string]: any;                  // Additional dynamic properties
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

**ReactionAnnotation (placed emoji reaction):**

```typescript
interface ReactionAnnotation {
  annotationId?: string;               // Reaction-annotation ID
  documentId?: string;
  organizationId?: string;
  location?: Location;
  targetElement?: TargetElement;
  reactions?: Reaction[];
  createdAt?: any;                     // Auto-generated
  lastUpdated?: any;                   // Auto-generated
  metadata?: ReactionMetadata;
  context?: Context;
  involvedUserIds?: string[];          // All user IDs involved in the reaction annotation. Read-only, server-derived
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

Suggestion state is mutated by `acceptSuggestion()` / `rejectSuggestion()`, which also flip `annotation.type` from `'suggestion'` to `'comment'`. Annotations created through the V2 REST API may carry a richer proposed-change payload on `suggestion` (`targetId`, `targetType`, `oldValue`, `newValue`, `summary`, `driftDetected`, plus custom fields). The annotation `type` is the source of truth for suggestion classification; the legacy `commentType: 'suggestion'` value no longer drives it. The `sourceType` field selects the agent-identity vs human-author header variant rendered in the UI.

**FullscreenClickEvent (payload for the `fullscreenClick` sidebar event):**

```typescript
interface FullscreenClickEvent {
  fullScreen: boolean;           // Required. Fullscreen state AFTER the toggle. `true` = now fullscreen
  metadata?: VeltEventMetadata;  // Optional event metadata
}
```

Emitted by the Comment Sidebar V2 `fullscreenClick` event when the header fullscreen toggle is clicked. `fullScreen` is the **post-toggle** state, not the previous state. See `events-comment-lifecycle.md` for subscription patterns.

**Verification:**
- [ ] Using correct types for all comment-related data
- [ ] commentId is number, annotationId is string
- [ ] `Location` has an `id` (string or number) or a non-empty `locationName`
- [ ] Status.type is one of 'default', 'ongoing', 'terminal'
- [ ] Agent-authored annotations check `annotation.agent` for identity, not custom fields
- [ ] `CommentAnnotation.involvedUserIds` / `mentionedUserIds` and `ReactionAnnotation.involvedUserIds` are treated as read-only server-derived fields (never written from the client)
- [ ] `Comment.sourceType === 'agent'` is the discriminator for the agent-identity header; `Comment.agent` carries the AI payload (`AgentData` — see `data-agent-fields-query.md` for the shape)
- [ ] `Comment.metadata` is opaque to Velt — application code owns its schema
- [ ] `FullscreenClickEvent.fullScreen` is read as the post-toggle state (`true` = now fullscreen)

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentannotation - CommentAnnotation
- https://docs.velt.dev/api-reference/sdk/models/data-models#comment - Comment
- https://docs.velt.dev/api-reference/sdk/models/data-models#location - Location
- https://docs.velt.dev/api-reference/sdk/models/data-models#fullscreenclickevent - FullscreenClickEvent

---

### 7.5 Individual Comment CRUD — Add, Update, Delete, Get Comments Within Threads

**Impact: HIGH (Required for programmatic comment management within annotation threads)**

Manage individual comments inside an existing annotation thread: add replies, edit messages, delete comments, and track unread counts. For `updateComment()`, the `commentId` goes **inside** the `comment` object, and `updateComment()` replaces the comment wholesale.

**Incorrect (commentId outside the comment object):**

```jsx
await commentElement.updateComment({
  annotationId: 'ann-123',
  commentId: 42,                       // must be comment.commentId
  comment: { commentText: 'Updated text' },
});
```

**Correct:**

```jsx
const commentElement = client.getCommentElement();

// Add a reply to an existing thread (optionally with visibility set at creation)
await commentElement.addComment({
  annotationId: 'ANNOTATION_ID',
  comment: { commentText: 'This is a reply', commentHtml: '<p>This is a reply</p>' },
});

// Update: commentId lives inside comment
await commentElement.updateComment({
  annotationId: 'ANNOTATION_ID',
  comment: { commentId: 42, commentText: 'Updated text', commentHtml: '<p>Updated text</p>' },
});

await commentElement.deleteComment({ annotationId: 'ANNOTATION_ID', commentId: 42 });

// Returns Comment[] for the annotation
const comments = await commentElement.getComment({ annotationId: 'ANNOTATION_ID' });
```

```jsx
// Hooks
const { addComment } = useAddComment();
const { updateComment } = useUpdateComment();
const { deleteComment } = useDeleteComment();
const { getComment } = useGetComment();
```

**Unread counts:**

```jsx
// Hooks
const docCount = useUnreadCommentCountOnCurrentDocument();
const locationCount = useUnreadCommentCountByLocationId(locationId);
const threadCount = useUnreadCommentCountByAnnotationId(annotationId);

// API Methods (Observables)
const subscription = commentElement
  .getUnreadCommentCountByAnnotationId(annotationId)
  .subscribe((countObj) => console.log(countObj));
subscription?.unsubscribe();
```

**Key details:**
- `addComment()` adds a reply to an existing thread. To create a new thread, use `addCommentAnnotation()` (see `data-annotation-crud.md`).
- `commentId` is a number.
- `updateComment()` replaces the comment. It marks a comment "(edited)" only when the replaced comment already had content, so completing a content-less progress comment is not flagged as edited.
- The `addComment` and `updateComment` events carry `isAssigneeChanged`; through `commentElement.updateComment()` it is always `false`.
- Live progress rows and action chips are fields on the comment (`progress`, `actions`); see `data-comment-progress.md` and `data-comment-actions.md`.
- In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Verification:**
- [ ] `updateComment()` passes `comment.commentId`
- [ ] `commentHtml` provided alongside `commentText` for rich text
- [ ] Unread count subscriptions cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#messages - Messages
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatecomment - updateComment
- https://docs.velt.dev/api-reference/sdk/models/data-models#updatecommentrequest - UpdateCommentRequest

---

### 7.6 Mark Comments as Read or Unread

**Impact: HIGH (Control read/unread state for notification badges and filtering)**

Use `markAsRead()` and `markAsUnread()` to control the current user's read state on one annotation at a time, for example in a custom "mark as read" button. Each call takes a single `annotationId` and resolves to `Promise<void>`. There is no batch `annotationIds` form.

**Incorrect (array payload):**

```jsx
commentElement.markAsRead({ annotationIds: ['ann-123', 'ann-456'] });
```

**Correct:**

```jsx
// Hook
const { markAsRead, markAsUnread } = useCommentUtils();
await markAsRead({ annotationId: 'ANNOTATION_ID' });

// API Method
const commentElement = client.getCommentElement();
await commentElement.markAsRead({ annotationId: 'ANNOTATION_ID' });   // adds the user to viewedBy
await commentElement.markAsUnread({ annotationId: 'ANNOTATION_ID' }); // removes the user from viewedBy

// Mark several threads by looping
await Promise.all(ids.map((annotationId) => commentElement.markAsRead({ annotationId })));
```

```js
// Other Frameworks
const commentElement = Velt.getCommentElement();
await commentElement.markAsRead({ annotationId: 'ANNOTATION_ID' });
```

**Key details:**
- Only the current user's read state changes.
- Unread badges (`commentCountType="unread"`), sidebar unread filters, and unread count subscriptions update automatically.
- Choose the unread indicator style with `setUnreadIndicatorMode('minimal' | 'verbose')`.

**Verification:**
- [ ] Each call passes a single `annotationId`
- [ ] Calls are awaited (they return promises)
- [ ] Unread UI is driven by the unread count subscriptions, not local state

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#markasread - markAsRead
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#markasunread - markAsUnread

---

### 7.7 Programmatic Annotation CRUD — Create, Query, Delete Threads

**Impact: HIGH (Required for programmatic comment thread management)**

Create, query, and delete comment annotation threads without user interaction. Mutation hooks return an object containing the method (`const { addCommentAnnotation } = useAddCommentAnnotation()`), and subscription APIs emit response objects whose `data` is a map keyed by document ID.

**Incorrect (hook used as a function, flat request, wrong response shape):**

```jsx
const addAnnotation = useAddCommentAnnotation();          // returns { addCommentAnnotation }
await addAnnotation({ targetElementId: 'element-1' });    // request needs { annotation: {...} }

commentElement.getCommentAnnotationsCount().subscribe((count) => {
  console.log(count.total);                               // count lives under response.data[documentId]
});
```

**Correct (create and delete):**

```jsx
const addCommentAnnotationRequest = {
  annotation: {
    comments: [{ commentText: 'This is a comment', commentHtml: '<p>This is a comment</p>' }],
  },
};

// Hook
const { addCommentAnnotation } = useAddCommentAnnotation();
const addEvent = await addCommentAnnotation(addCommentAnnotationRequest);

const { deleteCommentAnnotation } = useDeleteCommentAnnotation();
await deleteCommentAnnotation({ annotationId: 'ANNOTATION_ID' });

// API Method
const commentElement = client.getCommentElement();
await commentElement.addCommentAnnotation(addCommentAnnotationRequest);
await commentElement.deleteCommentAnnotation({ annotationId: 'ANNOTATION_ID' });
commentElement.deleteSelectedComment();

// Comment on an element (or a text occurrence inside it)
commentElement.addCommentOnElement({
  targetElement: { elementId: 'element_id', targetText: 'target_text', occurrence: 1 },
  commentData: [{ commentText: 'This is awesome!', commentHtml: '<p>This is awesome!</p>' }],
});

// Comment on the current text selection (text mode)
commentElement.addCommentOnSelectedText();
```

The `addCommentAnnotation` event payload includes `isAssigneeChanged` (see `events-comment-lifecycle.md`).

**Correct (query):**

```jsx
// Realtime subscription; data is Record<documentId, CommentAnnotation[]>, null while loading
const { data } = useGetCommentAnnotations({ organizationId: 'org1', documentIds: ['doc1'] });

const subscription = commentElement
  .getCommentAnnotations({ documentIds: ['doc1'], statusIds: ['OPEN'] })
  .subscribe((response) => console.log(response?.data));
subscription?.unsubscribe();

// One-off paginated fetch (not realtime)
const { data: byDoc, nextPageToken } = await commentElement.fetchCommentAnnotations({
  organizationId: 'org1',
  documentIds: ['doc1', 'doc2'],
  pageSize: 50,
});

// Single annotation (subscription)
const annotation = useCommentAnnotationById({ annotationId: 'ANNOTATION_ID', documentId: 'doc1' });
commentElement.getCommentAnnotationById({ annotationId: 'ANNOTATION_ID' }).subscribe((a) => console.log(a));

// XPath of the DOM element the comment is attached to
const elementRef = commentElement.getElementRefByAnnotationId('ANNOTATION_ID');

// Currently selected annotations
commentElement.getSelectedComments().subscribe((selected) => console.log(selected));
```

**Correct (counts):**

```jsx
// Hook: data is Record<documentId, { total, unread }>, null while loading
const { data: counts } = useCommentAnnotationsCount({ documentIds: ['doc1', 'doc2'] });

// API Method
commentElement.getCommentAnnotationsCount({ aggregateDocuments: true }).subscribe((response) => {
  console.log(response.data);
});

// Annotations with at least one unread comment at a location
const unread = useUnreadCommentAnnotationCountByLocationId('locationId');
commentElement.getUnreadCommentAnnotationCountByLocationId('locationId').subscribe((c) => console.log(c));
```

With 2+ `documentIds`, count requests are auto-batched (tune with `debounceMs`, default 5000 ms). Set `filterGhostComments: true` to exclude ghost comments.

**CommentRequestQuery (getCommentAnnotations / getCommentAnnotationsCount):**

| Property | Type | Description |
|----------|------|-------------|
| `organizationId` | `string` | Filter by organization |
| `documentIds` | `string[]` | Documents to query (30 at a time for `getCommentAnnotations`) |
| `folderId` / `allDocuments` | `string` / `boolean` | Query a whole folder |
| `locationIds` / `locationId` | `string[]` / `string` | Filter by location |
| `statusIds` | `string[]` | Filter by status |
| `aggregateDocuments` | `boolean` | One combined count across documents |
| `batchedPerDocument` | `boolean` | Batched listener for large document lists |
| `debounceMs` | `number` | Auto-batching delay |
| `filterGhostComments` | `boolean` | Exclude ghost comments |
| `agentFields` | `string[]` | Agent-tagged annotations only (see `data-agent-fields-query.md`) |

`fetchCommentAnnotations()` takes `FetchCommentAnnotationsRequest`, which adds `createdAfter` / `createdBefore` / `updatedAfter` / `updatedBefore`, `order`, `pageSize`, and `pageToken`.

In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Verification:**
- [ ] Mutation hooks destructured (`const { addCommentAnnotation } = useAddCommentAnnotation()`)
- [ ] `addCommentAnnotation()` request wraps the thread in `annotation: { comments: [...] }`
- [ ] Subscription responses read from `response.data[documentId]`, handling `null` while loading
- [ ] Subscriptions cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#threads - Threads
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#getcommentannotationscount - getCommentAnnotationsCount
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentrequestquery - CommentRequestQuery
- https://docs.velt.dev/api-reference/sdk/models/data-models#fetchcommentannotationsrequest - FetchCommentAnnotationsRequest

---

### 7.8 Programmatic Composer Control — Submit, Clear, Read State

**Impact: HIGH (Control the comment composer programmatically)**

Submit, clear, or read a composer without user interaction. All three methods target one composer through `targetComposerElementId`, which must match the `targetComposerElementId` prop on `VeltCommentComposer` or `VeltCommentDialogComposer`. Calling them without it does not reach your composer.

**Incorrect (no target id):**

```jsx
commentElement.clearComposer();                 // which composer?
const data = commentElement.getComposerData();  // requires { targetComposerElementId }
```

**Correct:**

```jsx
import { VeltCommentComposer, useVeltClient } from '@veltdev/react';

function CustomSubmitForm() {
  const { client } = useVeltClient();
  const commentElement = client?.getCommentElement(); // or useCommentUtils()

  return (
    <>
      <VeltCommentComposer targetComposerElementId="composer-1" />
      <button onClick={() => commentElement?.submitComment({ targetComposerElementId: 'composer-1' })}>
        Submit
      </button>
      <button onClick={() => commentElement?.clearComposer({ targetComposerElementId: 'composer-1' })}>
        Clear
      </button>
      <button
        onClick={() => {
          // Same shape as the composerTextChange event
          const data = commentElement?.getComposerData({ targetComposerElementId: 'composer-1' });
          console.log(data);
        }}
      >
        Inspect
      </button>
    </>
  );
}
```

```html
<velt-comment-composer target-composer-element-id="composer-1"></velt-comment-composer>
<script>
  const commentElement = Velt.getCommentElement();
  commentElement.submitComment({ targetComposerElementId: 'composer-1' });
</script>
```

**Key details:**
- `clearComposer()` resets text, attachments, recordings, tagged users, assignments, and custom lists for that composer.
- `getComposerData()` returns a `ComposerTextChangeEvent` synchronously; subscribe to `composerTextChange` for live updates.
- To pre-fill files, use `setComposerFileAttachments({ files, annotationId?, targetElementId? })` (see `config-attachments.md`).

**Verification:**
- [ ] `targetComposerElementId` matches between the component and each API call
- [ ] `clearComposer()` and `getComposerData()` receive `{ targetComposerElementId }`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#submitcomment - submitComment
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#clearcomposer - clearComposer
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#getcomposerdata - getComposerData
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-composer/customize-behavior - Comment Composer

---

### 7.9 Render Custom Action Chips with Comment.actions and Handle commentActionClicked

**Impact: MEDIUM (Adds customer-owned buttons (Copy, Dig Deeper, Approve) to comment rows and suggestion cards without forking the dialog UI)**

Set `actions` on a comment (one row) or on the annotation (default for every row without its own list) to render customer-defined chips. Velt never interprets a click: there is no annotation write, no `saveComment()`, and no record of who clicked. You must subscribe to `commentActionClicked` and do the work yourself. On a `type: 'suggestion'` card, chips replace the built-in Accept / Reject row.

**Incorrect (expecting Velt to act on the click):**

```jsx
// Chips render, but nothing happens on click: no listener for commentActionClicked
await commentElement.updateComment({
  annotationId: 'ANNOTATION_ID',
  comment: { commentId: 'COMMENT_ID', commentText: 'Answer', actions: [{ id: 'approve', label: 'Approve' }] },
});
```

**Correct (set actions, then handle the event):**

```jsx
const commentElement = client.getCommentElement();

await commentElement.updateComment({
  annotationId: 'ANNOTATION_ID',
  comment: {
    commentId: 'COMMENT_ID',
    commentText: 'This is the answer for your question.',
    actions: [
      { id: 'copy-response', label: 'Copy Response' },
      { id: 'dig-deeper', label: 'Dig Deeper', metadata: { kind: 'followup' } },
    ],
  },
});

// Hook
const eventData = useCommentEventCallback('commentActionClicked');
useEffect(() => {
  if (eventData) {
    handleAction(eventData.actionId, eventData.scope, eventData.commentId, eventData.action.metadata);
  }
}, [eventData]);

// API Method
const subscription = commentElement.on('commentActionClicked').subscribe((event) => {
  handleAction(event.actionId, event.scope, event.commentId, event.action.metadata);
});
subscription?.unsubscribe();
```

```js
// Other Frameworks
const commentElement = Velt.getCommentElement();
const subscription = commentElement.on('commentActionClicked').subscribe((event) => {
  console.log(event.actionId, event.scope, event.commentId);
});
subscription?.unsubscribe();
```

To resolve a suggestion from a chip, call `commentElement.acceptSuggestion({ annotationId })` or `rejectSuggestion({ annotationId })` in your handler.

**Behavior:**
- `CommentAnnotation.actions` is the per-row default regardless of who authored the row; a comment-level list overrides it for that row.
- An explicitly empty comment-level list (`actions: []`, or every entry `hidden`) renders no row and does not fall back to the built-in Accept / Reject controls.
- A progress row never inherits annotation-level actions; only actions set directly on the progress comment render there.
- Each entry is validated on its own. It renders when `id` is a non-empty string, `hidden` is not `true`, and it has a non-empty `label` or `icon`. `disabled` keeps the chip visible but emits nothing.
- Duplicate clicks are suppressed for 500 ms per `(annotationId, commentId, actionId)`.
- REST: `actions` is accepted on `commentData[]` and on the annotation (max 20); updates replace the stored array outright.

**Types:**

```typescript
interface CommentAction {
  id: string;          // stable, customer-owned identity
  label?: string;
  icon?: string;       // raw SVG string, or URL / data URI
  disabled?: boolean;
  hidden?: boolean;
  metadata?: any;      // echoed back on commentActionClicked
}
interface CommentActionClickedEvent {
  action: CommentAction;
  actionId: string;
  scope: 'comment' | 'annotation';
  annotationId: string;
  commentId?: number;
  commentAnnotation: CommentAnnotation;
  comment?: Comment;
  actionUser: User;    // who clicked, distinct from the row's author
  metadata: VeltEventMetadata;
}
```

Restyle the chip row with the Actions wireframes or the `VeltCommentDialogActions` primitives.

**Verification Checklist:**
- [ ] A `commentActionClicked` listener performs every side effect; nothing is expected from Velt
- [ ] Each action has a stable non-empty `id` and a `label` or `icon`
- [ ] Suggestion cards that need Accept / Reject either omit `actions` or call `acceptSuggestion()` / `rejectSuggestion()` from a chip
- [ ] Subscriptions are unsubscribed on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#actions - Actions
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#commentactionclicked - commentActionClicked
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentaction - CommentAction
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentactionclickedevent - CommentActionClickedEvent
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/primitives#veltcommentdialogactions - VeltCommentDialogActions primitives

---

### 7.10 Stream Multi-Step Work into a Comment with Comment.progress

**Impact: MEDIUM (Shows a live progress row while an agent or long task works, without posting placeholder replies that count toward the thread)**

`Comment.progress` turns a comment into a live progress row (animated dots plus a step label) rendered between the last message and the reply composer. Use it instead of posting and deleting "Thinking..." replies: a content-less progress comment does not count toward `annotation.comments`, reply counts, sidebar previews, or resolve state. It is independent of the `agent` block, so any multi-step operation can use it.

**Incorrect (placeholder replies that pollute the thread):**

```jsx
// Each placeholder is a real comment: it bumps reply counts and must be deleted later
await commentElement.addComment({ annotationId, comment: { commentText: 'Thinking...' } });
await commentElement.addComment({ annotationId, comment: { commentText: 'Still working...' } });
```

**Correct (create active, push steps on the same commentId, complete with content):**

```jsx
const commentElement = client.getCommentElement();
const commentId = Date.now();

// 1. Content-less comment with progress.state 'active'
await commentElement.addComment({
  annotationId: 'ANNOTATION_ID',
  comment: {
    commentId,
    progress: { state: 'active', steps: [{ label: 'Getting data', state: 'active' }] },
  },
});

// 2. Push step updates on the SAME commentId (updateComment replaces the comment wholesale)
await commentElement.updateComment({
  annotationId: 'ANNOTATION_ID',
  comment: {
    commentId,
    progress: { state: 'active', steps: [{ label: 'Generating response', state: 'active' }] },
  },
});

// 3. Finish: write the real content and move out of 'active'
await commentElement.updateComment({
  annotationId: 'ANNOTATION_ID',
  comment: {
    commentId,
    progress: { state: 'completed', steps: [{ label: 'Generating response', state: 'completed' }] },
    commentText: 'This is the answer for your question.',
    commentHtml: '<p>This is the answer for your question.</p>',
  },
});
```

The Other Frameworks code is identical with `Velt.getCommentElement()`.

**From your backend:** send `progress` on `commentData[]` in Add Comments / Add Comment Annotations, then update it with Update Comments (`updatedData.progress` replaces the stored object). Set `triggerNotification: true` at the request root of the final update to notify once when the answer lands. Keep progress writes to about one per second per comment. See `rest-comments-api.md`.

**Behavior:**
- The row renders only while `progress.state === 'active'`. `completed` renders the comment as a normal reply; `failed` and `cancelled` stop the indicator but keep any partial content visible.
- `steps` is replaced on every update; there is no server-side append. Keep at most one step `active`. The label shown is the last `active` step, else the last step, else a default "Processing…". Labels render verbatim and are never translated.
- Multiple concurrent runs each get their own row, ordered by server-stamped `createdAt` (`progress.startedAt` never affects ordering).
- A thread whose only comments are content-less progress comments does not render until real content is written.
- Completing a content-less progress comment does not mark it "(edited)".
- A row with no updates goes stale after `commentProgressStaleAfter` ms (default `600000`) and stops rendering. Raise it for long-running agents:

```jsx
<VeltComments commentProgressStaleAfter={1800000} />
// or
commentElement.setCommentProgressStaleAfter(1800000);
```

```html
<velt-comments comment-progress-stale-after="1800000"></velt-comments>
```

**Types:**

```typescript
interface CommentProgress {
  state: 'active' | 'completed' | 'failed' | 'cancelled';
  steps?: CommentProgressStep[];     // max 100 via REST
  visibleToUserIds?: string[];       // display-only, not a security boundary
  startedAt?: number;
}
interface CommentProgressStep {
  label: string;
  id?: string;
  state?: 'pending' | 'active' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  metadata?: any;
}
```

Restyle the row with the Progress wireframes (`VeltCommentDialogProgressWireframe` with `.Dots` / `.Label`) or the `VeltCommentDialogProgress` primitives.

**Verification Checklist:**
- [ ] Every update reuses the same `commentId` as the initial progress comment
- [ ] The final update writes content and sets `state` to `'completed'` (or `'failed'` / `'cancelled'`)
- [ ] Each update sends the full `steps` array you want displayed
- [ ] `commentProgressStaleAfter` raised for runs that can pause longer than 10 minutes
- [ ] `visibleToUserIds` is not relied on for access control

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#progress - Progress
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#commentprogressstaleafter - commentProgressStaleAfter
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentprogress - CommentProgress
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/update-comments - Update Comments (progress, triggerNotification)
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/wireframes#progress-body - Progress wireframes

---

### 7.11 Use agentFields on CommentRequestQuery to Filter Annotation Count by Agent

**Impact: MEDIUM (Enables precise comment count queries scoped to agent-tagged annotations, avoiding full-collection scans)**

> **This rule is about QUERYING annotation counts on the frontend**, not about CREATING annotations. To create agent annotations via REST API, see `rest-agent-comments-api.md` — the creation API uses `agentName`, `reason`, `type: "suggestion"`, and `executionId` on `commentData[0].agent`. Do not confuse `agentFields` (a query-side filter) with the creation-side `agent` block fields.

`CommentRequestQuery.agentFields` filters `getCommentAnnotationsCount()` to only annotations where `agent.agentFields` contains any of the provided values. This is useful when a document has a mix of human and agent-authored annotations and you want a count scoped to a specific agent. When `agentFields` is set, the unread count equals the total count.

**Incorrect (querying all annotation counts without agent scoping):**

```jsx
// Returns total + unread counts across all annotations,
// including those not authored by the target agent
const commentElement = client.getCommentElement();
commentElement.getCommentAnnotationsCount({
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
    // when agentFields is set.
    const subscription = commentElement.getCommentAnnotationsCount({
      organizationId: 'org-123',
      agentFields: ['agent-1', 'agent-2'],
    }).subscribe((response) => {
      // response.data: Record<documentId, { total, unread }>, null while loading
      setCount(response?.data);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  const total = Object.values(count ?? {}).reduce((sum, c) => sum + c.total, 0);
  return <div>Agent annotations: {total}</div>;
}
```

**Correct (Other Frameworks — Angular, Vue, Vanilla JS):**

```typescript
const commentElement = Velt.getCommentElement();

const subscription = commentElement.getCommentAnnotationsCount({
  organizationId: 'org-123',
  agentFields: ['agent-1', 'agent-2'],
}).subscribe((response) => {
  console.log('Agent annotation count:', response?.data);
});
subscription?.unsubscribe();
```

React hook equivalent: `const { data } = useCommentAnnotationsCount({ organizationId: 'org-123', agentFields: ['agent-1'] });`

**CommentRequestQuery.agentFields:**

| Field | Type | Optional | Description |
|-------|------|----------|-------------|
| `agentFields` | `string[]` | Yes | Filters count queries to annotations where `agent.agentFields` contains any of the provided values. When set, unread count is treated as equal to total count. |

**Behavioral Note:** When `agentFields` is set, the returned `unread` count equals `total`. If your UI distinguishes read from unread, do not rely on `unread` when `agentFields` is active.

**AgentData (set on `Comment.agent`):**

The AI-agent identity + output payload attached to an agent-authored `Comment` (set on `Comment.agent` when `Comment.sourceType === 'agent'`). Read-only from the SDK; populated when the annotation is created via the REST API `agent` block. The `agentFields` array on this payload is the field that `CommentRequestQuery.agentFields` filters against.

```typescript
interface AgentData {
  agentName?: string;            // Agent identifier. Always retained for agent-field querying.
  name?: string;                 // Agent display name.
  avatar?: string;               // Agent avatar URL.
  result?: { title?: string };   // Structured agent output; `title` renders in the agent suggestion card.
  agentFields?: string[];        // Agent field tags used by CommentRequestQuery.agentFields.
}
```

The annotation-level `CommentAnnotationAgent` (see `data-types-reference.md`) is a sibling shape used on `CommentAnnotation.agent`; `AgentData` is its comment-level counterpart on `Comment.agent`. Both surface `agentFields` for the same query-side filter.

**Verification Checklist:**
- [ ] `agentFields` values match the strings stored in `agent.agentFields` on the target annotations
- [ ] UI does not display a meaningful unread badge when `agentFields` is set (unread equals total)
- [ ] Subscription is cleaned up on component unmount
- [ ] `organizationId` is always provided alongside `agentFields`
- [ ] When reading `Comment.agent`, use the `AgentData` shape (`agentName`, `name`, `avatar`, `result.title`, `agentFields`); do not mutate it from the client

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentrequestquery - CommentRequestQuery model
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#getcommentannotationscount - getCommentAnnotationsCount
- https://docs.velt.dev/api-reference/sdk/models/data-models#getcommentannotationscountresponse - GetCommentAnnotationsCountResponse

---

### 7.12 Use CommentActivityActionTypes for Type-Safe Comment Activity Filtering

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

**Verification Checklist:**
- [ ] `CommentActivityActionTypes` imported from `@veltdev/react` (React) or `@veltdev/types` (other frameworks)
- [ ] `CommentActivityActionType` union type used for typed `actionTypes` arrays
- [ ] No raw string literals used for comment action type values
- [ ] Activity subscriptions cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#activitysubscribeconfig - ActivitySubscribeConfig
- https://docs.velt.dev/async-collaboration/comments/setup/popover - Comments Setup

---

### 7.13 Use Config-Based URL Endpoints Instead of Placeholder Callbacks in CommentAnnotationDataProvider

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

**CommentAnnotationDataProvider interface (v5.0.2-beta.8):**

| Field | Type | Optional | Description |
|-------|------|----------|-------------|
| `get` | `(request: CommentAnnotationGetRequest) => Promise<ResolverResponse<CommentAnnotation>>` | Yes | Callback to fetch an annotation from your backend. Optional when `config.getConfig` is provided. |
| `save` | `(request: CommentAnnotationSaveRequest) => Promise<ResolverResponse<void>>` | Yes | Callback to persist an annotation. Optional when `config.saveConfig` is provided. |
| `delete` | `(request: CommentAnnotationDeleteRequest) => Promise<ResolverResponse<void>>` | Yes | Callback to delete an annotation. Optional when `config.deleteConfig` is provided. |
| `config.getConfig` | `{ url: string }` | Yes | URL endpoint for fetch operations. |
| `config.saveConfig` | `{ url: string }` | Yes | URL endpoint for save operations. |
| `config.deleteConfig` | `{ url: string }` | Yes | URL endpoint for delete operations. |
| `config.additionalFields` | `string[]` | Yes | Fields copied to your resolver endpoint payload but **retained** in Velt's storage. Use for data replication without removal. |
| `config.fieldsToRemove` | `string[]` | Yes | Fields **stripped from Velt's DB** before storage. Use for PII removal. Can coexist with `additionalFields` on the same config object. |

The same `get?`, `save?`, `delete?` optionality applies to `ReactionAnnotationDataProvider` and `AttachmentDataProvider`.

**Verification Checklist:**
- [ ] Config-based registrations omit placeholder `get`/`save`/`delete` stub callbacks
- [ ] `additionalFields` lists only field names that exist in your comment data model and are safe to replicate
- [ ] `fieldsToRemove` lists PII or sensitive fields that must not be persisted in Velt's storage
- [ ] Callback-based and config-based forms are not mixed on the same provider entry
- [ ] `setDataProviders` is called after the Velt client is initialized

**Source Pointers:**
- https://docs.velt.dev/self-hosting/partial/comments - Comments data provider (endpoint and function based)
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setdataproviders - setDataProviders()

---

### 7.14 Use triggerActivities to Create Activity Records via REST API

**Impact: MEDIUM (Ensures comment additions via REST API are reflected in the activity feed when workspace-level activity tracking is enabled)**

When adding comments via the `POST /v2/commentannotations/add` REST endpoint, set `triggerActivities: true` on each `CommentData` entry to automatically create an activity record for that comment. Without this flag the comment is persisted but no activity record is generated, even if the workspace has `activityServiceConfig` enabled.

Note: `triggerActivities` creates activity records; `triggerNotification` sends notifications. These are independent flags — one does not imply the other.

**Prerequisite:** The workspace must have `activityServiceConfig` enabled at the workspace level before `triggerActivities` has any effect.

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

**Field Reference — CommentData schema (v5.0.2-beta.7):**

| Field | Type | Default | Description |
|---|---|---|---|
| `triggerActivities` | `boolean` | `false` | When `true`, an activity record is automatically created for this comment addition. Requires workspace `activityServiceConfig` to be enabled. Set at the individual `CommentData` level, not the annotation level. |
| `triggerNotification` | `boolean` | `false` | When `true`, triggers in-app notifications, email notifications, and webhooks matching the SDK's native behavior. Independent of `triggerActivities`. |

**Verification Checklist:**
- [ ] `triggerActivities` is set inside `commentData[]`, not at the `commentAnnotations[]` level
- [ ] Workspace has `activityServiceConfig` enabled before relying on this flag
- [ ] `triggerActivities` and `triggerNotification` are set independently based on requirements
- [ ] Request body uses `commentData` (array) as the key, not `comments`

**Source Pointers:**
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations - POST /v2/commentannotations/add endpoint reference
- https://docs.velt.dev/async-collaboration/activity/overview - Activity Service overview and activityServiceConfig

---

## 8. Debugging & Testing

**Impact: LOW-MEDIUM**

Troubleshooting patterns and verification checklists for Velt integrations.

### 8.1 Troubleshoot Common Velt Integration Issues

**Impact: LOW-MEDIUM (Quick fixes for common setup and runtime problems)**

Common issues and solutions when integrating Velt Comments.

**Issue: Components Not Rendering**

**Symptoms:** VeltComments, VeltCommentTool, etc. don't appear

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

**Verification Checklist:**
- [ ] API key valid and domain safelisted
- [ ] VeltProvider wraps all Velt components
- [ ] User authenticated before document setup
- [ ] Document ID is stable and consistent
- [ ] Mode-specific props configured correctly

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart - "Debugging" section

---

### 8.2 Verify Velt Comments Integration

**Impact: LOW-MEDIUM (Checklist to confirm correct setup and functionality)**

Use this checklist to verify your Velt Comments integration is working correctly.

**1. SDK Initialization Check**

Open browser console and run:
```javascript
// Should return document metadata
await Velt.getMetadata();

// Should return user object
await Velt.getCurrentUser();
```

**2. Core Setup Verification**

- [ ] VeltProvider wraps application with valid API key
- [ ] Domain added to "Managed Domains" in Velt Console
- [ ] User authenticated with userId, organizationId, name, email
- [ ] Document set with stable, unique ID
- [ ] VeltComments component added to app root

**3. Comment Creation Test**

- [ ] Click VeltCommentTool button
- [ ] Cursor changes to comment pin (Freestyle mode)
- [ ] Click on page creates comment dialog
- [ ] Submit comment successfully
- [ ] Comment persists after page refresh

**4. Multi-User Test**

- [ ] Open two browsers (one incognito)
- [ ] Login as different users with same organizationId
- [ ] Set same documentId in both
- [ ] Create comment in one browser
- [ ] Comment appears in other browser

**5. Mode-Specific Tests**

**Freestyle Mode:**
- [ ] VeltCommentTool button visible
- [ ] Click anywhere creates comment

**Popover Mode:**
- [ ] popoverMode={true} set
- [ ] Comments attach to target elements
- [ ] Triangle or bubble indicator visible

**Text Mode:**
- [ ] Select text shows comment tool
- [ ] Comment attaches to selection
- [ ] Highlighted text marked

**Stream Mode:**
- [ ] streamMode={true} set
- [ ] Comments appear in right column
- [ ] Stream scrolls with content

**Video/Lottie:**
- [ ] Timeline shows comment bubbles
- [ ] Comments link to correct timestamps
- [ ] Clicking comment seeks media

**Editor (TipTap/Slate/Lexical):**
- [ ] textMode={false} set
- [ ] Extension installed and configured
- [ ] Comments render in editor
- [ ] renderComments called on annotation change

**6. Sidebar Verification**

- [ ] VeltCommentsSidebar renders
- [ ] VeltSidebarButton toggles sidebar
- [ ] Comments listed in sidebar
- [ ] Click navigates to comment

**7. Console Error Check**

Open browser console and check for:
- [ ] No Velt-related errors
- [ ] No "Invalid API key" errors
- [ ] No network errors to Velt endpoints
- [ ] No authentication errors

**8. Performance Check**

- [ ] Comments load without significant delay
- [ ] No UI blocking during comment operations
- [ ] Smooth interaction with comment dialogs

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

**Source Pointers:**
- https://docs.velt.dev/get-started/quickstart - "Step 8: Verify Setup"

---

## 9. Moderation & Permissions

**Impact: LOW**

Access control and moderation features for comments. Includes comment visibility control (private mode), per-annotation visibility updates, and post-persist event handling.

### 9.1 Combine Private Comments with Access Context as Two Independent Checks

**Impact: MEDIUM (Prevents leaking private comments to viewers who share an Access Context, and avoids comments loading for the wrong users because of a reserved field name)**

Comments have two independent scoping systems that can be set on the same comment. **Visibility** (`updateVisibility()`, `enablePrivateMode()`, the composer visibility banner; stored as `visibilityConfig`) controls who may see a comment. **Access Context** (`context.access` set via `addContext()`, `setContextProvider()`, or a component `context` prop, enforced with `isContextEnabled: true` on your Permission Provider) partitions comments by custom metadata. A viewer must pass both checks. Treating context as a permission, or visibility as a partition, leads to comments showing up for the wrong users.

**Incorrect (relying on context to hide a private comment, reserved field name):**

```jsx
const commentElement = client.getCommentElement();

// Context is a data partition, not a permission: everyone allowed in widgetId 2 can still
// see public comments there, and private comments need their own visibility.
// 'organizationPrivate' is reserved: Velt reads it as a visibility setting.
commentElement.setContextProvider(() => ({
  access: { widgetId: 2, organizationPrivate: 'acme' },
}));
```

**Correct (React / Next.js):**

```jsx
import { useEffect } from 'react';
import { useSetContextProvider, useVeltClient } from '@veltdev/react';

function PrivateWidgetComments() {
  const { client } = useVeltClient();
  // Hook
  const { setContextProvider } = useSetContextProvider();

  useEffect(() => {
    if (setContextProvider) {
      // Partition: attach an Access Context to every new comment
      setContextProvider(() => ({ access: { widgetId: 2 } }));
    }
  }, [setContextProvider]);

  useEffect(() => {
    if (!client) return;
    // API Method (permission): restrict every new comment to the current organization
    const commentElement = client.getCommentElement();
    commentElement.enablePrivateMode({ type: 'organizationPrivate' });
  }, [client]);

  return null;
}
```

**Correct (Other Frameworks):**

```js
const commentElement = Velt.getCommentElement();
commentElement.setContextProvider(() => ({ access: { widgetId: 2 } }));
commentElement.enablePrivateMode({ type: 'organizationPrivate' });
```

**Updating context without losing visibility:**

```js
// Merge access keys: adding a key keeps the others, null deletes a key,
// removing the last key returns the comment to its default context.
commentElement.updateContext('ANNOTATION_ID', { access: { widgetId: 3, region: null } }, { merge: true });
```

**How the two settings behave together:**
- Making a comment private keeps its Access Context, and updating Access Context (even clearing `access` with `null`) keeps its visibility.
- You can edit a private comment while Access Context is enabled.
- A private comment appears only under its own Access Context, for everyone including the author, and reaches only the users its visibility allows.
- Comments created with context from `setContextProvider()` or a component `context` prop (`VeltCommentTool`, `VeltCommentComposer`) load right away and survive reloads, the same as `addContext()`.
- Turning a loaded comment private removes it from other viewers immediately; turning it public again keeps it loadable when Access Context is off.
- Reactions, recordings, and area annotations on a private comment do not inherit its Access Context, and viewers who cannot see the parent do not receive them.
- The write gate checks the **acting** user (not the comment author); admins are exempt so moderation works. An empty access field list grants access.
- Notifications follow visibility: users who cannot see a private comment get no notification, on any channel. Comment webhooks for private comments carry a `visibility` object (`type`, `userIds`, `organizationIds`, `organizationId`); public comments carry none. Basic (V1) webhooks also include `accessDeniedUsers`. Use it to filter downstream fan-out.
- Inside `context.accessFields`, the prefixes `__velt_private_self:` and `organizationPrivate:` are reserved for visibility. Never name an Access Context field `organizationPrivate`; Velt does not block it at runtime.

**Prerequisites:**
- Enable **Private Comments** in the Velt Console. Without it, visibility choices do not filter the audience.
- Set `isContextEnabled: true` on your Permission Provider to enforce Access Context.

**Verification Checklist:**
- [ ] Private Comments enabled in the Velt Console
- [ ] Permission Provider sets `isContextEnabled: true` when Access Context must be enforced
- [ ] Visibility is set separately from context; context is never used as the only privacy control
- [ ] No Access Context field is named `organizationPrivate`
- [ ] `updateContext()` uses `{ merge: true }` when other access keys must be kept

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#private-comments-with-access-context - Private comments with Access Context
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatecontext - updateContext
- https://docs.velt.dev/key-concepts/overview#d-set-feature-level-permissions-using-access-context - Access Context permissions
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#notifications-for-private-comments - Notifications for private comments
- https://docs.velt.dev/webhooks/advanced#comment-visibility - Comment visibility on webhooks

---

### 9.2 Control Comment Visibility with Private Mode and Per-Annotation Updates

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
      // organizationId is optional — defaults to the logged-in user's org.
      // Use organizationIds: ['org-A', 'org-B'] to share with several orgs/teams.
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
      comment: {
        commentText: 'Visible only to selected users',
        commentHtml: '<p>Visible only to selected users</p>',
      },
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
  comment: {
    commentText: 'Visible only to selected users',
    commentHtml: '<p>Visible only to selected users</p>',
  },
  visibility: {
    type: 'restricted',
    userIds: ['user1', 'user2'],
  },
});
```

**API Reference:**

| Method | Signature | Description |
|---|---|---|
| `enablePrivateMode` | `enablePrivateMode(config: PrivateModeConfig): void` | Sets global visibility for all new comments. |
| `disablePrivateMode` | `disablePrivateMode(): void` | Reverts all new comments to default public visibility. |
| `updateVisibility` | `updateVisibility(config: CommentVisibilityConfig): Promise<any>` | Updates visibility of a specific annotation; the annotation is identified by `config.annotationId` (a single object, not two arguments). |
| `addComment` | `addComment(request: AddCommentRequest): Promise<AddCommentEvent>` | Creates a comment; accepts optional `visibility` to set `CommentVisibilityConfig` at creation time. |

**Type Definitions:**

```typescript
type CommentVisibilityType = 'public' | 'organizationPrivate' | 'restricted';

interface CommentVisibilityConfig {
  type: CommentVisibilityType;
  annotationId: string;      // Identifies the annotation for updateVisibility()
  organizationId?: string;   // 'organizationPrivate'; defaults to the logged-in user's org
  organizationIds?: string[]; // 'organizationPrivate' across several orgs; merged + de-duplicated with organizationId
  userIds?: string[];        // 'restricted'; current user always auto-appended
}

// PrivateModeConfig omits only annotationId (organizationId / organizationIds are accepted)
type PrivateModeConfig = Omit<CommentVisibilityConfig, 'annotationId'>;

interface AddCommentRequest {
  annotationId?: string;
  comment?: { commentText?: string; commentHtml?: string; [key: string]: unknown };
  visibility?: CommentVisibilityConfig; // Optional: set visibility at creation time (v5.0.2-beta.4+)
  [key: string]: unknown;
}
```

**Key Behaviors:**

- `enablePrivateMode()` applies to all **new** comments created after the call. It does not retroactively change existing annotations.
- `disablePrivateMode()` resets the global default to `'public'` for subsequent new comments.
- For `'organizationPrivate'` type, `organizationId` defaults to the logged-in user's organization. Pass `organizationIds` to make a comment visible to several organizations or teams (pair with `contactElement.updateOrgList()` for the "Selected Teams" picker).
- `enablePrivateMode()` called before the user is identified keeps its config, and restricted comments always carry their actual author.
- Visibility and Access Context are independent: setting visibility keeps the comment's `access` context, and a viewer must pass both checks. See `permissions-private-comments-access-context.md`.
- Comment notifications follow visibility: a user who cannot see a private comment gets no notification for it on any channel.
- For `'restricted'` type, the current user is **always** auto-appended to `userIds` — even when an explicit `userIds` list is provided. If the current user is not in the list, they are automatically included. Do not assume passing `userIds: ['user-b']` restricts the comment to only `user-b`.
- `updateVisibility()` requires `annotationId` and changes only that specific annotation.
- `addComment()` accepts an optional `visibility: CommentVisibilityConfig` field (v5.0.2-beta.4+) to set visibility at creation time, eliminating a separate `updateVisibility()` call when visibility is known upfront.

---

#### Breaking Change: CommentVisibilityType Value Renames (v5.0.1-beta.4)

The string literal values of `CommentVisibilityType` were renamed in v5.0.1-beta.4. Passing the old values will **silently** apply incorrect (or no) visibility — there is no runtime error.

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

**Migration Checklist:**
- [ ] Search codebase for `type: 'organization'` passed to `updateVisibility()` or `enablePrivateMode()` — replace with `'organizationPrivate'`
- [ ] Search codebase for `type: 'self'` passed to `updateVisibility()` or `enablePrivateMode()` — replace with `'restricted'`
- [ ] Audit any serialized `CommentVisibilityType` values stored in databases or localStorage

**Verification Checklist:**
- [ ] Visibility feature is enabled in [Velt Console](https://console.velt.dev/dashboard/config/appconfig) before using any visibility API
- [ ] `enablePrivateMode()` called before the user creates any new comments in the session
- [ ] `disablePrivateMode()` called in cleanup (e.g., `useEffect` return) to avoid leaking visibility state across routes
- [ ] `CommentVisibilityType` values use the new names: `'public'`, `'organizationPrivate'`, `'restricted'`
- [ ] `updateVisibility()` includes a valid `annotationId` for per-annotation changes

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#private-comments-beta - Private Comments
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatevisibility - updateVisibility
- https://docs.velt.dev/api-reference/sdk/api/api-methods#updatevisibility - updateVisibility() reference
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentvisibilityconfig - CommentVisibilityConfig

---

### 9.3 Moderation & Permissions

**Impact: LOW (Access control and moderation features for comments)**

- **Private comments (visibility):** `permissions-private-mode.md` (`enablePrivateMode`, `updateVisibility`), `permissions-visibility-option-dropdown.md` (composer visibility banner), `permissions-visibility-routing.md` (`isAnnotationPrivate()` semantics).
- **Access Context with private comments:** `permissions-private-comments-access-context.md`.
- **Comment events used for gating and side effects:** `permissions-comment-saved-event.md`, `permissions-comment-save-triggered-event.md`, `permissions-comment-interaction-events.md`, `permissions-submit-in-flight.md`.
- **Anonymous (email-only) users:** `permissions-anonymous-user-data-provider.md`.
- **Moderation (approval, read-only, admin-only resolve, suggestion resolution):** `config/config-moderation.md`.

#### Access control basics

- Assign users as **Editor** or **Viewer** per resource (organization, folder, document) through your JWT token permissions or the access REST APIs. Editors can write collaboration data; Viewers are read-only.
- Users can only access documents in their own organization unless you grant cross-organization access.
- Feature-level partitioning of comments uses Access Context with `isContextEnabled: true` on your Permission Provider.

#### Source Pointers

- https://docs.velt.dev/key-concepts/overview - Access control concepts
- https://docs.velt.dev/security/auth-tokens - Auth tokens
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/add-permissions - Add permissions REST API
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#private-comments-beta - Private Comments

---

### 9.4 Prefer Past-Tense Event Aliases commentToolClicked and sidebarButtonClicked in New Code

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

**Event Alias Reference:**

| Past-Tense (canonical, new code) | Present-Tense (legacy, still works) | Type |
|----------------------------------|--------------------------------------|------|
| `commentToolClicked` | `commentToolClick` | `CommentToolClickedEvent extends CommentToolClickEvent` |
| `sidebarButtonClicked` | `sidebarButtonClick` | `SidebarButtonClickedEvent extends SidebarButtonClickEvent` |

<!-- TODO (v5.0.2-beta.2): Verify exact payload fields for CommentToolClickEvent and SidebarButtonClickEvent. Release note documents the type names and alias relationship but does not enumerate individual payload fields. Refer to https://docs.velt.dev/api-reference/sdk/models/data-models for the full field listing of the parent types. -->

**Key Behaviors:**

- `commentToolClicked` and `sidebarButtonClicked` are past-tense aliases introduced in v5.0.2-beta.2. Both names fire simultaneously when the corresponding UI element is clicked — subscribing to either name receives the same event.
- `CommentToolClickedEvent` extends `CommentToolClickEvent`; `SidebarButtonClickedEvent` extends `SidebarButtonClickEvent`. Payload fields match the parent types — refer to the data-models documentation for the full field listing.
- Migration from the present-tense names is non-breaking. Existing subscriptions on `commentToolClick` or `sidebarButtonClick` continue to work without modification.
- In React, use `useCommentEventCallback` with a `useEffect` that depends on the returned event value.
- In non-React frameworks, always call `.unsubscribe()` on each subscription to avoid memory leaks.

**Verification Checklist:**
- [ ] New code subscribes to `commentToolClicked` and `sidebarButtonClicked` (past-tense), not the present-tense originals
- [ ] React usage uses `useCommentEventCallback('commentToolClicked')` / `useCommentEventCallback('sidebarButtonClicked')` with separate `useEffect` hooks for each event
- [ ] Non-React usage calls `.unsubscribe()` on each subscription when the listener is destroyed
- [ ] Payload field access is validated against the data-models documentation for `CommentToolClickEvent` / `SidebarButtonClickEvent`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#event-subscription - `commentToolClicked` and `sidebarButtonClicked` event reference
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - `useCommentEventCallback` hook
- https://docs.velt.dev/api-reference/sdk/api/api-methods#on - `commentElement.on()` subscription pattern
- https://docs.velt.dev/api-reference/sdk/models/data-models - Parent type payload field details

---

### 9.5 Register an Anonymous User Data Provider to Resolve Tagged Contact Emails to User IDs

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

**Key Behaviors:**

- The provider is called automatically at comment save time — not on every keystroke or mention.
- `resolveUserIdsByEmail` receives all unresolved emails for the annotation in a single batch call.
- `setAnonymousUserDataProvider(resolver)` and `setDataProviders({ anonymousUser: resolver })` are equivalent; use whichever fits your initialization pattern.

**Verification Checklist:**
- [ ] `setAnonymousUserDataProvider()` or `setDataProviders({ anonymousUser })` is called once at initialization inside a `useEffect` that depends on `client`
- [ ] `resolveUserIdsByEmail` returns `{ statusCode: number, success: boolean, data: Record<string, string> }` mapping each input email to its userId
- [ ] The provider handles the case where an email cannot be resolved (e.g., returns an empty string or omits the key)
- [ ] Subscription/cleanup is not needed — this is a one-time registration, not an observable

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#setanonymoususerdataprovider - setAnonymousUserDataProvider
- https://docs.velt.dev/self-hosting/partial/users#anonymous-user-resolution - Anonymous user resolution guide
- https://docs.velt.dev/api-reference/sdk/models/data-models#anonymoususerdataprovider - AnonymousUserDataProvider and related type definitions

---

### 9.6 Show a Visibility Banner in the Comment Composer for Multi-Level Visibility Selection

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

**API Reference:**

| API | Type | Signature | Description |
|-----|------|-----------|-------------|
| `visibilityOptions` | prop | `boolean` (default: `false`) | Show or hide the visibility banner in the comment composer. |
| `enableVisibilityOptions` | method | `enableVisibilityOptions(): void` | Programmatically show the visibility banner. |
| `disableVisibilityOptions` | method | `disableVisibilityOptions(): void` | Programmatically hide the visibility banner. |
| `visibilityOptionClicked` | event | `VisibilityOptionClickedEvent` | Fires when the user selects a visibility option from the banner. |

**Key Behaviors:**

- Enable **Private Comments** in the Velt Console first. Without it, the "Visible to" dropdown does not filter the audience: comments stay visible to everyone on the document even after a user picks a non-public option.
- Users can also change visibility after submission from the thread options menu. Supply the "Selected Teams" options with `contactElement.updateOrgList({ orgList })`.
- The visibility banner is hidden by default (`visibilityOptions={false}`). It must be explicitly enabled via the prop or `enableVisibilityOptions()`.
- The `visibilityOptionClicked` event fires each time the user selects an option — not on submission.
- When `visibility === 'restrictedSelectedPeople'`, the event includes a `users` array with the selected user objects. For other visibility types, `users` is `undefined`.
- In React, `useCommentEventCallback('visibilityOptionClicked')` returns the latest event; use it inside a `useEffect` that depends on the returned value.
- In non-React frameworks, always call `.unsubscribe()` to avoid memory leaks when the listener is no longer needed.
- The UI surface is a persistent banner below the composer (replaces the previous two-option dropdown). Customize it via `VeltCommentDialogWireframe.VisibilityBanner.*`.

**Migration Checklist (from v5.0.2-beta.3 and earlier):**
- [ ] Replace `visibilityOptionDropdown={true}` with `visibilityOptions={true}` on `<VeltComments>`
- [ ] Replace `visibility-option-dropdown="true"` with `visibility-options="true"` on `<velt-comments>`
- [ ] Replace `enableVisibilityOptionDropdown()` with `enableVisibilityOptions()`
- [ ] Replace `disableVisibilityOptionDropdown()` with `disableVisibilityOptions()`
- [ ] Replace `visibility === 'private'` checks with `visibility === 'personal'`
- [ ] Update `VisibilityOptionClickedEvent.visibility` type references from `'public' | 'private'` to `CommentVisibilityOptionType`

**Migration Checklist (from v5.0.2-beta.4 and earlier — v5.0.2-beta.5 rename):**
- [ ] Replace `visibility === 'personal'` checks with `visibility === 'restrictedSelf'`
- [ ] Replace `visibility === 'selected-people'` checks with `visibility === 'restrictedSelectedPeople'`
- [ ] Replace `visibility === 'org-users'` checks with `visibility === 'organizationPrivate'`
- [ ] Update `CommentVisibilityOptionType` references to the new template-literal form: `'restrictedSelf' | 'restrictedSelectedPeople' | 'organizationPrivate' | 'public'`

**Verification Checklist:**
- [ ] `visibilityOptions={true}` set on `<VeltComments>` or `enableVisibilityOptions()` called programmatically before the user opens the composer
- [ ] `disableVisibilityOptions()` called in cleanup (e.g., `useEffect` return) if enabled programmatically
- [ ] `visibilityOptionClicked` listener uses `useCommentEventCallback` in React or `.on(...).subscribe(...)` in other frameworks
- [ ] Non-React subscriptions call `.unsubscribe()` when the listener is destroyed

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#visibilityoptions - visibilityOptions banner
- https://docs.velt.dev/api-reference/sdk/api/api-methods#getcommentelement - `getCommentElement()` reference
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - `useCommentEventCallback` hook

---

### 9.7 Use CommentDialogActionService.isSubmitInFlight() to Guard Against Duplicate Submits

**Impact: LOW-MEDIUM (Without in-flight tracking, custom submit actions in sidebar custom-actions hosts can trigger duplicate comment saves or spurious draft events)**

When building custom-actions sidebar hosts that intercept the comment submit flow, `CommentDialogActionService.isSubmitInFlight()` prevents duplicate submits and spurious auto-draft saves that fire before the composer reset signal propagates.

**When to use:** Only relevant for advanced custom-actions hosts (apps using `customActions={true}` on `VeltCommentsSidebar` with `setCommentSidebarData()`). Standard integrations do not need this.

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

### 9.8 Use commentSaveTriggered for Immediate UI Feedback Before Async Save Completes

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

**Event Timing Reference:**

| Event | Fires When | Use For |
|-------|-----------|---------|
| `commentSaveTriggered` | Immediately on save button click | Instant UI feedback (spinners, disabled states) |
| `commentSaved` | After async database write confirms | Webhooks, analytics, external sync |

**Key Behaviors:**

- `commentSaveTriggered` fires **before** the database write — it is not a confirmation of persistence.
- Do not trigger webhooks or external sync from `commentSaveTriggered`; those side-effects require confirmation from `commentSaved`.
- `CommentSaveTriggeredEvent` now includes the full `commentAnnotation` object (v5.0.2-beta.4+), providing comment content, assignment, and visibility state without a separate lookup.
- In React, `useCommentEventCallback('commentSaveTriggered')` returns the latest event value and updates on each new save click.
- In non-React frameworks, always call `.unsubscribe()` to avoid memory leaks when the listener is no longer needed.

**Verification Checklist:**
- [ ] Immediate UI side-effects (spinners, disabled inputs) use `commentSaveTriggered`, not `commentSaved`
- [ ] Post-persist side-effects (webhooks, analytics, external sync) use `commentSaved`, not `commentSaveTriggered`
- [ ] React usage uses `useCommentEventCallback('commentSaveTriggered')` with a `useEffect` that depends on `triggeredEvent`
- [ ] Non-React usage calls `.unsubscribe()` to clean up the subscription when the listener is destroyed

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#event-subscription - `commentSaveTriggered` event and payload reference
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - `useCommentEventCallback` hook
- https://docs.velt.dev/api-reference/sdk/api/api-methods#on - `commentElement.on()` subscription pattern

---

### 9.9 Use isAnnotationPrivate() for Unified Visibility Routing

**Impact: MEDIUM (Without the shared isAnnotationPrivate() utility, privacy checks miss annotations using the new visibilityConfig field and only detect legacy iam.accessMode)**

Velt has two mechanisms for marking comments as private: the legacy `iam.accessMode === 'private'` field and the newer `visibilityConfig.type` field (which can be `'restricted'` or `'organizationPrivate'`). The SDK routes every privacy check through its shared internal `isAnnotationPrivate()` utility, which checks both. Your own code and wireframes should apply the same rule (or bind to the `isPrivateComment` wireframe variable) instead of checking a single field.

**Incorrect (only checking legacy field):**

```jsx
// Wrong: misses annotations set via updateVisibility({ type: 'restricted' })
const isPrivate = annotation.iam?.accessMode === 'private';
```

**Correct (check both paths, the same way the SDK does):**

```jsx
const isPrivate =
  annotation.iam?.accessMode === 'private' ||
  annotation.visibilityConfig?.type === 'restricted' ||
  annotation.visibilityConfig?.type === 'organizationPrivate';
```

The SDK's internal `isAnnotationPrivate()` returns `true` when any of these conditions holds:
- `annotation.iam.accessMode === 'private'` (legacy)
- `annotation.visibilityConfig.type === 'restricted'`
- `annotation.visibilityConfig.type === 'organizationPrivate'`

This utility is used internally by these primitive components:
- `VeltCommentDialogOptionsDropdownContentMakePrivate` — auto-suppressed when `featureState.visibilityOptions === true`
- `VeltCommentDialogOptionsDropdownContentMakePrivateEnable` — shown when `isAnnotationPrivate()` returns `false`
- `VeltCommentDialogOptionsDropdownContentMakePrivateDisable` — shown when `isAnnotationPrivate()` returns `true`
- The private badge and banner are auto-suppressed when visibility options are active

In wireframes, bind to `{isPrivateComment}` (Comment Bubble and Comment Dialog wireframe variables), which reflects both models.

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

**Verification Checklist:**
- [ ] Privacy checks cover `iam.accessMode === 'private'` and `visibilityConfig.type` of `restricted` / `organizationPrivate`
- [ ] Wireframes use `{isPrivateComment}` rather than reading one field
- [ ] Visibility changes go through `updateVisibility()` / `enablePrivateMode()`, not by writing `iam` directly

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/primitives#veltcommentdialogoptionsdropdowncontentmakeprivateenable - Make-private enable/disable variants
- https://docs.velt.dev/ui-customization/features/async/comments/comment-bubble/wireframe-variables - `isPrivateComment` variable
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#private-comments-beta - Private Comments

---

### 9.10 Use the commentSaved Event for Reliable Post-Persist Side-Effects

**Impact: LOW (Trigger webhooks, analytics, or external sync only after database write confirmation — not prematurely on optimistic UI updates)**

> **For agent suggestion accept/reject**: Do NOT use `commentSaved` with status checks. Instead use the dedicated `suggestionAccepted` and `suggestionRejected` events via `useCommentEventCallback('suggestionAccepted')` / `useCommentEventCallback('suggestionRejected')`. See `rest-agent-comments-api.md` and `events-comment-lifecycle.md`.

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

**Key Behaviors:**

- `commentSaved` fires **after** write confirmation, not on optimistic update. It is safe to use as the trigger for backend side-effects.
- The event is emitted once per annotation save — both for new annotations and updates to existing ones.
- `savedEvent.commentAnnotation` contains the full persisted annotation object, including any server-assigned fields.
- In React, `useCommentEventCallback('commentSaved')` returns the latest event value; it updates whenever a new save occurs.
- In non-React frameworks, the `.subscribe()` callback receives each event in order. Always call `.unsubscribe()` to avoid memory leaks.

**Verification Checklist:**
- [ ] Side-effects (webhooks, logging, external sync) are triggered from `commentSaved`, not from optimistic callbacks like `onCommentAdd`
- [ ] React usage uses `useCommentEventCallback('commentSaved')` with a `useEffect` that depends on `savedEvent`
- [ ] Non-React usage calls `.unsubscribe()` to clean up the subscription when the component or listener is destroyed
- [ ] `annotationId` from the event is used to reference the saved annotation in downstream systems

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#event-subscription - `commentSaved` event and payload reference
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - `useCommentEventCallback` hook
- https://docs.velt.dev/api-reference/sdk/api/api-methods#on - `commentElement.on()` subscription pattern

---

## 10. Attachments & Reactions

**Impact: MEDIUM**

File attachment control and emoji reaction features. Includes attachment download behavior, click interception events, and CSS state classes for attachment loading and edit-mode states.

### 10.1 Attachments & Reactions

**Impact: MEDIUM (File attachment control and emoji reaction features)**

- **Attachment download control and click interception:** `attach-download-control.md` (`attachmentDownload`, `attachmentDownloadClicked`).
- **Enabling attachments, file-type limits, programmatic uploads:** `config/config-attachments.md` (`setAllowedFileTypes`, `addAttachment`, `setComposerFileAttachments`).
- **Comment reactions (enable, custom set, add / delete / toggle):** `config/config-reactions.md`.

#### Video player reactions

`VeltReactionTool` adds reactions to video content and needs a `videoPlayerId`:

```jsx
import { VeltReactionTool } from '@veltdev/react';

<VeltReactionTool videoPlayerId={videoPlayerId} onReactionToolClick={() => onReactionToolClick()} />
```

```html
<velt-reaction-tool video-player-id="videoPlayerId"></velt-reaction-tool>
```

#### Source Pointers

- https://docs.velt.dev/async-collaboration/comments/customize-behavior#attachments - Attachments
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#reactions - Reactions
- https://docs.velt.dev/async-collaboration/comments/setup/video-player-setup/custom-video-player-setup - VeltReactionTool

---

### 10.2 Control Attachment Download Behavior and Intercept Clicks

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

```html
<!-- Declarative attribute -->
<velt-comments attachment-download="false"></velt-comments>
```

```typescript
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

**`attachmentDownload` Prop Reference:**

| Prop / Attribute | Type | Default | Description |
|---|---|---|---|
| `attachmentDownload` (React) | boolean | `true` | Controls whether clicking an attachment triggers a file download. Set to `false` to suppress download. |
| `attachment-download` (HTML) | string | `"true"` | Same control via HTML attribute. Use `"false"` to suppress download. |

**`AttachmentDownloadClickedEvent` Interface:**

```typescript
interface AttachmentDownloadClickedEvent {
  annotationId: string;               // ID of the comment annotation containing the attachment
  commentAnnotation: CommentAnnotation; // Full comment annotation object
  attachment: Attachment;             // Attachment object that was clicked
  metadata?: VeltEventMetadata;       // Optional event metadata
}
```

**Key Behaviors:**

- Download is enabled by default — no breaking change when upgrading.
- `attachmentDownloadClicked` fires on **every** attachment click, even when download is enabled.
- Use the event to open a custom file viewer, log analytics, or enforce access control without needing to disable downloads globally.
- `enableAttachmentDownload()` and `disableAttachmentDownload()` operate on `commentElement` obtained via `client.getCommentElement()` (React) or `Velt.getCommentElement()` (non-React).

**CSS State Classes:**

Velt applies the following CSS classes to composer attachment elements to reflect loading and edit-mode states. These classes allow styling attachment states without needing to use wireframes.

> **Shadow DOM note:** These classes live inside Velt's Shadow DOM by default. To target them with external CSS you must either disable Shadow DOM (`shadowDom={false}` / `shadow-dom="false"`) or use CSS custom properties. See the `ui-comment-dialog` rule for the Shadow DOM disable pattern.

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

**Verification Checklist:**
- [ ] `attachmentDownload={false}` or `disableAttachmentDownload()` called to suppress default download
- [ ] `attachmentDownloadClicked` event handler subscribed to handle click side-effects
- [ ] Subscription cleaned up on component unmount (non-React: `unsubscribe()`)
- [ ] Shadow DOM disabled (`shadowDom={false}`) if targeting CSS state classes with external stylesheets

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#attachmentdownload - Attachment download control
- https://docs.velt.dev/api-reference/sdk/api/react-hooks - `useCommentEventCallback` hook
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/wireframes#disable-shadowdom - Shadow DOM and CSS customization

---

## 11. Configuration

**Impact: MEDIUM**

Advanced configuration methods for comment features — mentions/contacts, status/priority, reactions, attachments, text formatting, navigation/deep linking, DOM controls, sidebar management, UI behavior toggles, and moderation.

### 11.1 Comment Moderation — Approve, Read-Only, and Suggestion Workflows

**Impact: LOW (Moderation workflows for comment review and approval)**

Moderator mode hides new comments from everyone except admins and the author until an admin approves them. Suggestion annotations (`type: 'suggestion'`) are resolved with `acceptSuggestion()` / `rejectSuggestion()`. The older `acceptCommentAnnotation()` / `rejectCommentAnnotation()` pair is deprecated and no longer documented: it only wrote the workflow status and never flipped `annotation.type`, so an accepted suggestion kept rendering as a suggestion.

**Incorrect (deprecated accept/reject calls):**

```jsx
const commentElement = client.getCommentElement();
commentElement.acceptCommentAnnotation({ annotationId: 'ann-123' }); // deprecated, does not retire the suggestion card
commentElement.rejectCommentAnnotation({ annotationId: 'ann-123' }); // deprecated
```

**Correct (moderation, read-only, suggestion resolution):**

```jsx
const commentElement = client.getCommentElement();

// Moderator mode (default false). Mark admins with isAdmin: true on the User you authenticate.
commentElement.enableModeratorMode();

// Admin approves a pending comment so everyone with document access can see it
await commentElement.approveCommentAnnotation({ annotationId: 'ANNOTATION_ID' });

// Only admins and the comment author can resolve
commentElement.enableResolveStatusAccessAdminOnly();

// Read-only: removes composer, reactions, status, and other interactive features (default false)
commentElement.enableReadOnly();

// Suggestion mode: accept/reject controls on comments (default false)
commentElement.enableSuggestionMode();

// Resolve a type: 'suggestion' annotation from your own UI. Sets suggestion.status,
// flips annotation.type to 'comment', and emits suggestionAccepted / suggestionRejected.
await commentElement.acceptSuggestion({ annotationId: 'ANNOTATION_ID' });
await commentElement.rejectSuggestion({ annotationId: 'ANNOTATION_ID' });
```

```jsx
// React hooks
const { approveCommentAnnotation } = useApproveCommentAnnotation();
const { acceptSuggestion } = useAcceptSuggestion();
const { rejectSuggestion } = useRejectSuggestion();
```

```jsx
// Props
<VeltComments moderatorMode={true} resolveStatusAccessAdminOnly={true} readOnly={false} suggestionMode={true} />
```

```html
<velt-comments moderator-mode="true" resolve-status-access-admin-only="true" suggestion-mode="true"></velt-comments>
```

**Key details:**
- `approveCommentAnnotation` emits the `approveCommentAnnotation` event.
- For the full suggestion lifecycle (targets, `newValue`, `suggestionAccepted` handling), see the `velt-suggestions-best-practices` skill and the `suggestionAccepted` / `suggestionRejected` handling in `events-comment-lifecycle.md`.
- In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Verification:**
- [ ] Moderator mode only enabled where approval is required, and admins carry `isAdmin: true`
- [ ] No new code calls `acceptCommentAnnotation()` / `rejectCommentAnnotation()`
- [ ] Suggestions are resolved with `acceptSuggestion()` / `rejectSuggestion()` (or the built-in buttons)
- [ ] Read-only mode used for viewers who must not write

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#moderation - Moderation
- https://docs.velt.dev/async-collaboration/suggestions/overview#resolve-suggestions-programmatically - acceptSuggestion / rejectSuggestion
- https://docs.velt.dev/api-reference/sdk/api/api-methods#acceptsuggestion - acceptSuggestion()

---

### 11.2 Comment Navigation and Deep Linking

**Impact: MEDIUM (Navigate to comments programmatically and generate shareable links)**

Navigate to specific comments, track selection changes, and generate shareable deep links. `getLink()` and `copyLink()` resolve to response/event objects, not a bare URL string.

**Incorrect (treating getLink as a string):**

```jsx
const link = await commentElement.getLink({ annotationId: 'ann-123' });
navigator.clipboard.writeText(link); // link is a GetLinkResponse object
```

**Correct:**

```jsx
const commentElement = client.getCommentElement();

// Scroll to the comment's element (works when the element is on the DOM)
commentElement.scrollToCommentByAnnotationId('ANNOTATION_ID');

// Open a thread, e.g. after landing from a notification email
commentElement.selectCommentByAnnotationId('ANNOTATION_ID');
// Close the currently selected thread (no argument or an unknown id)
commentElement.selectCommentByAnnotationId();

// Deep links
const getLinkResponse = await commentElement.getLink({ annotationId: 'ANNOTATION_ID' });
const copyLinkEvent = await commentElement.copyLink({ annotationId: 'ANNOTATION_ID' });

// Scroll to a comment when its id is in the URL (default true)
commentElement.enableScrollToComment();
```

**Selection changes:**

```jsx
// Hook
const commentSelectionChange = useCommentSelectionChangeHandler();
useEffect(() => {
  console.log(commentSelectionChange?.annotation?.id);
}, [commentSelectionChange]);

// API Method
const subscription = commentElement.onCommentSelectionChange().subscribe((data) => {
  console.log('Selection changed', data);
});
subscription?.unsubscribe();
```

React hooks for links: `const { getLink } = useGetLink();` and `const { copyLink } = useCopyLink();`. Disable URL scroll with `<VeltComments scrollToComment={false} />`. In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Verification:**
- [ ] `selectCommentByAnnotationId()` called after the page finished rendering the target
- [ ] `getLink()` result read as a `GetLinkResponse`, not a string
- [ ] `onCommentSelectionChange()` subscription cleaned up on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#navigation - Navigation
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#deep-link - Deep Link
- https://docs.velt.dev/api-reference/sdk/models/data-models#getlinkresponse - GetLinkResponse

---

### 11.3 Component Props API — VeltComments, VeltCommentDialog, VeltCommentsSidebar, VeltInlineCommentsSection

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

**Verification Checklist:**
- [ ] Edit-mode placeholder variants (`editCommentPlaceholder`, `editReplyPlaceholder`) are set on `VeltComments` root so they propagate to all dialogs
- [ ] `assignToType` is only used on `VeltComments` (not on `VeltCommentDialog`)
- [ ] `openAnnotationInFocusMode` on `VeltCommentsSidebar` is paired with `focusedThreadMode` enabled
- [ ] `VeltInlineCommentsSection` `readOnly` prop is used instead of imperative disable calls where applicable

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior - VeltCommentsProps and VeltCommentDialogProps
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior - VeltCommentsSidebarProps
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentsprops - VeltCommentsProps type definition
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentdialogprops - VeltCommentDialogProps type definition
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltcommentssidebarprops - VeltCommentsSidebarProps type definition
- https://docs.velt.dev/api-reference/sdk/models/data-models#veltinlinecommentssectionprops - VeltInlineCommentsSectionProps type definition

---

### 11.4 Configure @Mentions, Contacts, and User Assignment

**Impact: MEDIUM (Control @mention behavior, contact lists, and comment assignment)**

Mentions and contact-list methods are split across two elements. Assignment, subscriptions, pagination, and custom autocomplete search live on the **comment element**. `@here`, user mentions, the contact list, and contact selection live on the **contact element** (`client.getContactElement()` or the `useContactUtils()` hook). Calling contact methods on the comment element fails.

**Incorrect (wrong element and wrong payload shapes):**

```jsx
const commentElement = client.getCommentElement();
commentElement.assignUser({ annotationId: 'ann-123', userId: 'user-2' }); // needs assignedTo: User
commentElement.setAssignToType('checkbox');                                // needs { type }
commentElement.enableAtHere();                                             // contact element API
commentElement.updateContactList(contacts);                                // contact element API
commentElement.customAutocompleteSearch(async (q) => search(q));           // not a callback API
```

**Correct (comment element: assignment, subscription, pagination):**

```jsx
const commentElement = client.getCommentElement();

// Assign a user: pass the full user object as assignedTo
await commentElement.assignUser({
  annotationId: 'ann-123',
  assignedTo: { userId: 'user-2', name: 'Jane', email: 'jane@example.com' },
});

// Assign-to UI mode
commentElement.setAssignToType({ type: 'checkbox' }); // or { type: 'dropdown' }

// Thread notification subscriptions
await commentElement.subscribeCommentAnnotation({ annotationId: 'ann-123' });
await commentElement.unsubscribeCommentAnnotation({ annotationId: 'ann-123' });

// Paginate large contact lists in the @mention dropdown (default false)
commentElement.enablePaginatedContactList();
```

**Correct (contact element: @here, mentions, contact list, selection):**

```jsx
const contactElement = client.getContactElement(); // or: const contactElement = useContactUtils();

contactElement.enableAtHere();                     // default disabled
contactElement.setAtHereLabel('@all');
contactElement.setAtHereDescription('Notify all users in this document');
contactElement.enableUserMentions();               // default true

// Replace (default) or merge the session contact list; does not change access control
contactElement.updateContactList(
  [{ userId: 'userId1', name: 'User Name', email: 'user1@velt.dev' }],
  { merge: false },
);
// Restrict sidebar People/Assigned/Tagged/Involved filters to this list + current user
contactElement.updateContactList(contacts, { filters: true });

// Teams shown in the "Selected Teams" visibility picker (full replace on every call)
contactElement.updateOrgList({ orgList: [{ id: 'org-A', name: 'Team A' }] });

contactElement.updateContactListScopeForOrganizationUsers(['all', 'organization', 'organizationUserGroup', 'document']);

contactElement.getContactList().subscribe((response) => console.log(response));

const subscription = contactElement.onContactSelected().subscribe((payload) => {
  // payload: { contact, isOrganizationContact, isDocumentContact, documentAccessType }
});
subscription?.unsubscribe();
```

React hooks: `useContactUtils()`, `useContactList()`, `useContactSelected()`, `useAssignUser()`, `useSubscribeCommentAnnotation()`, `useUnsubscribeCommentAnnotation()`.

**Correct (custom autocomplete search for large or remote contact lists):**

```jsx
// 1. Enable the feature
<VeltComments customAutocompleteSearch={true} />
// or: commentElement.enableCustomAutocompleteSearch();

// 2. Seed an initial list, then answer each search event
const contactElement = client.getContactElement();
contactElement.updateContactList(initialUsers);

const subscription = commentElement.on('autocompleteSearch').subscribe(async (inputData) => {
  if (inputData.type === 'contact') {
    const users = await yourApi.searchUsers(inputData.searchText);
    contactElement.updateContactList(users, { merge: false });
  }
});
subscription?.unsubscribe();
```

**Mention group and scroll props:**

```jsx
<VeltComments
  expandMentionGroups={true}
  showMentionGroupsFirst={true}
  autoCompleteScrollConfig={{ itemSize: 28, minBufferPx: 100, maxBufferPx: 200 }}
/>
```

**Key details:**
- `assignUser()` takes `assignedTo` (a `User`), not a bare `userId`.
- `setAssignToType()` takes an `AssignToConfig` object: `{ type: 'dropdown' | 'checkbox' }`.
- `updateContactList()` only affects the current session; it does not grant document access.
- In Other Frameworks, use `Velt.getCommentElement()` and `Velt.getContactElement()`.

**Verification:**
- [ ] `@here`, mentions, and contact-list calls use the contact element, not the comment element
- [ ] `assignUser()` passes `assignedTo: { userId, ... }`
- [ ] Custom search enabled via prop or `enableCustomAutocompleteSearch()` and answered from the `autocompleteSearch` event
- [ ] `onContactSelected()` and `autocompleteSearch` subscriptions are unsubscribed on unmount

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#mentions - @Mentions
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#customautocompletesearch - customAutocompleteSearch
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatecontactlist - updateContactList
- https://docs.velt.dev/api-reference/sdk/models/data-models#assigntoconfig - AssignToConfig

---

### 11.5 Configure Comment Attachments and File Uploads

**Impact: MEDIUM (Enable file attachments, screenshots, and manage uploaded files)**

Attachments are on by default. File-type restrictions use **extensions** through `setAllowedFileTypes()` (there is no `allowedFileTypes()` method), and programmatic uploads pass `File` objects in a `files` array. Building an attachment object with a `url` by hand does not upload anything.

**Incorrect (invented method and payloads):**

```jsx
commentElement.allowedFileTypes(['image/png', 'application/pdf']);   // no such method; MIME types
commentElement.addAttachment({ annotationId: 'ann-123', attachment: { url: '...' } });
commentElement.setComposerFileAttachments([file1, file2]);             // needs { files }
```

**Correct:**

```jsx
const commentElement = client.getCommentElement();

commentElement.enableAttachments();   // default true
commentElement.enableScreenshot();    // default false

// Restrict by file extension (default: png, jpg, gif, svg up to 15MB per file)
commentElement.setAllowedFileTypes(['jpg', 'png']);

// Upload File objects to an existing thread
const responses = await commentElement.addAttachment({
  annotationId: 'ANNOTATION_ID',
  files: [file1, file2],
});

// Delete / list attachments on a comment (commentId is a number)
await commentElement.deleteAttachment({ annotationId: 'ANNOTATION_ID', commentId: 1, attachmentId: 'ATTACHMENT_ID' });
const attachments = await commentElement.getAttachment({ annotationId: 'ANNOTATION_ID', commentId: 1 });

// Pre-fill a composer with files (new composer, existing thread, or element-bound composer)
commentElement.setComposerFileAttachments({ files: [file1, file2] });
commentElement.setComposerFileAttachments({ files: [file1], annotationId: 'annotation-123' });
commentElement.setComposerFileAttachments({ files: [file1], targetElementId: 'element-1' });
```

```jsx
// Props
<VeltComments attachments={true} screenshot={true} allowedFileTypes={['jpg', 'png']} attachmentNameInMessage={true} />
```

```html
<velt-comments allowed-file-types="['jpg', 'png']" attachment-name-in-message="true"></velt-comments>
```

React hooks: `useAddAttachment()`, `useDeleteAttachment()`, `useGetAttachment()` (each returns the matching method, for example `const { addAttachment } = useAddAttachment();`).

**Key details:**
- `getAttachment()` returns `Attachment[]` for the comment.
- Download control and click interception are covered in `attach/attach-download-control.md`.
- In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Verification:**
- [ ] `setAllowedFileTypes()` (or the `allowedFileTypes` prop) uses extensions, not MIME types
- [ ] `addAttachment()` and `setComposerFileAttachments()` pass `files: File[]`
- [ ] `deleteAttachment()` includes `annotationId`, `commentId`, and `attachmentId`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#attachments - Attachments
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#setcomposerfileattachments - setComposerFileAttachments
- https://docs.velt.dev/api-reference/sdk/models/data-models#uploadfiledata - UploadFileData

---

### 11.6 Configure Comment Status and Priority Levels

**Impact: MEDIUM (Enable and customize comment status tracking and priority levels)**

Enable status tracking (open, in progress, resolved) and priority levels (P0-P3) on comment annotations.

**Incorrect (status objects missing required fields, single status):**

```tsx
commentElement.setCustomStatus([
  { id: 'open', name: 'Open', type: 'default' }, // missing color / lightColor; need at least 2 statuses
]);
```

**Correct:**

**Status Configuration:**

```tsx
const commentElement = client.getCommentElement();

// Enable/disable status feature
commentElement.enableStatus();
commentElement.disableStatus();

// Enable quick resolve button on comment dialog
commentElement.enableResolveButton();

// Define custom status values
// Provide at least 2 statuses; each needs id, name, color, lightColor, and type
commentElement.setCustomStatus([
  { id: 'open', name: 'Open', type: 'default', color: '#625df5', lightColor: '#f2f2fe' },
  { id: 'in_progress', name: 'In Progress', type: 'ongoing', color: '#f59e0b', lightColor: '#fffbeb' },
  { id: 'resolved', name: 'Resolved', type: 'terminal', color: '#198f65', lightColor: '#edf6f3' },
]);

// Update annotation status programmatically (returns UpdateStatusEvent)
await commentElement.updateStatus({
  annotationId: 'ann-123',
  status: { id: 'resolved', name: 'Resolved', type: 'terminal', color: '#198f65', lightColor: '#edf6f3' },
});

// Resolve a thread (returns ResolveCommentAnnotationEvent)
await commentElement.resolveCommentAnnotation({ annotationId: 'ann-123' });
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
await commentElement.updatePriority({
  annotationId: 'ann-123',
  priority: { id: 'high', name: 'High', color: '#f59e0b', lightColor: '#fffbeb' },
});
```

**Or via component props:**

```tsx
// priority defaults to false; customPriority replaces the default P0 / P1 / P2 set
<VeltComments priority={true} customPriority={[{ id: 'low', name: 'Low', color: 'red', lightColor: 'pink' }]} />
```

React hooks: `const { updateStatus } = useUpdateStatus();`, `const { resolveCommentAnnotation } = useResolveCommentAnnotation();`, `const { updatePriority } = useUpdatePriority();`. In Other Frameworks, call the same methods on `Velt.getCommentElement()`.

**Status type values:**
- `'default'` — initial state (e.g., Open)
- `'ongoing'` — in-progress state (e.g., In Progress, Needs Attention)
- `'terminal'` — final state (e.g., Resolved, Approved, Rejected)

**Key details:**
- Custom statuses replace built-in defaults entirely; define at least 2
- Comments with a `terminal` status are no longer shown on the DOM (unless `showResolvedCommentsOnDom()` is on)
- Status and priority appear in the comment dialog header, sidebar filters, and activity logs
- When you change status through the V2 REST Update Comment Annotations API, also send `statusUpdatedByUserId` (and `resolvedByUserId` for terminal statuses) so authorship is recorded; see `rest-comment-annotations-api.md`

**Verification:**
- [ ] Status types correctly use 'default', 'ongoing', or 'terminal'
- [ ] At least two statuses defined, including one `terminal` status for resolve
- [ ] Every custom status / priority includes `color` and `lightColor`
- [ ] Custom status/priority called before user interaction

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#enablestatus - enableStatus
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#setcustomstatus - setCustomStatus
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#updatestatus - updateStatus

---

### 11.7 Configure Emoji Reactions on Comments

**Impact: MEDIUM (Enable and customize emoji reactions for comment feedback)**

Reactions are enabled by default. `setCustomReactions()` takes a **map keyed by reaction ID**, and the add / delete / toggle methods take a nested `reaction` object. Passing an array of emoji or a top-level `reactionId` does not work.

**Incorrect (array of reactions, flat reactionId):**

```jsx
commentElement.setCustomReactions([{ id: 'thumbsup', emoji: '👍' }]);
commentElement.toggleReaction({ annotationId: 'ann-123', commentId: 1, reactionId: 'thumbsup' });
```

**Correct (map of custom reactions, nested reaction object):**

```jsx
const commentElement = client.getCommentElement();

commentElement.enableReactions();   // default true
commentElement.disableReactions();

// Keys are reaction IDs; each value has either `emoji` or `url`
commentElement.setCustomReactions({
  fire: { emoji: '🔥' },
  party: { emoji: '🎉' },
  ship: { url: 'https://example.com/ship.svg' },
});

// Add / delete / toggle on a specific comment (commentId is a number)
await commentElement.addReaction({
  annotationId: 'ANNOTATION_ID',
  commentId: 384399,
  reaction: { reactionId: 'fire', customReaction: { emoji: '🔥' } },
});

await commentElement.deleteReaction({
  annotationId: 'ANNOTATION_ID',
  commentId: 384399,
  reaction: { reactionId: 'fire' },
});

await commentElement.toggleReaction({
  annotationId: 'ANNOTATION_ID',
  commentId: 384399,
  reaction: { reactionId: 'fire' },
});
```

**React hooks:**

```jsx
const { addReaction } = useAddReaction();
const { deleteReaction } = useDeleteReaction();
const { toggleReaction } = useToggleReaction();
await toggleReaction({ annotationId: 'ANNOTATION_ID', commentId: 384399, reaction: { reactionId: 'fire' } });
```

In Other Frameworks, call the same methods on `Velt.getCommentElement()`. The `addReaction`, `deleteReaction`, and `toggleReaction` events are available on `commentElement.on(...)`.

**Key details:**
- `setCustomReactions()` replaces the default reaction set.
- Each method resolves to its event object, or `null`.
- Reactions on private comments stay visible only to people who can read the parent comment, and they do not inherit the parent's Access Context.

**Verification:**
- [ ] `setCustomReactions()` receives an object map, not an array
- [ ] add / delete / toggle pass `reaction: { reactionId }`
- [ ] `commentId` is a number; `annotationId` is a string

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#reactions - Reactions
- https://docs.velt.dev/api-reference/sdk/models/data-models#togglereactionrequest - ToggleReactionRequest

---

### 11.8 Configure Rich Text Formatting in Comment Composer

**Impact: LOW (Control which text formatting options are available in the comment composer)**

The formatting toolbar is off by default. Turn it on with `formatOptions` / `enableFormatOptions()`, then choose which formats appear with `setFormatConfig()`. `FormatConfig` supports exactly four formats (`bold`, `italic`, `underline`, `strikethrough`), and each takes an `{ enable: boolean }` object, not a bare boolean.

**Incorrect (bare booleans and unsupported formats):**

```jsx
commentElement.setFormatConfig({
  bold: true,        // must be { enable: true }
  link: true,        // not a FormatConfig key
  codeBlock: true,   // not a FormatConfig key
  heading: false,    // not a FormatConfig key
});
```

**Correct:**

```jsx
const commentElement = client.getCommentElement(); // or useCommentUtils()

commentElement.enableFormatOptions();   // default false
commentElement.setFormatConfig({
  bold: { enable: true },
  italic: { enable: true },
  underline: { enable: false },
  strikethrough: { enable: false },
});
```

```jsx
<VeltComments formatOptions={true} />
```

```html
<velt-comments format-options="true"></velt-comments>
<script>
  const commentElement = Velt.getCommentElement();
  commentElement.setFormatConfig({ bold: { enable: true }, italic: { enable: true } });
</script>
```

**Verification:**
- [ ] Toolbar enabled via `formatOptions={true}` or `enableFormatOptions()`
- [ ] `setFormatConfig()` keys limited to `bold`, `italic`, `underline`, `strikethrough`
- [ ] Each key uses `{ enable: boolean }`

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#text-formatting - Text Formatting
- https://docs.velt.dev/api-reference/sdk/models/data-models#formatconfig - FormatConfig

---

### 11.9 Programmatic Sidebar Data, Filtering, and Configuration

**Impact: MEDIUM (Control sidebar content, filters, and behavior programmatically)**

Control the comments sidebar programmatically: supply custom data, apply filters, and react to sidebar events. Filter keys are field names from `CommentSidebarFilters` (`status`, `priority`, `people`, `location`, ...). Unknown keys such as `statusIds` are ignored.

**Incorrect (unknown filter keys, uppercase operator):**

```jsx
commentElement.setCommentSidebarFilters({ statusIds: ['open'] }); // ignored: not a filter key
<VeltCommentsSidebar systemFiltersOperator="AND" />                // values are 'and' | 'or'
```

**Correct (data, filters, operators):**

```jsx
const commentElement = client.getCommentElement();

// Custom-actions mode: you compute the list and hand it to the sidebar
commentElement.enableSidebarCustomActions();
commentElement.setCommentSidebarData(customFilterData, { grouping: true });

// URL navigation on comment click (default false)
commentElement.enableSidebarUrlNavigation();

// Partial update: included keys replace, omitted keys are preserved
commentElement.setCommentSidebarFilters({
  status: ['OPEN'],
  priority: ['P0'],
  people: [{ userId: 'user-1' }],
});
commentElement.setCommentSidebarFilters({ priority: [] }); // clear one field
commentElement.setCommentSidebarFilters({});              // clear all

commentElement.setSystemFiltersOperator('or');            // 'and' (default) | 'or'
commentElement.setSidebarButtonCountType('filter');       // 'default' | 'filter'
```

**Sidebar events (comment element event bus):**

```jsx
// Hook
const sidebarData = useCommentEventCallback('commentSidebarDataUpdate');
const commentClick = useCommentEventCallback('commentClick');

// API Method
const subscription = commentElement.on('commentNavigationButtonClick').subscribe((event) => {
  // event: { annotation, documentId, location, targetElementId, context }
  router.push(`/page/${event.location?.pageId}`);
});
subscription?.unsubscribe();
```

Other sidebar events: `commentSidebarDataInit`, `sidebarOpen`, `sidebarClose`, `fullscreenClick`. With client-provided data, quick-filter, category-filter, and data changes emit `commentSidebarDataUpdate` with the filtered list. V1 also accepts the `onCommentClick` / `onCommentNavigationButtonClick` component props; V2 uses the event bus.

**Sidebar Props (V1 + V2):**

| Prop | Type | Description |
|------|------|-------------|
| `filterConfig` | `object` | V1 system filter panel config (status, priority, people, location, ...) |
| `groupConfig` | `{ enable?, name?, groupBy? }` | Grouping configuration |
| `sortOrder` | `'asc' \| 'desc'` | Sort direction |
| `sortBy` | `string` | Default sort field |
| `systemFiltersOperator` | `'and' \| 'or'` | How different filter fields combine |
| `defaultMinimalFilter` | `string` | Default quick filter (`'all'`, `'read'`, `'unread'`, `'resolved'`, `'open'`, `'reset'`; V2 also `'assignedToMe'`) |
| `searchPlaceholder` | `string` | Search input placeholder |
| `commentPlaceholder` / `replyPlaceholder` / `pageModePlaceholder` | `string` | Composer placeholders |
| `editPlaceholder` / `editCommentPlaceholder` / `editReplyPlaceholder` | `string` | Edit-composer placeholders (specific variants win over `editPlaceholder`) |
| `sidebarButtonCountType` | `'default' \| 'filter'` | Sidebar button badge source |
| `commentCountType` | `'total' \| 'unread'` | V1 sidebar / sidebar-button count type |
| `floatingMode` | `boolean` | Floating overlay sidebar |
| `fullScreen` | `boolean` | Fullscreen toggle in the header |
| `expandOnSelection` | `boolean` | Auto-expand on comment selection (default `true`) |
| `filterPanelLayout` | `'bottomSheet' \| 'menu'` | Filter panel layout |
| `filterOptionLayout` | `'dropdown' \| 'checkbox'` | Option rendering inside a filter section |
| `filterCount` | `boolean` | Per-option counts (default `true`) |
| `dialogSelection` | `boolean` | `false` emits `commentClick` only, with no inline expansion |
| `currentLocationSuffix` | `boolean` | Adds "(This page)" to the current location's group |
| `excludeLocationIds` | `string[]` | Hide comments from these locations (API: `excludeLocationIdsFromSidebar()`) |
| `filterGhostCommentsInSidebar` | `boolean` | Hide ghost comments |

**Edit Composer Placeholders:**

Props set on the root `VeltComments` propagate to all dialogs. Priority: `editCommentPlaceholder` / `editReplyPlaceholder` > `editPlaceholder` > `commentPlaceholder` / `replyPlaceholder` > SDK defaults.

```jsx
<VeltComments
  editPlaceholder="Edit your message…"
  editCommentPlaceholder="Edit the original comment…"
  editReplyPlaceholder="Edit your reply…"
/>
```

```html
<velt-comments
  edit-placeholder="Edit your message…"
  edit-comment-placeholder="Edit the original comment…"
  edit-reply-placeholder="Edit your reply…"
></velt-comments>
```

**Verification:**
- [ ] Filter payloads use `CommentSidebarFilters` keys with object identities for people and locations
- [ ] Operator values are lowercase `'and'` / `'or'`
- [ ] Custom actions enabled before calling `setCommentSidebarData()`
- [ ] Event subscriptions cleaned up on unmount
- [ ] Props match the sidebar version (V1 `filterConfig` vs V2 `filters` / `minimalFilters`)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior - V1 customize behavior
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior#setcommentsidebarfilters - setCommentSidebarFilters
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#event-subscription - Comment event table
- https://docs.velt.dev/api-reference/sdk/api/api-methods#setcommentsidebardata - setCommentSidebarData()

---

### 11.10 Restrict Comment Placement to Specific DOM Elements

**Impact: LOW (Control where users can place comments on the page)**

Control which elements can receive comment pins. Once you provide allowed IDs, class names, or query selectors, commenting is disabled on every other element (Popover mode is not affected). Use `data-velt-comment-disabled` to block individual elements instead.

**Incorrect (boolean param on a toggle, URL cursor):**

```jsx
commentElement.commentToNearestAllowedElement(true);   // not a method; use the enable/disable pair
commentElement.setPinCursorImage('https://example.com/cursor.svg'); // expects a 32x32 base64 image
```

**Correct:**

```jsx
const commentElement = client.getCommentElement();

commentElement.allowedElementIds(['some-element']);
commentElement.allowedElementClassNames(['class-name-1', 'class-name-2']);
commentElement.allowedElementQuerySelectors(['#id1.class-name-1']);

// Snap pins to the closest allowed element when the user clicks a non-allowed one (default false)
commentElement.enableCommentToNearestAllowedElement();

// Custom cursor in comment mode: 32 x 32 pixel image as a base64 string
commentElement.setPinCursorImage(BASE64_IMAGE_STRING);
```

```jsx
<VeltComments
  allowedElementIds={['some-element']}
  allowedElementClassNames={['class-name-1', 'class-name-2']}
  allowedElementQuerySelectors={['#id1.class-name-1']}
  commentToNearestAllowedElement={true}
  pinCursorImage={BASE64_IMAGE_STRING}
/>
```

**Disable comments on specific elements:**

```html
<div data-velt-comment-disabled></div>
```

**sourceId for duplicate DOM IDs:**

When the same element ID appears more than once (for example, a data component rendered in several places), give each `VeltCommentTool` a session-unique `sourceId` so the dialog opens on the instance the user clicked.

```jsx
<VeltCommentTool sourceId="sourceId1" />
```

```html
<velt-comment-tool source-id="sourceId1"></velt-comment-tool>
```

**Verification:**
- [ ] Allowed lists cover every element that should accept comments
- [ ] `data-velt-comment-disabled` on elements that must never be commented on
- [ ] `setPinCursorImage()` receives a 32 x 32 base64 image
- [ ] `sourceId` is unique per instance when DOM IDs repeat

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#dom-controls - DOM Controls
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#commenttonearestallowedelement - commentToNearestAllowedElement
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#setpincursorimage - setPinCursorImage

---

### 11.11 UI/UX Toggle Methods — Comment Display, Interaction, and Behavior

**Impact: LOW (Fine-tune comment UI appearance and interaction behavior)**

Fine-tune comment UI appearance and user interaction patterns. Most toggles exist as a `<VeltComments>` prop, a kebab-case HTML attribute on `<velt-comments>`, and an `enable*` / `disable*` pair on `getCommentElement()`. Several older shorthand calls (`showCommentsOnDom(true)`, `svgAsImg(true)`, `composerMode('inline')`) do not exist; use the exact names below.

**Incorrect (invented signatures):**

```jsx
const commentElement = client.getCommentElement();
commentElement.showCommentsOnDom(true);          // no boolean param; use show/hide pair
commentElement.composerMode('inline');           // composerMode is a prop, not a method
commentElement.svgAsImg(true);                   // use enableSvgAsImg()
commentElement.excludeLocationIds([1, 2]);       // excludeLocationIds lives on the client
commentElement.enableMultithread();              // casing is enableMultiThread()
```

**Correct (Display & Layout):**

```jsx
const commentElement = client.getCommentElement();

// Collapse middle replies: first + last comment with an "N more replies" divider (default false)
commentElement.enableCollapsedComments();
commentElement.enableFullExpanded();             // Always render fully expanded (default false)

commentElement.enableFloatingCommentDialog();    // default true
commentElement.enableDialogOnHover();            // default true
commentElement.enableCommentPinHighlighter();    // default true

// Show / hide pins on the DOM
commentElement.showCommentsOnDom();              // default: shown
commentElement.hideCommentsOnDom();
commentElement.showResolvedCommentsOnDom();      // default: hidden
commentElement.hideResolvedCommentsOnDom();
commentElement.enableFilterCommentsOnDom();      // Mirror sidebar filters onto page pins

// Hide comments at specific locations (client-level API, not commentElement)
client.excludeLocationIds(['location1', 'location2']);
client.excludeLocationIds([]);                   // reset

// Re-position the open dialog after you move a manual pin (no params)
commentElement.updateCommentDialogPosition();
```

**Comment Numbering & Info:**

```jsx
commentElement.enableCommentIndex();             // default false
commentElement.enableDeviceInfo();               // default false
commentElement.enableDeviceIndicatorOnCommentPins();
commentElement.enableShortUserName();            // default true
commentElement.enableReplyAvatars();             // default false
commentElement.setMaxReplyAvatars(2);
commentElement.enableSeenByUsers();              // default true
commentElement.setUnreadIndicatorMode('verbose'); // 'minimal' (default) | 'verbose'
```

**Ghost Comments (comments whose target element is gone):**

```jsx
commentElement.enableGhostComments();            // default false
commentElement.enableGhostCommentsIndicator();   // default true
```

**Draft Mode, Draft Confirmation, and Lazy-Loading Resolved Comments:**

```jsx
// draftMode defaults to true: partial comments are saved with isDraft: true on close
commentElement.enableDraftMode();

// Opt-in (default false, requires draftMode): Keep Draft / Delete Draft popup with a
// quoted preview instead of saving the draft silently
commentElement.enableDraftConfirmation();
commentElement.disableDraftConfirmation();

// Opt-in (default false): skip fetching resolved (terminal-status) comments on initial load
commentElement.enableLazyLoadResolvedComments();
commentElement.disableLazyLoadResolvedComments();
```

```jsx
// Same flags as props
<VeltComments draftMode={true} draftConfirmation={true} lazyLoadResolvedComments={true} />
```

```html
<velt-comments draft-mode="true" draft-confirmation="true" lazy-load-resolved-comments="true"></velt-comments>
```

- `draftConfirmation` never fires for non-draft writes (edits, status, priority, assignment, deletes). Keep Draft, Escape, or a backdrop click saves the draft; Delete Draft discards it. The popup reuses the confirm dialog with a `velt-confirm-dialog--draft` modifier class and a `Preview` wireframe slot.
- With `lazyLoadResolvedComments`, selecting a terminal status, Status → All, Reset filters, or the `resolved` quick filter fetches resolved comments for that document. The unlock re-locks when you navigate to another document or organization. `showResolvedCommentsOnDom()` does not unlock the fetch, and terminal status options show no count (not `0`) while withheld.

**Keyboard & Input:**

```jsx
commentElement.enableHotkey();                   // 'c' toggles comment mode (default false)
commentElement.enableEnterKeyToSubmit();         // default: Enter = newline, Shift+Enter = submit
commentElement.enableDeleteOnBackspace();        // default enabled
commentElement.enablePersistentCommentMode();    // Stay in comment mode after placing a pin
commentElement.enableForceCloseAllOnEsc();       // ESC exits persistent comment mode too
```

**Mobile & Auth:**

```jsx
commentElement.enableMobileMode();
commentElement.enableSignInButton();             // default false
```

```jsx
// onSignIn is a component event, not a commentElement method
<VeltComments signInButton={true} onSignIn={() => yourSignInMethod()} />
```

**Minimap:**

```jsx
<VeltComments minimap={true} minimapPosition="left" />
commentElement.enableMinimap();
```

**Sidebar Button on Dialog:**

```jsx
commentElement.enableSidebarButtonOnCommentDialog(); // default true

const subscription = commentElement
  .onSidebarButtonOnCommentDialogClick()
  .subscribe((event) => openMySidebar(event));
subscription?.unsubscribe();
```

**Composer Mode and Delete Behavior (props):**

```jsx
// composerMode: 'default' (actions bar shows on focus) | 'expanded' (always visible)
// deleteThreadWithFirstComment: default true
<VeltComments composerMode="expanded" deleteThreadWithFirstComment={false} />

commentElement.enableDeleteReplyConfirmation();
```

**Confirm Dialog Variant CSS Classes:**

The confirm dialog host receives a BEM modifier based on its type: `velt-confirm-dialog--comment`, `velt-confirm-dialog--reply`, and `velt-confirm-dialog--draft` (draft confirmation popup). The base class `velt-confirm-dialog` is always present.

```css
.velt-confirm-dialog--comment { border-left: 4px solid red; }
.velt-confirm-dialog--reply { border-left: 4px solid orange; }
.velt-confirm-dialog--draft { border-left: 4px solid gray; }
```

**Comment Modes & Selection:**

```jsx
commentElement.focusPageModeComposer();
commentElement.enableAreaComment();              // default true
commentElement.enableMultiThread();              // default false; needs multithread wireframe if you customized the dialog
commentElement.enableChangeDetectionInCommentMode();
commentElement.enableSvgAsImg();                 // Treat SVGs as flat images
commentElement.enableCommentToNearestAllowedElement();
```

**PDF & Iframe Support:**

```jsx
// data-velt-pdf-viewer is an HTML attribute, not a method
<div data-velt-pdf-viewer="true">
  <PDFViewer />
</div>
```

**AI Auto-Categorization:**

```jsx
commentElement.enableAutoCategorize();           // default false
commentElement.setCustomCategory([
  { id: 'bug', name: 'Bug', color: 'red' },
  { id: 'feedback', name: 'Feedback', color: 'blue' },
]);
```

**Comment Bubble Grouping:**

```jsx
commentElement.enableGroupMatchedComments();     // Group bubbles matching the same context/targetElementId
```

**Custom Lists (Autocomplete Chips):**

```jsx
// Annotation-level dropdown (tags/categories on the thread)
commentElement.createCustomListDataOnAnnotation({
  type: 'multi', // 'multi' | 'single'
  placeholder: 'Select a category',
  data: [
    { id: 'violent', label: 'Violent' },
    { id: 'nsfw', label: 'NSFW' },
  ],
});

// Comment-level hotkey list: typing the hotkey in the composer opens a picker
commentElement.createCustomListDataOnComment({
  hotkey: '#', // single character only
  type: 'custom',
  data: [
    { id: '1', name: 'File 1', description: 'File Description 1' },
  ],
});
```

**Recording in Comments:**

```jsx
await commentElement.deleteRecording({ annotationId: 'ann-123', commentId: 1, recordingId: 'rec-1' });
const recordings = await commentElement.getRecording({ annotationId: 'ann-123', commentId: 1 });

// Comma-separated string: 'audio' (default) | 'video' | 'screen' | 'all' | 'none'
commentElement.setAllowedRecordings('audio,screen'); // omit 'video' to disable video recording

commentElement.enableRecordingTranscription();
```

**Edit Draft Preservation (v5.0.2-beta.18+):**

When a user dismisses the edit composer without submitting, the in-progress edits are kept in memory as a draft. The collapsed thread card shows a `(DRAFT)` badge, and clicking it re-opens the edit composer pre-filled. Drafts are session-only and are cleared on submit, Escape, or page refresh. There is no API surface for this behavior.

**Collapsed Replies Preview (v5.0.2-beta.37+):**

When enabled, a non-selected dialog shows the collapsed teaser (first comment, a "Show N replies…" divider, last comment) instead of only the first comment. Defaults to disabled.

```jsx
commentElement.enableCollapsedRepliesPreview();
commentElement.disableCollapsedRepliesPreview();
```

Also settable as `<VeltComments collapsedRepliesPreview={true} />` or `<velt-comments collapsed-replies-preview="true"></velt-comments>`. Boolean HTML attributes need an explicit `="true"` / `="false"`; a bare attribute is treated as disabled.

**Key details:**
- All toggle methods have corresponding `disable` variants.
- Call configuration methods after `getCommentElement()` is available (inside a `useEffect` with `client` as a dependency in React).
- In Other Frameworks, use `Velt.getCommentElement()` and `Velt.excludeLocationIds()`.

**Verification:**
- [ ] No invented signatures (`showCommentsOnDom(true)`, `svgAsImg(true)`, `composerMode(...)`, `enableMultithread()`)
- [ ] `excludeLocationIds()` called on `client` / `Velt`, not on the comment element
- [ ] `draftConfirmation` only enabled together with `draftMode`
- [ ] `lazyLoadResolvedComments` UI accounts for terminal statuses showing no count until unlocked
- [ ] `setAllowedRecordings()` receives a comma-separated string, not an array
- [ ] Hotkeys don't conflict with application shortcuts

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#uiux - UI/UX
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#draftconfirmation - draftConfirmation
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#lazyloadresolvedcomments - lazyLoadResolvedComments
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#excludelocationids - excludeLocationIds
- https://docs.velt.dev/ui-customization/features/async/comments/confirm-dialog - Confirm dialog wireframes and modifier classes

---

### 11.12 Use accessModes in Sidebar Filters for Privacy-Based Filtering

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

**Custom filter dropdown in wireframe:** If you build a custom privacy filter dropdown inside `<velt-comments-sidebar-wireframe>`, drive `accessModes` through the same `setCommentSidebarFilters()` API, or bind your state to a call that writes the selected values. `setCommentSidebarFilters()` is a partial update: included keys replace their selections, omitted keys are preserved, and **Reset** clears them.

**Full filter options reference:**

| Filter Key | Value Type | Description |
|-----------|-----------|-------------|
| `location` | `[{ id: string }]` | Filter by location |
| `document` | `[{ id: string }]` | Filter by document |
| `people` | `[{ userId: string }]` | Filter by comment author |
| `involved` | `[{ userId: string }]` | Author, mentioned, or assigned |
| `tagged` | `[{ userId: string }]` | Mentioned users |
| `assigned` | `[{ userId: string }]` | Assigned users |
| `priority` | `string[]` | e.g. `['P0', 'P1']` |
| `category` | `string[]` | e.g. `['bug', 'feedback']` |
| `status` | `string[]` | e.g. `['OPEN', 'IN_PROGRESS']` |
| `version` | `[{ id: string }]` | Filter by version |
| `accessModes` | `('public' \| 'private')[]` | Privacy filter |

For V2, `people` / `assigned` / `tagged` / `involved` match by `userId` (falling back to `email`) and `location` matches by `id` (falling back to `locationName`).

**Verification Checklist:**
- [ ] Privacy filtering uses `accessModes`, not a status or custom field
- [ ] Values are `'public'` and/or `'private'` (both legacy `iam.accessMode` and `visibilityConfig.type` of `restricted` / `organizationPrivate` count as private)
- [ ] User and location filter values are objects, not bare id strings

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior#setcommentsidebarfilters - setCommentSidebarFilters (V1)
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior#setcommentsidebarfilters - setCommentSidebarFilters (V2)
- https://docs.velt.dev/api-reference/sdk/models/data-models#commentsidebarfilters - CommentSidebarFilters

---

## 12. Events

**Impact: MEDIUM**

Comment lifecycle event subscriptions for custom workflows.

### 12.1 Comment Lifecycle Events — Pin Clicks, Add Events, Button Clicks

**Impact: MEDIUM (Subscribe to comment lifecycle events for custom workflows)**

Subscribe to comment lifecycle events for custom navigation, context injection, and workflow triggers.

> **For agent suggestion accept/reject:** Use `useCommentEventCallback('suggestionAccepted')` and `useCommentEventCallback('suggestionRejected')` — these are the correct events, not `commentSaved` with status checks.

**Agent suggestion accept/reject events (for AI agent findings):**

Agent findings (annotations with `sourceType: "agent"` and `type: "suggestion"`) render with Accept and Reject buttons. Use `suggestionAccepted` and `suggestionRejected` to handle the reviewer's decision. The SDK persists the status — applying the actual change is your code's responsibility.

```tsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

export function AgentSuggestionListener() {
  const accepted = useCommentEventCallback('suggestionAccepted');
  const rejected = useCommentEventCallback('suggestionRejected');

  useEffect(() => {
    if (!accepted) return;
    console.log('Suggestion accepted', accepted.commentAnnotation);
  }, [accepted]);

  useEffect(() => {
    if (!rejected) return;
    console.log('Suggestion rejected', rejected.rejectReason);
  }, [rejected]);

  return null;
}
```

**Events via on() method:**

```tsx
const commentElement = client.getCommentElement();

// Pin clicked: payload is { annotationId, commentAnnotation, metadata? }
const pinSub = commentElement.on('commentPinClicked').subscribe((event) => {
  console.log('Pin clicked:', event.annotationId, event.commentAnnotation.location);
});

// Autocomplete search (custom contact search; see config-mentions-contacts.md)
const searchSub = commentElement.on('autocompleteSearch').subscribe((event) => {
  console.log('Searching for:', event.searchText, event.type);
});

pinSub?.unsubscribe();
searchSub?.unsubscribe();
```

**Wireframe button clicks (`veltButtonClick`) are a client-level event, not a comment event:**

```tsx
// Hook
const veltButtonClick = useVeltEventCallback('veltButtonClick');

// API Method (client / Velt, not commentElement)
const subscription = client.on('veltButtonClick').subscribe((event) => {
  console.log(event.buttonContext?.groupId, event.buttonContext?.selections);
});
subscription?.unsubscribe();
```

**Incorrect (`onCommentAdd` is not an event name; `veltButtonClick` is not a comment event):**

```tsx
const onCommentAdd = useCommentEventCallback('onCommentAdd');   // never fires
commentElement.on('veltButtonClick').subscribe(handler);        // wrong element
```

**Correct (add context when a thread is created with `addCommentAnnotation` + `addContext()`):**

`addContext()` is available on the `addCommentAnnotation` and `addCommentAnnotationDraft` event payloads. `onCommentAdd` is not an event name for `on()` or `useCommentEventCallback`; it only exists as the legacy `<VeltComments onCommentAdd>` prop / `useCommentAddHandler()` hook.

```tsx
// Hook
const addEvent = useCommentEventCallback('addCommentAnnotation');
useEffect(() => {
  if (addEvent) {
    addEvent.addContext({ pageSection: 'header', projectId: 'proj-123' });
  }
}, [addEvent]);

// API Method
const subscription = commentElement.on('addCommentAnnotation').subscribe((event) => {
  event.addContext({ pageSection: 'header' });
});
subscription?.unsubscribe();
```

**Detect assignment changes (`isAssigneeChanged`, v6.0.15+):**

The `addComment`, `addCommentAnnotation`, and `updateComment` payloads carry `isAssigneeChanged`: `true` when the event assigned a new user or removed the assignee. Read the current assignee from `commentAnnotation.assignedTo`. Through `commentElement.updateComment()` it is always `false`; listen to `assignUser` for assignments made separately.

```tsx
// Hook
const addCommentEvent = useCommentEventCallback('addComment');
useEffect(() => {
  if (addCommentEvent?.isAssigneeChanged) {
    notifyAssignee(addCommentEvent.commentAnnotation.assignedTo);
  }
}, [addCommentEvent]);

// API Method
const subscription = commentElement.on('addComment').subscribe((event) => {
  if (event.isAssigneeChanged) {
    console.log(event.commentAnnotation.assignedTo);
  }
});
subscription?.unsubscribe();
```

**Sidebar events (v6):** `sidebarOpen`, `sidebarClose`, `commentClick` (payload: `annotation`, `documentId`, `location`, `targetElementId`, `context`), `commentNavigationButtonClick`, and `fullscreenClick` are on the comment element event bus. `sidebarClose` fires exactly once per close, whether from the close button, an outside click, or `closeCommentSidebar()` / `toggleCommentSidebar()`. Action chip clicks emit `commentActionClicked` (see `data-comment-actions.md`).

**React hooks for events:**

```tsx
import { useCommentEventCallback, useVeltEventCallback } from '@veltdev/react';

// Comment-specific events
const pinClicked = useCommentEventCallback('commentPinClicked');
const commentSaved = useCommentEventCallback('commentSaved');
const visibilityClicked = useCommentEventCallback('visibilityOptionClicked');
const sidebarOpen = useCommentEventCallback('sidebarOpen');

// Client-level UI events
const veltEvent = useVeltEventCallback('veltButtonClick');
```

**addCommentDraft event (abandoned reply/edit drafts):**

The `addCommentDraft` event fires when a user abandons a reply or edit composer without saving — for example, by clicking outside the dialog, closing the sidebar, or navigating away. It fires only on existing threads that already have at least one committed comment; brand-new pin drafts do not trigger it. The payload includes the unsaved text, HTML, attachments, recordings, and the parent annotation — use it to recover or log lost work.

Do not rely on this event for brand-new pin placements. Those do not trigger `addCommentDraft`.

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

**AddCommentDraftEvent payload:**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `annotationId` | `string` | Yes | ID of the annotation to which the abandoned draft belongs |
| `commentAnnotation` | `CommentAnnotation` | Yes | The full parent thread object |
| `comment` | `Comment` | Yes | Snapshot of unsaved composer content (reply mode: pending text/HTML/attachments/recordings; edit mode: original fields merged with unsaved edits, `commentId` preserved) |
| `metadata` | `VeltEventMetadata` | Yes | Event metadata |

**Comment Sidebar V2 fullscreen toggle (`fullscreenClick` event):**

The `fullscreenClick` event fires when a user clicks the fullscreen toggle in the Comment Sidebar V2 header (`fullScreen={true}` prop must be enabled to render the button). The payload is a `FullscreenClickEvent` whose `fullScreen` field is the **post-toggle** state — `true` means the sidebar just entered fullscreen. Use this event as the standard event-API pathway; the component-level `onFullscreenClick` output on `VeltCommentSidebarV2FullscreenButton` remains available for callers wiring the primitive directly. Both pathways coexist — pick one; do not wire both for the same handler.

**Correct (React — subscribe to fullscreen toggle):**

```jsx
import { useCommentEventCallback } from '@veltdev/react';
import { useEffect } from 'react';

function FullscreenHandler() {
  const fullscreenEvent = useCommentEventCallback('fullscreenClick');

  useEffect(() => {
    if (!fullscreenEvent) return;
    // fullscreenEvent.fullScreen — post-toggle state (true = now fullscreen)
    console.log('Sidebar fullscreen:', fullscreenEvent.fullScreen);
  }, [fullscreenEvent]);

  return null;
}
```

**Correct (Other frameworks — subscribe to fullscreen toggle):**

```typescript
const commentElement = client.getCommentElement();
const subscription = commentElement.on('fullscreenClick').subscribe((event) => {
  // event: FullscreenClickEvent
  // event.fullScreen — post-toggle state; event.metadata — VeltEventMetadata
  console.log('Sidebar fullscreen:', event.fullScreen);
});

// Clean up on teardown
subscription.unsubscribe();
```

**Key details:**
- `addContext()` lives on the `addCommentAnnotation` / `addCommentAnnotationDraft` payloads; use it to inject metadata before the annotation is saved
- `commentPinClicked` fires when a pin on the page is clicked
- `veltButtonClick` fires for custom buttons added via wireframes and is subscribed on the client (`client.on` / `Velt.on` / `useVeltEventCallback`)
- `isAssigneeChanged` on `addComment` / `addCommentAnnotation` / `updateComment` tells you an assignment changed
- `addCommentDraft` fires only when the thread already has at least one committed comment — enum value `ADD_COMMENT_DRAFT`
- `suggestionAccepted` / `suggestionRejected` fire when a reviewer clicks Accept or Reject on an agent suggestion — the payload includes `commentAnnotation` (the full finding); rejected also includes `rejectReason`
- `fullscreenClick` fires when the Comment Sidebar V2 fullscreen toggle is clicked; `event.fullScreen` is the state **after** the toggle. Alternative pathway to the primitive-level `onFullscreenClick` output on `VeltCommentSidebarV2FullscreenButton` — both surfaces coexist, choose one per handler
- All subscriptions must be cleaned up on unmount
- `useCommentEventCallback` returns the event object directly (no subscription needed)

**Verification:**
- [ ] Event subscriptions cleaned up on component unmount
- [ ] `addContext()` called synchronously in the `addCommentAnnotation` handler
- [ ] `veltButtonClick` subscribed on the client, not on the comment element
- [ ] Event names match exactly (case-sensitive)
- [ ] addCommentDraft handler checks that the thread has existing comments before acting (brand-new pins do not fire this event)
- [ ] `fullscreenClick` handler treats `event.fullScreen` as the post-toggle state (not the previous state); handler is not double-wired to both the event API and the component-level `onFullscreenClick` output

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#event-subscription - Comment event table
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#addcontext - addContext
- https://docs.velt.dev/api-reference/sdk/models/data-models#addcommentevent - AddCommentEvent (`isAssigneeChanged`)
- https://docs.velt.dev/api-reference/sdk/models/data-models#addcommentdraftevent - AddCommentDraftEvent
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior#fullscreenclick - fullscreenClick
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior#custom-filtering-sorting-and-grouping - veltButtonClick

---

## 13. Wireframe Variables

**Impact: MEDIUM**

Template-variable binding patterns for the Comment Bubble, Comment Dialog, Comment Tool, Text Comment, Inline Comments Section, Multithread Comments, Comment Sidebar, and Comment Sidebar Button wireframes. Documents the `velt-data` / `velt-if` / `velt-class` directive system layered on top of the structural wireframe catalog in `ui/ui-wireframes.md` — variable namespaces (App / Data / UI / Feature State), loop-scope iteration variables, `defaultCondition` overrides, Angular signal inputs, and common `shouldShow` gates.

### 13.1 Bind Autocomplete Wireframe Slots Using Template Variables

**Impact: MEDIUM (Drives the @-mention picker — option rows, group rows, chips, empty state — inside Autocomplete wireframes without re-implementing search / filtering on top of the composer)**

The Autocomplete primitive is the @-mention picker rendered inside `<velt-autocomplete-panel>` / `<velt-autocomplete-tool>`, mounted by composers — most prominently the Comment Dialog Composer. Variables are available inside any `<velt-autocomplete-...-wireframe>` tag via the standard `<velt-data field="...">` / `velt-if="{...}"` / `velt-class="'cls': {...}"` directives.

Unlike the Comment Bubble / Comment Dialog families, Autocomplete uses the **flat-config** access pattern — panel-level state is referenced with the explicit `componentConfig.<path>` form. Only the per-row iteration variables (`option`, `chip`) resolve as bare names.

For the structural catalog of which wireframe tags exist and how they nest, see `ui/ui-wireframes.md`. This rule documents the *variable-binding* layer on top.

Do not filter or group the mention list yourself (for example from `useContactList()` data). The panel already produces `componentConfig.flattenedItems` with the correct ordering and grouping applied. Reimplementing flattening breaks the virtual-scroll contract and produces stale results.

**Correct (let the wireframe iterate, read `option` / `chip` per row, gate empty-state with `componentConfig.flattenedItems.length`):**

```jsx
import {
  VeltWireframe,
  VeltAutocompleteOptionWireframe,
  VeltAutocompleteGroupOptionWireframe,
  VeltAutocompleteEmptyWireframe,
} from '@veltdev/react';

// There is no panel-level wireframe: register the slot wireframes directly under VeltWireframe
<VeltWireframe>
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
</VeltWireframe>
```

#### Component Config (panel-level state)

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

#### Context-Specific Variables (loop scope)

These resolve as **bare names** — only inside the iteration tag that owns them.

| Variable | Type | Available in | Notes |
|---|---|---|---|
| `option` | `SelectorDataListItem` | `<velt-autocomplete-option-wireframe>`, `<velt-autocomplete-group-option-wireframe>`, and their child tags | Current row. |
| `option.user` | `User` | Same as above | Set when the option represents a user. |
| `option.group` | `GroupData` | Same as above | Set when the option represents a group. Use `velt-class="'is-group': {option.group}"` to branch. |
| `chip` | `AutocompleteChipConfig` | `<velt-autocomplete-chip-wireframe>` and its tooltip child tags | Inline chip in the composer. |

#### Wireframe tags

| Wireframe tag | React component | Notes |
|---|---|---|
| (none) | — | The panel itself (`<velt-autocomplete-panel>`) is a live custom element, not a `-wireframe` slot. Register the slot wireframes below directly inside `VeltWireframe` / `<velt-wireframe style="display:none;">`. |
| `<velt-autocomplete-empty-wireframe>` | `<VeltAutocompleteEmptyWireframe>` | Empty-state. `shouldShow` requires `componentConfig.flattenedItems.length === 0`. |
| `<velt-autocomplete-option-wireframe>` | `<VeltAutocompleteOptionWireframe>` | Option row. Composes `*-option-name` / `*-option-description` / `*-option-icon` / `*-option-error-icon`. |
| `<velt-autocomplete-group-option-wireframe>` | `<VeltAutocompleteGroupOptionWireframe>` | Group-of-users row — only when `customGroupsEnabled` is true or mention groups are present. |
| `<velt-autocomplete-chip-wireframe>` | — | Inline chip in the contenteditable composer. Composes `*-chip-tooltip` / `*-chip-tooltip-name` / `*-chip-tooltip-description` / `*-chip-tooltip-icon`. The generated Wireframe components appendix lists only the `-chip-tooltip*` tags, so confirm the chip root tag renders before relying on it. |
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

#### Common mistakes — DO NOT

**1. DO NOT bare-name panel-level state.** This family uses flat-config access. `<velt-data field="flattenedItems.length" />` resolves to nothing — use `<velt-data field="componentConfig.flattenedItems.length" />`. The bare-name exception is the loop-scope variables `option` and `chip`.

**2. DO NOT re-implement filtering / grouping over your own contact list.** The panel already produces `componentConfig.flattenedItems`. Read it; don't rebuild it.

**3. DO NOT nest `<velt-autocomplete-group-option-wireframe>` inside `<velt-autocomplete-option-wireframe>`.** They are sibling iteration roots — the panel decides which to render based on `option.group` / `customGroupsEnabled`.

**4. DO NOT bind `chip.*` outside a chip wireframe.** The `chip` iteration context only exists inside `<velt-autocomplete-chip-wireframe>` and its tooltip descendants.

**Verification:**
- [ ] Panel-level state is read via `componentConfig.<path>` (not bare names)
- [ ] `option` / `chip` are only referenced inside their owning iteration tag
- [ ] Empty-state is gated by the wireframe's `shouldShow` (or `componentConfig.flattenedItems.length === 0`) — not by ad-hoc rendering above the panel
- [ ] Group-option branch is gated by `componentConfig.customGroupsEnabled` (or the presence of `option.group`)
- [ ] `componentConfig.onOptionClick` is wired from custom option markup when overriding the click target

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/autocomplete-wireframe-variables — "Autocomplete Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-autocomplete-primitives.md` (standalone autocomplete primitives), `wireframe-variables/wireframe-variables-comment-dialog.md` (parent composer that mounts the panel)

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

#### Variable namespaces

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

#### Wireframe tags

The Comment Bubble proper has 4 slots; the related Comment Pin has 7 deeply-nested tags. Pin tags read from the *same* `annotation` context.

**Comment Bubble slots:**

| Wireframe tag | React component | Notes |
|---|---|---|
| `<velt-comment-bubble-wireframe>` | `<VeltCommentBubbleWireframe>` | Root. One per non-resolved annotation; resolved bubbles render only when `globalConfigSignal.featureState.resolvedCommentsOnDom === true`. |
| `<velt-comment-bubble-avatar-wireframe>` | `<VeltCommentBubbleWireframe.Avatar>` | Author avatar (`annotation.from.photoUrl` / `annotation.from.name`). |
| `<velt-comment-bubble-comments-count-wireframe>` | `<VeltCommentBubbleWireframe.CommentsCount>` | "N" badge. `shouldShow` requires `annotation.comments.length > 1`. |
| `<velt-comment-bubble-unread-icon-wireframe>` | `<VeltCommentBubbleWireframe.UnreadIcon>` | Unread indicator. `shouldShow` requires `unreadCount > 0` (or `annotation.unread`, depending on `commentCountType`). |

**Comment Pin slots** (separate primitive, same `annotation` binding):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-pin-wireframe>` | Root pin element. |
| `<velt-comment-pin-triangle-wireframe>` | Pointing-arrow triangle below the pin (visual only — no data binding). |
| `<velt-comment-pin-index-wireframe>` | Place-order index — bind `<velt-data field="annotation.annotationIndex" />`. |
| `<velt-comment-pin-number-wireframe>` | Auto-generated number — bind `<velt-data field="annotation.annotationNumber" />`. |
| `<velt-comment-pin-unread-comment-indicator-wireframe>` | Unread dot — gate with `velt-if="{annotation.unread}"`. |
| `<velt-comment-pin-private-comment-indicator-wireframe>` | Private-mode lock — gate with `velt-if="{annotation.iam.accessMode} === 'private'"`. |
| `<velt-comment-pin-ghost-comment-indicator-wireframe>` | Ghost-comment indicator — gate with `velt-if="{annotation.ghostComment}"`. |

#### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show a slot you would otherwise hide (e.g. render the comments-count badge even at length `1`). |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-comment-bubble-...-wireframe> in an Angular template
[componentConfigSignal]="config()"      // annotation, selectedAnnotationsMap,
                                         // unreadCount, openDialog
[parentLocalUIState]="localUI()"         // darkMode, variant, shadowDom,
                                         // readOnly, showAvatar, commentCountType
```

The root `<velt-comment-bubble>` element additionally accepts host attributes that map onto local UI state: `dark-mode`, `variant`, `show-avatar`, `comment-count-type`, `shadow-dom`.

#### `shouldShow` gates worth remembering

| Slot | `shouldShow` |
|---|---|
| `comment-bubble-wireframe` (root) | One per non-resolved annotation. Resolved annotations render only when `globalConfigSignal.featureState.resolvedCommentsOnDom === true`. |
| `comment-bubble-comments-count-wireframe` | `annotation.comments.length > 1` |
| `comment-bubble-unread-icon-wireframe` | `unreadCount > 0` (or `annotation.unread === true`, depending on `commentCountType`) |
| `comment-pin-unread-comment-indicator-wireframe` | `annotation.unread === true` |
| `comment-pin-private-comment-indicator-wireframe` | `annotation.iam.accessMode === 'private'` |
| `comment-pin-ghost-comment-indicator-wireframe` | `annotation.ghostComment != null` |

Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.

#### Naming conflicts — use the full path

Three names collide with mappings used by other features. Inside a Comment Bubble wireframe, prefer the explicit path:

| Conflicting name | Use this in Comment Bubble |
|---|---|
| `customStatusesShown` | `globalConfigSignal.featureState.customStatusesShown` |
| `resolvedCommentsOnDom` | `globalConfigSignal.featureState.resolvedCommentsOnDom` |
| `readOnly` | `globalConfigSignal.featureState.readOnly` (workspace) **or** `{readOnly}` (per-render local) |

#### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.`** Variables are mapped to short names. `<velt-data field="componentConfig.annotation.from.name" />` resolves to nothing — use `<velt-data field="annotation.from.name" />`. The exception is the *feature-state* names listed above, which **require** the `globalConfigSignal.featureState.<name>` path.

**2. DO NOT confuse `annotation.unread` with `uiState.commentPinSelected`.** `annotation.unread` is data-state (this annotation has unread comments for me). `uiState.commentPinSelected` is UI-state (this bubble's pin is the currently selected one). They drive different visuals.

**3. DO NOT compare `selectedAnnotationsMap` to a boolean directly.** It is a map. Bracket-lookup the current annotation: `{selectedAnnotationsMap[annotation.annotationId]}`.

**4. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal gate (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**5. DO NOT bind to `parentLocalUIState.shadowDom` from inside the wireframe to *enable* shadow-DOM.** Shadow-DOM is set via the host attribute `shadow-dom="true"` on `<velt-comment-bubble>`. The variable only reports the current state.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name (not `componentConfig.var`)
- [ ] Feature-state reads use the full `globalConfigSignal.featureState.<name>` path for the four conflicting names
- [ ] Selection state uses `{selectedAnnotationsMap[annotation.annotationId]}` (bracket-lookup), not a boolean alias
- [ ] Comment-pin tags are used only when implementing a custom pin — the bubble tags do not nest pin tags
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-bubble/wireframe-variables — "Comment Bubble Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural wireframe catalog), `ui/ui-comment-bubble.md` (bubble customization patterns)

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
  const { client } = useVeltClient();
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

#### Variable namespaces

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

| Variable | Type | Notes |
|---|---|---|
| `showReplies` | `boolean` | Reply list is currently shown. |
| `collapsedComments` | `boolean` | Comments are collapsed. |
| `showAllComments` | `boolean` | "Show all" mode is active. |
| `showReplyComposer` | `boolean` | Reply composer is visible. |
| `maxReplyAvatars` | `number` | Max reply avatars to show before "+N". |
| `showSuggestionModeActions` | `boolean` | Suggestion-mode accept/reject visible. |
| `reactionToolOpenIndex` | `number` | Comment index whose reaction picker is open (`-1` if none). |
| `openDropdownIndexValue` | `number` | Comment index whose options dropdown is open (`-1` if none). |
| `hasReactionsByCommentId` | `Record<string, boolean>` | Map keyed by `commentId` — bracket-lookup. |
| `assignToMenuOpened` | `boolean` | Assign-to menu is open. |
| `isPrivateComment` | `boolean` | Annotation is in private mode. |
| `showGhostCommentMessage` | `boolean` | Ghost-comment banner should show. |
| `playVideoInFullScreen` | `boolean` | Recordings play full-screen. |
| `shouldScrollToBottom` | `boolean` | Internal transient signal — not typically used in wireframes. |
| `showScreenSizeInfo` | `boolean` | Screen-size information overlay visible. |
| `sidebarButtonOnCommentDialogVisible` | `boolean` | "View all comments" sidebar button visible. |

**Feature State** — workspace capability flags (all shared across dialog instances for the same annotation):

| Variable | Type | Notes |
|---|---|---|
| `canResolveAnnotation` / `canUnresolveAnnotation` | `boolean` | Current user is allowed to (un)resolve. |
| `dialogSelectedByKnownUser` | `boolean` | Selected dialog belongs to an identified user. |
| `enableResolve` | `boolean` | Resolve action enabled by config. |
| `resolveStatusAccessAdminOnly` | `boolean` | Only admins can change resolve status. |
| `enableSignInButton` / `enableUpgradeButton` | `boolean` | Sign-in / upgrade buttons rendered. |
| `enableGhostCommentsMessage` | `boolean` | Ghost-comment banner enabled. |
| `replyAvatars` | `boolean` | Reply-avatars strip enabled. |
| `collapsedRepliesPreview` | `boolean` | Surface the collapsed teaser (first comment + "Show N replies…" divider + last comment) even while the dialog is non-selected/preview. Mirrors the `collapsedRepliesPreview` prop / `collapsed-replies-preview` attribute. Default `false`. |
| `userMentions` | `boolean` | @-mention autocomplete enabled. |
| `recordingSummaryEnabled` | `boolean` | Recording AI-summary feature enabled. |
| `enableAttachment` | `boolean` | File attachments enabled. |
| `allowedFileTypes` | `string[]` | File-type allow-list. |
| `allowedRecordings` | `string[]` | Recording types enabled (`'audio'` / `'video'` / `'screen'`). |
| `screenSharingSupported` | `boolean` | Browser supports screen-sharing. |
| `enterKeyToSubmit` | `boolean` | Enter submits (vs. newline). |
| `deleteOnBackspace` | `boolean` | Backspace on empty composer deletes the comment. |
| `enableReactions` | `boolean` | Emoji reactions enabled. |
| `isInsidePdfViewer` | `boolean` | Dialog is inside a PDF viewer. |
| `enableStatus` / `enablePriority` | `boolean` | Status / Priority dropdowns enabled. |
| `customStatusesShown` | `boolean` | Custom-status decoration enabled. |
| `statusOptions` / `priorityOptions` | `CustomStatus[]` / `CustomPriority[]` | Available options. |
| `visibilityOptions` | `boolean` | Visibility dropdown enabled. |
| `enableAssignment` | `boolean` | Assign-to dropdown enabled. |
| `enableNotifications` | `boolean` | Notification toggle enabled. |
| `enableEdit` / `enableDelete` | `boolean` | Edit / delete actions enabled. |
| `enablePrivateMode` | `boolean` | Private-mode toggle enabled. |
| `deleteThreadWithFirstComment` | `boolean` | Deleting the first comment cascades to thread. |
| `seenByUsers` | `boolean` | "Seen by" feature enabled. |
| `commentAcceptedStatus` / `commentRejectedStatus` | `CustomStatus` | Suggestion-mode terminal-status objects. |
| `enableAutoCategorize` | `boolean` | Auto-categorize feature enabled. |
| `suggestionMode` / `moderatorMode` | `boolean` | Suggestion / moderator modes active. |
| `isPlanExpired` | `boolean` | Workspace plan is expired. |

#### Loop-scope (context-specific) variables

These resolve only inside their owning iteration slot — referencing them outside returns `undefined`.

| Variable | Type | Available in |
|---|---|---|
| `commentObj` / `comment` | `Comment` | `<velt-comment-dialog-thread-card-wireframe>` and descendants. Aliases. |
| `commentIndex` | `number` | Same as above. `0` on the parent comment. |
| `commentAnnotation` / `commentAnnotations` | `CommentAnnotation` / `CommentAnnotation[]` | Available everywhere (aliases of `annotation` / `annotations`). |
| `userContact` | `UserContact` | User-selector items (visibility-banner dropdown, assign-user). |
| `context` | `Record<string, any>` | Inline-comment-section context (cross-references `mode/mode-inline-comments.md`). |

**Aliases:** `commentObj` ↔ `comment`, `annotation` ↔ `commentAnnotation`, `annotations` ↔ `commentAnnotations`. Prefer the short form.

#### Root-Level Properties (Use Full Path)

These live at the root of `componentConfigSignal` and are **not** entries in the variable map — they require the full path:

| Variable | Type | Notes |
|---|---|---|
| `componentConfigSignal.unreadCommentsMap` | `Record<string, number> \| null` | Map keyed by `annotationId` → unread count. Combine with bracket notation: `{componentConfigSignal.unreadCommentsMap[annotation.annotationId]}`. |
| `componentConfigSignal.unreadIndicatorMode` | `'minimal' \| 'detailed'` | Unread-indicator display mode. |
| `componentConfigSignal.commentplaceholder` | `string` | Placeholder for the new-comment composer. |
| `componentConfigSignal.replyplaceholder` | `string` | Placeholder for the reply composer. |
| `componentConfigSignal.editplaceholder` | `string` | Placeholder for the generic edit composer. |
| `componentConfigSignal.editcommentplaceholder` | `string` | Placeholder for the edit-comment composer. |
| `componentConfigSignal.editreplyplaceholder` | `string` | Placeholder for the edit-reply composer. |
| `componentConfigSignal.placeholder` | `string` | Generic placeholder; takes priority over the others. |

One root-level helper **is** mapped: `unreadCommentAnnotationCount` (read as `{unreadCommentAnnotationCount}` — populated for the unread counter on dialog/sidebar entry-points).

#### Version 1 backward-compatibility aliases

Inherited from v4 SDK config signals. Mapped so v4 wireframes keep working:

| v1 Alias | Maps to | Notes |
|---|---|---|
| `allowAssignment` | `enableAssignment` | Was in `CommentDialogOptionsDropdownConfig`. |
| `allowToggleNotification` | `enableNotifications` | Per-comment notification toggle flag. |
| `allowEdit` | `enableEdit` | Per-comment edit-permission flag. |
| `allowChangeCommentAccessMode` | `enablePrivateMode` | Access-mode toggle flag. |
| `notificationEnabled` | `notificationEnabled` (passthrough) | Data context must provide it. |
| `mainCommentId` | `annotation.comments.0.commentId` | First comment's id. |

The resolver also unwraps two legacy signal-name prefixes — `commentDialogOptionsDropdownConfigSignal.*` and `commentDialogStatusDropdownConfigSignal.*` — so an old wireframe like `{commentDialogOptionsDropdownConfigSignal.allowAssignment}` keeps working. **Prefer the v5 names in new code.**

#### Wireframe tags by region

The dialog exposes roughly 110 slot tags. They are grouped here by region; the full structural tree is catalogued in `ui/ui-wireframes.md`. The React component path is `<VeltCommentDialogWireframe.X.Y>` matching the kebab-case tag.

**Root / structural** (4 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-wireframe>` | Root. `shouldShow` requires `annotation` to resolve. |
| `<velt-comment-dialog-header-wireframe>` | Top region — typically wraps `close-button`, `resolve-button`, dropdowns. |
| `<velt-comment-dialog-body-wireframe>` | Middle region — wraps `threads` and banners. |
| `<velt-comment-dialog-close-button-wireframe>` | Close button. |

**Threads region** (iteration root + 11 thread-card slots):

| Wireframe tag | Loop-scope | Notes |
|---|---|---|
| `<velt-comment-dialog-threads-wireframe>` | — | Iteration root over `annotation.comments`. |
| `<velt-comment-dialog-thread-card-wireframe>` | injects `comment`, `commentObj`, `commentIndex` | Per-comment card. All children below inherit the loop-scope. |
| `<velt-comment-dialog-thread-card-avatar-wireframe>` | inherits | Author avatar — bind `comment.from.photoUrl`. |
| `<velt-comment-dialog-thread-card-name-wireframe>` | inherits | Author name — bind `comment.from.name`. |
| `<velt-comment-dialog-thread-card-time-wireframe>` | inherits | Timestamp — bind `comment.createdAt`. |
| `<velt-comment-dialog-thread-card-message-wireframe>` | inherits | Comment text. Has `…-show-more-wireframe` / `…-show-less-wireframe` children for long messages. |
| `<velt-comment-dialog-thread-card-edited-wireframe>` | inherits | "(edited)" indicator. |
| `<velt-comment-dialog-thread-card-options-wireframe>` | inherits | Per-comment options menu trigger. |
| `<velt-comment-dialog-thread-card-reactions-wireframe>` | inherits | Emoji reactions strip. `shouldShow` requires `{enableReactions} && {hasReactionsByCommentId[comment.commentId]}`. |
| `<velt-comment-dialog-thread-card-recordings-wireframe>` | inherits | Per-comment recordings list. |
| `<velt-comment-dialog-thread-card-attachments-wireframe>` | inherits | Per-comment attachments list. |
| `<velt-comment-dialog-thread-card-seen-dropdown-wireframe>` | inherits | "Seen by" dropdown trigger. Children: `…-content-item-avatar/name/time-wireframe`. |

**Composer region** (10 top-level + attachment / format-toolbar subtrees):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-composer-wireframe>` | Composer root. Reads `composerContent` / `composerContentHTML`. |
| `<velt-comment-dialog-composer-input-wireframe>` | The contenteditable input. |
| `<velt-comment-dialog-composer-avatar-wireframe>` | Current-user avatar (`user.photoUrl`). |
| `<velt-comment-dialog-composer-action-button-wireframe>` | Submit / send button. `shouldShow` requires `{showCommentButtons}`. |
| `<velt-comment-dialog-composer-format-toolbar-wireframe>` | Rich-text format toolbar. |
| `<velt-comment-dialog-composer-assign-user-wireframe>` | Assign-user trigger. `shouldShow` requires `{enableAssignment}`. |
| `<velt-comment-dialog-composer-private-badge-wireframe>` | Private-mode badge. `shouldShow` requires `{isPrivateComment}`. |
| `<velt-comment-dialog-composer-recordings-wireframe>` | Recordings staged in composer — iterates `localRecordedData`. |
| `<velt-comment-dialog-composer-attachments-wireframe>` | Attachments root — wraps the subtree below. |
| `<velt-comment-dialog-composer-attachments-selected-wireframe>` | Selected-attachments iteration root. |

**Composer attachment subtree** (per-file slots — image vs. other vs. invalid):

| Wireframe tag | Notes |
|---|---|
| `…-attachments-image-wireframe` (+ `-preview`, `-loading`, `-download`, `-delete` children) | Image file slot. |
| `…-attachments-other-wireframe` (+ `-icon`, `-name`, `-size`, `-loading`, `-download`, `-delete` children) | Non-image file slot. |
| `…-attachments-invalid-wireframe` (+ `-item-preview`, `-item-message`, `-item-delete` children) | Validation-failed file slot. Gate the root with `velt-if="{invalidSelectedFiles.length} > 0"`. |

**Status / Priority / Custom-annotation dropdown subtrees** — each has a `…-dropdown-wireframe` trigger plus `…-content-item-icon/name(/label)/tick-wireframe` per-row children. Loop-scope inside the per-row slots is the option object (`statusOptions[i]`, `priorityOptions[i]`, `customChipData.items[i]`).

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-status-dropdown-wireframe>` (+ content children) | `shouldShow` requires `{enableStatus}`. |
| `<velt-comment-dialog-priority-dropdown-wireframe>` (+ content children) | `shouldShow` requires `{enablePriority}`. |
| `<velt-comment-dialog-custom-annotation-dropdown-wireframe>` (+ content / trigger-list-item children) | `shouldShow` requires `customChipData != null`. |
| `<velt-comment-dialog-options-dropdown-wireframe>` (+ 8 content variants — `delete-comment`, `delete-thread`, `make-private-enable/disable`, `mark-as-read-mark-read/mark-unread`, `notification-subscribe/unsubscribe`) | Per-comment options. Gate variants by current-state flags. |

**Action buttons** (8 tags — each is its own primitive, gated by feature/capability flags):

| Wireframe tag | `shouldShow` |
|---|---|
| `<velt-comment-dialog-resolve-button-wireframe>` | `{enableResolve} && {canResolveAnnotation} && (!{resolveStatusAccessAdminOnly} || {isUserAdmin})` |
| `<velt-comment-dialog-unresolve-button-wireframe>` | `{canUnresolveAnnotation}` |
| `<velt-comment-dialog-private-button-wireframe>` | `{enablePrivateMode}` |
| `<velt-comment-dialog-delete-button-wireframe>` | `{enableDelete}` |
| `<velt-comment-dialog-approve-wireframe>` | `{moderatorMode}` |
| `<velt-comment-dialog-sign-in-wireframe>` | `{enableSignInButton} && !{isKnownUser}` |
| `<velt-comment-dialog-upgrade-wireframe>` | `{enableUpgradeButton} && {isPlanExpired}` |

**Banners** (4 tags + visibility-banner dropdown subtree):

| Wireframe tag | `shouldShow` |
|---|---|
| `<velt-comment-dialog-assignee-banner-wireframe>` (+ `-user-avatar`, `-user-name`, `-resolve-button` children) | `assignTo != null` |
| `<velt-comment-dialog-private-banner-wireframe>` | `{isPrivateComment}` |
| `<velt-comment-dialog-ghost-banner-wireframe>` | `{enableGhostCommentsMessage} && {showGhostCommentMessage}` |
| `<velt-comment-dialog-visibility-banner-wireframe>` (+ `-icon`, `-text`, full dropdown subtree below) | `{visibilityOptions}` |

The **visibility-banner dropdown subtree** mirrors the status / priority dropdown shape — a trigger (with avatar-list-item / remaining-count / icon / label children) and a content list (with per-item icon / label children). Loop-scope is `userContact` (avatar list) or the visibility option (`{option.value}` / `{option.label}` / `{option.icon}`) inside the per-item slots.

**Metadata / per-comment indicator tags** (4 tags — each renders a small badge in the thread-card header):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-metadata-wireframe>` | Wraps the four below. |
| `<velt-comment-dialog-comment-category-wireframe>` | Auto-categorize chip. `shouldShow` requires `{enableAutoCategorize}`. |
| `<velt-comment-dialog-comment-index-wireframe>` | "1 of N" indicator. |
| `<velt-comment-dialog-comment-number-wireframe>` | Auto-generated comment number. |
| `<velt-comment-dialog-comment-suggestion-status-wireframe>` | Suggestion-mode terminal status. |

**Reply navigation** (5 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-reply-avatars-wireframe>` (+ `-list-item-wireframe` child) | Strip of reply-author avatars. `shouldShow` requires `{replyAvatars}`. |
| `<velt-comment-dialog-toggle-reply-wireframe>` (+ `-count`, `-icon`, `-text` children) | "View replies (N)" toggle. `shouldShow` = `!isDialogSelected` **and** `!collapsedRepliesPreview` **and** `annotation.comments.length > 0`, so it never renders next to an open composer or the "N more replies" divider (matches the default dialog since v6.0.11; no markup change needed). |
| `<velt-comment-dialog-hide-reply-wireframe>` | "Hide replies" toggle. |
| `<velt-comment-dialog-more-reply-wireframe>` (+ `-count-wireframe` / `-text-wireframe` children) | "Show N replies…" expander between the first comment and the rest — label composed as `Show` + `Count` + `Text`. `shouldShow` = (`isDialogSelected` **or** `collapsedRepliesPreview`) **and** `!showAllComments` **and** `annotation.comments.length > 2`. The `-count` child renders the hidden-reply count (`annotation.comments.length - 2`, clamped ≥ 0); the `-text` child renders the pluralized noun (`reply` / `replies`). Exposed in React as `VeltCommentDialogWireframe.MoreReply.Count` / `.Text`. |
| `<velt-comment-dialog-navigation-button-wireframe>` | Inter-thread navigation. |

**Auxiliary** (3 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-dialog-all-comment-wireframe>` | "View all comments" link. `shouldShow` requires `{sidebarButtonOnCommentDialogVisible}`. |
| `<velt-comment-dialog-copy-link-wireframe>` | Copy-link button. |
| Suggestion card slots | The suggestion card (Accept / Reject, header, banner) and the Progress / Actions rows are documented on the Comment Dialog wireframes page, not in the template-variables reference. See `ui-agent-suggestion-primitives.md`, `data-comment-progress.md`, and `data-comment-actions.md`. |

For the *exhaustive* per-slot prose (sample markup, props, classes), see the docs source linked at the bottom.

#### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `annotationId` | `annotation-id` | `string` | — | Standalone mode — pin this primitive to an annotation id. |
| `inlineCommentSectionMode` | `inline-comment-section-mode` | `boolean \| "true" \| "false"` | `false` | Switch to inline-section behavior. |
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, bypasses the slot's `shouldShow` so it always renders. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-comment-dialog-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // shared per-annotation config signal
[parentLocalUIState]="localUI()"     // per-instance UI state
```

The root `<velt-comment-dialog>` element additionally accepts host attributes that map onto local UI state — `dark-mode`, `variant`, `disabled`, `read-only`, `composer-position`, `dialog-shadow-dom`, etc.

#### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.` or `componentConfigSignal.`.** The dialog exposes ~250 mapped names. `<velt-data field="componentConfigSignal.annotation.from.name" />` resolves to nothing — use `<velt-data field="annotation.from.name" />`. The exception is the **eight unmapped root-level properties** (`componentConfigSignal.unreadCommentsMap`, the five `*placeholder` strings, `componentConfigSignal.unreadIndicatorMode`, `componentConfigSignal.placeholder`) which **must** use the full path.

**2. DO NOT reference loop-scope variables outside their slot.** `{comment}` / `{commentObj}` / `{commentIndex}` are defined only inside `<velt-comment-dialog-thread-card-wireframe>` and its descendants. Referencing them from the header or composer returns `undefined`.

**3. DO NOT gate the resolve button with only `{enableResolve}` or only `{canResolveAnnotation}`.** Both are required, plus the admin-only override: `velt-if="{enableResolve} && {canResolveAnnotation} && (!{resolveStatusAccessAdminOnly} || {isUserAdmin})"`.

**4. DO NOT compare `reactionToolOpenIndex` / `openDropdownIndexValue` directly to a boolean.** They are numeric indices (`-1` when closed). Compare to `{commentIndex}`: `velt-class="'reaction-open': '{reactionToolOpenIndex} === {commentIndex}'"`.

**5. DO NOT bracket-lookup `hasReactionsByCommentId` / `unreadCommentsMap` without the `commentId` / `annotationId` in scope.** Inside thread-card use `{hasReactionsByCommentId[comment.commentId]}`. Inside the dialog root use `{componentConfigSignal.unreadCommentsMap[annotation.annotationId]}`.

**6. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**7. DO NOT remount the dialog wireframe to switch layout modes.** `sidebarMode` / `inboxMode` / `dialogMode` / `inlineCommentMode` / `focusedThreadMode` are exposed as variables — toggle a class with `velt-class`, do not unmount.

**8. DO NOT depend on legacy `commentDialogOptionsDropdownConfigSignal.*` / `commentDialogStatusDropdownConfigSignal.*` prefixes in new code.** They are kept working by the resolver but the v5 short names (`enableAssignment`, `enableEdit`, `statusOptions`, …) are canonical.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name — `{annotation}`, `{enableResolve}`, `{composerContent}` — never `componentConfigSignal.<mapped-name>`
- [ ] The eight unmapped root-level properties (`unreadCommentsMap`, the `*placeholder` set, `unreadIndicatorMode`) are read with the full `componentConfigSignal.<name>` path
- [ ] Loop-scope (`comment`, `commentObj`, `commentIndex`, `userContact`) is used only inside the owning iteration slot
- [ ] Resolve / delete / private / suggestion buttons combine the capability flag (`enable*`) **and** the per-user permission (`can*` / `is*Admin`) — not one or the other
- [ ] Index-based dropdown / reaction state uses `=== {commentIndex}` (not a boolean coercion)
- [ ] `hasReactionsByCommentId` / `unreadCommentsMap` are bracket-looked-up against `comment.commentId` / `annotation.annotationId`
- [ ] Layout-mode switching is done via `velt-class`, not by remounting the wireframe
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not
- [ ] v5 short names (`enableAssignment`, `enableEdit`, `enableNotifications`, `enablePrivateMode`) are preferred over the v1 aliases (`allowAssignment`, `allowEdit`, `allowToggleNotification`, `allowChangeCommentAccessMode`)

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/wireframe-variables — "Comment Dialog Wireframe Variables" (full per-slot reference)
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog of all dialog tags), `ui/ui-comment-dialog.md` (dialog customization), `mode/mode-inline-comments.md` (`{context.someProperty}` patterns in inline-section composers)

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

#### Variable namespaces (flat-config — full path required)

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

#### Wireframe tags

| Wireframe tag | React component | `shouldShow` |
|---|---|---|
| `<velt-sidebar-button-wireframe>` | `<VeltSidebarButtonWireframe>` | Root. |
| `<velt-sidebar-button-icon-wireframe>` | `<VeltSidebarButtonWireframe.Icon>` | Default chat icon. |
| `<velt-sidebar-button-comments-count-wireframe>` | `<VeltSidebarButtonWireframe.CommentsCount>` | Branches on `componentConfig.uiState.commentCountType` — `'total'` shows `annotations.length`, `'unread'` shows `unreadCount`. |
| `<velt-sidebar-button-unread-icon-wireframe>` | `<VeltSidebarButtonWireframe.UnreadIcon>` | `componentConfig.data.unreadCount > 0`. |

Override any gate with `defaultCondition={false}` (React) / `default-condition="false"` (HTML).

#### Common mistakes — DO NOT

**1. DO NOT drop the namespace prefix.** This wireframe is flat-config — `<velt-data field="unreadCount" />` resolves to nothing. Use the full path: `<velt-data field="componentConfig.data.unreadCount" />`.

**2. DO NOT confuse `globalConfig.featureState.sidebarVisible` with `componentConfig.uiState.floatingModeSidebarVisible`.** The first is the global linked-sidebar state; the second is the floating-overlay variant. They are independent — the floating mode can be open while the docked sidebar is closed.

**3. DO NOT compare `commentCountType` to a boolean.** It is a string enum (`'total'` / `'unread'`). Compare explicitly: `velt-if="{componentConfig.uiState.commentCountType} === 'total'"`.

**4. DO NOT bind to `parentLocalUIState.shadowDom` to *enable* shadow-DOM.** Shadow-DOM is set via the host attribute `shadow-dom="true"` on `<velt-sidebar-button>`. The variable only reports the current state.

**Verification:**
- [ ] All bindings use the full flat-config path (`globalConfig.featureState.*`, `componentConfig.data.*`, `componentConfig.uiState.*`, `parentLocalUIState.*`)
- [ ] Total-vs-unread badge switching compares `commentCountType` with `===`, not a boolean coercion
- [ ] Unread-icon slot is gated by `{componentConfig.data.unreadCount} > 0`
- [ ] Active-state styling reads `globalConfig.featureState.sidebarVisible` (docked) or `componentConfig.uiState.floatingModeSidebarVisible` (floating), not both at once

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar-button/wireframe-variables — "Comment Sidebar Button Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural wireframe catalog), `surface/surface-sidebar-button.md` (toggle button surface), `wireframe-variables-comment-sidebar.md` (the sidebar this button opens)

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
import { VeltWireframe, VeltCommentsSidebarWireframe, VeltIf, VeltData } from '@veltdev/react';

<VeltWireframe>
  <VeltCommentsSidebarWireframe>
    <VeltCommentsSidebarWireframe.Panel>
      <VeltCommentsSidebarWireframe.Header>
        <h2>Comments</h2>
        <VeltCommentsSidebarWireframe.FilterButton
          veltClass="'has-filters': {appliedFiltersCount} > 0">
          Filter
          <VeltIf condition="{appliedFiltersCount} > 0">
            <span><VeltData field="appliedFiltersCount" /></span>
          </VeltIf>
        </VeltCommentsSidebarWireframe.FilterButton>
        <VeltCommentsSidebarWireframe.CloseButton />
      </VeltCommentsSidebarWireframe.Header>

      <VeltCommentsSidebarWireframe.Skeleton />
      <VeltCommentsSidebarWireframe.List />

      <VeltCommentsSidebarWireframe.EmptyPlaceholder
        veltIf="{componentConfig.noCommentsFound} || {componentConfig.noCommentsFoundForAppliedFilters}">
        <p>No comments to show.</p>
        <VeltCommentsSidebarWireframe.ResetFilterButton veltIf="{appliedFiltersCount} > 0">
          Clear filters
        </VeltCommentsSidebarWireframe.ResetFilterButton>
      </VeltCommentsSidebarWireframe.EmptyPlaceholder>

      <VeltCommentsSidebarWireframe.FocusedThread>
        <VeltIf condition="{focusedAnnotation}">
          <div className="my-focused">
            <h3><VeltData field="focusedAnnotation.from.name" /></h3>
            <p><VeltData field="focusedAnnotation.comments.0.commentText" /></p>
          </div>
        </VeltIf>
      </VeltCommentsSidebarWireframe.FocusedThread>
    </VeltCommentsSidebarWireframe.Panel>
  </VeltCommentsSidebarWireframe>
</VeltWireframe>
```

**HTML / web-component equivalent:**

```html
<velt-wireframe style="display:none;">
  <velt-comments-sidebar-wireframe>
    <velt-comments-sidebar-panel-wireframe>
      <velt-comments-sidebar-header-wireframe>
        <velt-comments-sidebar-filter-button-wireframe
          velt-class="'has-filters': {appliedFiltersCount} > 0">
          Filter
        </velt-comments-sidebar-filter-button-wireframe>
      </velt-comments-sidebar-header-wireframe>
      <velt-comments-sidebar-list-wireframe></velt-comments-sidebar-list-wireframe>
      <velt-comments-sidebar-empty-placeholder-wireframe
        velt-if="{componentConfig.noCommentsFound} || {componentConfig.noCommentsFoundForAppliedFilters}">
      </velt-comments-sidebar-empty-placeholder-wireframe>
    </velt-comments-sidebar-panel-wireframe>
  </velt-comments-sidebar-wireframe>
</velt-wireframe>
```

#### Mapped variables (bare short names)

**Sidebar-specific:**

| Variable | Type | Notes |
|---|---|---|
| `focusedAnnotation` | `CommentAnnotation` | Currently-focused annotation in focused-thread view. Only resolves inside `<velt-comments-sidebar-focused-thread-wireframe>` and descendants. |
| `selectedMinimalFilterDropdownOption` | `{ filter: string; sort: string }` | Current option in the minimal filter / sort dropdown. |
| `appliedFiltersCount` | `number` | Number of filters currently applied — drives the badge on the filter button. |
| `filteredCommentAnnotationsCount` | `number` | Count of annotations after filtering. |
| `unreadCommentAnnotationCount` | `number` | Unread-annotation count on the current document (also exposed inside Comment Dialog). |

**Inherited from Comment Dialog** (resolve as short names everywhere):

- App state: `user`, `isUserAdmin`, `isKnownUser`.
- Per-instance UI: `darkMode`, `variant`.
- Comment data: `annotation`, `annotations`, `allAnnotations`, `commentAnnotation`, `commentAnnotations`.

Inside a sidebar wireframe that nests a comment-dialog wireframe (list-item dialogs, focused-thread dialog, page-mode composer), the **full Comment Dialog variable surface** becomes available — see `wireframe-variables-comment-dialog.md`.

#### Flat `componentConfig.*` properties (full path required)

The sidebar's underlying shape is flat — these properties sit directly on `componentConfig`, **not** under `appState` / `data` / `uiState` / `featureState`. Grouped by area:

**Layout / mode:**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.darkMode` | `boolean` | Per-sidebar dark-mode flag. |
| `componentConfig.variant` | `string` | Wireframe variant id (default `'sidebar'`). |
| `componentConfig.fullScreen` | `boolean` | Sidebar rendered full-screen. |
| `componentConfig.embedMode` | `string \| null` | Embedded layout id (e.g. `'figma'`). |
| `componentConfig.floatingMode` | `boolean` | Floating-overlay layout. |
| `componentConfig.pageMode` | `boolean` | Page-mode layout (includes top-level composer). |
| `componentConfig.readOnly` | `boolean` | Read-only mode. |
| `componentConfig.sidebarVisible` | `boolean` | Master visibility toggle (floating mode). |
| `componentConfig.sidebarReadMode` | `boolean` | Read-mode flag. |
| `componentConfig.fullExpanded` | `boolean` | Sidebar fully expanded. |
| `componentConfig.isFirstComponent` | `boolean` | This is the first sidebar instance — gates root `shouldShow`. |

**Loading / empty state:**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.skeletonLoading` | `boolean` | Skeleton loader active. Gate the skeleton; hide the list. |
| `componentConfig.noCommentsFound` | `boolean` | No annotations exist in scope. |
| `componentConfig.noCommentsFoundForAppliedFilters` | `boolean` | Filters reduced the list to zero. |

**Filter state:**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.moreFiltersVisible` | `boolean` | Expanded filter panel is open. |
| `componentConfig.filterConfig` | `CommentSidebarFilterConfig` | Filter-panel configuration (`layout`, ordering, …). `layout === 'minimal'` swaps to the compact dropdown. |
| `componentConfig.filters` | `Record<string, any[]>` | Currently-selected values per category. |
| `componentConfig.systemFiltersOperator` | `'AND' \| 'OR'` | How filter categories compose. |

**List data:**

| Variable | Type | Notes |
|---|---|---|
| `componentConfig.virtualScrollData` | `{ type: string; data: any }[]` | Virtual-scroll items (annotations + section dividers). |
| `componentConfig.commentAnnotationsCountByFilters` | `Record<string, Record<string, number>>` | Per-filter-category-and-id annotation count. |

**Callbacks** (wired into custom triggers, not bound with `velt-data`):

- `componentConfig.openMoreFilters` — open the filter panel.
- `componentConfig.toggleMoreFilters` — toggle the filter panel.

#### Loop-scope (context-specific) variables

These resolve only inside their owning iteration slot — referencing them outside returns `undefined`.

| Variable | Type | Available in |
|---|---|---|
| `focusedAnnotation` | `CommentAnnotation` | `<velt-comments-sidebar-focused-thread-wireframe>` and descendants. |
| `sidebarRef` | `HTMLElement` | Focused-thread context — DOM reference (internal positioning; rarely read in user wireframes). |
| `filter` | `{ name: string }` | Per-filter-category tags (`<velt-comments-sidebar-filter-name-wireframe>` and friends). |
| `item` | `{ name: string; count: number; selected: boolean }` | Per-option-row tags — filter-item children, status / location / document dropdown content-items. |
| `group` | `{ name: string; count: number; expanded: boolean }` | `<velt-comments-sidebar-list-item-group-wireframe>` and children. |
| `tag` | `{ name: string }` | Filter-search-tag children (`<velt-comments-sidebar-filter-search-tags-item-wireframe>` and friends). |

#### Wireframe tags by region

The full tag set runs to ~80 wireframe tags. The structural tree lives in `ui/ui-wireframes.md`; below is a navigable summary.

**Root / wrapper** (4 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-wireframe>` | Root. `shouldShow` = `componentConfig.isFirstComponent \|\| componentConfig.floatingMode \|\| componentConfig.embedMode`; floating mode additionally requires `componentConfig.sidebarVisible`. |
| `<velt-comments-sidebar-wrapper>` | Visible-content wrapper (a public element registered through its own template, not a `-wireframe` slot you fill). |
| `<velt-comments-sidebar-panel-wireframe>` | Panel container. |
| `<velt-comments-sidebar-page-mode-wireframe>` | Page-mode wrapper variant. Gate with `velt-if="{componentConfig.pageMode}"`. |

**Header** (5 tags — title row + action buttons):

| Wireframe tag | Notes |
|---|---|
| `<velt-comment-sidebar-header-wireframe>` (also `<velt-comments-sidebar-header-wireframe>`) | Header row. |
| `<velt-comments-sidebar-filter-button-wireframe>` | Opens the filter panel. Decorate with `{appliedFiltersCount} > 0`. |
| `<velt-comment-sidebar-close-button-wireframe>` / `<velt-comments-sidebar-close-button-wireframe>` | Close button. |
| `<velt-comment-sidebar-fullscreen-button-wireframe>` / `<velt-comments-sidebar-fullscreen-button-wireframe>` | Fullscreen toggle. |
| `<velt-comment-sidebar-search-wireframe>` / `<velt-comments-sidebar-search-wireframe>` | Search input row. |
| `<velt-comments-sidebar-toggle-button-wireframe>` | Open / close toggle. |

**List** (8 tags — `virtualScrollData` iteration + grouped-section variants):

| Wireframe tag | Loop-scope | Notes |
|---|---|---|
| `<velt-comment-sidebar-list-wireframe>` / `<velt-comments-sidebar-list-wireframe>` | — | Iterates `componentConfig.virtualScrollData`. Renders a nested comment-dialog (sidebar mode) per annotation row. |
| `<velt-comments-sidebar-list-item-wireframe>` | inherits `annotation` | Per-annotation row. |
| `<velt-comments-sidebar-list-item-dialog-container-wireframe>` | inherits `annotation` | Container for the inline comment-dialog inside a list item — all Comment Dialog variables resolve inside. |
| `<velt-comments-sidebar-list-item-group-wireframe>` | injects `group` | Section divider for grouped lists. |
| `<velt-comments-sidebar-list-item-group-name-wireframe>` | inherits `group` | Group name label. |
| `<velt-comments-sidebar-list-item-group-count-wireframe>` | inherits `group` | Count badge. |
| `<velt-comments-sidebar-list-item-group-arrow-wireframe>` | inherits `group` | Expand / collapse chevron — gate with `{group.expanded}`. |

**Empty / skeleton** (2 tags):

| Wireframe tag | `shouldShow` |
|---|---|
| `<velt-comments-sidebar-empty-placeholder-wireframe>` | `componentConfig.noCommentsFound \|\| componentConfig.noCommentsFoundForAppliedFilters` |
| `<velt-comment-sidebar-skeleton-wireframe>` / `<velt-comments-sidebar-skeleton-wireframe>` | `componentConfig.skeletonLoading === true` |

**Focused thread + page-mode composer** (3 tags — both nest a comment-dialog):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-focused-thread-wireframe>` | `shouldShow` = `!componentConfig.skeletonLoading && componentConfig.focusedAnnotation`. Injects `focusedAnnotation` for descendants. |
| `<velt-comments-sidebar-focused-thread-dialog-container-wireframe>` | Container for the focused-thread comment-dialog (full Comment Dialog scope resolves inside). |
| `<velt-comment-sidebar-page-mode-composer-wireframe>` | Page-level "Add comment" composer — delegates to the Comment Dialog composer subtree. |

**Filter panel** (16 tags — category sub-panels + done / reset / view-all + per-category roots):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-filter-wireframe>` | Expanded filter panel root. Gate with `{componentConfig.moreFiltersVisible}`. |
| `<velt-comments-sidebar-filter-title-wireframe>` / `…-close-button-…` / `…-done-button-…` / `…-reset-button-…` / `…-view-all-…` | Panel chrome + actions. The reset button is meaningful only when `{appliedFiltersCount} > 0`. |
| `<velt-comments-sidebar-filter-name-wireframe>` | Category label — bind `{filter.name}` (loop-scope). |
| `<velt-comments-sidebar-filter-status-wireframe>` / `…-priority-…` / `…-people-…` / `…-assigned-…` / `…-tagged-…` / `…-involved-…` / `…-document-…` / `…-location-…` / `…-versions-…` / `…-comment-type-…` / `…-category-…` / `…-custom-…` / `…-group-by-…` | Per-category sub-panel roots. Compose per-option rows below. |

**Filter-item + filter-search** (15 tags — per-option rows + checkbox variants + selected-tag pills):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-filter-item-wireframe>` (+ `-name`, `-count`, `-checkbox` children) | Per-option row. Loop-scope `item` — gate with `{item.selected}`. |
| `<velt-comments-sidebar-filter-item-checkbox-checked-wireframe>` / `…-unchecked-…` | Two-variant checkbox. Gate with `velt-if="{item.selected}"` / `velt-if="!{item.selected}"`. |
| `<velt-comments-sidebar-filter-search-wireframe>` (+ `-input`, `-dropdown-icon`, `-tags`, `-tags-item`, `-tags-item-name`, `-tags-item-close`, `-hidden-count` children) | Filter-search row + selected-tag pills. Loop-scope `tag` inside the tag-item subtree. |

**Standalone filter dropdowns** (status / location / document — 13 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-status-wireframe>` (+ `-dropdown-trigger`, `-dropdown-trigger-name`, `-dropdown-trigger-arrow`, `-dropdown-trigger-indicator`, `-dropdown-content`, `-dropdown-content-item`, `-…-item-name`, `-…-item-icon`, `-…-item-count`, `-…-item-checkbox`(+ checked / unchecked) children) | Standalone status filter, placeable outside the main panel. Per-row loop-scope `item`. |
| `<velt-comments-sidebar-document-filter-dropdown-trigger-wireframe>` (+ `-trigger-label`, `-content`, `-content-item` children) | Standalone document filter. |
| `<velt-comments-sidebar-location-filter-dropdown-wireframe>` (+ trigger / trigger-label / content / content-item children) | Standalone location filter. |

**Minimal filter / actions dropdowns** (15 tags — compact layout):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-minimal-filter-dropdown-trigger-wireframe>` (+ `-content` child) | Compact filter + sort UI. Used when `componentConfig.filterConfig.layout === 'minimal'`. |
| `<velt-comments-sidebar-minimal-filter-dropdown-content-filter-all-wireframe>` / `…-open` / `…-resolved` / `…-read` / `…-unread` / `…-assigned-to-me` / `…-reset-wireframe>` | Per-filter rows. Compare with `{selectedMinimalFilterDropdownOption.filter} === 'open'` etc. |
| `<velt-comments-sidebar-minimal-filter-dropdown-content-selected-icon-wireframe>` | Per-row selected tick. Gate with `{item.selected}`. |
| `<velt-comments-sidebar-minimal-filter-dropdown-content-sort-date-wireframe>` / `…-sort-unread-wireframe>` | Sort rows. Compare `{selectedMinimalFilterDropdownOption.sort}`. |
| `<velt-comments-sidebar-minimal-actions-dropdown-trigger-wireframe>` (+ `-content`, `-content-mark-all-read`, `-content-mark-all-resolved` children) | "⋯" actions dropdown. |

**Auxiliary** (3 tags):

| Wireframe tag | Notes |
|---|---|
| `<velt-comments-sidebar-reset-filter-button-wireframe>` | Reset-filters button (used in empty placeholder). Gate with `{appliedFiltersCount} > 0`. |
| `<velt-comment-sidebar-action-button-wireframe>` / `<velt-comment-sidebar-reset-filter-button-wireframe>` | Generic action / reset primitives used in placeholders. |

#### V2 wireframe slots — Search, FilterButton, FilterContainer, FullscreenButton, ListGroupHeader

The V2 sidebar wireframe family (`VeltCommentsSidebarV2Wireframe.*` / `<velt-comments-sidebar-*-v2-wireframe>`) introduces five new bindable slot subtrees on top of the V1 surface above. Each leaf wireframe exposes its own per-slot variables — **bind dynamic data on the leaf, not its container** (signals only update live when bound to the leaf signal).

**Header — Search / FilterButton / FullscreenButton:**

| Wireframe tag | Exposed variables / `shouldShow` | Notes |
|---|---|---|
| `<velt-comments-sidebar-search-v2-wireframe>` (+ `-icon-`, `-input-` leaves) | `placeholder`, `searchable` | Header search row. Bind `placeholder` on `-input-` to customize the search placeholder live. |
| `<velt-comments-sidebar-filter-button-v2-wireframe>` (+ `-applied-icon-` leaf) | `isFilterActive`, `appliedCount` | Opens the Main Filter container. Drive the badge with `appliedCount`; gate the `-applied-icon-` leaf with `velt-if="{isFilterActive}"`. |
| `<velt-comments-sidebar-fullscreen-button-v2-wireframe>` | — | Header fullscreen toggle; emits the `onFullscreenClick` event upstream. |

**FilterContainer (Main Filter bottom-sheet/menu subtree):**

The `FilterContainer` wireframe is the new bottom-sheet/menu surface — distinct from the existing `FilterDropdown` header dropdown. Available variables across these leaves: `value`, `label`, `count`, `mode`, `selected`, `group`, `groupingEnabled`, `groupByOptions`, `chips`, `searchable`, `placeholder`, `isFilterActive`, `appliedCount`.

| Wireframe tag | Exposed variables / `shouldShow` | Notes |
|---|---|---|
| `<velt-comments-sidebar-filter-container-v2-wireframe>` | `isFilterActive`, `appliedCount` | Root container — holds title, group-by, section list, reset/apply/close. |
| `<velt-comments-sidebar-filter-container-v2-title-wireframe>` | `label` | Panel title. |
| `<velt-comments-sidebar-filter-container-v2-group-by-wireframe>` | `groupByOptions`, `groupingEnabled` | Renders only when grouping is enabled. Bind `groupByOptions` for its option list. |
| `<velt-comments-sidebar-filter-container-v2-section-list-wireframe>` → `…-section-wireframe>` (loop) | inherits `section` (one per filter section) | Per-section iteration. |
| `<velt-comments-sidebar-filter-container-v2-section-label-wireframe>` | `label`, `count` | Section header label + count. |
| `<velt-comments-sidebar-filter-container-v2-section-field-wireframe>` | `searchable`, `mode` | Field container; `searchable` toggles the per-section search box. |
| `<velt-comments-sidebar-filter-container-v2-section-control-wireframe>` (+ `-chevron-`, `-value-`, `-chip-list-` → `-chip-`, `-search-` leaves) | `value`, `chips`, `searchable`, `placeholder` | Section control row — chips list and inline search. |
| `<velt-comments-sidebar-filter-container-v2-section-option-list-wireframe>` → `-section-option-wireframe>` (loop) | inherits `option` per row | Per-option iteration. |
| `<velt-comments-sidebar-filter-container-v2-section-option-checkbox-wireframe>` | `selected` | Per-option checkbox state. Gate with `velt-if="{selected}"` (or the unchecked sibling). |
| `<velt-comments-sidebar-filter-container-v2-section-option-name-wireframe>` | `label` | Option label. |
| `<velt-comments-sidebar-filter-container-v2-section-option-count-wireframe>` | `count` | Option facet count. Gate with `velt-if="{componentConfig.filterCount}"` if you want to honor the `filterCount` prop. |
| `<velt-comments-sidebar-filter-container-v2-reset-button-wireframe>` / `…-apply-button-…` / `…-close-button-…` | `appliedCount`, `isFilterActive` | Footer actions. The reset button is meaningful only when `{appliedCount} > 0`. |

**List groups — ListGroupHeader:**

| Wireframe tag | Exposed variables | Notes |
|---|---|---|
| `<velt-comments-sidebar-list-group-header-v2-wireframe>` | injects `group` (one per group when grouping is enabled) | Renders once per group inside `<velt-comments-sidebar-list-v2-wireframe>`. |
| `<velt-comments-sidebar-list-group-header-v2-label-wireframe>` | `group.label` | Group display label. |
| `<velt-comments-sidebar-list-group-header-v2-count-wireframe>` | `group.count` | Group annotation count. |
| `<velt-comments-sidebar-list-group-header-v2-chevron-wireframe>` | inherits `group.isExpanded` | Expand / collapse chevron — drive direction with `velt-class="'collapsed': !{group.isExpanded}"`. |
| `<velt-comments-sidebar-list-group-header-v2-separator-wireframe>` | — | Inter-group separator. |

**FilterDropdown subtree leaves (new this release):**

| Wireframe tag | Exposed variables |
|---|---|
| `<velt-comments-sidebar-filter-dropdown-content-list-item-count-v2-wireframe>` | per-item `count` (new — surfaces per-option facet count alongside the existing indicator + label leaves). |
| `<velt-comments-sidebar-filter-dropdown-content-list-category-label-v2-wireframe>` | category `label` (new — sibling to the existing `Category.Content` leaf). |

> **Breaking change (V2 — current release):** the `velt-comments-sidebar-minimal-actions-dropdown-v2-wireframe` family (Trigger / Content / MarkAllRead / MarkAllResolved) is removed. Mark-all-read and mark-all-resolved are now exposed by the combined `actions` filter-dropdown configured via the `minimalFilters` input on `VeltCommentsSidebarV2` — bind those rows inside the existing `FilterDropdown` subtree (`<velt-comments-sidebar-filter-dropdown-content-list-item-v2-wireframe>` + `…-item-count-v2-wireframe`).

#### `defaultCondition` and Common Props

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, bypasses the slot's `shouldShow` for previews. |
| `fullScreen` / `embedMode` / `floatingMode` / `pageMode` / `darkMode` / `readOnly` / `variant` | matching kebab attributes | — | — | Layout flags. Reflected onto `componentConfig.*` (read inside wireframes via the full path). |
| `dialogVariant` / `focusedThreadDialogVariant` / `pageModeComposerVariant` | matching kebab attributes | `string` | — | Variant ids forwarded to nested comment-dialogs. |
| `sortBy` / `sortOrder` / `sortData` / `systemFiltersOperator` / `currentLocationSuffix` / `selection` / `expandOnSelection` / `queryParamsComments` | matching kebab attributes | — | — | Behavioral props (operator default `'AND'`). |

**Signal inputs** (Angular parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-comments-sidebar-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // shared per-sidebar config signal
```

#### Common mistakes — DO NOT

**1. DO NOT drop the `componentConfig.` prefix on flat properties.** The sidebar is hybrid — mapped names (`focusedAnnotation`, `appliedFiltersCount`, `annotation`, `user`, `darkMode`, `variant`, `unreadCommentAnnotationCount`, …) resolve as bare short names; **everything else** lives flat on `componentConfig`. `<velt-data field="skeletonLoading" />` returns nothing — use `<velt-data field="componentConfig.skeletonLoading" />`. Similarly: `componentConfig.virtualScrollData`, `componentConfig.moreFiltersVisible`, `componentConfig.filterConfig.layout`, `componentConfig.noCommentsFound`, …

**2. DO NOT reference `focusedAnnotation` outside the focused-thread subtree.** It's loop-scope — only resolves inside `<velt-comments-sidebar-focused-thread-wireframe>` (and the focused-thread-dialog container). Referencing it from the list or filter panel returns `undefined`.

**3. DO NOT confuse `componentConfig.noCommentsFound` with `componentConfig.noCommentsFoundForAppliedFilters`.** The first is "no annotations exist on the document"; the second is "filters reduced the list to zero". Empty-state copy + the reset-filter button should branch on the second.

**4. DO NOT confuse the two prefixes.** Both `<velt-comments-sidebar-...>` (plural, sidebar-level) and `<velt-comment-sidebar-...>` (singular, header / search / list-level) appear in the catalog. The format guide is consistent inside each subtree — copy the tag name exactly from the docs source; don't infer.

**5. DO NOT bind `componentConfig.openMoreFilters` / `toggleMoreFilters` with `velt-data`.** They are callback functions — wire them into a custom click handler in your host code, not into the template-variable resolver.

**6. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**7. DO NOT compare `selectedMinimalFilterDropdownOption.filter` directly to a boolean.** It is a string (`'all'`, `'open'`, `'resolved'`, `'read'`, `'unread'`, `'assigned-to-me'`). Compare with `===` inside the per-row gate: `velt-class="'selected': '{selectedMinimalFilterDropdownOption.filter} === \'open\''"`.

**8. DO NOT remount the sidebar to switch between docked / floating / page-mode / embed layouts.** `componentConfig.floatingMode` / `componentConfig.pageMode` / `componentConfig.embedMode` / `componentConfig.fullScreen` are exposed as variables — toggle classes with `velt-class`, don't unmount.

**Verification:**
- [ ] Mapped names (`focusedAnnotation`, `appliedFiltersCount`, `filteredCommentAnnotationsCount`, `unreadCommentAnnotationCount`, `selectedMinimalFilterDropdownOption`, `annotation`, `annotations`, `user`, `darkMode`, `variant`) are referenced as bare short names
- [ ] Every other property uses the full `componentConfig.<name>` path (skeleton / empty / filter / virtual-scroll / mode state)
- [ ] Loop-scope (`focusedAnnotation` inside focused-thread, `filter` / `item` / `group` / `tag` inside their owning iteration, `group` inside `list-group-header-v2`) is used only inside the owning slot
- [ ] Empty-state copy + reset-filter button branch on `noCommentsFoundForAppliedFilters` (not `noCommentsFound`) when filters are applied
- [ ] Skeleton vs. list mutual exclusion uses `{componentConfig.skeletonLoading}` to gate the skeleton — the list does not need an explicit `velt-if` (the wireframe handles it)
- [ ] Nested comment-dialog wireframes (list-item, focused-thread, page-mode composer) use the full Comment Dialog variable surface — see `wireframe-variables-comment-dialog.md`
- [ ] Tag names are copied verbatim — both `velt-comments-sidebar-…` and `velt-comment-sidebar-…` prefixes are valid depending on the subtree
- [ ] Minimal-filter row gating compares `selectedMinimalFilterDropdownOption.filter` / `.sort` with `===`, not boolean coercion
- [ ] V2 FilterContainer leaves bind `value` / `label` / `count` / `selected` / `chips` / `placeholder` on the leaf wireframe (not its container) so signals update live
- [ ] V2 `FilterButton.AppliedIcon` is gated on `{isFilterActive}` and the badge text is driven by `{appliedCount}`
- [ ] V2 `ListGroupHeader.Chevron` is class-toggled on `{group.isExpanded}` (not unmounted) so collapse-state is reversible
- [ ] No references remain to the removed `velt-comments-sidebar-minimal-actions-dropdown-v2-wireframe` family — migrate to the `actions` filter-dropdown configured via `minimalFilters`

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-wireframe-variables — "Comment Sidebar Wireframe Variables" (full per-slot reference)
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-v2-wireframes — "V2 Sidebar Wireframes" (Search / FilterButton / FilterContainer / FullscreenButton / ListGroupHeader new-slot bindings)
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog), `surface/surface-sidebar.md` (sidebar surface), `surface/surface-sidebar-v2.md` (V2 primitives + declarative filter model), `wireframe-variables-comment-dialog.md` (variables that resolve inside nested dialog tags rendered by the list / focused-thread / page-mode composer), `wireframe-variables-comment-sidebar-button.md` (the button that opens this sidebar)

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
  const { client } = useVeltClient();
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Reimplements addCommentMode + commentToolEnabled tracking
    // that the wireframe already exposes as variables.
    const sub = client?.getCommentElement().onCommentModeChange().subscribe(setActive);
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

```html
<velt-comment-tool-wireframe>
  <button class="my-tool"
          velt-class="'is-active': {addCommentMode}, 'is-off': '!{commentToolEnabled}'">
    <svg class="my-tool__icon"></svg>
    <span velt-if="!{addCommentMode}">Add comment</span>
    <span velt-if="{addCommentMode}">Click anywhere to comment</span>
  </button>
</velt-comment-tool-wireframe>
```

#### Variable namespaces

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

#### Wireframe tag

The Comment Tool has a single wireframe primitive — the tool button itself.

| Public element | Wireframe tag | React component |
|---|---|---|
| `<velt-comments-tool>` | `<velt-comment-tool-wireframe>` *(singular)* | `<VeltCommentToolWireframe>` |

Children of `<VeltCommentToolWireframe>` are the host-app markup the customer supplies — there are no sub-component slots. The inner default button paints these classes automatically: `velt-comment-tool`, `velt-tool--action-btn`, `active` (when `addCommentMode`), `velt-tool--action-btn-disabled` (when `!commentToolEnabled`), `velt-tool--action-btn-icon`, `velt-comment-tool--custom-btn`.

#### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. The root tool always renders by default; the disabled state is rendered via a CSS class, not an unmount, so `defaultCondition` is rarely needed here. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On <velt-comment-tool-wireframe> in an Angular template
[componentConfigSignal]="config()"      // featureState, data, uiState
[parentLocalUIState]="localUI()"        // darkMode, variant, shadowDom
```

The root `<velt-comments-tool>` element additionally accepts host attributes that map onto local UI state: `dark-mode`, `variant`, `shadow-dom`.

#### `shouldShow` reference

| Slot | `shouldShow` |
|---|---|
| `comment-tool-wireframe` (root) | Always renders. The *inner default button* visually disables (does not unmount) when `commentToolEnabled === false`. |

If you want the tool to disappear entirely when disabled, gate it yourself: `velt-if="{commentToolEnabled}"`.

#### Common mistakes — DO NOT

**1. DO NOT confuse `commentToolEnabled` with `addCommentMode`.** `commentToolEnabled` is the workspace capability flag (can the tool be used at all). `addCommentMode` is the transient state (is the user about to drop a pin). Style with `addCommentMode`; gate visibility with `commentToolEnabled`.

**2. DO NOT subscribe to SDK state to drive the button.** The wireframe injects `addCommentMode` and `commentToolEnabled` automatically. Reading them via the host signal and re-rendering breaks the wireframe contract and double-paints state.

**3. DO NOT pass `componentConfig.uiState.shadowDom` through the wireframe.** `shadowDom` is a host-element attribute (`shadow-dom="true"` on `<velt-comments-tool>`), not a wireframe-bound knob.

**4. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal gate (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**Verification:**
- [ ] The wireframe root has no `velt-if` gate (the tool button should remain mounted so add-comment mode can be toggled)
- [ ] Active styling uses `{addCommentMode}` (not a host-React `useState`)
- [ ] Disabled styling uses `'!{commentToolEnabled}'` (string-quoted negation — required for the parser)
- [ ] `componentConfig.*` paths are used when explicitness is desired; flat aliases are used only for the three documented names (`commentToolEnabled`, `addCommentMode`, `disabled`)
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not
- [ ] `shadow-dom`, `dark-mode`, `variant` are set on the host element, not inside the wireframe

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/comment-tool-wireframe-variables — "Comment Tool Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog), `mode/mode-inline-comments.md` (`{context.someProperty}` patterns in inline-section composers)

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

#### Variable namespaces

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

**UI State — filter/sort, layout, identity wiring:**

| Variable | Type | Notes |
|---|---|---|
| `skeletonLoading` | `boolean` | Skeleton loader is active. Drives `skeleton-wireframe` `shouldShow`. |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string` | Per-instance variant tag from the host element. |
| `uiState.componentId` | `string` | Unique id of this section instance. Use the full path — `componentId` is conflicting. |
| `filterState` / `filterState.filters` / `filterState.filterDropdownOpen` | `InlineSectionFilterState` | Combined filter state — per-status rows + dropdown-open flag. |
| `sortState` / `sortState.sortBy` / `sortState.sortOrder` / `sortState.activeSortOption` / `sortState.sortingDropdownOpen` | `InlineSectionSortState` | Combined sort state. |
| `isResolvedCommentsOnDomFilterSelected` | `boolean` | "Show resolved" filter is currently selected. |
| `resolvedCommentsOnDom` | `boolean` | Resolved annotations are rendered. |
| `selectedAnnotationsMap` | `SelectedAnnotationsMap` | Map keyed by `annotationId` → selected flag. Use bracket lookup: `{selectedAnnotationsMap[annotation.annotationId]}`. |
| `selectedAnnotationsLocationMap` | `SelectedAnnotationsLocationMap` | Internal selection bookkeeping by location — bracket-lookup individual entries if needed. |
| `parentLocalUIState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled. |
| `dialogVariant` / `composerVariant` | `string` | Variants forwarded to nested comment-dialogs / composer. |
| `composerPosition` | `'top' \| 'bottom'` | Composer placement. |
| `multiThread` | `boolean` | Multi-thread layout is active. |
| `fullExpanded` | `boolean` | Section is fully expanded. |
| `commentPlaceholder` / `replyPlaceholder` / `composerPlaceholder` / `editPlaceholder` / `editCommentPlaceholder` / `editReplyPlaceholder` | `string` | Placeholder strings for each composer surface. |
| `targetElementId` | `string` | DOM target the section is anchored to. |
| `folderId` / `veltFolderId` / `clientDocumentId` / `documentId` / `locationId` | `string` | Folder / document / location wiring. |
| `context` | `Record<string, any>` | Free-form annotation context. Cross-reference `mode/mode-inline-comments.md` for `{context.someProperty}` patterns. |
| `contextOptions` | `ContextOptions` | Context-options config for new annotations. |
| `readOnly` | `boolean` | Per-instance read-only flag. **Prefer `featureState.readOnly`** (see conflicts). |
| `messageTruncation` | `boolean` | Per-instance truncation flag. **Prefer `featureState.messageTruncation`** (see conflicts). |
| `messageTruncationLines` | `number` | Per-instance truncation line count. **Prefer `featureState.messageTruncationLines`** (see conflicts). |

**Feature State** — workspace capability flags:

| Variable | Type | Notes |
|---|---|---|
| `featureState.readOnly` | `boolean` | Section is in read-only mode (workspace-wide). |
| `featureState.anonymousEmail` | `boolean` | Anonymous-email capture is enabled. |
| `featureState.messageTruncation` | `boolean` | Long messages are truncated. |
| `featureState.messageTruncationLines` | `number` | Line count for truncation. |

#### Loop-scope (context-specific) variables

These resolve only inside their owning iteration slot — referencing them outside returns `undefined`.

| Variable | Type | Available in |
|---|---|---|
| `filter` / `filter.id` / `filter.isSelected` / `filter.metadata` | `InlineSectionFilterItem<CustomStatus>` | Filter-dropdown list-item / checkbox / label tags. |
| `sortOption` | `InlineSortingCriteria` | Sorting-dropdown content-item / -icon / -tick tags. |
| `sortOptionText` | `string` | Sorting-dropdown content-item / -name tags. |
| `isActive` | `boolean` | Sorting-dropdown content-item (this is the active sort option). |
| `isAscending` | `boolean` | Sorting-dropdown content-item-icon (current sort is ascending). |

Inside the nested `List` and `ComposerContainer` slots, the standard Comment Dialog loop-scope (`comment`, `commentObj`, `commentIndex`, `commentAnnotation`) resolves — see `wireframe-variables-comment-dialog.md`.

#### Naming conflicts — use the full path

Four names collide with mappings used elsewhere. Inside an Inline Comments Section wireframe, prefer the explicit path:

| Conflicting name | Use this in Inline Comments Section |
|---|---|
| `readOnly` | `featureState.readOnly` (workspace) **or** `{readOnly}` (per-instance local) |
| `messageTruncation` | `featureState.messageTruncation` |
| `messageTruncationLines` | `featureState.messageTruncationLines` |
| `componentId` | `uiState.componentId` |

#### Wireframe tags

The section has a root primitive, a panel container, a skeleton, a count label, a list (iteration), a composer container, and two dropdowns (filter + sort). The full structural tree is catalogued in `ui/ui-wireframes.md`.

**Root + structural:**

| Wireframe tag | React component | Notes |
|---|---|---|
| `<velt-inline-comments-section-wireframe>` | `<VeltInlineCommentsSectionWireframe>` | Root. Always renders when present. |
| `<velt-inline-comments-section-panel-wireframe>` | `<VeltInlineCommentsSectionWireframe.Panel>` | Wrapper container — composes header + list + composer. |
| `<velt-inline-comments-section-skeleton-wireframe>` | `<VeltInlineCommentsSectionWireframe.Skeleton>` | Skeleton loader. `shouldShow` requires `skeletonLoading === true`. |
| `<velt-inline-comments-section-comment-count-wireframe>` | `<VeltInlineCommentsSectionWireframe.CommentCount>` | "N comments" label — bind `<velt-data field="annotations.length" />`. |
| `<velt-inline-comments-section-list-wireframe>` | `<VeltInlineCommentsSectionWireframe.List>` | Iterates `annotations`. Renders Comment Dialog primitives per entry — nested tags resolve dialog variables. |
| `<velt-inline-comments-section-composer-container-wireframe>` | `<VeltInlineCommentsSectionWireframe.ComposerContainer>` | Per-section composer. Nested composer slots resolve Comment Dialog composer variables. |

**Filter dropdown subtree** (per-status rows expose `filter`):

| Wireframe tag | Notes |
|---|---|
| `<velt-inline-comments-section-filter-dropdown-wireframe>` | Root. |
| `<velt-inline-comments-section-filter-dropdown-trigger-wireframe>` (+ `-name`, `-arrow` children) | Trigger pill — bind `{filterState.filters.length}` on `-name`. |
| `<velt-inline-comments-section-filter-dropdown-content-wireframe>` (+ `-list`, `-list-item`, `-list-item-checkbox`, `-list-item-label`, `-apply-button` children) | Open menu. Per-row tags expose `filter`. |

**Sorting dropdown subtree** (per-row tags expose `sortOption` / `sortOptionText` / `isActive` / `isAscending`):

| Wireframe tag | Notes |
|---|---|
| `<velt-inline-comments-section-sorting-dropdown-wireframe>` | Root. |
| `<velt-inline-comments-section-sorting-dropdown-trigger-wireframe>` (+ `-icon`, `-name` children) | Trigger pill. |
| `<velt-inline-comments-section-sorting-dropdown-content-wireframe>` (+ `-item`, `-item-icon`, `-item-name`, `-item-tick` children) | Open menu. Per-row tags carry loop-scope; `-item-tick` is gated by `isActive`. |

#### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show the skeleton outside its load window or a sort-tick when `isActive` is false. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-inline-comments-section-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // annotations, statuses, filterState, sortState, ...
[parentLocalUIState]="localUI()"     // darkMode, variant, shadowDom, dialogVariant, ...
```

The root `<velt-inline-comments-section>` element additionally accepts host attributes that map onto config and local UI state: `target-element-id`, `folder-id`, `document-id`, `location-id`, `context`, `dialog-variant`, `composer-variant`, `composer-position`, `comment-placeholder` / `reply-placeholder` / `composer-placeholder` / `edit-placeholder`, `multi-thread`, `full-expanded`, `read-only`, `message-truncation`, `message-truncation-lines`, `dark-mode`, `variant`, `shadow-dom`.

#### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.annotations.length" />` resolves to nothing — use `<velt-data field="annotations.length" />`. The exception is the four conflicting names above, which **require** their explicit path.

**2. DO NOT read `readOnly` / `messageTruncation` / `messageTruncationLines` at the short name when you mean the workspace-wide flag.** The short names are the per-instance local copies; the workspace flags live under `featureState.*`. They can disagree.

**3. DO NOT remount the section to switch between filter values.** `filterState.filters`, `sortState.sortBy`, and `sortState.sortOrder` are exposed as variables — toggle classes with `velt-class`, do not unmount.

**4. DO NOT iterate `annotations` yourself.** The `<velt-inline-comments-section-list-wireframe>` iterates and mounts the standard Comment Dialog primitives per annotation, injecting the per-annotation context that nested dialog tags read.

**5. DO NOT compare `selectedAnnotationsMap` to a boolean directly.** It is a map. Bracket-lookup the current annotation: `{selectedAnnotationsMap[annotation.annotationId]}` (inside an iteration where `annotation` is in scope).

**6. DO NOT reference `filter` / `sortOption` / `sortOptionText` / `isActive` / `isAscending` outside their owning dropdown row tag.** They are loop-scoped — referencing them from the header or the list returns `undefined`.

**7. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name — `{annotations}`, `{filterState}`, `{sortState}`, `{composerPosition}` — never `componentConfig.<mapped-name>`
- [ ] The four conflicting names use their explicit path: `featureState.readOnly`, `featureState.messageTruncation`, `featureState.messageTruncationLines`, `uiState.componentId`
- [ ] Loop-scope (`filter`, `sortOption`, `sortOptionText`, `isActive`, `isAscending`) is used only inside the owning filter/sort row tag
- [ ] `selectedAnnotationsMap` is bracket-looked-up against `annotation.annotationId`, not coerced to a boolean
- [ ] The list and composer rely on the standard Comment Dialog wireframe variables (see `wireframe-variables-comment-dialog.md`) — do not iterate `annotations` by hand
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/inline-comments-section/wireframe-variables — "Inline Comments Section Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog), `mode/mode-inline-comments.md` (Inline Comments mode setup + `{context.*}` patterns), `wireframe-variables-comment-dialog.md` (variables that resolve inside the nested list / composer dialog tags)

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

#### Variable namespaces

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

**UI State — layout + filter/sort + empty-state:**

| Variable | Type | Notes |
|---|---|---|
| `commentPinSelected` | `boolean` | Pin associated with the focused annotation is selected. |
| `commentPinType` | `string \| null` | Pin shape (`'pin'`, `'bubble'`, etc.). |
| `inboxMode` | `boolean` | Inbox-style layout is active. |
| `readOnly` | `boolean` | Dialog is in read-only mode. |
| `hideMultiThreadAnnotationComposer` | `boolean` | Anchor-annotation composer should be hidden. Drives `composer-container-wireframe` `shouldShow` via `!hideMultiThreadAnnotationComposer`. |
| `dialogVariant` | `string` | Variant forwarded to nested comment-dialogs. |
| `minimalFilter` | `'all' \| 'read' \| 'unread' \| 'resolved'` | Currently selected filter row. |
| `selectedMinimalFilterDropdownOption.sorting` | `SidebarSortingCriteria` | Currently selected sort row. |
| `selectedMinimalFilterDropdownOption.filter` | `'all' \| 'read' \| 'unread' \| 'resolved'` | Selected filter — mirrors `minimalFilter`. |
| `minimalFilterDropdownOpen` | `boolean` | Filter+sort dropdown menu is open. |
| `minimalActionsDropdownOpen` | `boolean` | Bulk-actions dropdown menu is open. |
| `noCommentsFoundForAppliedFilters` | `boolean` | Filters reduced the list to zero. |
| `noCommentsFound` | `boolean` | No annotations exist in scope (unfiltered). |
| `darkMode` | `boolean` | Dark mode is active. |
| `variant` | `string \| null` | Per-instance variant tag from the host element. |
| `uiState.shadowDom` | `boolean` | Shadow-DOM rendering is enabled (per-instance). Use the full path — `shadowDom` is conflicting. |
| `parentLocalUIState.darkMode` / `parentLocalUIState.variant` / `parentLocalUIState.shadowDom` | `boolean` / `string` / `boolean` | Per-render aliases for `darkMode` / `variant` / `shadowDom`. Set via host attributes. |

#### Loop-scope (context-specific) variables

These resolve only inside their owning iteration slot — referencing them outside returns `undefined`.

| Variable | Type | Available in |
|---|---|---|
| `isSelected` | `boolean` | All six `*-minimal-filter-dropdown-content-{filter,sort}-*` row tags. |

Inside the `List` and `ComposerContainer`, the standard Comment Dialog loop-scope (`comment`, `commentObj`, `commentIndex`, `commentAnnotation`) resolves — see `wireframe-variables-comment-dialog.md`.

#### Naming conflicts — use the full path

Two names collide with mappings used by Comment Dialog. Inside a Multithread Comments wireframe, prefer the explicit path:

| Conflicting name | Use this in Multithread Comments |
|---|---|
| `user` | `data.user` |
| `shadowDom` | `parentLocalUIState.shadowDom` (per-render) **or** `uiState.shadowDom` (per-instance) |

#### Wireframe tags

**Root + structural:**

| Wireframe tag | React component | Notes |
|---|---|---|
| `<velt-multi-thread-comment-dialog-wireframe>` | `<VeltMultiThreadCommentDialogWireframe>` | Outer wireframe — wraps the entire panel. |
| `<velt-multi-thread-comment-dialog-panel-wireframe>` | `<VeltMultiThreadCommentDialogPanelWireframe>` | Visible container. |
| `<velt-multi-thread-comment-dialog-list-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.List>` | Iterates `filteredAnnotations`. Renders Comment Dialog primitives per entry — nested tags resolve dialog variables. |
| `<velt-multi-thread-comment-dialog-comment-count-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.CommentCount>` | Count label — bind `<velt-data field="nonDraftCommentsCount" />`. |
| `<velt-multi-thread-comment-dialog-empty-placeholder-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.EmptyPlaceholder>` | Empty-state. `shouldShow` requires `noCommentsFound || noCommentsFoundForAppliedFilters`. |
| `<velt-multi-thread-comment-dialog-close-button-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.CloseButton>` | Close button. |
| `<velt-multi-thread-comment-dialog-new-thread-button-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.NewThreadButton>` | Add-thread button. |
| `<velt-multi-thread-comment-dialog-reset-filter-button-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.ResetFilterButton>` | Inside the empty placeholder. `shouldShow` requires `noCommentsFoundForAppliedFilters`. |
| `<velt-multi-thread-comment-dialog-composer-container-wireframe>` | `<VeltMultiThreadCommentDialogWireframe.ComposerContainer>` | New-thread composer. `shouldShow` requires `!hideMultiThreadAnnotationComposer`. Nested composer slots resolve Comment Dialog composer variables. |

**Minimal filter dropdown subtree** (per-row tags expose `isSelected`):

| Wireframe tag | Notes |
|---|---|
| `<velt-multi-thread-comment-dialog-minimal-filter-dropdown-wireframe>` | Root. |
| `<velt-multi-thread-comment-dialog-minimal-filter-dropdown-trigger-wireframe>` | Trigger pill. |
| `<velt-multi-thread-comment-dialog-minimal-filter-dropdown-content-wireframe>` | Open menu — gate with `{minimalFilterDropdownOpen}`. |
| `…-content-filter-all-wireframe` / `…-filter-read-wireframe` / `…-filter-unread-wireframe` / `…-filter-resolved-wireframe` | Per-filter rows. Each exposes `isSelected`. |
| `…-content-selected-icon-wireframe` | Per-row selected tick — gate with `velt-if="{isSelected}"`. |
| `…-content-sort-date-wireframe` / `…-sort-unread-wireframe` | Per-sort rows. Each exposes `isSelected`. |

**Minimal actions dropdown subtree** (bulk-actions):

| Wireframe tag | Notes |
|---|---|
| `<velt-multi-thread-comment-dialog-minimal-actions-dropdown-wireframe>` | Root. |
| `<velt-multi-thread-comment-dialog-minimal-actions-dropdown-trigger-wireframe>` | Trigger ("⋯"). |
| `<velt-multi-thread-comment-dialog-minimal-actions-dropdown-content-wireframe>` | Open menu — gate with `{minimalActionsDropdownOpen}`. |
| `…-content-mark-all-read-wireframe` / `…-mark-all-resolved-wireframe` | Action rows. |

#### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show the empty placeholder, the reset-filter button, or the composer container outside their normal gates. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-multi-thread-comment-dialog-...-wireframe> in an Angular template
[componentConfigSignal]="config()"   // annotations, filteredAnnotations, minimalFilter, ...
[parentLocalUIState]="localUI()"     // darkMode, variant, shadowDom
```

#### `shouldShow` gates worth remembering

| Slot | `shouldShow` |
|---|---|
| `empty-placeholder-wireframe` | `noCommentsFound \|\| noCommentsFoundForAppliedFilters` |
| `reset-filter-button-wireframe` | `noCommentsFoundForAppliedFilters` |
| `composer-container-wireframe` | `!hideMultiThreadAnnotationComposer` |

Override any of them with `defaultCondition={false}` (React) / `default-condition="false"` (HTML).

#### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.nonDraftCommentsCount" />` resolves to nothing — use `<velt-data field="nonDraftCommentsCount" />`. The exception is the two conflicting names above, which **require** their explicit path (`data.user`, `parentLocalUIState.shadowDom` / `uiState.shadowDom`).

**2. DO NOT read `user` directly inside a Multithread Comments wireframe.** `user` is a conflicting name — use `data.user` (and `data.user.name`, `data.user.photoUrl`).

**3. DO NOT compute the thread count from `annotations.length` or `filteredAnnotations.length`.** The display value is `nonDraftCommentsCount` — it excludes in-progress drafts and matches what the default UI shows.

**4. DO NOT show the empty placeholder with only `velt-if="{noCommentsFound}"`.** It must also cover the filtered case: `velt-if="{noCommentsFound} || {noCommentsFoundForAppliedFilters}"`. Otherwise the placeholder disappears as soon as the user applies a filter that yields zero results.

**5. DO NOT show the reset-filter button outside the filtered-empty case.** Its `shouldShow` is specifically `noCommentsFoundForAppliedFilters` — `noCommentsFound` (truly empty) should not offer "reset filter" since no filter is to blame.

**6. DO NOT reference `isSelected` outside a filter / sort row tag.** It is loop-scoped — referencing it from the panel root or trigger returns `undefined`.

**7. DO NOT iterate `filteredAnnotations` yourself.** The `<velt-multi-thread-comment-dialog-list-wireframe>` iterates and mounts the standard Comment Dialog primitives per annotation, injecting the per-annotation context that nested dialog tags read.

**8. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name — `{nonDraftCommentsCount}`, `{minimalFilter}`, `{filteredAnnotations}` — never `componentConfig.<mapped-name>`
- [ ] The two conflicting names use their explicit path: `data.user`, `parentLocalUIState.shadowDom` (per-render) or `uiState.shadowDom` (per-instance)
- [ ] Thread count comes from `{nonDraftCommentsCount}`, not `{annotations.length}` or `{filteredAnnotations.length}`
- [ ] Empty placeholder gates on `{noCommentsFound} || {noCommentsFoundForAppliedFilters}`
- [ ] Reset-filter button gates on `{noCommentsFoundForAppliedFilters}` only
- [ ] Loop-scope (`isSelected`) is used only inside the owning filter / sort row tag
- [ ] The list and composer rely on the standard Comment Dialog wireframe variables (see `wireframe-variables-comment-dialog.md`) — do not iterate `filteredAnnotations` by hand
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/multithread-comments/wireframe-variables — "Multithread Comments Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural catalog), `wireframe-variables-comment-dialog.md` (variables that resolve inside the nested list / composer dialog tags), sibling rules `wireframe-variables-comment-bubble.md` / `wireframe-variables-comment-tool.md` / `wireframe-variables-inline-comments-section.md`

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

```html
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
```

#### Variable namespaces

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

#### Naming conflicts — use the full path

Five names collide with mappings used by Comment Dialog. Inside a Text Comment wireframe, prefer the explicit path:

| Conflicting name | Use this in Text Comment |
|---|---|
| `user` | `data.user` |
| `disabled` | `uiState.disabled` |
| `left` | `uiState.left` |
| `isPlanExpired` | `uiState.isPlanExpired` |
| `shadowDom` | `parentLocalUIState.shadowDom` |

#### Wireframe tags

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

#### `defaultCondition` and Angular signal inputs

| React Prop | HTML Attribute | Type | Default | Behavior |
|---|---|---|---|---|
| `defaultCondition` | `default-condition` | `boolean \| "true" \| "false"` | `true` | When `false`, the component renders regardless of its internal `shouldShow` gate. Use to force-show the Copywriter button when `rewriterEnabled` is false, or the tool itself outside the min/max range. |

**Angular signal inputs** (parent-to-child wiring; React/HTML do not require these):

```typescript
// On any <velt-text-comment-...-wireframe> in an Angular template
[componentConfigSignal]="config()"      // position, selectedWordsCount,
                                         // selectedCharactersCount, data.user,
                                         // allowedElementIds, contextId
[parentLocalUIState]="localUI()"         // darkMode, variant, shadowDom
```

The root `<velt-text-comment>` element additionally accepts host attributes that map onto local UI state: `dark-mode`, `variant`, `shadow-dom`.

#### `shouldShow` gates worth remembering

| Slot | `shouldShow` |
|---|---|
| `text-comment-tool-wireframe` (root) | Active selection inside an `allowedElementIds` element **and** `selectedWordsCount >= MIN_ALLOWED_WORDS_COUNT` **and** `selectedCharactersCount` between `MIN_ALLOWED_CHARACTERS_COUNT` and `MAX_ALLOWED_CHARACTERS_COUNT`. |
| `text-comment-toolbar-copywriter-wireframe` | `rewriterEnabled === true` |

Override either with `defaultCondition={false}` (React) / `default-condition="false"` (HTML) when you need the slot to render unconditionally.

#### Common mistakes — DO NOT

**1. DO NOT prefix mapped variables with `componentConfig.`.** Variables are mapped to short names. `<velt-data field="componentConfig.selectedWordsCount" />` resolves to nothing — use `<velt-data field="selectedWordsCount" />`. The exception is the five conflicting names above, which **require** their explicit path (`data.user`, `uiState.disabled`, `uiState.left`, `uiState.isPlanExpired`, `parentLocalUIState.shadowDom`).

**2. DO NOT read `user` directly inside a Text Comment wireframe.** `user` is mapped elsewhere — use `data.user` (and `data.user.name`, `data.user.photoUrl`, etc.) to read the identified end-user here.

**3. DO NOT gate the Copywriter button with only `velt-if="{rewriterEnabled}"` when you also want the default UI hidden.** The toolbar slot's own `shouldShow` covers `rewriterEnabled`. If you are providing a custom rewriter UI, check `rewriterDefaultUIEnabled` separately — they are not the same flag.

**4. DO NOT compute the toolbar position from `uiState.left` directly.** `uiState.left` is the raw value before resolution; the placed `position` / `position.left` is what the tool actually uses for layout.

**5. DO NOT mix `defaultCondition` with `velt-if` to mean the same thing.** `defaultCondition={false}` disables the slot's internal `shouldShow` (forcing render). `velt-if` adds a new gate on top. Combining them inverts the semantics you probably want.

**6. DO NOT bind to `parentLocalUIState.shadowDom` from inside the wireframe to *enable* shadow-DOM.** Shadow-DOM is set via the host attribute `shadow-dom="true"` on `<velt-text-comment>`. The variable only reports the current state.

**Verification:**
- [ ] Wireframe slots reference mapped variables by short name (not `componentConfig.var`)
- [ ] The five conflicting names use their explicit path: `data.user`, `uiState.disabled`, `uiState.left`, `uiState.isPlanExpired`, `parentLocalUIState.shadowDom`
- [ ] Toolbar position uses `{position.top}` / `{position.left}`, not `{uiState.left}`
- [ ] Copywriter gate either relies on the slot's own `shouldShow` *or* uses `velt-if="{rewriterEnabled}"` — not both, and not combined with `defaultCondition`
- [ ] `defaultCondition` / `default-condition` is used only to override an unwanted `shouldShow` gate
- [ ] Angular usage wires `[componentConfigSignal]` and `[parentLocalUIState]` from the parent — React/HTML usage does not

**Source Pointers:**
- https://docs.velt.dev/ui-customization/features/async/comments/text-comment-wireframe-variables — "Text Comment Wireframe Variables"
- https://docs.velt.dev/ui-customization/template-variables — "Template Variables overview"
- Cross-reference: `ui/ui-wireframes.md` (structural wireframe catalog), `wireframe-variables-comment-bubble.md` / `wireframe-variables-comment-dialog.md` / `wireframe-variables-comment-tool.md` (sibling wireframe-variable rules)

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
- https://docs.velt.dev/async-collaboration/comments/setup/apryse
- https://docs.velt.dev/api-reference/sdk/models/data-models
- https://docs.velt.dev/ui-customization/features/async/comments/comment-dialog/primitives
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-v2-primitives
- https://docs.velt.dev/ui-customization/features/async/comments/inline-comments-section/primitives
- https://docs.velt.dev/ui-customization/features/async/comments/multithread-comments/primitives
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/setup
- https://docs.velt.dev/async-collaboration/comments-sidebar/v2/customize-behavior
- https://docs.velt.dev/api-reference/sdk/api/api-methods
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-components
- https://docs.velt.dev/ui-customization/features/async/comments/comment-sidebar/comment-sidebar-v2-wireframes
- https://docs.velt.dev/api-reference/rest-apis/v2/agents/create
- https://docs.velt.dev/ai/agent-comments
- https://docs.velt.dev/async-collaboration/comments/customize-behavior
- https://docs.velt.dev/async-collaboration/comments/standalone-components/comment-text/overview
- https://docs.velt.dev/async-collaboration/comments/setup/prosemirror
- https://docs.velt.dev/async-collaboration/comments-sidebar/v1/customize-behavior
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/add-comment-annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comment-annotations/update-comment-annotations
- https://docs.velt.dev/api-reference/rest-apis/v2/comments-feature/comments/update-comments
- https://docs.velt.dev/ui-customization/reference/primitives
- https://docs.velt.dev/ui-customization/reference/wireframe-components
- https://docs.velt.dev/async-collaboration/suggestions/overview
