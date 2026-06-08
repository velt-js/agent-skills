---
title: Dynamic liveStateDataId with updateLiveStateDataId
impact: HIGH
tags: updateLiveStateDataId, dynamic, room, document, context switch
---

## Dynamic liveStateDataId with updateLiveStateDataId

`updateLiveStateDataId` lets you switch the sync scope at runtime — for example, when a user navigates between documents or rooms.

```tsx
import { updateLiveStateDataId } from './store';

function DocumentView({ documentId }: { documentId: string }) {
  useEffect(() => {
    updateLiveStateDataId(`doc-${documentId}`);
  }, [documentId]);

  return <Editor />;
}
```

### How It Works

- `createLiveStateMiddleware` returns `{ middleware, updateLiveStateDataId }`
- Export `updateLiveStateDataId` from your store file
- Call it whenever the context changes (document switch, room change, etc.)
- All actions dispatched after the call use the new ID
- Actions already in flight use the old ID — there is no retroactive update

### Key Points

- Always set an initial `liveStateDataId` in the middleware config, then update dynamically — don't rely solely on dynamic updates
- The ID change takes effect immediately for new dispatches
- Other clients subscribed to the old ID stop receiving this client's actions; clients on the new ID start receiving them
- Common pattern: `doc-${documentId}` or `room-${roomId}` to scope state per document/room
