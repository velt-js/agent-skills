---
title: Moderation & Permissions
impact: LOW
impactDescription: Access control and moderation features for comments
tags: permissions, access-control, moderation, visibility, private-comments, access-context
---

# Moderation & Permissions

This category covers who can see and act on comments.

## Where each topic lives

- **Private comments (visibility):** `permissions-private-mode.md` (`enablePrivateMode`, `updateVisibility`), `permissions-visibility-option-dropdown.md` (composer visibility banner), `permissions-visibility-routing.md` (`isAnnotationPrivate()` semantics).
- **Access Context with private comments:** `permissions-private-comments-access-context.md`.
- **Comment events used for gating and side effects:** `permissions-comment-saved-event.md`, `permissions-comment-save-triggered-event.md`, `permissions-comment-interaction-events.md`, `permissions-submit-in-flight.md`.
- **Anonymous (email-only) users:** `permissions-anonymous-user-data-provider.md`.
- **Moderation (approval, read-only, admin-only resolve, suggestion resolution):** `config/config-moderation.md`.

## Access control basics

- Assign users as **Editor** or **Viewer** per resource (organization, folder, document) through your JWT token permissions or the access REST APIs. Editors can write collaboration data; Viewers are read-only.
- Users can only access documents in their own organization unless you grant cross-organization access.
- Feature-level partitioning of comments uses Access Context with `isContextEnabled: true` on your Permission Provider.

## Source Pointers

- https://docs.velt.dev/key-concepts/overview - Access control concepts
- https://docs.velt.dev/security/auth-tokens - Auth tokens
- https://docs.velt.dev/api-reference/rest-apis/v2/auth/add-permissions - Add permissions REST API
- https://docs.velt.dev/async-collaboration/comments/customize-behavior#private-comments-beta - Private Comments
