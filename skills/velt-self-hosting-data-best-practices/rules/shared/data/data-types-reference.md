---
title: Self-Hosting Data Type Reference — Provider Interfaces, Config, Request/Response Types
impact: MEDIUM
impactDescription: Complete type definitions for all data provider interfaces and resolver types
tags: VeltDataProvider, CommentAnnotationDataProvider, ReactionAnnotationDataProvider, UserDataProvider, AttachmentDataProvider, RecorderAnnotationDataProvider, NotificationDataProvider, ActivityAnnotationDataProvider, AnonymousUserDataProvider, ResolverConfig, ResolverResponse, ResolverEndpointConfig, RetryConfig, ResolverActions, types
---

## Self-Hosting Data Type Reference

Complete type definitions for all data provider interfaces, configuration types, request/response shapes, and resolver enums.

### VeltDataProvider (top-level)

```typescript
interface VeltDataProvider {
  comment?: CommentAnnotationDataProvider;
  user?: UserDataProvider;
  reaction?: ReactionAnnotationDataProvider;
  attachment?: AttachmentDataProvider;
  recorder?: RecorderAnnotationDataProvider;
  activity?: ActivityAnnotationDataProvider;
  notification?: NotificationDataProvider;
  anonymousUser?: AnonymousUserDataProvider;
}

// Set via: client.setDataProviders(provider) or <VeltProvider dataProviders={provider}>
```

### Provider Interfaces

```typescript
interface CommentAnnotationDataProvider {
  get?: (request: GetCommentResolverRequest) => Promise<ResolverResponse<Record<string, PartialCommentAnnotation>>>;
  save?: (request: SaveCommentResolverRequest) => Promise<ResolverResponse<unknown>>;
  delete?: (request: DeleteCommentResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
}

interface ReactionAnnotationDataProvider {
  get?: (request: GetReactionResolverRequest) => Promise<ResolverResponse<Record<string, PartialReactionAnnotation>>>;
  save?: (request: SaveReactionResolverRequest) => Promise<ResolverResponse<unknown>>;
  delete?: (request: DeleteReactionResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
}

interface UserDataProvider {
  get?: (userIds: string[]) => Promise<Record<string, User> | ResolverResponse<Record<string, User>>>;
  config?: ResolverConfig;
}

interface AttachmentDataProvider {
  save?: (request: SaveAttachmentResolverRequest) => Promise<ResolverResponse<SaveAttachmentResolverData>>;
  delete?: (request: DeleteAttachmentResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
}

interface RecorderAnnotationDataProvider {
  get?: (request: GetRecorderResolverRequest) => Promise<ResolverResponse<Record<string, PartialRecorderAnnotation>>>;
  save?: (request: SaveRecorderResolverRequest) => Promise<ResolverResponse<SaveRecorderResolverData | undefined>>;
  delete?: (request: DeleteRecorderResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
  uploadChunks?: boolean;
  storage?: AttachmentDataProvider;
}

interface NotificationDataProvider {
  get?: (request: GetNotificationResolverRequest) => Promise<ResolverResponse<Record<string, PartialNotification>>>;
  delete?: (request: DeleteNotificationResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: NotificationResolverConfig;
}

interface ActivityAnnotationDataProvider {
  get?: (request: GetActivityResolverRequest) => Promise<ResolverResponse<Record<string, PartialActivityRecord>>>;
  save?: (request: SaveActivityResolverRequest) => Promise<ResolverResponse<undefined>>;
  config?: ResolverConfig;
}

interface AnonymousUserDataProvider {
  resolveUserIdsByEmail: (request: ResolveUserIdsByEmailRequest) => Promise<ResolverResponse<Record<string, string>>>;
  config?: AnonymousUserDataProviderConfig;
}
```

### Configuration Types

```typescript
interface ResolverConfig {
  resolveTimeout?: number;
  saveRetryConfig?: RetryConfig;
  deleteRetryConfig?: RetryConfig;
  getRetryConfig?: RetryConfig;
  resolveUsersConfig?: ResolveUsersConfig;
  getConfig?: ResolverEndpointConfig;
  saveConfig?: ResolverEndpointConfig;
  deleteConfig?: ResolverEndpointConfig;
  additionalFields?: string[];     // Copy fields to resolver while keeping in Velt storage
  fieldsToRemove?: string[];       // Strip fields from Velt DB (PII removal)
}

interface ResolverEndpointConfig {
  url: string;
  headers?: Record<string, string>;
}

interface ResolverResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
  timestamp?: number;
  statusCode: number;              // Must be 200
  signature?: string;
}

interface RetryConfig {
  retryCount?: number;
  retryDelay?: number;             // Milliseconds
  revertOnFailure?: boolean;
}

interface ResolveUsersConfig {
  organization?: boolean;          // Resolve org users
  folder?: boolean;                // Resolve folder users
  document?: boolean;              // Resolve document users
}

interface NotificationResolverConfig {
  resolveTimeout?: number;
  getRetryConfig?: RetryConfig;
  deleteRetryConfig?: RetryConfig;
  getConfig?: ResolverEndpointConfig;
  deleteConfig?: ResolverEndpointConfig;
}

interface AnonymousUserDataProviderConfig {
  resolveTimeout?: number;
  getRetryConfig?: RetryConfig;
}

interface SaveAttachmentResolverData {
  url: string;                     // URL where the file can be accessed
}
```

### Request Types

