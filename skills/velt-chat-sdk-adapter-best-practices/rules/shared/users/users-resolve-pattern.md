---
title: User Resolution Pattern (resolveUsers)
impact: HIGH
tags: resolveUsers, userIds, name, index alignment, undefined
---

## User Resolution Pattern

The `resolveUsers` callback maps user IDs to display names. The adapter calls it when parsing mentions in messages to replace `{{userId}}` tokens with readable `@Name` text.

```typescript
interface User {
  name: string;
  avatarUrl?: string;
  email?: string;
}

function resolveUsers({ userIds }: { userIds: string[] }): (User | undefined)[] {
  return userIds.map((id) => {
    const user = USERS_DATABASE.find((u) => u.userId === id);
    return user ? { name: user.name } : undefined;
  });
}
```

### The Index Alignment Rule

The returned array must be the same length as the input `userIds` array, with matching indices. Position 0 in the output corresponds to position 0 in the input. Return `undefined` for unknown users.

```typescript
// Input:  userIds = ["alice", "unknown-user", "bob"]
// Output: [{ name: "Alice" }, undefined, { name: "Bob" }]
```

### Static vs Dynamic Resolution

**Static (hardcoded users):**
```typescript
const USERS: Record<string, string> = {
  "user-1": "Alice",
  "user-2": "Bob",
};

function resolveUsers({ userIds }: { userIds: string[] }) {
  return userIds.map((id) => {
    const name = USERS[id];
    return name ? { name } : undefined;
  });
}
```

**Dynamic (runtime learning from the AI bot example):**
```typescript
const knownUsers = new Map<string, string>();

export function rememberUser(userId?: string, fullName?: string) {
  if (userId && fullName) knownUsers.set(userId, fullName);
}

function resolveUsers({ userIds }: { userIds: string[] }) {
  return userIds.map((id) => {
    const name = knownUsers.get(id);
    return name ? { name } : undefined;
  });
}
```

### Key Points

- The output array length must equal the input array length — mismatched indices break mention resolution
- Return `undefined` (not `null`) for unknown users
- For production apps, consider fetching from your user database or Velt's REST API
- The AI bot example demonstrates "runtime learning" — it calls `rememberUser()` with data from incoming messages, gradually building a user map without a database
