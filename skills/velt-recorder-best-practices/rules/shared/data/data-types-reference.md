---
title: Recorder Data Type Reference — Core Models
impact: MEDIUM
impactDescription: Correct field names for recording data, annotations, queries, and configuration prevent silent undefined reads
tags: RecordedData, RecorderAnnotation, RecorderRequestQuery, GetRecordingDataResponse, RecorderDataAsset, RecorderDataTranscription, RecorderQualityConstraints, RecorderEncodingOptions, RecorderDevicePermissionOptions, MediaPreviewConfig, types, models
---

## Recorder Data Type Reference — Core Models

Use the documented field names when reading recorder data. Several fields are easy to guess wrong: segments are `transcriptSegments` with `startTimeInSeconds` / `endTimeInSeconds`, asset size is `fileSizeInBytes`, and the non-Safari browser key is `other` (not `others`).

**Incorrect (guessed field names):**

```typescript
const segments = recording.transcription.segments;        // Use transcriptSegments
const start = segments[0].start;                          // Use startTime / startTimeInSeconds
const size = recording.assets[0].size;                    // Use fileSizeInBytes
recorderElement.setRecordingEncodingOptions({ others: {} }); // Use 'other'
```

**Correct (documented shapes):**

```typescript
// RecorderRequestQuery: fetchRecordings / getRecordings / deleteRecordings
interface RecorderRequestQuery {
  recorderIds: string[];
}

// Items returned by fetchRecordings(), getRecordings(), deleteRecordings()
// (GetRecordingDataResponse / DeleteRecordingsResponse), and recordingDone-style events
interface GetRecordingDataResponse {
  recorderId: string;
  from?: User | null;
  metadata?: RecorderMetadata;
  assets: RecorderDataAsset[];            // latest version
  assetsAllVersions: RecorderDataAsset[]; // every edited version
  transcription: RecorderDataTranscription;
}

interface RecorderDataAsset {
  version?: number;
  url: string;
  mimeType?: string;
  fileName?: string;
  fileSizeInBytes?: number;
  fileFormat?: RecorderFileFormat;        // e.g. 'mp3' | 'mp4' | 'webm'
  thumbnailUrl?: string;
  transcription?: RecorderDataTranscription;
}

interface RecorderDataTranscription {
  transcriptSegments?: RecorderDataTranscriptSegment[];
  vttFileUrl?: string;
  contentSummary?: string;
}

interface RecorderDataTranscriptSegment {
  startTime: string;
  endTime: string;
  startTimeInSeconds: number;
  endTimeInSeconds: number;
  text: string;
}

// RecordedData: legacy onRecordedData callback payload
interface RecordedData {
  id: string;                    // recorder annotation ID
  tag: string;                   // recorder player tag you can place in the DOM
  type: string;                  // 'audio' | 'video' | 'screen'
  thumbnailUrl?: string;
  thumbnailWithPlayIconUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  videoPlayerUrl?: string;
  getThumbnailTag: Function;     // returns thumbnail HTML linking to the player
}

// Quality and encoding: keys are 'safari' and 'other'
interface RecorderQualityConstraints {
  safari?: { video?: MediaTrackConstraints; audio?: MediaTrackConstraints };
  other?: { video?: MediaTrackConstraints; audio?: MediaTrackConstraints };
}
interface RecorderEncodingOptions {
  safari?: { videoBitsPerSecond?: number; audioBitsPerSecond?: number };
  other?: { videoBitsPerSecond?: number; audioBitsPerSecond?: number };
}

interface RecorderDevicePermissionOptions {
  audio?: boolean;
  video?: boolean;
}

interface MediaPreviewConfig {
  audio?: { enabled?: boolean; deviceId?: string };
  video?: { enabled?: boolean; deviceId?: string };
  screen?: { enabled?: boolean; stream?: MediaStream };
}
```

**RecorderAnnotation (stored recorder annotation, also returned by the Get Recordings REST API):** `annotationId`, `from`, `color`, `lastUpdated`, `locationId`, `location`, `type`, `recordingType`, `mode` (`'floating' | 'thread'`), `approved`, `attachments` (the deprecated single `attachment` also exists), `annotationIndex`, `pageInfo`, `recordedTime`, `transcription`, `isRecorderResolverUsed` (true while self-hosted PII is being fetched), and `isUrlAvailable` (true once the URL is no longer a local blob).

**Defaults:** encoding defaults are `videoBitsPerSecond` 2,500,000 (Safari) / 1,000,000 (other) and `audioBitsPerSecond` 128,000. Quality defaults target 1280x720 at up to 30 fps with echo cancellation, noise suppression, and auto gain control.

**Verification:**
- [ ] Transcript code reads `transcriptSegments` and `startTimeInSeconds` / `endTimeInSeconds`
- [ ] Asset code reads `fileSizeInBytes`, `fileFormat`, `thumbnailUrl`
- [ ] Quality / encoding objects use the `safari` and `other` keys
- [ ] `assets` used for the latest version; `assetsAllVersions` when edit history matters
- [ ] Upload state checked with `isUrlAvailable` before sharing a URL

**Source Pointers:**
- https://docs.velt.dev/api-reference/sdk/models/data-models#recorderrequestquery - "RecorderRequestQuery" and Recorder Data models
- https://docs.velt.dev/api-reference/sdk/models/data-models#recorderdataasset - "RecorderDataAsset"
- https://docs.velt.dev/api-reference/sdk/models/data-models#recorderannotation - "RecorderAnnotation"
- https://docs.velt.dev/api-reference/sdk/models/data-models#recordeddata - "RecordedData"
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#setrecordingqualityconstraints - "setRecordingQualityConstraints" (defaults)
