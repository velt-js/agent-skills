---
title: Return index-aligned results from resolveUsers
impact: HIGH
impactDescription: resolveUsers results are matched by position; a filtered or reordered array attaches names to the wrong users
tags: resolveUsers, userIds, name, index alignment, undefined, mentions
---

## Return index-aligned results from resolveUsers

`resolveUsers({ userIds })` converts Velt user IDs into display info (`{ name }`). The adapter uses it to turn mention tokens into readable `@Name` text and to fill in authors. Return one entry per input ID, in the same order, with `undefined` for unknown users. It may be synchronous or return a Promise.

**Incorrect (filters out unknown users):**

```typescript
function resolveUsers({ userIds }: { userIds: string[] }) {
  // BUG: dropping unknown IDs shifts every later name onto the wrong user
  return USERS.filter((u) => userIds.includes(u.userId)).map((u) => ({ name: u.name }));
}
```

**Correct:**

```typescript
// app/database.ts
export const BOT_USER_ID = "velt-bot";
export const BOT_USER_NAME = "Velt Bot";

const USERS = [
  { userId: "user-1", name: "Charlie Layne" },
  { userId: "user-2", name: "Mislav Abha" },
  { userId: BOT_USER_ID, name: BOT_USER_NAME },
];

export function getUser(userId: string) {
  const user = USERS.find((u) => u.userId === userId);
  return user ? { name: user.name } : undefined;
}

export function resolveUsers({ userIds }: { userIds: string[] }) {
  return userIds.map((id) => getUser(id));
}
```

For production, look users up in your database (batch the query, then map back in input order).

**Verification Checklist:**
- [ ] Output length equals input length, in the same order
- [ ] Unknown users map to `undefined`
- [ ] The bot user is resolvable

**Source Pointers:**
- https://docs.velt.dev/ai/chat-sdk-adapter — "Create a user database"
