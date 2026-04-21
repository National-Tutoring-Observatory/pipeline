# Already-member Invite Toast — Design

## Problem

When a user clicks `/join/:slug` for a team they're already a member of, the current `consumeTeamInvite` returns `already_member` and `handleTeamInviteSignup` falls through silently — the user completes OAuth with no indication their click did anything. Per the final code review on #2065, this is a visible UX gap that should be addressed.

## Goal

The `already_member` user is logged in via the OAuth they just completed, lands on a normal page, and sees a toast confirming they're already a member of the team. No redirect-to-team (rejected in brainstorming) and no dedicated info page that creates false CTAs.

## Non-goals

- Changing behaviour for any other invite scenario (new / existing-joined / expired / full / revoked — all unchanged)
- Redirecting to the team page — the user hasn't taken any new action, so the landing page shouldn't shift
- A full cross-cutting flash/notification framework — just enough to carry one-shot toasts through server redirects

## Design

### Generic flash-toast mechanism in `app/root.tsx`

Add a small, reusable hook for "flash a toast message that fires on the next page load":

1. **Loader** reads `session.get("flashToast")`. If present, include in loaderData AND commit the session (so the flash is consumed). Normal loads skip the commit — no cookie churn.
2. **App component** calls `toast(message)` in a `useEffect` when `flashToast` is set.

About 15 lines net. Any server code that wants to fire a toast after a redirect can:

```ts
session.flash("flashToast", "Message");
// commit session → Set-Cookie → throw redirect with that header
```

### `already_member` handler in the GitHub strategy

Modify `handleTeamInviteSignup.server.ts` to accept `request` so it can manipulate the session. For `already_member`:

```ts
const session = await sessionStorage.getSession(request.headers.get("cookie"));
session.set("user", result.user);
session.flash("flashToast", `You're already a member of this team`);
const cookie = await sessionStorage.commitSession(session);
throw redirect("/", { headers: { "Set-Cookie": cookie } });
```

Key points:

- `session.set("user", user)` manually does what `authCallback.route.tsx` would have done — logs the user in.
- `session.flash("flashToast", ...)` queues the one-shot message.
- `commitSession` returns a new cookie with both the user and the flash.
- `throw redirect("/", { headers: Set-Cookie })` exits the strategy cleanly, carrying the cookie on the response.

The user lands on `/` (their default dashboard), authenticated, and sees the toast once.

### Other invite-outcome paths — unchanged

- `expired` / `full` / `revoked` / `not_found` → unchanged, still throw redirect to `/signup?error=...`
- `success` → unchanged, returns the user for the normal authCallback path

## Files affected

- `app/root.tsx` — loader + App component
- `app/modules/authentication/helpers/handleTeamInviteSignup.server.ts` — add `request` param and the already_member branch
- `app/modules/authentication/helpers/githubStrategy.ts` — pass `request` through to `handleTeamInviteSignup`

## Testing

- `handleTeamInviteSignup.test.ts` (new or extend consumeTeamInvite tests) — verify the already_member path commits a session with user + flash and throws a redirect to `/` with a Set-Cookie header.
- Root loader/component test — verify flashToast path wires the toast correctly. Existing tests shouldn't be affected.
- Manual smoke: log in with GitHub, join a team via invite, click the same invite again, confirm toast + landing page.

## Out of scope / deferred

- Typed toast variants (info / success / warning) — current `toast(message)` with default style is enough for v1.
- A broader notification/flash framework — defer until a second use case appears.
