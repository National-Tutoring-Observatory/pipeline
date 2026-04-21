# Already-member Invite Toast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a user clicks `/join/:slug` for a team they're already in, log them in via the OAuth attempt they just completed and show a toast saying they're already a member — instead of the current silent fall-through.

**Architecture:** Add a generic flash-toast mechanism in `root.tsx` (session key `flashToast`, one-shot, consumed on read). In `handleTeamInviteSignup.server.ts`, handle the `already_member` case by manually committing the session with `session.set("user", user)` + `session.flash("flashToast", ...)` and throwing a redirect with the Set-Cookie header.

**Tech Stack:** TypeScript, React Router v7, remix-auth, Sonner (existing toast library), Mongoose/MongoDB, Vitest.

**Spec:** [`specs/2026-04-21-already-member-invite-toast-design.md`](../specs/2026-04-21-already-member-invite-toast-design.md)

**Commit conventions:** Branch is `issue/#2065` — include `Fixes #2065` in each commit message. **Never** add `Co-Authored-By: Claude` trailers.

---

## Task 1: Add flash-toast mechanism to root.tsx

**Files:**

- Modify: `app/root.tsx`

### Step 1: Update imports

Change the `sonner` import from `import { Toaster } from "sonner";` to include `toast`, and add `sessionStorage`:

```ts
import { Toaster, toast } from "sonner";
import sessionStorage from "../sessionStorage";
```

### Step 2: Update the loader to read + consume a `flashToast` session value

Replace the current `loader` in `app/root.tsx`:

```ts
export async function loader({ request }: Route.LoaderArgs) {
  let maintenanceMode = false;
  try {
    maintenanceMode = await SystemSettingsService.isMaintenanceMode();
  } catch {
    // DB not ready or unavailable — default to false
  }

  const url = new URL(request.url);
  const isExempt = TERMS_EXEMPT_PATHS.some((p) => url.pathname.startsWith(p));

  if (!isExempt) {
    const user = await getSessionUser({ request });
    if (user && (!user.onboardingComplete || !user.termsAcceptedAt)) {
      return redirect("/onboarding");
    }
  }

  // Read and consume one-shot flash toast from session
  const session = await sessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const flashToast = session.get("flashToast") as string | undefined;

  return Response.json(
    {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || null,
      maintenanceMode,
      flashToast: flashToast ?? null,
    },
    flashToast
      ? {
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
        }
      : undefined,
  );
}
```

Key detail: the `Set-Cookie` header is only attached when a flash was consumed. Normal page loads stay as plain loader returns (no cookie churn).

### Step 3: Update the App component to fire the toast

Replace the `App` export in `app/root.tsx`:

```ts
export default function App() {
  const { googleAnalyticsId, flashToast } = useLoaderData<typeof loader>();
  useGoogleAnalytics(googleAnalyticsId);

  useEffect(() => {
    if (flashToast) toast(flashToast);
  }, [flashToast]);

  return <Outlet />;
}
```

### Step 4: Typecheck

Run: `yarn typecheck`
Expected: clean.

### Step 5: Run the full test suite to confirm no regressions

Run: `yarn test 2>&1 | tail -5`
Expected: all tests pass. The loader now returns a `Response.json(...)` instead of a plain object, but `useLoaderData` handles both identically.

### Step 6: Commit

```bash
git add app/root.tsx
git commit -m "Add generic flashToast mechanism to root loader

Fixes #2065"
```

---

## Task 2: Wire already_member toast through handleTeamInviteSignup + githubStrategy

Combined commit — the signature change in `handleTeamInviteSignup.server.ts` requires an update in `githubStrategy.ts`. Typecheck only passes with both in place.

**Files:**

- Modify: `app/modules/authentication/helpers/handleTeamInviteSignup.server.ts`
- Modify: `app/modules/authentication/helpers/githubStrategy.ts`
- Test: `app/modules/authentication/__tests__/handleTeamInviteSignup.test.ts` (new)

### Step 1: Write failing test for the already_member branch

Create `app/modules/authentication/__tests__/handleTeamInviteSignup.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import handleTeamInviteSignup from "../helpers/handleTeamInviteSignup.server";
import { TeamInviteService } from "~/modules/teams/teamInvites";
import { TeamService } from "~/modules/teams/team";
import { UserService } from "~/modules/users/user";

async function captureThrow(promise: Promise<unknown>): Promise<Response> {
  try {
    await promise;
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }
  throw new Error("Expected handler to throw a Response, but it resolved");
}

describe("handleTeamInviteSignup already_member", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("logs the user in, flashes a toast, and redirects to /", async () => {
    const team = await TeamService.create({ name: "Existing Team" });
    const existing = await UserService.create({
      username: "existing",
      githubId: 42,
      hasGithubSSO: true,
      isRegistered: true,
      teams: [{ team: team._id, role: "MEMBER" }],
    });
    const invite = await TeamInviteService.create({
      team: team._id,
      name: "Test Invite",
      maxUses: 5,
      createdBy: existing._id,
    });

    const request = new Request("http://localhost/auth/github", {
      headers: { cookie: "" },
    });

    const response = await captureThrow(
      handleTeamInviteSignup({
        teamInviteId: invite._id,
        githubUser: { id: 42, login: "existing", name: "Existing" },
        emails: [{ primary: true, email: "existing@example.com" }],
        request,
      }),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/");

    const setCookie = response.headers.get("Set-Cookie");
    expect(setCookie).toBeTruthy();
    // Session cookie name is configured in sessionStorage — check that the
    // Set-Cookie header was written (the specific name is an implementation
    // detail that could change).
    expect(setCookie).toMatch(/=.+/);
  });
});
```

