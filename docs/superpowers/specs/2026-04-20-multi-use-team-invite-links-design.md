# Multi-use Team Invite Links — Design

## Problem

Admins need a way to invite many people to a team from a single shareable link — for example, at a conference where generating a per-person single-use link doesn't scale. Each link must have a capped number of uses; once the cap is hit, the link stops working. The existing single-use invite flow must continue to work unchanged.

## Goals

- Admins can generate a named, capped, shareable invite link for a team.
- Invitees click the link, log in with GitHub, and are added to the team (or created as new users, then added).
- Admins can audit which users signed up via which link.
- Admins can revoke a link before its natural expiry.
- Single-use invite flow is untouched.

## Non-goals

- Editing an existing link's `maxUses` — admins create a new link instead.
- Hard-deleting links — all revoked/expired/full links remain visible for audit.
- Multi-role invite links — links are `MEMBER`-only in v1 (schema allows future expansion).
- Per-invitee name personalisation — the link `name` is admin-facing only; invitees see the standard landing page.

## Data model

### New collection: `TeamInvite`

New Mongoose schema in `app/lib/schemas/teamInvite.schema.ts`:

```ts
{
  _id: ObjectId,
  team: ObjectId,         // ref: Team
  name: string,           // admin-facing label, e.g. "Learning Conference Norway", max 100 chars
  role: "MEMBER",         // enum; hard-coded MEMBER in v1
  maxUses: number,        // integer 1..500
  usedCount: number,      // default 0, incremented atomically on successful signup
  revokedAt?: Date,       // soft-revoke marker; absent = not revoked
  createdAt: Date,        // source of truth for expiry (createdAt + INVITE_LINK_TTL_DAYS)
  createdBy: ObjectId,    // ref: User
  updatedAt?: Date,
  updatedBy?: ObjectId
}
```

TTL reuses the existing `INVITE_LINK_TTL_DAYS` constant from `app/modules/teams/helpers/inviteLink.ts`. Expiry is computed at read time (`dayjs(invite.createdAt).add(INVITE_LINK_TTL_DAYS, "day")`), identical to the single-use flow's use of `user.invitedAt`. A single TTL change affects both flows consistently.

Status is derived, not stored:

```ts
function getTeamInviteStatus(
  invite,
): "active" | "revoked" | "full" | "expired" {
  if (invite.revokedAt) return "revoked";
  if (invite.usedCount >= invite.maxUses) return "full";
  if (dayjs().isAfter(dayjs(invite.createdAt).add(INVITE_LINK_TTL_DAYS, "day")))
    return "expired";
  return "active";
}
```

This keeps writes simple and avoids drift between a `status` field and the fields that imply it.

### User schema change

Add one optional field to each embedded team membership in `app/lib/schemas/user.schema.ts`:

```ts
teams: [
  {
    team: { type: ObjectId, ref: "Team" },
    role: { type: String, enum: ["ADMIN", "MEMBER"] },
    viaTeamInvite: { type: ObjectId, ref: "TeamInvite" }, // NEW — set only when joined via /join
    _id: false,
  },
];
```

Why embedded on the membership (not top-level on `User`): a user might attend multiple conferences over time and join multiple teams via multi-use links. A top-level field would overwrite on each new join, losing audit history. Per-membership attribution is semantically correct: this specific team membership came from this specific invite.

Unused by the existing single-use flow. No migration needed — new optional field, new collection, existing users untouched.

**Collection naming note:** the spec uses `TeamInvite` as a placeholder name. Decide `TeamInvite` vs plain `Invite` during implementation.

## URL scheme

Two disjoint URL paths — separation is important for analytics (GA can filter traffic by route pattern without further instrumentation).

- **Single-use (existing, unchanged):** `/invite/:id`
- **Multi-use (new):** `/join/:id`

Each has its own route file, loader, landing page, and auth-action branch. No runtime type detection. No shared session key.

## Signup flow (multi-use)

