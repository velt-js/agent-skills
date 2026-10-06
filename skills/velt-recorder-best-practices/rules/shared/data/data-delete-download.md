---
title: Delete Recordings and Download Latest Video
impact: MEDIUM
impactDescription: Manage recording lifecycle and enable user-facing download
tags: deleteRecordings, downloadLatestVideo, data, management, recorderIds
---

## Delete Recordings and Download Latest Video

Use `deleteRecordings()` to remove recordings by ID and `downloadLatestVideo()` to download the most recent version of a recording. Both return Promises for async handling.

**Incorrect (not providing deletion or download capabilities):**

```jsx
// No way for users to manage recordings after creation
<VeltRecorderPlayer recorderId={recorderId} />
```

**Correct (delete and download via API):**

```jsx
import { useRecorderUtils } from '@veltdev/react';

function RecordingActions({ recorderId }) {
  const recorderUtils = useRecorderUtils();

  const handleDelete = async () => {
    const results = await recorderUtils.deleteRecordings({
      recorderIds: [recorderId]
    });
    console.log('Deleted:', results);
  };

  const handleDownload = async () => {
    const success = await recorderUtils.downloadLatestVideo(recorderId);
    if (!success) {
      console.error('Download failed');
    }
  };

  return (
    <div>
      <VeltRecorderPlayer recorderId={recorderId} />
      <button onClick={handleDownload}>Download</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

**For non-React frameworks:**

```js
const recorderElement = Velt.getRecorderElement();

// Delete recordings by IDs
const results = await recorderElement.deleteRecordings({
  recorderIds: ['RECORDER_ID_1', 'RECORDER_ID_2']
});

// Download latest version of a recording
const success = await recorderElement.downloadLatestVideo('RECORDER_ID');
```

**Key details:**
- `deleteRecordings()` accepts a `RecorderRequestQuery` (`{ recorderIds: string[] }`) and returns `Promise<DeleteRecordingsResponse[]>`
- `downloadLatestVideo()` accepts a single `recorderId` string and returns `Promise<boolean>`
- `downloadLatestVideo` downloads the latest edited version if the video was edited

**Player delete control:** `VeltRecorderPlayer` accepts an `onDelete` callback that receives `{ id }` (the `recorderId`). The docs differ on what happens without it: the props reference says it fires when the recording is deleted, while the behaviors reference says the delete control only emits the event and your handler owns the deletion. Wire `onDelete`, check in your build whether the recording is already gone (for example with `fetchRecordings({ recorderIds: [id] })`), and only call `deleteRecordings()` if it is not.

```jsx
<VeltRecorderPlayer
  recorderId={recorderId}
  onDelete={({ id }) => handlePlayerDelete(id)}
/>
```

The `deleteRecording` recorder event fires when a recording is deleted.

**Verification:**
- [ ] Delete functionality available for user-created recordings
- [ ] `onDelete` wired on `VeltRecorderPlayer` and deletion behavior confirmed in your SDK build
- [ ] Download triggers browser download of the latest video version
- [ ] Error cases handled (failed delete, failed download)

**Source Pointers:**
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#deleterecordings - "deleteRecordings"
- https://docs.velt.dev/async-collaboration/recorder/customize-behavior#downloadlatestvideo - "downloadLatestVideo"
- https://docs.velt.dev/ui-customization/reference/behaviors/recorder-huddle - "VeltRecorderPlayer" (`onDelete`)
