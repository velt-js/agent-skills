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

### Per-Feature Field Inventory (`Partial<X>` PII payloads)

Each provider's `save` handler receives a `Partial<X>` shape — the SDK strips PII on the frontend before any write reaches Velt and hands only this payload to your DB. The note vocabulary used below: **kept** (sent to Velt verbatim), **reduced** (user → `{ userId }` before any write to Velt), **never sent to Velt** (stripped on the frontend before any request — value goes only to your DB or is recomputed on the client), **copied-not-moved** (sent to both), **@deprecated** (kept for back-compat; do not rely on it).

#### `PartialCommentAnnotation` (your DB)

```typescript
interface PartialCommentAnnotation {
  annotationId: string;                                  // join key; also in Velt's DB
  metadata?: BaseMetadata;                               // getClientMetadata(data.metadata ?? {})
  comments: Record<string | number, PartialComment>;    // re-keyed array → map; required (defaults to {})
  from?: PartialUser;                                    // { userId }; copied-not-moved
  assignedTo?: PartialUser;                              // { userId }; copied-not-moved
  targetTextRange?: { text: string };                    // only the .text sub-field is withheld from Velt
  resolvedByUserId?: string | null;                      // copied-not-moved
  // plus any keys listed in config.fieldsToRemove (truthy-gated) and config.additionalFields (!== undefined)
}

interface PartialComment {
  commentId: string | number;                            // always sent
  commentHtml?: string;                                  // PII — never sent to Velt (only-if-truthy)
  commentText?: string;                                  // PII — never sent to Velt (only-if-truthy)
  attachments?: Record<number, PartialAttachment>;       // only when the attachment resolver is also active
  from?: PartialUser;                                    // only if truthy
  to?: PartialUser[];                                    // @mentioned users
  taggedUserContacts?: { userId: string; contact?: { userId: string }; text?: string }[];
}
```

#### `PartialReactionAnnotation` (your DB)

```typescript
interface PartialReactionAnnotation {
  annotationId: string;                                  // join key
  metadata?: BaseMetadata;                               // getClientMetadata(annotation.metadata ?? {})
  icon: string;                                          // the only field never sent to Velt
  from?: PartialUser;                                    // { userId }; copied-not-moved
}
```

`iconUrl` and `iconEmoji` (custom reaction icon variants) are **kept** — they are sent to Velt verbatim. Only the emoji-code `icon` is withheld.

#### `PartialRecorderAnnotation` (your DB)

```typescript
interface PartialRecorderAnnotation {
  annotationId: string;                                  // join key
  metadata?: BaseMetadata;                               // getClientMetadata(data.metadata)
  from?: User;                                           // full user object (PII); deep-cloned
  transcription?: Transcription;                         // entire object → your DB, never sent to Velt
  attachment?: Attachment | null;                        // @deprecated; value written as null on Velt's side
  attachments?: Attachment[];                            // full list incl. URLs — Velt keeps only stubs { attachmentId, name, bucketPath }
  chunkUrls?: Record<number, string>;                    // full map → your DB; Velt's side written as {}
  recordingEditVersions?: Record<number, PartialRecorderAnnotationEditVersion>;
  isUrlAvailable?: boolean;                              // copied-not-moved
  // plus config.additionalFields
}

interface Transcription {
  from: User;                                            // required
  lastUpdated?: number;
  srtBucketPath?: string; srtUrl?: string;
  vttBucketPath?: string; vttUrl?: string;
  transcriptedText?: string;                             // PII
  transcriptionLatency?: number;
}
```

`bucketPath` inside `attachments[]` is deliberately **kept** in Velt's stub form so Velt can clean up storage; `url` and the other PII fields are stripped.

#### `PartialNotification` (your DB — custom notifications only)

```typescript
interface PartialNotification {
  notificationId: string;                                // join key; the only non-PII field
  displayHeadlineMessageTemplate?: string;               // PII; your DB only
  displayHeadlineMessageTemplateData?: {
    actionUser?: User;
    recipientUser?: User;
    actionMessage?: string;
    [key: string]: any;
  };
  displayBodyMessage?: string;                           // PII; your DB only
  displayBodyMessageTemplate?: string;                   // PII; your DB only
  displayBodyMessageTemplateData?: { [key: string]: any };
  notificationSourceData?: any;                          // your custom source payload
  [key: string]: any;                                    // any extra custom fields merged verbatim on read
}
```

This is **read-only enrichment** — there is no write-side strip and no `save`. The PII is never written to Velt at all; it lives in your backend and is fetched on read.

#### `PartialActivityRecord` (your DB — append-only)

```typescript
interface PartialActivityRecord {
  id: string;                                            // correlation key (same as ActivityRecord.id)
  metadata?: BaseMetadata;                               // getClientMetadata subset
  changes?: ActivityChanges;                             // for comment activities: { commentText: { from, to } } only
  entityData?: unknown;                                  // PartialReaction… / PartialRecorder… — only when matching feature resolver active
  entityTargetData?: unknown;                            // sub-entity PII snapshot (e.g. comment fields)
  displayMessageTemplateData?: Record<string, unknown>;  // custom-activity template values
  [key: string]: any;                                    // fieldsToRemove custom fields (featureType === 'custom' only)
}
```

`displayMessage` is **always recomputed on the client** from the template + values — stored in neither DB.

#### Attachment upload payload (handed to your storage provider)