1. Invitee visits `/join/:id`. Loader in `join.route.tsx` looks up the `TeamInvite` by `_id`. Returns `{ status: "active" | "revoked" | "full" | "expired" | "not_found" }`. If not active, redirects to `/signup?error=...` with the matching code below.
2. Landing page (reuses the existing `Invite` component) shows "You've been invited … log in with GitHub". No invite-specific content shown to the invitee — the link `name` is admin-only.
3. Invitee clicks "Login with GitHub" → POST to `/api/authentication` with `inviteId: params.id` in the body (reusing existing pattern). The auth action's referer check is extended: if referer is `/join/:id`, the action flashes `teamInviteId` (not `inviteId`) into session, after re-validating the `TeamInvite` is `active`. The existing `/invite/:id` branch is unchanged.
4. GitHub strategy (`app/modules/authentication/helpers/githubStrategy.ts`) reads both `inviteId` and `teamInviteId` from session. If `teamInviteId` is present, it delegates to a new helper `handleTeamInviteSignup.server.ts`, which calls `TeamInviteService.consume(teamInviteId, githubUser)`.

### `consumeTeamInvite.server.ts` — the core

Three signup scenarios (agreed with user):

- **New user (no existing account):** create `User` with `teams: [{ team, role: "MEMBER", viaTeamInvite: inviteId }]`, `isRegistered: true`. Fire `user_registered` event (matches existing flow) plus `team_invite_signup` with `is_new_user: true`.
- **Existing user, not in team:** push `{ team, role: "MEMBER", viaTeamInvite: inviteId }` to their `teams` array. Fire `team_invite_signup` with `is_new_user: false`.
- **Existing user, already in team:** no-op. No increment, no audit mutation, no event. Redirect to team.

### Race safety

Two invitees hitting "Login" simultaneously on a `usedCount: 19, maxUses: 20` link must not both succeed. Use an atomic conditional increment:

```ts
const cutoff = dayjs().subtract(INVITE_LINK_TTL_DAYS, "day").toDate();
const updated = await TeamInvite.findOneAndUpdate(
  {
    _id: inviteId,
    revokedAt: null,
    createdAt: { $gt: cutoff },
    $expr: { $lt: ["$usedCount", "$maxUses"] },
  },
  { $inc: { usedCount: 1 } },
  { new: true },
);
if (!updated) {
  // link became revoked/full/expired between page load and callback — re-read to determine which
  const current = await TeamInvite.findById(inviteId);
  throw redirect(
    `/signup?error=${mapStatusToError(getTeamInviteStatus(current))}`,
  );
}
```

DocumentDB supports `$expr` and `$lt`. Verified during implementation.

Scenario-3 no-op path does **not** call `findOneAndUpdate` — we check team membership first and skip the increment entirely.

### Error redirects (three distinct reasons)

- `EXPIRED_INVITE` — TTL elapsed
- `INVITE_FULL` — `usedCount >= maxUses`
- `INVITE_REVOKED` — `revokedAt` set

The existing `/signup?error=EXPIRED_INVITE` page is reused; two new cases are added to its message mapping.

## Admin UI

### New tab: "Invite links"

Added to `app/modules/teams/components/team.tsx`. Tab order: **Users, Invite links, Projects, Prompts, (Billing)**. Visible to users who pass `TeamAuthorization.Users.canInvite` (same permission as generating single-use invites).

Registered in `app/routes.ts` under the existing team sub-routes:

```ts
route("invite-links", "modules/teams/containers/teamInviteLinks.route.tsx", { id: "teamInviteLinks" }, [
  route(":inviteLinkId", "modules/teams/containers/teamInviteLink.route.tsx", { id: "teamInviteLink" }),
]),
```

### Tab layout (list of invite links)

Uses the standard `Collection` pattern with search, pagination, sort. Loader calls `getQueryParamsFromRequest` + `buildQueryFromParams` + `TeamInviteService.paginate()`. Default sort: `-createdAt`. Sort options: name, createdAt, usedCount.

Per-link row:

