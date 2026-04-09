---
title: Comments Data Type Reference — Core Models
impact: MEDIUM
impactDescription: Type definitions for comment annotations, comments, status, priority, attachments
tags: CommentAnnotation, Comment, Status, Priority, Attachment, Location, TargetElement, CommentRequestQuery, AddCommentAnnotationRequest, CommentSidebarData, types, models
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

**Verification:**
- [ ] Using correct types for all comment-related data
- [ ] commentId is number, annotationId is string
- [ ] Location.id is number, not string
- [ ] Status.type is one of 'default', 'ongoing', 'terminal'

**Source Pointer:** https://docs.velt.dev/api-reference/sdk/models/data-models - Comments