```typescript
interface SaveAttachmentResolverRequest {
  file: File;                                            // raw binary — sent only to your storage, never to Velt
  attachment: {
    attachmentId: number;                                // required
    name?: string;
    mimeType?: string;
  };
  metadata: AttachmentResolverMetadata;                  // routing context
  event?: ResolverActions;                               // e.g. ATTACHMENT_ADD / ATTACHMENT_DELETE
}

interface AttachmentResolverMetadata {
  organizationId: string | null;
  documentId: string | null;
  folderId?: string | null;                              // optional + nullable
  attachmentId: number | null;
  commentAnnotationId: string | null;                    // dropped on delete
  apiKey: string | null;
}

// Required return shape
interface SaveAttachmentResolverData { url: string; }
```

There is no `Partial<X>` strip and no `get` for attachments — they are binary files. The `file` is destructured out and sent as binary to your storage; the JSON request body is exactly `{ attachment: { attachmentId, name, mimeType }, metadata, event }`. Velt receives the returned `url` plus the structural fields on the `Attachment` record (`bucketPath`, `size`, `type`, `thumbnail`, etc.).

### Shared building blocks

These nested types are referenced from every feature payload above.

#### `BaseMetadata`

```typescript
interface BaseMetadata {
  apiKey?: string;
  documentId?: string;                                   // Velt-internal hashed id (auto-derived)
  clientDocumentId?: string;                             // raw id you passed; dropped from the client-facing copy
  organizationId?: string;                               // Velt-internal hashed id
  clientOrganizationId?: string;                         // raw id you passed; dropped from the client-facing copy
  folderId?: string;                                     // auto-derived from veltFolderId
  veltFolderId?: string;                                 // Velt-internal; not in the client-facing copy
  documentMetadata?: DocumentMetadata;
  sdkVersion?: string | null;
}
```

`getClientMetadata` transform (used for every payload sent to your DB): `clientDocumentId → documentId`, `clientOrganizationId → organizationId`; `veltFolderId` / `parentVeltFolderId` / `pageInfo` dropped; `folderId` included only when truthy.

#### `User` / `PartialUser`

```typescript
type PartialUser = { userId: string };                   // the "reduced" shape — what Velt sees
```

The full `User` object (name / email / avatar / `photoUrl`) is **never sent to Velt** when the `user` provider is active; only `{ userId }` is written.

#### `Location` and `Version`

```typescript
interface Location {
  id?: string;
  locationName?: string;
  version?: { id: string; name: string };
  [key: string]: any;                                    // arbitrary custom keys — kept
}
```

#### `TargetElement`

```typescript
interface TargetElement {
  xpath?: string;
  fXpath?: string;                                       // full XPath
  cfXpath?: string;                                      // full XPath with class names
  topPercentage?: number;                                // default 0
  leftPercentage?: number;                               // default 0
  anchor?: AnchorRecord | null;
  targetText?: string;                                   // IS sent to Velt — the readable anchor text
}
```

Notable: `TargetElement.targetText` **IS** sent to Velt verbatim. The similarly named `targetTextRange.text` is **NOT** — see `TargetTextRange` below.

#### `TargetTextRange`

```typescript
interface TargetTextRange {
  commonAncestorContainer?: string;
  commonAncestorContainerFXpath?: string;
  commonAncestorContainerCFXpath?: string;
  commonAncestorContainerAnchor?: AnchorRecord;
  text?: string;                                         // never sent to Velt for comments (→ your DB) — only sub-field withheld
  occurrence?: number;                                   // default 1
}
```

#### `CursorPosition`

```typescript
interface CursorPosition {
  top: number;                                           // default 0
  left: number;                                          // default 0
  parentScaleX?: number;                                 // transform handling
  parentScaleY?: number;
  transformContext?: any;
}
```

#### `PageInfo`

```typescript
interface PageInfo {
  url?: string;
  path?: string;
  queryParams?: string;
  baseUrl?: string;
  title?: string;
  arrowUrl?: string; areaUrl?: string; commentUrl?: string; tagUrl?: string; recorderUrl?: string;
  screenWidth?: number;
  deviceInfo?: IDeviceInfo;
}
```

#### `CommentAnnotationViews`

```typescript
interface CommentAnnotationViews {
  views: Record<string, { timestamp: number }>;          // per-userId annotation view timestamps
  comments: Record<string | number, {
    views: Record<string, { timestamp: number }>;        // per-userId per-comment view timestamps
  }>;
  metadata?: BaseMetadata;
}
```

### Resolver flags (set in Velt's DB; never sent from your side)

The SDK sets these on the Velt-side record whenever PII was withheld for the corresponding feature. They are signals to clients that the resolver enrichment must run before the record is fully renderable.

`isCommentResolverUsed` · `isReactionResolverUsed` · `isRecorderResolverUsed` · `isNotificationResolverUsed` · `isActivityResolverUsed` · `isAttachmentResolverUsed`

**Verification:**
- [ ] All provider interfaces match the VeltDataProvider shape
- [ ] ResolverResponse always has `success: boolean` and `statusCode: number`
- [ ] Request types match the operation (get/save/delete)
- [ ] Partial types include only the PII fields stored on your infrastructure
- [ ] `BaseMetadata` payloads sent to your DB go through `getClientMetadata` (raw `clientDocumentId` → `documentId`)
- [ ] `TargetElement.targetText` is kept (sent to Velt); `targetTextRange.text` is stripped to your DB only
- [ ] Recorder attachment stubs preserve `bucketPath` for Velt-side storage cleanup; `url` is never sent to Velt

**Source Pointer:** https://docs.velt.dev/api-reference/sdk/models/data-models - Self-Hosting Types; https://docs.velt.dev/self-host-data/field-inventory - "Complete Field Inventory"