- **Title:** link name
- **Description:** full `/join/:id` URL (copy-on-click)
- **Meta:** `"12 of 20 used"`, `"Expires in 3 days"` / `"Expired"` / `"Revoked"` / `"Full"` (inactive states shown in red), `"Created by Jane Doe"`
- **Actions:** Copy link (if active), Revoke (if active, confirmation dialog), View signups

Header action: "Create invite link" button opens the dialog.

### Create dialog

Fields:

- **Name** — required, trimmed, 1..100 chars, live `xx / 100` character counter in the UI
- **Max uses** — integer, 1..500, default 20

No role dropdown. `role` is hard-coded to `MEMBER` server-side; any payload value is ignored (defence against enum-input attacks).

Dialog states mirror the existing single-use dialog:

1. Form state (fields + "Generate invite link" button)
2. Generating state (skeleton)
3. Generated state (URL + copy button + "This invite link will expire in 7 days" text reusing `INVITE_LINK_TTL_DAYS`)

### Detail view (signups)

Route: `/teams/:id/invite-links/:inviteLinkId`

Loader fetches the `TeamInvite` scoped to `params.id` (IDOR prevention) and the list of users where `teams.viaTeamInvite === inviteLinkId`.

Header: link name, status badge, "X of Y used", expiry info, "Created by" + date, Revoke button (if active), Copy link button (if active).

Body: `Collection` of users (same item shape as team users list: name, role, registered/invited, createdAt).

## Module layout

```
app/modules/teams/
├── teamInvites.ts                                     # TeamInviteService facade
├── teamInvites.types.ts                               # TeamInvite type + getTeamInviteStatus type
├── authorization.ts                                   # + TeamAuthorization.Invites.*
├── containers/
│   ├── teamInviteLinks.route.tsx                      # tab list route (loader + action)
│   ├── teamInviteLink.route.tsx                       # detail view route (loader + revoke action)
│   ├── createTeamInviteLinkDialog.container.tsx       # dialog container
│   └── join.route.tsx                                 # public /join/:id landing
├── components/
│   ├── teamInviteLinks.tsx                            # list UI
│   ├── teamInviteLink.tsx                             # detail UI
│   └── createTeamInviteLinkDialog.tsx                 # dialog UI
├── services/
│   └── consumeTeamInvite.server.ts                    # atomic increment + 3-scenario wiring
├── helpers/
│   ├── getTeamInviteStatus.ts
│   ├── getTeamInviteLinksItemAttributes.tsx
│   ├── getTeamInviteLinksItemActions.tsx
│   └── getTeamInviteLinkSignupsItemAttributes.tsx

app/lib/schemas/
└── teamInvite.schema.ts

app/modules/authentication/helpers/
└── handleTeamInviteSignup.server.ts                   # called from githubStrategy branch
```

## Services

`TeamInviteService` facade:

```ts
class TeamInviteService {
  static find(options): Promise<TeamInvite[]>;
  static findById(id): Promise<TeamInvite | null>;
  static findOne(query): Promise<TeamInvite | null>;
  static paginate(options): Promise<{ data; count; totalPages }>;
  static create(data): Promise<TeamInvite>;
  static revokeById(id, userId): Promise<TeamInvite | null>;
  static consume(inviteId, githubUser): Promise<ConsumeResult>; // delegates
}
```

CRUD methods are inline (~5–10 lines each). `consume` delegates to `consumeTeamInvite.server.ts`.

## Authorization

Extend `TeamAuthorization`:

```ts
TeamAuthorization.Invites = {
  canView(user, teamId): boolean      // same as Users.canInvite
  canCreate(user, teamId): boolean    // same as Users.canInvite
  canRevoke(user, teamId): boolean    // same as Users.canInvite
}
```

Auth is verified independently in **every** action (never relying on the loader). Every nested fetch is scoped: `findOne({ _id: params.inviteLinkId, team: params.id })` — never `findById(params.inviteLinkId)` — to prevent cross-team IDOR.

Action intents on `teamInviteLinks.route.tsx`:

