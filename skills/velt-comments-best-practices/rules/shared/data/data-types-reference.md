---
title: Comments Data Type Reference — Core Models
impact: MEDIUM
impactDescription: Type definitions for comment annotations, comments, status, priority, attachments
tags: CommentAnnotation, Comment, ReactionAnnotation, Status, Priority, Attachment, Location, TargetElement, CommentRequestQuery, AddCommentAnnotationRequest, CommentSidebarData, CommentAnnotationAgent, AgentResult, CommentAnnotationSuggestion, FullscreenClickEvent, basicAnchorData, commentType, sourceType, involvedUserIds, mentionedUserIds, metadata, types, models
---

## Comments Data Type Reference — Core Models

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
  involvedUserIds?: string[];          // All user IDs involved in the annotation (subscribed + unsubscribed). Read-only, server-derived
  mentionedUserIds?: string[];         // User IDs @mentioned across the annotation's comments. Read-only, server-derived
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

Suggestion state is mutated by `acceptSuggestion()` / `rejectSuggestion()` API methods. The `commentType` field on the parent annotation is `'suggestion'` for agent suggestion comments. The `sourceType` field selects the agent-identity vs human-author header variant rendered in the UI.

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
- [ ] Location.id is number, not string
- [ ] Status.type is one of 'default', 'ongoing', 'terminal'
- [ ] Agent-authored annotations check `annotation.agent` for identity, not custom fields
- [ ] `CommentAnnotation.involvedUserIds` / `mentionedUserIds` and `ReactionAnnotation.involvedUserIds` are treated as read-only server-derived fields (never written from the client)
- [ ] `Comment.sourceType === 'agent'` is the discriminator for the agent-identity header; `Comment.agent` carries the AI payload (`AgentData` — see `data-agent-fields-query.md` for the shape)
- [ ] `Comment.metadata` is opaque to Velt — application code owns its schema
- [ ] `FullscreenClickEvent.fullScreen` is read as the post-toggle state (`true` = now fullscreen)

**Source Pointer:** https://docs.velt.dev/api-reference/sdk/models/data-models - Comments
**Source Pointer:** https://docs.velt.dev/api-reference/sdk/models/data-models#fullscreenclickevent