```typescript
// Comments
interface GetCommentResolverRequest {
  organizationId: string; commentAnnotationIds?: string[]; documentIds?: string[]; folderId?: string; allDocuments?: boolean;
}
interface SaveCommentResolverRequest {
  commentAnnotation: Record<string, PartialCommentAnnotation>; metadata?: BaseMetadata; event?: ResolverActions; commentId?: string;
}
interface DeleteCommentResolverRequest {
  commentAnnotationId: string; metadata?: BaseMetadata; event?: ResolverActions;
}

// Reactions
interface GetReactionResolverRequest {
  organizationId: string; reactionAnnotationIds?: string[]; documentIds?: string[]; folderId?: string; allDocuments?: boolean;
}
interface SaveReactionResolverRequest {
  reactionAnnotation: Record<string, PartialReactionAnnotation>; metadata?: BaseMetadata; event?: ResolverActions;
}
interface DeleteReactionResolverRequest {
  reactionAnnotationId: string; metadata?: BaseMetadata; event?: ResolverActions;
}

// Attachments
interface SaveAttachmentResolverRequest { file: File; metadata?: AttachmentResolverMetadata; }
interface DeleteAttachmentResolverRequest { url: string; }

// Recordings
interface GetRecorderResolverRequest {
  organizationId: string; recorderAnnotationIds?: string[]; documentIds?: string[]; folderId?: string; allDocuments?: boolean;
}
interface SaveRecorderResolverRequest {
  recorderAnnotations: Record<string, PartialRecorderAnnotation>; metadata?: BaseMetadata; event?: ResolverActions;
}
interface DeleteRecorderResolverRequest {
  recorderAnnotationId: string; metadata?: BaseMetadata; event?: ResolverActions;
}

// Notifications
interface GetNotificationResolverRequest { organizationId: string; notificationIds?: string[]; documentId?: string; }
interface DeleteNotificationResolverRequest { notificationId: string; metadata?: BaseMetadata; event?: ResolverActions; }

// Activity
interface GetActivityResolverRequest { organizationId: string; activityIds?: string[]; documentIds?: string[]; allDocuments?: boolean; }
interface SaveActivityResolverRequest { activity: Record<string, PartialActivityRecord>; metadata?: BaseMetadata; event?: ResolverActions; }

// Users
interface GetUserResolverRequest { organizationId: string; userIds: string[]; }
interface ResolveUserIdsByEmailRequest { organizationId: string; documentId?: string; folderId?: string; emails: string[]; }
```

### Partial Data Types (PII stored on your infrastructure)

```typescript
interface PartialCommentAnnotation {
  annotationId: string; metadata?: BaseMetadata; comments: Record<string, PartialComment>;
}
interface PartialComment {
  commentId: string | number; commentHtml?: string; commentText?: string;
  attachments?: Record<number, PartialAttachment>; from?: PartialUser;
  to?: PartialUser[]; taggedUserContacts?: PartialTaggedUserContacts[];
}
interface PartialTaggedUserContacts { userId: string; contact?: PartialUser; text?: string; }
interface PartialAttachment { url: string; name: string; attachmentId: number; }
interface PartialReactionAnnotation { annotationId: string; /* reaction data */ }
interface PartialRecorderAnnotation {
  annotationId: string; from?: PartialUser; attachment?: ResolverAttachment;
  attachments?: ResolverAttachment[]; transcription?: string;
  recordingEditVersions?: Record<number, PartialRecorderAnnotationEditVersion>;
}
interface PartialNotification { /* custom notification content fields */ }
interface PartialActivityRecord { id: string; metadata?: BaseMetadata; changes?: ActivityChanges; entityData?: unknown; entityTargetData?: unknown; displayMessageTemplateData?: Record<string, unknown>; }

interface ResolverAttachment { attachmentId: number; file: File; name?: string; metadata?: AttachmentResolverMetadata; mimeType?: string; }
interface AttachmentResolverMetadata { organizationId: string | null; documentId: string | null; folderId?: string | null; attachmentId: number | null; commentAnnotationId: string | null; apiKey: string | null; }
```

### Resolver Enums

```typescript
enum ResolverActions {
  COMMENT_ANNOTATION_ADD = 'comment_annotation.add',
  COMMENT_ANNOTATION_DELETE = 'comment_annotation.delete',
  COMMENT_ADD = 'comment.add',
  COMMENT_DELETE = 'comment.delete',
  COMMENT_UPDATE = 'comment.update',
  REACTION_ADD = 'reaction.add',
  REACTION_DELETE = 'reaction.delete',
  ATTACHMENT_ADD = 'attachment.add',
  ATTACHMENT_DELETE = 'attachment.delete',
  RECORDER_ANNOTATION_ADD = 'recorder_annotation.add',
  RECORDER_ANNOTATION_UPDATE = 'recorder_annotation.update',
  RECORDER_ANNOTATION_DELETE = 'recorder_annotation.delete',
}

enum UserResolverModuleName { IDENTIFY = 'identify/authProvider', GET_TEMPORARY_USERS = 'getTemporaryUsers', GET_USERS = 'getUsers', GET_HUDDLE_USERS = 'getHuddleUsers', GET_SINGLE_EDITOR_USERS = 'getSingleEditorUsers' }
enum CommentResolverModuleName { SET_DOCUMENTS = 'setDocuments', GET_COMMENT_ANNOTATIONS = 'getCommentAnnotations', GET_NOTIFICATIONS = 'getNotifications' }
enum ReactionResolverModuleName { SET_DOCUMENTS = 'setDocuments', GET_REACTION_ANNOTATIONS = 'getReactionAnnotations' }
enum RecorderResolverModuleName { GET_RECORDER_ANNOTATIONS = 'getRecorderAnnotations' }
```

**Verification:**
- [ ] All provider interfaces match the VeltDataProvider shape
- [ ] ResolverResponse always has `success: boolean` and `statusCode: number`
- [ ] Request types match the operation (get/save/delete)
- [ ] Partial types include only the PII fields stored on your infrastructure

**Source Pointer:** https://docs.velt.dev/api-reference/sdk/models/data-models - Self-Hosting Types