### Step 2: Run test — expect failure

Run: `yarn test app/modules/authentication/__tests__/handleTeamInviteSignup.test.ts`
Expected: FAIL. Either "request is not a known property" or the test completes but the Location is `/signup?error=EXPIRED_INVITE` (the current already_member fall-through doesn't throw; the test's `captureThrow` will error with "Expected handler to throw a Response, but it resolved").

### Step 3: Update `handleTeamInviteSignup.server.ts`

Replace the entire contents of `app/modules/authentication/helpers/handleTeamInviteSignup.server.ts`:

```ts
import find from "lodash/find";
import { redirect } from "react-router";
import consumeTeamInvite from "~/modules/teams/services/consumeTeamInvite.server";
import sessionStorage from "../../../../sessionStorage";

export default async function handleTeamInviteSignup({
  teamInviteId,
  githubUser,
  emails,
  request,
}: {
  teamInviteId: string;
  githubUser: { id: number; login: string; name?: string };
  emails: Array<{ primary?: boolean; email: string }>;
  request: Request;
}) {
  const primaryEmail =
    (
      find(emails, (e: { primary?: boolean; email: string }) => !!e.primary) ||
      emails[0] || { email: "" }
    ).email || "";

  const result = await consumeTeamInvite({
    inviteId: teamInviteId,
    githubUser,
    primaryEmail,
  });

  if (result.status === "expired")
    throw redirect("/signup?error=EXPIRED_INVITE");
  if (result.status === "full") throw redirect("/signup?error=INVITE_FULL");
  if (result.status === "revoked")
    throw redirect("/signup?error=INVITE_REVOKED");
  if (result.status === "not_found")
    throw redirect("/signup?error=EXPIRED_INVITE");

  if (result.status === "already_member") {
    const session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );
    session.set("user", result.user);
    session.flash("flashToast", "You're already a member of this team");
    const cookie = await sessionStorage.commitSession(session);
    throw redirect("/", { headers: { "Set-Cookie": cookie } });
  }

  return result.user!;
}
```

### Step 4: Update `githubStrategy.ts` to pass `request` through

In `app/modules/authentication/helpers/githubStrategy.ts`, locate the teamInviteId branch around line 45–51:

```ts
const teamInviteId = session.get("teamInviteId");
if (teamInviteId) {
  const handleTeamInviteSignup = (
    await import("./handleTeamInviteSignup.server")
  ).default;
  return handleTeamInviteSignup({ teamInviteId, githubUser, emails });
}
```

Replace with:

```ts
const teamInviteId = session.get("teamInviteId");
if (teamInviteId) {
  const handleTeamInviteSignup = (
    await import("./handleTeamInviteSignup.server")
  ).default;
  return handleTeamInviteSignup({
    teamInviteId,
    githubUser,
    emails,
    request,
  });
}
```

### Step 5: Run the new test — expect pass

Run: `yarn test app/modules/authentication/__tests__/handleTeamInviteSignup.test.ts`
Expected: PASS (1 test).

### Step 6: Run the broader auth test suite to confirm no regressions

Run: `yarn test app/modules/authentication 2>&1 | tail -10`
Expected: all existing auth tests still pass. The happy-path signup flow (success / expired / full / revoked) is unchanged.

### Step 7: Typecheck

Run: `yarn typecheck`
Expected: clean.

### Step 8: Commit

```bash
git add \
  app/modules/authentication/helpers/handleTeamInviteSignup.server.ts \
  app/modules/authentication/helpers/githubStrategy.ts \
  app/modules/authentication/__tests__/handleTeamInviteSignup.test.ts
git commit -m "Log in and toast already-member invitees instead of silent fall-through

Fixes #2065"
```

---

## Task 3: Manual smoke test

**Files:** none — verification only.

- [ ] **Step 1: Run the full test suite one more time**

Run: `yarn test 2>&1 | tail -5`
Expected: all pass.

- [ ] **Step 2: Run the build**

Run: `yarn app:build 2>&1 | tail -5`
Expected: build succeeds.

- [ ] **Step 3: Local smoke**

1. Start Redis, workers, dev server (`yarn local:redis`, `yarn workers:dev`, `yarn app:dev`).
2. As an admin of some team, create an invite link and copy the `/join/:slug` URL.
3. In the same session (logged in, already a member of that team), paste the URL and click through — verify:
   - After OAuth, you land on `/` (or onboarding if incomplete).
   - A toast appears: "You're already a member of this team".
   - You remain logged in.
4. Log out. Repeat from step 3 in an incognito window with a GitHub account that's already a member of the team (if you have a test account handy). Confirm the same behaviour.
5. Verify all the OTHER invite paths still work correctly:
   - New-user signup via `/join/:slug` → team added, onboarding redirect.
   - Existing-user-not-in-team → team added, lands on default.
   - Expired / full / revoked invite → `/signup?error=...` with correct message.

- [ ] **Step 4: Commit only if fixes were made**

If no fixes needed, no commit. Otherwise:

```bash
git add -u
git commit -m "Fix <specific issue found in smoke test>

Fixes #2065"
```

---

## Self-Review Checklist

- [ ] Spec fully covered (flash-toast mechanism + already_member handling + tests)
- [ ] `yarn typecheck` clean
- [ ] `yarn test` green
- [ ] `yarn app:build` succeeds
- [ ] Manual smoke: already-member user sees toast, stays logged in, lands on `/`. Other invite paths unaffected.