- `CREATE_TEAM_INVITE_LINK` — payload: `{ name, maxUses }`
- `REVOKE_TEAM_INVITE_LINK` — payload: `{ inviteLinkId }`

Validation:

- `name` — trimmed non-empty, ≤ 100 chars
- `maxUses` — integer, 1..500
- `role` — ignored if present; always MEMBER
- Invalid input → `data({ errors: {...} }, { status: 400 })`

## Event tracking

Events fire via `trackServerEvent` (existing helper in `app/modules/analytics/helpers/trackServerEvent.server.ts`). All tracking lives inline in the signup flow (no worker needed).

1. **`user_registered`** — existing event, reused when a new user is created via multi-use link. Same payload shape as today.
2. **`team_invite_signup`** — new event, fired in `consumeTeamInvite.server.ts` on every successful use (not on the "already in team" no-op). Params:
   ```ts
   { team_invite_id: string, team_id: string, is_new_user: boolean }
   ```
3. **`team_invite_link_created`** — new event, fired on link creation. Params: `{ team_id: string, max_uses: number }`.

Revocation is not tracked as an event (infrequent; `revokedAt` in DB suffices if needed).

## Testing

### New test files

```
app/modules/teams/__tests__/
├── teamInviteLinks.route.test.ts        # loader + action: auth, IDOR, validation, create/revoke
├── teamInviteLink.route.test.ts         # detail view: auth, IDOR, signup listing, revoke
├── join.route.test.ts                   # public landing: valid / expired / full / revoked / not_found
├── consumeTeamInvite.test.ts            # 3 scenarios + race + status checks + event firing
└── authorization.test.ts                # extend with Invites.* cases
```

### Critical test cases

1. **`consumeTeamInvite`**
   - New user → account created with `teams[0].viaTeamInvite` set, both events fired.
   - Existing user, not in team → team pushed with `viaTeamInvite` on the new membership entry; `team_invite_signup` with `is_new_user: false`.
   - Existing user, already in team → no-op (no increment, no audit mutation, no event).
   - Concurrent calls at `usedCount: maxUses - 1` → one succeeds, the other gets `INVITE_FULL`.
   - Revoked / expired / full links → correct per-reason error.

2. **Route authorization** — non-admin denied on list, create, revoke, detail; super admin allowed.

3. **IDOR** — `/teams/TEAM_A/invite-links/INVITE_FROM_TEAM_B` returns 404/redirect, no leaked metadata. Same for detail loader, revoke action, signups listing.

4. **Input validation** — name empty / > 100 / whitespace-only → 400. maxUses 0 / 501 / negative / non-integer / string → 400. Role in payload is ignored (MEMBER always).

5. **Landing page** — per-reason status returned correctly for each state.

6. **Single-use flow unchanged** — existing `generateInviteToTeam.route.test.ts` and auth tests continue to pass.

## Observability

- **DocumentDB compatibility:** no aggregation pipelines needed in v1. Signups list = `User.find({ "teams.viaTeamInvite": inviteId })`. Invite list = `TeamInviteService.paginate()`. The race-safe consume uses `findOneAndUpdate` with `$expr` (DocumentDB-supported). If future analytics need per-invite aggregates, use `Promise.all` with separate queries (no `$facet`).
- **Debug logging:** `console.log` statements in `consumeTeamInvite.server.ts` at each decision point (invite loaded, atomic update result, scenario chosen, user created/updated) during development, per team preference for verifiable data-shape tracing.
- **Analytics:** the disjoint `/join/:id` URL means existing GA / server-event wiring starts reporting it under a new route pattern automatically. No extra instrumentation beyond the three events listed above.

## Out of scope / deferred

- Admin ability to edit `maxUses` on an existing link — product decision: create new link instead.
- Per-link branded landing page (showing the link `name` to invitees) — one-prop change if later wanted.
- `team_invite_link_revoked` event — cheap to add later.
- Non-MEMBER roles on multi-use links — schema supports, UI does not.
- Hard deletion of links — retained for audit permanently.
