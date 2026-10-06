---
title: Add AI Agents and Bots to Presence with addUser / removeUser
impact: MEDIUM
impactDescription: Show non-human participants (AI agents, bots, system accounts) in the presence list without faking authenticated sessions
tags: presence, addUser, removeUser, localOnly, ai-agent, bot, custom-user, rest-api, presence-rest
---

## Add AI Agents and Bots to Presence with addUser / removeUser

Use `presenceElement.addUser()` to show a custom participant, such as an AI agent working on the document, in the presence list. Remove it with `removeUser()` when the work ends. For server-driven agents, use the Presence REST APIs instead.

**Why this matters:**

Authenticating a second Velt session for a bot is wrong: it consumes a user, needs a token, and leaves stale presence when the process dies. `addUser` adds a presence record for the current document directly. `localOnly: true` keeps it on the current client only.

**Incorrect (opening a hidden session to impersonate the agent):**

```jsx
// Do not authenticate a fake user just to make an avatar appear
await client.identify({ userId: "ai-agent-1", name: "AI Assistant", organizationId: "org-1" });
```

**Correct (React / Next.js):**

```jsx
const presenceElement = client.getPresenceElement();

// Persisted for everyone on the current document
presenceElement.addUser({ user: { userId: "ai-agent-1", name: "AI Assistant" } });

// Visible only to the current user (not persisted)
presenceElement.addUser({ user: { userId: "local-bot", name: "Local Bot" }, localOnly: true });

// Remove when done; match the localOnly flag used when adding
presenceElement.removeUser({ user: { userId: "ai-agent-1" } });
presenceElement.removeUser({ user: { userId: "local-bot" }, localOnly: true });
```

**Correct (Other Frameworks):**

```js
const presenceElement = Velt.getPresenceElement();
presenceElement.addUser({ user: { userId: "ai-agent-1", name: "AI Assistant" } });
presenceElement.removeUser({ user: { userId: "ai-agent-1" } });
```

**Server side (Presence REST APIs):**

```bash
curl -X POST https://api.velt.dev/v2/presence/add \
  -H "x-velt-api-key: YOUR_API_KEY" \
  -H "x-velt-auth-token: YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"organizationId":"org-1","documentId":"doc-1","users":[{"userId":"ai-agent-1","name":"AI Editor","status":"online"}]}}'
```

Use `POST /v2/presence/update` to change name, email, or status and `POST /v2/presence/delete` to remove users.

**Key details:**

- Params: `{ user: Partial<PresenceUser>, localOnly?: boolean }`; `localOnly` defaults to `false`
- Returns `void`
- `PresenceUser.initial` (avatar initial) defaults to the first character of `name`, uppercased, for users added with `addUser`
- Custom users appear in `getData()` / `usePresenceData()` results and in the `VeltPresence` avatar row
- Always remove server-added users when the agent finishes, or they stay in the list

**Verification:**
- [ ] Custom participants use `addUser`, not a second authenticated session
- [ ] `removeUser` is called with the same `localOnly` value used in `addUser`
- [ ] Server-driven agents use the Presence REST APIs with `organizationId` and `documentId`
- [ ] Agents are removed (client or REST) when their work ends

**Source Pointers:**
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#adduser - "addUser()"
- https://docs.velt.dev/realtime-collaboration/presence/customize-behavior#removeuser - "removeUser()"
- https://docs.velt.dev/api-reference/rest-apis/v2/presence/add-presence - "Add Presence"
- https://docs.velt.dev/api-reference/rest-apis/v2/presence/update-presence - "Update Presence"
- https://docs.velt.dev/api-reference/rest-apis/v2/presence/delete-presence - "Delete Presence"
- https://docs.velt.dev/api-reference/sdk/models/data-models#presenceuser - `PresenceUser`
