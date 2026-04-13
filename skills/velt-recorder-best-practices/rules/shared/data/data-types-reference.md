---
title: Recorder Data Type Reference — Core Models
impact: MEDIUM
impactDescription: Type definitions for recording data, annotations, queries, and configuration
tags: RecordedData, RecorderAnnotation, RecorderRequestQuery, RecorderQualityConstraints, RecorderEncodingOptions, RecorderDevicePermissionOptions, MediaPreviewConfig, RecorderDataAsset, types, models
---

## Recorder Data Type Reference — Core Models

Complete type definitions for recorder-related data models used across hooks, API methods, and REST endpoints.

**RecordedData (recording annotation with URLs and metadata):**

```typescript
interface RecordedData {
  id: string;                         // Recording ID
  type: 'audio' | 'video' | 'screen'; // Recording type
  assets: RecorderDataAsset[];        // Recorded file versions
  transcription?: RecorderDataTranscription; // AI transcription data
  metadata?: RecorderMetadata;        // Associated metadata
  createdAt?: number;                 // Creation timestamp
  lastUpdated?: number;               // Last update timestamp
  userId?: string;                    // User who recorded
}
```

**RecorderDataAsset (individual recorded file):**

```typescript
interface RecorderDataAsset {
  url: string;                        // Playback URL
  mimeType: string;                   // MIME type (e.g., 'video/mp4')
  size?: number;                      // File size in bytes
  duration?: number;                  // Duration in seconds
  format?: RecorderFileFormat;        // 'mp3' | 'mp4' | 'webm'
  version?: number;                   // Version number (for edited recordings)
}
```

**RecorderAnnotation (annotation for a recorded item):**

```typescript
interface RecorderAnnotation {
  recorderId: string;                 // Recording ID
  recorderData: RecordedData;         // Full recording data
  location?: Location;                // Where recording was pinned
  metadata?: Record<string, any>;     // Custom metadata
}
```

**RecorderRequestQuery (query parameters for fetch/get/delete):**

```typescript
interface RecorderRequestQuery {
  recorderIds?: string[];             // Filter by specific recording IDs
  documentId?: string;                // Filter by document
  organizationId?: string;            // Filter by organization
  pageSize?: number;                  // Items per page
  pageToken?: string;                 // Pagination token
}
```

**RecorderQualityConstraints (quality settings per browser):**

```typescript
interface RecorderQualityConstraints {
  safari?: RecorderQualityConstraintsOptions;
  others?: RecorderQualityConstraintsOptions;
}

interface RecorderQualityConstraintsOptions {
  video?: MediaTrackConstraints;      // Video constraints
  audio?: MediaTrackConstraints;      // Audio constraints
}

// MediaTrackConstraints supports:
// width, height, frameRate, aspectRatio (video)
// echoCancellation, noiseSuppression, autoGainControl, sampleRate (audio)
// Each can be a number or { min, max, ideal, exact }
```

**RecorderEncodingOptions (output quality/size):**

```typescript
interface RecorderEncodingOptions {
  safari?: MediaRecorderOptions;
  others?: MediaRecorderOptions;
}

interface MediaRecorderOptions {
  videoBitsPerSecond?: number;        // Video bitrate (Safari default: 2.5 Mbps, others: 1 Mbps)
  audioBitsPerSecond?: number;        // Audio bitrate (default: 128 kbps)
}
```

**RecorderDevicePermissionOptions:**

```typescript
interface RecorderDevicePermissionOptions {
  audio?: boolean;                    // Request microphone access
  video?: boolean;                    // Request camera access
}
```

**MediaPreviewConfig:**

```typescript
interface MediaPreviewConfig {
  audio?: boolean;                    // Show audio preview
  video?: boolean;                    // Show video preview
  screen?: boolean;                   // Show screen preview
}
```

**RecorderDataTranscription:**

```typescript
interface RecorderDataTranscription {
  segments: RecorderDataTranscriptSegment[];
  vttFileUrl?: string;                // VTT format transcription file
  contentSummary?: string;            // AI-generated summary
}

interface RecorderDataTranscriptSegment {
  text: string;                       // Transcribed text
  start: number;                      // Start time in seconds
  end: number;                        // End time in seconds
}
```

**Verification:**
- [ ] Using correct types for recording data
- [ ] RecorderRequestQuery used for fetch/get/delete operations
- [ ] Quality constraints configured per browser if needed
- [ ] RecordedData.assets is an array of versions (edited recordings create new versions)

**Source Pointer:** https://docs.velt.dev/api-reference/sdk/models/data-models - Recorder
