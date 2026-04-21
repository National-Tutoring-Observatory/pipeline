# Multi-use Team Invite Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add named, capped, revocable, shareable invite links for teams (e.g., conference signups) while leaving the existing single-use invite flow untouched.

**Architecture:** New `TeamInvite` mongoose collection with a readable slug for the public `/join/:slug` URL. Users carry attribution on each embedded team-membership (`teams[].viaTeamInvite`) so audit history survives across multiple link signups. Consumption is a single atomic `findOneAndUpdate` to prevent over-capacity races. Admin UI lives in a new "Invite links" tab on the team page; creation, revocation, and signup auditing are all scoped to that tab.

**Tech Stack:** TypeScript, React 19, React Router v7 (loader/action), Vitest, Mongoose (MongoDB/DocumentDB), Yarn, existing `Collection` UI component, shadcn/ui primitives, `trackServerEvent` for GA4.

**Spec:** [`specs/2026-04-20-multi-use-team-invite-links-design.md`](../specs/2026-04-20-multi-use-team-invite-links-design.md)

**Commit message convention:** Branch name starts with `2065-...` style → include `Fixes #2065` in each commit. **Never** add `Co-Authored-By: Claude` lines.

---

## Task 1: Add slugify dependency + create slug helper

**Files:**

- Modify: `package.json` (add `slugify` dependency)
- Create: `app/modules/teams/helpers/generateTeamInviteSlug.ts`
- Test: `app/modules/teams/__tests__/generateTeamInviteSlug.test.ts`

- [ ] **Step 1: Install slugify**

Run: `yarn add slugify`
Expected: `slugify` added to `dependencies` in `package.json`, yarn.lock updated.

- [ ] **Step 2: Write failing test for slug helper**

Create `app/modules/teams/__tests__/generateTeamInviteSlug.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import generateTeamInviteSlug from "../helpers/generateTeamInviteSlug";

describe("generateTeamInviteSlug", () => {
  it("lowercases and hyphenates the name", () => {
    const slug = generateTeamInviteSlug("Learning Conference Norway");
    expect(slug).toMatch(/^learning-conference-norway-[a-f0-9]{8}$/);
  });

  it("strips punctuation and diacritics", () => {
    const slug = generateTeamInviteSlug("NTO: Fall '26 — Kick-off!");
    expect(slug).toMatch(/^nto-fall-26-kick-off-[a-f0-9]{8}$/);
  });

  it("appends an 8-char random hex suffix", () => {
    const slug = generateTeamInviteSlug("Test");
    const suffix = slug.split("-").pop()!;
    expect(suffix).toHaveLength(8);
    expect(suffix).toMatch(/^[a-f0-9]{8}$/);
  });

  it("produces distinct suffixes on repeated calls", () => {
    const a = generateTeamInviteSlug("Test");
    const b = generateTeamInviteSlug("Test");
    expect(a).not.toBe(b);
  });

  it("falls back to 'invite' when the name slugifies to empty", () => {
    const slug = generateTeamInviteSlug("!!! ???");
    expect(slug).toMatch(/^invite-[a-f0-9]{8}$/);
  });
});
```

- [ ] **Step 3: Run tests — expect failure**

Run: `yarn test app/modules/teams/__tests__/generateTeamInviteSlug.test.ts`
Expected: FAIL — "Cannot find module '../helpers/generateTeamInviteSlug'".

- [ ] **Step 4: Implement the helper**

Create `app/modules/teams/helpers/generateTeamInviteSlug.ts`:

```ts
import crypto from "crypto";
import slugify from "slugify";

export default function generateTeamInviteSlug(name: string): string {
  const base =
    slugify(name, { lower: true, strict: true, trim: true }) || "invite";
  const suffix = crypto.randomBytes(4).toString("hex");
  return `${base}-${suffix}`;
}
```

- [ ] **Step 5: Run tests — expect pass**

Run: `yarn test app/modules/teams/__tests__/generateTeamInviteSlug.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json yarn.lock app/modules/teams/helpers/generateTeamInviteSlug.ts app/modules/teams/__tests__/generateTeamInviteSlug.test.ts
git commit -m "Add slugify dep and generateTeamInviteSlug helper

Fixes #2065"
```

---

## Task 2: Create TeamInvite mongoose schema + types + status helper

**Files:**

- Create: `app/lib/schemas/teamInvite.schema.ts`
- Create: `app/modules/teams/teamInvites.types.ts`
- Create: `app/modules/teams/helpers/getTeamInviteStatus.ts`
- Test: `app/modules/teams/__tests__/getTeamInviteStatus.test.ts`

- [ ] **Step 1: Create the mongoose schema**

Create `app/lib/schemas/teamInvite.schema.ts`:

```ts
import mongoose from "mongoose";

export default new mongoose.Schema({
  team: { type: mongoose.Types.ObjectId, ref: "Team", required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ["MEMBER"], default: "MEMBER" },
  maxUses: { type: Number, required: true, min: 1, max: 500 },
  usedCount: { type: Number, default: 0, min: 0 },
  revokedAt: { type: Date },
  revokedBy: { type: mongoose.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Types.ObjectId, ref: "User" },
});
```

- [ ] **Step 2: Create the TeamInvite type**

Create `app/modules/teams/teamInvites.types.ts`:

```ts
export interface TeamInvite {
  _id: string;
  team: string;
  name: string;
  slug: string;
  role: "MEMBER";
  maxUses: number;
  usedCount: number;
  revokedAt?: string;
  revokedBy?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type TeamInviteStatus = "active" | "revoked" | "full" | "expired";
```

- [ ] **Step 3: Write failing test for status helper**

Create `app/modules/teams/__tests__/getTeamInviteStatus.test.ts`:

```ts
import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import getTeamInviteStatus from "../helpers/getTeamInviteStatus";
import type { TeamInvite } from "../teamInvites.types";

const baseInvite: TeamInvite = {
  _id: "1",
  team: "t1",
  name: "Test",
  slug: "test-abcd1234",
  role: "MEMBER",
  maxUses: 10,
  usedCount: 0,
  createdAt: new Date().toISOString(),
  createdBy: "u1",
};

describe("getTeamInviteStatus", () => {
  it("returns 'active' for a fresh, under-capacity, un-revoked invite", () => {
    expect(getTeamInviteStatus(baseInvite)).toBe("active");
  });

  it("returns 'revoked' when revokedAt is set (takes precedence)", () => {
    expect(
      getTeamInviteStatus({
        ...baseInvite,
        revokedAt: new Date().toISOString(),
        usedCount: 999,
      }),
    ).toBe("revoked");
  });

  it("returns 'full' when usedCount >= maxUses", () => {
    expect(
      getTeamInviteStatus({ ...baseInvite, usedCount: 10, maxUses: 10 }),
    ).toBe("full");
  });

  it("returns 'expired' when older than INVITE_LINK_TTL_DAYS", () => {
    expect(
      getTeamInviteStatus({
        ...baseInvite,
        createdAt: dayjs().subtract(8, "day").toISOString(),
      }),
    ).toBe("expired");
  });

  it("returns 'active' at TTL boundary (just inside)", () => {
    expect(
      getTeamInviteStatus({
        ...baseInvite,
        createdAt: dayjs().subtract(6, "day").toISOString(),
      }),
    ).toBe("active");
  });
});
```

- [ ] **Step 4: Run test — expect failure**

Run: `yarn test app/modules/teams/__tests__/getTeamInviteStatus.test.ts`
Expected: FAIL — "Cannot find module '../helpers/getTeamInviteStatus'".

- [ ] **Step 5: Implement the status helper**

Create `app/modules/teams/helpers/getTeamInviteStatus.ts`:

```ts
import dayjs from "dayjs";
import INVITE_LINK_TTL_DAYS from "./inviteLink";
import type { TeamInvite, TeamInviteStatus } from "../teamInvites.types";

export default function getTeamInviteStatus(
  invite: TeamInvite,
): TeamInviteStatus {
  if (invite.revokedAt) return "revoked";
  if (invite.usedCount >= invite.maxUses) return "full";
  if (
    dayjs().isAfter(dayjs(invite.createdAt).add(INVITE_LINK_TTL_DAYS, "day"))
  ) {
    return "expired";
  }
  return "active";
}
```

- [ ] **Step 6: Run test — expect pass**

Run: `yarn test app/modules/teams/__tests__/getTeamInviteStatus.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 7: Typecheck the new files**

Run: `yarn typecheck`
Expected: No new errors.

- [ ] **Step 8: Commit**

```bash
git add app/lib/schemas/teamInvite.schema.ts app/modules/teams/teamInvites.types.ts app/modules/teams/helpers/getTeamInviteStatus.ts app/modules/teams/__tests__/getTeamInviteStatus.test.ts
git commit -m "Add TeamInvite schema, types, and status helper

Fixes #2065"
```

---

## Task 3: Extend User schema with `viaTeamInvite` on team memberships

**Files:**

- Modify: `app/lib/schemas/user.schema.ts`
- Modify: `app/modules/users/users.types.ts`

- [ ] **Step 1: Add `viaTeamInvite` to the team membership subdoc**

Edit `app/lib/schemas/user.schema.ts` — update the `teams` array:

```ts
teams: [
  {
    team: { type: mongoose.Types.ObjectId, ref: "Team" },
    role: { type: String, enum: ["ADMIN", "MEMBER"] },
    viaTeamInvite: { type: mongoose.Types.ObjectId, ref: "TeamInvite" },
    _id: false,
  },
],
```

- [ ] **Step 2: Add `viaTeamInvite` to the `UserTeam` type**

Read `app/modules/users/users.types.ts` first to confirm shape, then add `viaTeamInvite?: string` to the `UserTeam` interface.

- [ ] **Step 3: Run typecheck and full test suite**

Run: `yarn typecheck && yarn test`
Expected: No new errors, all existing tests pass. The new field is optional and unused by existing code.

- [ ] **Step 4: Commit**

```bash
git add app/lib/schemas/user.schema.ts app/modules/users/users.types.ts
git commit -m "Add viaTeamInvite to user team memberships

Fixes #2065"
```

---

## Task 4: Build TeamInviteService facade (CRUD + create with slug + revokeById)

**Files:**

- Create: `app/modules/teams/teamInvites.ts`
- Test: `app/modules/teams/__tests__/teamInvites.test.ts`

- [ ] **Step 1: Write failing tests for the service**

Create `app/modules/teams/__tests__/teamInvites.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { TeamInviteService } from "../teamInvites";

describe("TeamInviteService", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  describe("create", () => {
    it("creates an invite with a generated slug", async () => {
      const invite = await TeamInviteService.create({
        team: "507f1f77bcf86cd799439011",
        name: "Learning Conference Norway",
        maxUses: 20,
        createdBy: "507f1f77bcf86cd799439012",
      });
      expect(invite.slug).toMatch(/^learning-conference-norway-[a-f0-9]{8}$/);
      expect(invite.usedCount).toBe(0);
      expect(invite.role).toBe("MEMBER");
      expect(invite.maxUses).toBe(20);
    });

    it("assigns a unique slug even for duplicate names", async () => {
      const base = {
        team: "507f1f77bcf86cd799439011",
        name: "Same Name",
        maxUses: 5,
        createdBy: "507f1f77bcf86cd799439012",
      };
      const a = await TeamInviteService.create(base);
      const b = await TeamInviteService.create(base);
      expect(a.slug).not.toBe(b.slug);
    });
  });

  describe("findOne", () => {
    it("looks up an invite by slug", async () => {
      const created = await TeamInviteService.create({
        team: "507f1f77bcf86cd799439011",
        name: "Slug Lookup Test",
        maxUses: 5,
        createdBy: "507f1f77bcf86cd799439012",
      });
      const found = await TeamInviteService.findOne({ slug: created.slug });
      expect(found?._id).toBe(created._id);
    });

    it("returns null for an unknown slug", async () => {
      const found = await TeamInviteService.findOne({ slug: "does-not-exist" });
      expect(found).toBeNull();
    });
  });

  describe("revokeById", () => {
    it("sets revokedAt and revokedBy", async () => {
      const invite = await TeamInviteService.create({
        team: "507f1f77bcf86cd799439011",
        name: "Revoke Test",
        maxUses: 5,
        createdBy: "507f1f77bcf86cd799439012",
      });
      const userId = "507f1f77bcf86cd799439099";
      const revoked = await TeamInviteService.revokeById(invite._id, userId);
      expect(revoked?.revokedAt).toBeDefined();
      expect(revoked?.revokedBy).toBe(userId);
    });

    it("returns null for an unknown id", async () => {
      const result = await TeamInviteService.revokeById(
        "507f1f77bcf86cd7994390ff",
        "507f1f77bcf86cd799439099",
      );
      expect(result).toBeNull();
    });
  });

  describe("paginate", () => {
    it("returns data with count and totalPages", async () => {
      for (let i = 0; i < 3; i++) {
        await TeamInviteService.create({
          team: "507f1f77bcf86cd799439011",
          name: `Invite ${i}`,
          maxUses: 5,
          createdBy: "507f1f77bcf86cd799439012",
        });
      }
      const result = await TeamInviteService.paginate({
        match: { team: "507f1f77bcf86cd799439011" },
        page: 1,
        pageSize: 10,
      });
      expect(result.data).toHaveLength(3);
      expect(result.count).toBe(3);
      expect(result.totalPages).toBe(1);
    });
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `yarn test app/modules/teams/__tests__/teamInvites.test.ts`
Expected: FAIL — "Cannot find module '../teamInvites'".

- [ ] **Step 3: Implement the service**

Create `app/modules/teams/teamInvites.ts`:

```ts
import mongoose from "mongoose";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import teamInviteSchema from "~/lib/schemas/teamInvite.schema";
import type { FindOptions, PaginateProps } from "~/modules/common/types";
import generateTeamInviteSlug from "./helpers/generateTeamInviteSlug";
import type { TeamInvite } from "./teamInvites.types";

const TeamInviteModel =
  mongoose.models.TeamInvite || mongoose.model("TeamInvite", teamInviteSchema);

export class TeamInviteService {
  private static toTeamInvite(doc: mongoose.Document): TeamInvite {
    return doc.toJSON({ flattenObjectIds: true }) as TeamInvite;
  }

  static async find(options?: FindOptions): Promise<TeamInvite[]> {
    const match = options?.match || {};
    let query = TeamInviteModel.find(match);
    if (options?.sort) query = query.sort(options.sort);
    if (options?.pagination) {
      query = query
        .skip(options.pagination.skip)
        .limit(options.pagination.limit);
    }
    const docs = await query.exec();
    return docs.map((doc) => this.toTeamInvite(doc));
  }

  static async count(match: Record<string, unknown> = {}): Promise<number> {
    return TeamInviteModel.countDocuments(match);
  }

  static async paginate({
    match,
    sort,
    page,
    pageSize,
  }: PaginateProps): Promise<{
    data: TeamInvite[];
    count: number;
    totalPages: number;
  }> {
    const pagination = getPaginationParams(page, pageSize);
    const results = await this.find({ match, sort, pagination });
    const count = await this.count(match);
    return {
      data: results,
      count,
      totalPages: getTotalPages(count, pageSize),
    };
  }

  static async findById(id: string | undefined): Promise<TeamInvite | null> {
    if (!id) return null;
    const doc = await TeamInviteModel.findById(id);
    return doc ? this.toTeamInvite(doc) : null;
  }

  static async findOne(
    query: Record<string, unknown>,
  ): Promise<TeamInvite | null> {
    const doc = await TeamInviteModel.findOne(query);
    return doc ? this.toTeamInvite(doc) : null;
  }

  static async create(data: {
    team: string;
    name: string;
    maxUses: number;
    createdBy: string;
  }): Promise<TeamInvite> {
    const payload = {
      team: data.team,
      name: data.name,
      maxUses: data.maxUses,
      createdBy: data.createdBy,
      role: "MEMBER",
      usedCount: 0,
    };
    for (let attempt = 0; attempt < 2; attempt++) {
      const slug = generateTeamInviteSlug(data.name);
      try {
        const doc = await TeamInviteModel.create({ ...payload, slug });
        return this.toTeamInvite(doc);
      } catch (err: unknown) {
        const isDuplicate =
          typeof err === "object" &&
          err !== null &&
          (err as { code?: number }).code === 11000;
        if (!isDuplicate || attempt === 1) throw err;
      }
    }
    throw new Error("Failed to generate unique slug");
  }

  static async revokeById(
    id: string,
    userId: string,
  ): Promise<TeamInvite | null> {
    const doc = await TeamInviteModel.findByIdAndUpdate(
      id,
      {
        revokedAt: new Date(),
        revokedBy: userId,
        updatedAt: new Date(),
        updatedBy: userId,
      },
      { new: true },
    ).exec();
    return doc ? this.toTeamInvite(doc) : null;
  }
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `yarn test app/modules/teams/__tests__/teamInvites.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Typecheck**

Run: `yarn typecheck`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add app/modules/teams/teamInvites.ts app/modules/teams/__tests__/teamInvites.test.ts
git commit -m "Add TeamInviteService with CRUD, slug generation, and revokeById

Fixes #2065"
```

---

## Task 5: Extend TeamAuthorization with `Invites.*`

**Files:**

- Modify: `app/modules/teams/authorization.ts`
- Modify: `app/modules/teams/__tests__/authorization.test.ts`

- [ ] **Step 1: Write failing authorization tests**

Append to `app/modules/teams/__tests__/authorization.test.ts` (inside the top-level `describe`):

```ts
describe("Invites", () => {
  it("allows team admins to view, create, and revoke invite links", () => {
    expect(TeamAuthorization.Invites.canView(teamAdminUser, "team-1")).toBe(
      true,
    );
    expect(TeamAuthorization.Invites.canCreate(teamAdminUser, "team-1")).toBe(
      true,
    );
    expect(TeamAuthorization.Invites.canRevoke(teamAdminUser, "team-1")).toBe(
      true,
    );
  });

  it("denies team members from creating or revoking invite links", () => {
    expect(TeamAuthorization.Invites.canCreate(teamMemberUser, "team-1")).toBe(
      false,
    );
    expect(TeamAuthorization.Invites.canRevoke(teamMemberUser, "team-1")).toBe(
      false,
    );
  });

  it("denies non-team users", () => {
    expect(TeamAuthorization.Invites.canView(nonTeamUser, "team-1")).toBe(
      false,
    );
    expect(TeamAuthorization.Invites.canCreate(nonTeamUser, "team-1")).toBe(
      false,
    );
    expect(TeamAuthorization.Invites.canRevoke(nonTeamUser, "team-1")).toBe(
      false,
    );
  });

  it("allows super admins", () => {
    expect(TeamAuthorization.Invites.canView(superAdminUser, "any-team")).toBe(
      true,
    );
    expect(
      TeamAuthorization.Invites.canCreate(superAdminUser, "any-team"),
    ).toBe(true);
    expect(
      TeamAuthorization.Invites.canRevoke(superAdminUser, "any-team"),
    ).toBe(true);
  });

  it("denies null users", () => {
    expect(TeamAuthorization.Invites.canView(null, "team-1")).toBe(false);
    expect(TeamAuthorization.Invites.canCreate(null, "team-1")).toBe(false);
    expect(TeamAuthorization.Invites.canRevoke(null, "team-1")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `yarn test app/modules/teams/__tests__/authorization.test.ts`
Expected: FAIL — "Cannot read properties of undefined (reading 'canView')" on `TeamAuthorization.Invites`.

- [ ] **Step 3: Add `Invites` to the authorization module**

Edit `app/modules/teams/authorization.ts`. Add the `Invites` block inside the `TeamAuthorization` object (match the existing `Users` block pattern):

```ts
  Invites: {
    canView(user: User | null, teamId: string): boolean {
      return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
    },

    canCreate(user: User | null, teamId: string): boolean {
      return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
    },

    canRevoke(user: User | null, teamId: string): boolean {
      return userIsSuperAdmin(user) || userIsTeamAdmin(user, teamId);
    },
  },
```

- [ ] **Step 4: Run test — expect pass**

Run: `yarn test app/modules/teams/__tests__/authorization.test.ts`
Expected: PASS (all existing + 5 new).

- [ ] **Step 5: Commit**

```bash
git add app/modules/teams/authorization.ts app/modules/teams/__tests__/authorization.test.ts
git commit -m "Add TeamAuthorization.Invites for invite-link permissions

Fixes #2065"
```

---

## Task 6: Build `consumeTeamInvite` service — the three signup scenarios

**Files:**

- Create: `app/modules/teams/services/consumeTeamInvite.server.ts`
- Test: `app/modules/teams/__tests__/consumeTeamInvite.test.ts`

This task focuses on the three non-race scenarios. Race safety is Task 7.

- [ ] **Step 1: Write failing tests for the three scenarios**

Create `app/modules/teams/__tests__/consumeTeamInvite.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { TeamService } from "../team";
import { TeamInviteService } from "../teamInvites";
import { UserService } from "~/modules/users/user";
import consumeTeamInvite from "../services/consumeTeamInvite.server";

vi.mock("~/modules/analytics/helpers/trackServerEvent.server", () => ({
  default: vi.fn(),
}));

describe("consumeTeamInvite", () => {
  let team: Awaited<ReturnType<typeof TeamService.create>>;
  let admin: Awaited<ReturnType<typeof UserService.create>>;
  let invite: Awaited<ReturnType<typeof TeamInviteService.create>>;

  beforeEach(async () => {
    await clearDocumentDB();
    vi.clearAllMocks();
    team = await TeamService.create({ name: "Test Team" });
    admin = await UserService.create({ username: "admin", teams: [] });
    invite = await TeamInviteService.create({
      team: team._id,
      name: "Test Invite",
      maxUses: 10,
      createdBy: admin._id,
    });
  });

  it("creates a new user when the github user has no account", async () => {
    const result = await consumeTeamInvite({
      inviteId: invite._id,
      githubUser: { id: 42, login: "newcomer", name: "New Comer" },
      primaryEmail: "new@example.com",
    });
    expect(result.status).toBe("success");
    expect(result.isNewUser).toBe(true);
    expect(result.user.teams).toHaveLength(1);
    expect(result.user.teams[0].team).toBe(team._id);
    expect(result.user.teams[0].role).toBe("MEMBER");
    expect(result.user.teams[0].viaTeamInvite).toBe(invite._id);

    const updatedInvite = await TeamInviteService.findById(invite._id);
    expect(updatedInvite?.usedCount).toBe(1);
  });

  it("adds team to an existing user not in the team", async () => {
    const existing = await UserService.create({
      username: "existing",
      name: "Existing",
      githubId: 99,
      hasGithubSSO: true,
      isRegistered: true,
      teams: [],
    });
    const result = await consumeTeamInvite({
      inviteId: invite._id,
      githubUser: { id: 99, login: "existing", name: "Existing" },
      primaryEmail: "existing@example.com",
    });
    expect(result.status).toBe("success");
    expect(result.isNewUser).toBe(false);
    expect(result.user._id).toBe(existing._id);
    expect(result.user.teams).toHaveLength(1);
    expect(result.user.teams[0].viaTeamInvite).toBe(invite._id);

    const updatedInvite = await TeamInviteService.findById(invite._id);
    expect(updatedInvite?.usedCount).toBe(1);
  });

  it("is a no-op for an existing user already in the team", async () => {
    const existing = await UserService.create({
      username: "existing",
      name: "Existing",
      githubId: 99,
      hasGithubSSO: true,
      isRegistered: true,
      teams: [{ team: team._id, role: "MEMBER" }],
    });
    const result = await consumeTeamInvite({
      inviteId: invite._id,
      githubUser: { id: 99, login: "existing", name: "Existing" },
      primaryEmail: "existing@example.com",
    });
    expect(result.status).toBe("already_member");
    expect(result.user._id).toBe(existing._id);

    const updatedInvite = await TeamInviteService.findById(invite._id);
    expect(updatedInvite?.usedCount).toBe(0);
  });

  it("rejects a revoked invite", async () => {
    await TeamInviteService.revokeById(invite._id, admin._id);
    const result = await consumeTeamInvite({
      inviteId: invite._id,
      githubUser: { id: 1, login: "a", name: "A" },
      primaryEmail: "a@example.com",
    });
    expect(result.status).toBe("revoked");
  });

  it("rejects a full invite", async () => {
    const fullInvite = await TeamInviteService.create({
      team: team._id,
      name: "Full",
      maxUses: 1,
      createdBy: admin._id,
    });
    await consumeTeamInvite({
      inviteId: fullInvite._id,
      githubUser: { id: 1, login: "a", name: "A" },
      primaryEmail: "a@example.com",
    });
    const result = await consumeTeamInvite({
      inviteId: fullInvite._id,
      githubUser: { id: 2, login: "b", name: "B" },
      primaryEmail: "b@example.com",
    });
    expect(result.status).toBe("full");
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `yarn test app/modules/teams/__tests__/consumeTeamInvite.test.ts`
Expected: FAIL — "Cannot find module '../services/consumeTeamInvite.server'".

- [ ] **Step 3: Implement the service**

Create `app/modules/teams/services/consumeTeamInvite.server.ts`:

```ts
import dayjs from "dayjs";
import mongoose from "mongoose";
import find from "lodash/find";
import setupNewUser from "~/modules/authentication/services/setupNewUser.server";
import trackServerEvent from "~/modules/analytics/helpers/trackServerEvent.server";
import teamInviteSchema from "~/lib/schemas/teamInvite.schema";
import INVITE_LINK_TTL_DAYS from "~/modules/teams/helpers/inviteLink";
import getTeamInviteStatus from "~/modules/teams/helpers/getTeamInviteStatus";
import { TeamInviteService } from "~/modules/teams/teamInvites";
import { UserService } from "~/modules/users/user";
import type { User } from "~/modules/users/users.types";
import type { TeamInvite } from "~/modules/teams/teamInvites.types";

const TeamInviteModel =
  mongoose.models.TeamInvite || mongoose.model("TeamInvite", teamInviteSchema);

export type ConsumeStatus =
  | "success"
  | "already_member"
  | "expired"
  | "full"
  | "revoked"
  | "not_found";

export interface ConsumeResult {
  status: ConsumeStatus;
  user?: User;
  invite?: TeamInvite;
  isNewUser?: boolean;
}

export default async function consumeTeamInvite({
  inviteId,
  githubUser,
  primaryEmail,
}: {
  inviteId: string;
  githubUser: { id: number; login: string; name?: string };
  primaryEmail: string;
}): Promise<ConsumeResult> {
  const invite = await TeamInviteService.findById(inviteId);
  console.log("[consumeTeamInvite] invite loaded", {
    inviteId,
    found: !!invite,
  });
  if (!invite) return { status: "not_found" };

  const status = getTeamInviteStatus(invite);
  if (status !== "active") {
    console.log("[consumeTeamInvite] invite not active", { status });
    return { status };
  }

  const existingUsers = await UserService.find({
    match: { githubId: githubUser.id, hasGithubSSO: true },
  });
  const existingUser = existingUsers[0] ?? null;
  console.log("[consumeTeamInvite] existing user lookup", {
    found: !!existingUser,
  });

  if (existingUser) {
    const alreadyInTeam = find(
      existingUser.teams,
      (t) => t.team === invite.team,
    );
    if (alreadyInTeam) {
      console.log("[consumeTeamInvite] already a team member — no-op");
      return { status: "already_member", user: existingUser, invite };
    }
  }

  const cutoff = dayjs().subtract(INVITE_LINK_TTL_DAYS, "day").toDate();
  const atomicallyUpdated = await TeamInviteModel.findOneAndUpdate(
    {
      _id: inviteId,
      revokedAt: null,
      createdAt: { $gt: cutoff },
      $expr: { $lt: ["$usedCount", "$maxUses"] },
    },
    { $inc: { usedCount: 1 } },
    { new: true },
  );
  console.log("[consumeTeamInvite] atomic increment", {
    succeeded: !!atomicallyUpdated,
  });
  if (!atomicallyUpdated) {
    const current = await TeamInviteService.findById(inviteId);
    return { status: current ? getTeamInviteStatus(current) : "not_found" };
  }

  let user: User;
  let isNewUser: boolean;

  if (existingUser) {
    const updatedTeams = [
      ...existingUser.teams,
      { team: invite.team, role: "MEMBER" as const, viaTeamInvite: invite._id },
    ];
    user = (await UserService.updateById(existingUser._id, {
      teams: updatedTeams,
    })) as User;
    isNewUser = false;
  } else {
    const created = await UserService.create({
      username: githubUser.login,
      name: githubUser.name || githubUser.login,
      email: primaryEmail,
      githubId: githubUser.id,
      hasGithubSSO: true,
      isRegistered: true,
      registeredAt: new Date(),
      role: "USER",
      teams: [{ team: invite.team, role: "MEMBER", viaTeamInvite: invite._id }],
      onboardingComplete: false,
    });
    await setupNewUser(
      created._id,
      `${githubUser.name || githubUser.login}'s Workspace`,
    );
    user = (await UserService.findById(created._id))!;
    isNewUser = true;
    trackServerEvent({ name: "user_registered", userId: user._id });
  }

  trackServerEvent({
    name: "team_invite_signup",
    userId: user._id,
    params: {
      team_invite_id: invite._id,
      team_id: invite.team,
      is_new_user: isNewUser ? 1 : 0,
    },
  });

  console.log("[consumeTeamInvite] success", { userId: user._id, isNewUser });
  return { status: "success", user, invite, isNewUser };
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `yarn test app/modules/teams/__tests__/consumeTeamInvite.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add app/modules/teams/services/consumeTeamInvite.server.ts app/modules/teams/__tests__/consumeTeamInvite.test.ts
git commit -m "Add consumeTeamInvite service with 3-scenario signup handling

Fixes #2065"
```

---

## Task 7: Add race-safety test for `consumeTeamInvite`

**Files:**

- Modify: `app/modules/teams/__tests__/consumeTeamInvite.test.ts`

- [ ] **Step 1: Add a concurrent-call test**

Append inside the existing `describe("consumeTeamInvite", ...)` block:

```ts
it("handles concurrent calls atomically (cap not exceeded)", async () => {
  const narrowInvite = await TeamInviteService.create({
    team: team._id,
    name: "Narrow",
    maxUses: 1,
    createdBy: admin._id,
  });
  const [r1, r2] = await Promise.all([
    consumeTeamInvite({
      inviteId: narrowInvite._id,
      githubUser: { id: 1001, login: "u1", name: "U1" },
      primaryEmail: "u1@example.com",
    }),
    consumeTeamInvite({
      inviteId: narrowInvite._id,
      githubUser: { id: 1002, login: "u2", name: "U2" },
      primaryEmail: "u2@example.com",
    }),
  ]);
  const statuses = [r1.status, r2.status].sort();
  expect(statuses).toEqual(["full", "success"]);

  const finalInvite = await TeamInviteService.findById(narrowInvite._id);
  expect(finalInvite?.usedCount).toBe(1);
});
```

- [ ] **Step 2: Run test — expect pass**

Run: `yarn test app/modules/teams/__tests__/consumeTeamInvite.test.ts`
Expected: PASS (6 tests including the new one).

- [ ] **Step 3: Commit**

```bash
git add app/modules/teams/__tests__/consumeTeamInvite.test.ts
git commit -m "Test consumeTeamInvite race safety under concurrent calls

Fixes #2065"
```

---

## Task 8: Add `INVITE_FULL` and `INVITE_REVOKED` signup error messages

**Files:**

- Modify: `app/modules/authentication/components/signup.tsx`

- [ ] **Step 1: Add the two new error entries**

Edit the `ERROR_MESSAGES` record in `app/modules/authentication/components/signup.tsx`:

```ts
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  EXPIRED_INVITE: {
    title: "Your invite link has expired",
    description: "Please reach out to your NTO contact.",
  },
  INVITE_FULL: {
    title: "This invite link has reached its capacity",
    description: "Please reach out to your NTO contact for a new link.",
  },
  INVITE_REVOKED: {
    title: "This invite link is no longer active",
    description: "Please reach out to your NTO contact for a new link.",
  },
  UNREGISTERED: {
    title: "You have not been registered",
    description: "Use the Sign up button below to create an account.",
  },
};
```

- [ ] **Step 2: Typecheck**

Run: `yarn typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/modules/authentication/components/signup.tsx
git commit -m "Add INVITE_FULL and INVITE_REVOKED signup error messages

Fixes #2065"
```

---

## Task 9: Wire `handleTeamInviteSignup` helper + GitHub strategy branch

**Files:**

- Create: `app/modules/authentication/helpers/handleTeamInviteSignup.server.ts`
- Modify: `app/modules/authentication/helpers/githubStrategy.ts`

- [ ] **Step 1: Create the helper**

Create `app/modules/authentication/helpers/handleTeamInviteSignup.server.ts`:

```ts
import { redirect } from "react-router";
import find from "lodash/find";
import consumeTeamInvite from "~/modules/teams/services/consumeTeamInvite.server";

export default async function handleTeamInviteSignup({
  teamInviteId,
  githubUser,
  emails,
}: {
  teamInviteId: string;
  githubUser: { id: number; login: string; name?: string };
  emails: Array<{ primary?: boolean; email: string }>;
}) {
  const primaryEmail =
    (find(emails, (e) => e.primary) || emails[0] || {}).email || "";

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

  return result.user!;
}
```

- [ ] **Step 2: Add the teamInviteId branch to `githubStrategy.ts`**

In `app/modules/authentication/helpers/githubStrategy.ts`, after reading the session cookie, add a new branch that runs **before** the existing `inviteId` branch. Locate the lines reading the session (around line 45):

```ts
const inviteId = session.get("inviteId");
const isInvitedUser = !!inviteId;
```

Insert immediately above:

```ts
const teamInviteId = session.get("teamInviteId");
if (teamInviteId) {
  const handleTeamInviteSignup = (
    await import("./handleTeamInviteSignup.server")
  ).default;
  return handleTeamInviteSignup({ teamInviteId, githubUser, emails });
}
```

The `await import` avoids a circular import chain through the teams module.

- [ ] **Step 3: Typecheck**

Run: `yarn typecheck`
Expected: No errors.

- [ ] **Step 4: Run existing auth tests**

Run: `yarn test app/modules/authentication`
Expected: All existing auth tests still pass (the teamInviteId branch is never hit when only `inviteId` is set).

- [ ] **Step 5: Commit**

```bash
git add app/modules/authentication/helpers/handleTeamInviteSignup.server.ts app/modules/authentication/helpers/githubStrategy.ts
git commit -m "Route GitHub strategy through handleTeamInviteSignup for multi-use invites

Fixes #2065"
```

---

## Task 10: Extend `/api/authentication` action to flash `teamInviteId` for `/join/:slug` referer

**Files:**

- Modify: `app/modules/authentication/containers/authentication.route.tsx`

- [ ] **Step 1: Add the `/join/:slug` branch to the action**

Edit `app/modules/authentication/containers/authentication.route.tsx`. Locate the existing referer check (around line 66):

```ts
if (
  referrerSplit[referrerSplit.length - 1] === data.inviteId &&
  referrerSplit[referrerSplit.length - 2] === "invite"
) {
  // single-use branch — UNCHANGED
}
```

Add a parallel branch directly below it:

```ts
if (
  referrerSplit[referrerSplit.length - 1] === data.inviteSlug &&
  referrerSplit[referrerSplit.length - 2] === "join"
) {
  const { TeamInviteService } = await import("~/modules/teams/teamInvites");
  const getTeamInviteStatus = (
    await import("~/modules/teams/helpers/getTeamInviteStatus")
  ).default;
  const invite = await TeamInviteService.findOne({ slug: data.inviteSlug });
  if (!invite) {
    return Response.json(
      { ok: false, error: "Invalid invite" },
      { status: 404 },
    );
  }
  const status = getTeamInviteStatus(invite);
  if (status !== "active") {
    return Response.json({ ok: false, error: status }, { status: 410 });
  }
  session.flash("teamInviteId", invite._id);
}
```

- [ ] **Step 2: Typecheck**

Run: `yarn typecheck`
Expected: No errors.

- [ ] **Step 3: Run existing auth route tests**

Run: `yarn test app/modules/authentication`
Expected: Unchanged results. New branch is additive.

- [ ] **Step 4: Commit**

```bash
git add app/modules/authentication/containers/authentication.route.tsx
git commit -m "Flash teamInviteId into session for /join/:slug referer

Fixes #2065"
```

---

## Task 11: Build the public `/join/:slug` route + landing page

**Files:**

- Create: `app/modules/teams/containers/join.route.tsx`
- Modify: `app/routes.ts`
- Test: `app/modules/teams/__tests__/join.route.test.ts`

- [ ] **Step 1: Write failing loader test**

Create `app/modules/teams/__tests__/join.route.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import { TeamService } from "../team";
import { TeamInviteService } from "../teamInvites";
import { UserService } from "~/modules/users/user";
import { loader } from "../containers/join.route";

describe("join.route loader", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("redirects to signup with EXPIRED_INVITE when the invite is expired", async () => {
    const admin = await UserService.create({ username: "admin", teams: [] });
    const team = await TeamService.create({ name: "T" });
    const invite = await TeamInviteService.create({
      team: team._id,
      name: "Old",
      maxUses: 5,
      createdBy: admin._id,
    });
    // Manually expire
    const mongoose = await import("mongoose");
    await mongoose.default
      .model("TeamInvite")
      .updateOne(
        { _id: invite._id },
        { createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      );

    const response = (await loader({
      request: new Request(`http://localhost/join/${invite.slug}`),
      params: { slug: invite.slug },
    } as any)) as Response;

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "/signup?error=EXPIRED_INVITE",
    );
  });

  it("redirects to signup with EXPIRED_INVITE when the invite does not exist", async () => {
    const response = (await loader({
      request: new Request("http://localhost/join/does-not-exist-12345678"),
      params: { slug: "does-not-exist-12345678" },
    } as any)) as Response;

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "/signup?error=EXPIRED_INVITE",
    );
  });

  it("returns an ok loader payload for an active invite", async () => {
    const admin = await UserService.create({ username: "admin", teams: [] });
    const team = await TeamService.create({ name: "T" });
    const invite = await TeamInviteService.create({
      team: team._id,
      name: "Active",
      maxUses: 5,
      createdBy: admin._id,
    });

    const result = (await loader({
      request: new Request(`http://localhost/join/${invite.slug}`),
      params: { slug: invite.slug },
    } as any)) as any;

    expect(result.ok).toBe(true);
    expect(result.slug).toBe(invite.slug);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `yarn test app/modules/teams/__tests__/join.route.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `join.route.tsx`**

Create `app/modules/teams/containers/join.route.tsx`:

```tsx
import { redirect, useFetcher } from "react-router";
import Invite from "../components/invite";
import getTeamInviteStatus from "../helpers/getTeamInviteStatus";
import { TeamInviteService } from "../teamInvites";
import type { Route } from "./+types/join.route";

const STATUS_TO_ERROR: Record<string, string> = {
  expired: "EXPIRED_INVITE",
  full: "INVITE_FULL",
  revoked: "INVITE_REVOKED",
};

export async function loader({ params }: Route.LoaderArgs) {
  const invite = await TeamInviteService.findOne({ slug: params.slug });
  if (!invite) throw redirect("/signup?error=EXPIRED_INVITE");

  const status = getTeamInviteStatus(invite);
  if (status !== "active") {
    const errorCode = STATUS_TO_ERROR[status] ?? "EXPIRED_INVITE";
    throw redirect(`/signup?error=${errorCode}`);
  }

  return { ok: true, slug: invite.slug };
}

export default function JoinRoute({ params }: Route.LoaderArgs) {
  const fetcher = useFetcher();

  const onLoginWithGithubClicked = () => {
    fetcher.submit(
      { provider: "github", inviteSlug: params.slug },
      {
        action: "/api/authentication",
        method: "post",
        encType: "application/json",
      },
    );
  };

  return (
    <Invite
      errorMessage={!fetcher.data?.ok ? fetcher.data?.error : null}
      onLoginWithGithubClicked={onLoginWithGithubClicked}
    />
  );
}
```

- [ ] **Step 4: Register the route**

Edit `app/routes.ts`. Directly after the existing `...prefix("invite", ...)` block (around line 134), add:

```ts
...prefix("join", [
  route(":slug", "modules/teams/containers/join.route.tsx", { id: "join" }),
]),
```

- [ ] **Step 5: Run test — expect pass**

Run: `yarn test app/modules/teams/__tests__/join.route.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add app/modules/teams/containers/join.route.tsx app/routes.ts app/modules/teams/__tests__/join.route.test.ts
git commit -m "Add public /join/:slug landing page

Fixes #2065"
```

---

## Task 12: Add "Invite links" tab trigger

**Files:**

- Modify: `app/modules/teams/components/team.tsx`

Route registration in `routes.ts` is split into Task 14 (list route) and Task 18 (detail route). Each is registered in the same commit as its route file so typecheck passes after every commit.

- [ ] **Step 1: Add tab trigger**

Edit `app/modules/teams/components/team.tsx`:

- Update the `active` calculation to include `"invite-links"`:
  ```ts
  const active = [
    "projects",
    "prompts",
    "users",
    "invite-links",
    "billing",
  ].includes(last)
    ? last
    : "users";
  ```
- Insert a new `<TabsTrigger>` between Users and Projects:
  ```tsx
  <TabsTrigger value="users">Users</TabsTrigger>
  <TabsTrigger value="invite-links">Invite links</TabsTrigger>
  <TabsTrigger value="projects">Projects</TabsTrigger>
  ```

The tab will route to a URL that 404s until Task 14 registers the route. That's expected — the feature isn't merged yet and the tab is only visible on the teams page which an admin is testing.

- [ ] **Step 2: Typecheck**

Run: `yarn typecheck`
Expected: No errors (this change is purely JSX string/array edits; no new imports).

- [ ] **Step 3: Commit**

```bash
git add app/modules/teams/components/team.tsx
git commit -m "Add Invite links tab trigger

Fixes #2065"
```

---

## Task 13: Add `getTeamInviteLinksItemAttributes` and `getTeamInviteLinksItemActions` helpers

**Files:**

- Create: `app/modules/teams/helpers/getTeamInviteLinksItemAttributes.tsx`
- Create: `app/modules/teams/helpers/getTeamInviteLinksItemActions.tsx`

- [ ] **Step 1: Write the attributes helper**

Create `app/modules/teams/helpers/getTeamInviteLinksItemAttributes.tsx`:

```tsx
import dayjs from "dayjs";
import getDateString from "~/modules/app/helpers/getDateString";
import INVITE_LINK_TTL_DAYS from "./inviteLink";
import getTeamInviteStatus from "./getTeamInviteStatus";
import type { TeamInvite } from "../teamInvites.types";
import type { User } from "~/modules/users/users.types";

function describeExpiry(status: string, createdAt: string): string {
  if (status === "revoked") return "Revoked";
  if (status === "full") return "Full";
  if (status === "expired") return "Expired";
  const expiresAt = dayjs(createdAt).add(INVITE_LINK_TTL_DAYS, "day");
  const daysLeft = expiresAt.diff(dayjs(), "day");
  if (daysLeft <= 0) {
    const hoursLeft = Math.max(0, expiresAt.diff(dayjs(), "hour"));
    return `Expires in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}`;
  }
  return `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;
}

export default function getTeamInviteLinksItemAttributes(
  item: TeamInvite,
  createdByUser?: Pick<User, "name" | "username"> | null,
  baseUrl?: string,
) {
  const status = getTeamInviteStatus(item);
  const origin =
    baseUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
  const creatorLabel =
    createdByUser?.name || createdByUser?.username || "Unknown";
  return {
    id: item._id,
    title: item.name,
    description: `${origin}/join/${item.slug}`,
    meta: [
      { text: `${item.usedCount} of ${item.maxUses} used` },
      { text: describeExpiry(status, item.createdAt) },
      { text: `Created by ${creatorLabel} · ${getDateString(item.createdAt)}` },
    ],
    to: `./${item._id}`,
  };
}
```

- [ ] **Step 2: Write the actions helper**

Create `app/modules/teams/helpers/getTeamInviteLinksItemActions.tsx`:

```tsx
import { CopyIcon, TrashIcon } from "lucide-react";
import getTeamInviteStatus from "./getTeamInviteStatus";
import type { TeamInvite } from "../teamInvites.types";

export default function getTeamInviteLinksItemActions(item: TeamInvite) {
  const status = getTeamInviteStatus(item);
  if (status !== "active") return [];
  return [
    { action: "COPY", text: "Copy link", icon: <CopyIcon /> },
    {
      action: "REVOKE",
      text: "Revoke",
      icon: <TrashIcon />,
      variant: "destructive" as const,
    },
  ];
}
```

- [ ] **Step 3: Typecheck**

Run: `yarn typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/modules/teams/helpers/getTeamInviteLinksItemAttributes.tsx app/modules/teams/helpers/getTeamInviteLinksItemActions.tsx
git commit -m "Add helpers for team invite links Collection items

Fixes #2065"
```

---

## Task 14: Build `teamInviteLinks.route.tsx` loader + container + register route

**Files:**

- Create: `app/modules/teams/containers/teamInviteLinks.route.tsx`
- Create: `app/modules/teams/components/teamInviteLinks.tsx`
- Modify: `app/routes.ts`

(Actions are included here too — split across Tasks 14/15/16 only for testing.)

- [ ] **Step 1: Implement the loader + container + dumb component together**

Create `app/modules/teams/components/teamInviteLinks.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import { Collection } from "@/components/ui/collection";
import {
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
} from "@/components/ui/pageHeader";
import { Plus } from "lucide-react";
import getTeamInviteLinksItemAttributes from "../helpers/getTeamInviteLinksItemAttributes";
import getTeamInviteLinksItemActions from "../helpers/getTeamInviteLinksItemActions";
import type { TeamInvite } from "../teamInvites.types";
import type { User } from "~/modules/users/users.types";

interface Props {
  invites: TeamInvite[];
  totalPages: number;
  currentPage: number;
  searchValue: string;
  sortValue: string;
  isSyncing: boolean;
  createdByById: Record<string, Pick<User, "name" | "username">>;
  onCreateClicked: () => void;
  onCopyClicked: (invite: TeamInvite) => void;
  onRevokeClicked: (invite: TeamInvite) => void;
  onSearchValueChanged: (value: string) => void;
  onPaginationChanged: (page: number) => void;
  onSortValueChanged: (value: string) => void;
}

export default function TeamInviteLinks({
  invites,
  totalPages,
  currentPage,
  searchValue,
  sortValue,
  isSyncing,
  createdByById,
  onCreateClicked,
  onCopyClicked,
  onRevokeClicked,
  onSearchValueChanged,
  onPaginationChanged,
  onSortValueChanged,
}: Props) {
  return (
    <div>
      <PageHeader>
        <PageHeaderLeft>
          <h2 className="text-lg font-medium">Invite links</h2>
        </PageHeaderLeft>
        <PageHeaderRight>
          <Button onClick={onCreateClicked}>
            <Plus />
            Create invite link
          </Button>
        </PageHeaderRight>
      </PageHeader>
      <Collection
        items={invites}
        itemsLayout="list"
        searchValue={searchValue}
        currentPage={currentPage}
        totalPages={totalPages}
        sortValue={sortValue}
        isSyncing={isSyncing}
        hasSearch
        hasPagination
        sortOptions={[
          { text: "Created", value: "createdAt" },
          { text: "Name", value: "name" },
          { text: "Uses", value: "usedCount" },
        ]}
        getItemAttributes={(item) =>
          getTeamInviteLinksItemAttributes(item, createdByById[item.createdBy])
        }
        getItemActions={(item) => getTeamInviteLinksItemActions(item)}
        onItemActionClicked={({ id, action }) => {
          const invite = invites.find((i) => i._id === id);
          if (!invite) return;
          if (action === "COPY") onCopyClicked(invite);
          if (action === "REVOKE") onRevokeClicked(invite);
        }}
        onSearchValueChanged={onSearchValueChanged}
        onPaginationChanged={onPaginationChanged}
        onSortValueChanged={onSortValueChanged}
      />
    </div>
  );
}
```

Create `app/modules/teams/containers/teamInviteLinks.route.tsx`:

```tsx
import { useEffect } from "react";
import {
  data,
  redirect,
  useFetcher,
  useLoaderData,
  useOutletContext,
} from "react-router";
import { toast } from "sonner";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import addDialog from "~/modules/dialogs/addDialog";
import { UserService } from "~/modules/users/user";
import TeamAuthorization from "../authorization";
import TeamInviteLinks from "../components/teamInviteLinks";
import ConfirmRevokeInviteDialog from "../components/confirmRevokeInviteDialog";
import CreateTeamInviteLinkDialogContainer from "./createTeamInviteLinkDialog.container";
import { TeamInviteService } from "../teamInvites";
import type { Team } from "../teams.types";
import type { TeamInvite } from "../teamInvites.types";
import type { Route } from "./+types/teamInviteLinks.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireAuth({ request });
  if (!TeamAuthorization.Invites.canView(user, params.id)) {
    return redirect(`/teams/${params.id}`);
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "-createdAt",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: { team: params.id },
    queryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt", "usedCount"],
    filterableFields: [],
  });

  const invites = await TeamInviteService.paginate(query);

  const creatorIds = Array.from(
    new Set(invites.data.map((i: TeamInvite) => i.createdBy).filter(Boolean)),
  );
  const creators = creatorIds.length
    ? await UserService.find({ match: { _id: { $in: creatorIds } } })
    : [];
  const createdByById = Object.fromEntries(
    creators.map((u) => [u._id, { name: u.name, username: u.username }]),
  );

  return { invites, createdByById };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireAuth({ request });

  const { intent, payload = {} } = await request.json();

  if (intent === "CREATE_TEAM_INVITE_LINK") {
    if (!TeamAuthorization.Invites.canCreate(user, params.id)) {
      return data({ errors: { general: "Forbidden" } }, { status: 403 });
    }
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const maxUses = Number(payload.maxUses);
    if (!name || name.length > 100) {
      return data(
        { errors: { name: "Name is required (1–100 chars)" } },
        { status: 400 },
      );
    }
    if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 500) {
      return data(
        { errors: { maxUses: "Max uses must be 1–500" } },
        { status: 400 },
      );
    }
    const invite = await TeamInviteService.create({
      team: params.id,
      name,
      maxUses,
      createdBy: user._id,
    });
    const trackServerEvent = (
      await import("~/modules/analytics/helpers/trackServerEvent.server")
    ).default;
    trackServerEvent({
      name: "team_invite_link_created",
      userId: user._id,
      params: { team_id: params.id, max_uses: maxUses },
    });
    return data({ success: true, invite });
  }

  if (intent === "REVOKE_TEAM_INVITE_LINK") {
    if (!TeamAuthorization.Invites.canRevoke(user, params.id)) {
      return data({ errors: { general: "Forbidden" } }, { status: 403 });
    }
    const inviteLinkId =
      typeof payload.inviteLinkId === "string" ? payload.inviteLinkId : "";
    const existing = await TeamInviteService.findOne({
      _id: inviteLinkId,
      team: params.id,
    });
    if (!existing) {
      return data({ errors: { general: "Not found" } }, { status: 404 });
    }
    const updated = await TeamInviteService.revokeById(inviteLinkId, user._id);
    return data({ success: true, invite: updated });
  }

  return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
}

export default function TeamInviteLinksRoute() {
  const { invites, createdByById } = useLoaderData<typeof loader>();
  const ctx = useOutletContext<{ team: Team }>();
  const fetcher = useFetcher<typeof action>();

  const {
    searchValue,
    setSearchValue,
    currentPage,
    setCurrentPage,
    sortValue,
    setSortValue,
    isSyncing,
  } = useSearchQueryParams({
    searchValue: "",
    currentPage: 1,
    sortValue: "-createdAt",
    filters: {},
  });

  // This route-level fetcher is only used for REVOKE. CREATE is submitted by
  // the dialog's own fetcher, so its success is announced inside the dialog.
  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if ("success" in fetcher.data && fetcher.data.success) {
      toast.success("Invite link revoked");
    } else if ("errors" in fetcher.data) {
      const msg = fetcher.data.errors.general || "An error occurred";
      toast.error(msg);
    }
  }, [fetcher.state, fetcher.data]);

  const onCreateClicked = () => {
    addDialog(<CreateTeamInviteLinkDialogContainer teamId={ctx.team._id} />);
  };

  const onCopyClicked = (invite: TeamInvite) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/join/${invite.slug}`,
    );
    toast.success("Link copied");
  };

  const onRevokeClicked = (invite: TeamInvite) => {
    addDialog(
      <ConfirmRevokeInviteDialog
        inviteName={invite.name}
        onConfirm={() => {
          fetcher.submit(
            JSON.stringify({
              intent: "REVOKE_TEAM_INVITE_LINK",
              payload: { inviteLinkId: invite._id },
            }),
            { method: "POST", encType: "application/json" },
          );
        }}
      />,
    );
  };

  return (
    <TeamInviteLinks
      invites={invites.data}
      totalPages={invites.totalPages}
      currentPage={currentPage}
      searchValue={searchValue}
      sortValue={sortValue}
      isSyncing={isSyncing}
      createdByById={createdByById}
      onCreateClicked={onCreateClicked}
      onCopyClicked={onCopyClicked}
      onRevokeClicked={onRevokeClicked}
      onSearchValueChanged={setSearchValue}
      onPaginationChanged={setCurrentPage}
      onSortValueChanged={setSortValue}
    />
  );
}
```

Note: this file references `CreateTeamInviteLinkDialogContainer` and `ConfirmRevokeInviteDialog`, both of which are created in Task 15. We'll commit all of this together with Task 15's dialogs so typecheck stays green.

- [ ] **Step 2: Register the list route (without the nested detail child yet)**

Edit `app/routes.ts`. Inside the `route(":id", "modules/teams/containers/team.route.tsx", ..., [...])` child array (around line 119-132), add between `users` and `billing`:

```ts
route("invite-links", "modules/teams/containers/teamInviteLinks.route.tsx", {
  id: "teamInviteLinks",
}),
```

(The nested `:inviteLinkId` child is added in Task 18 when that route file exists.)

- [ ] **Step 3: Hold off on commit until Task 15 completes**

The route file imports `CreateTeamInviteLinkDialogContainer` and `ConfirmRevokeInviteDialog` which don't exist yet. Typecheck will fail. Do **not** commit here — continue to Task 15 which provides those files, then commit the combined work at the end of Task 15.

---

## Task 15: Build the create-invite-link dialog + confirm-revoke dialog

**Files:**

- Create: `app/modules/teams/components/createTeamInviteLinkDialog.tsx`
- Create: `app/modules/teams/containers/createTeamInviteLinkDialog.container.tsx`
- Create: `app/modules/teams/components/confirmRevokeInviteDialog.tsx`

- [ ] **Step 1: Build the create dialog component**

Create `app/modules/teams/components/createTeamInviteLinkDialog.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyCheckIcon, CopyIcon, Loader2Icon } from "lucide-react";
import INVITE_LINK_TTL_DAYS from "../helpers/inviteLink";

export const NAME_MAX = 100;
export const USES_MIN = 1;
export const USES_MAX = 500;

interface Props {
  name: string;
  maxUses: number;
  inviteLink: string;
  hasCopied: boolean;
  isCreating: boolean;
  onNameChanged: (name: string) => void;
  onMaxUsesChanged: (uses: number) => void;
  onCreateClicked: () => void;
  onCopyClicked: () => void;
}

export default function CreateTeamInviteLinkDialog({
  name,
  maxUses,
  inviteLink,
  hasCopied,
  isCreating,
  onNameChanged,
  onMaxUsesChanged,
  onCreateClicked,
  onCopyClicked,
}: Props) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a team invite link</DialogTitle>
        <DialogDescription>
          {!isCreating && !inviteLink && (
            <span>
              Create a shareable link for events like conferences. Anyone with
              the link can join the team up to the limit you set.
            </span>
          )}
        </DialogDescription>
      </DialogHeader>
      <div>
        {!isCreating && !inviteLink && (
          <div className="flex flex-col gap-3">
            <div>
              <Label className="mb-1 text-xs">Name</Label>
              <Input
                value={name}
                maxLength={NAME_MAX}
                onChange={(e) => onNameChanged(e.target.value)}
                placeholder="e.g. Learning Conference Norway"
                autoComplete="off"
              />
              <div className="text-muted-foreground mt-1 text-right text-xs">
                {name.length} / {NAME_MAX}
              </div>
            </div>
            <div>
              <Label className="mb-1 text-xs">Maximum uses</Label>
              <Input
                type="number"
                min={USES_MIN}
                max={USES_MAX}
                value={maxUses}
                onChange={(e) => onMaxUsesChanged(Number(e.target.value))}
              />
            </div>
          </div>
        )}
        {isCreating && !inviteLink && (
          <Skeleton className="h-[20px] w-full rounded-full" />
        )}
        {inviteLink && (
          <div className="relative">
            <div className="bg-muted rounded-2xl p-2 pr-10 text-sm break-all">
              {inviteLink}
            </div>
            <Button
              variant="ghost"
              aria-label={hasCopied ? "Link copied" : "Copy link"}
              className="absolute top-0 right-1 z-10 cursor-pointer"
              disabled={hasCopied}
              onClick={onCopyClicked}
            >
              {hasCopied ? <CopyCheckIcon /> : <CopyIcon />}
            </Button>
            <div className="text-muted-foreground mt-4 text-xs">
              {`This invite link will expire in ${INVITE_LINK_TTL_DAYS} days.`}
            </div>
          </div>
        )}
      </div>
      <DialogFooter className="justify-end">
        {!inviteLink && (
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isCreating}>
              Cancel
            </Button>
          </DialogClose>
        )}
        {!inviteLink && (
          <Button
            type="button"
            disabled={
              isCreating ||
              name.trim().length === 0 ||
              name.length > NAME_MAX ||
              maxUses < USES_MIN ||
              maxUses > USES_MAX
            }
            onClick={onCreateClicked}
          >
            {isCreating && <Loader2Icon className="animate-spin" />}
            Generate invite link
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
}
```

- [ ] **Step 2: Build the container (owns its own fetcher)**

Create `app/modules/teams/containers/createTeamInviteLinkDialog.container.tsx`. Matches the existing `inviteUserToTeamDialogContainer.tsx` pattern: the container submits directly to the invite-links route action and reads its own `fetcher.data` to show the generated link.

```tsx
import { useState } from "react";
import { useFetcher } from "react-router";
import CreateTeamInviteLinkDialog from "../components/createTeamInviteLinkDialog";

interface Props {
  teamId: string;
}

export default function CreateTeamInviteLinkDialogContainer({ teamId }: Props) {
  const [name, setName] = useState("");
  const [maxUses, setMaxUses] = useState(20);
  const [hasCopied, setHasCopied] = useState(false);
  const fetcher = useFetcher<{
    success?: boolean;
    invite?: { slug: string };
  }>();

  const isCreating = fetcher.state !== "idle";
  const createdSlug =
    fetcher.data && "invite" in fetcher.data ? fetcher.data.invite?.slug : null;
  const inviteLink = createdSlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${createdSlug}`
    : "";

  const submitCreate = () => {
    fetcher.submit(
      JSON.stringify({
        intent: "CREATE_TEAM_INVITE_LINK",
        payload: { name: name.trim(), maxUses },
      }),
      {
        action: `/teams/${teamId}/invite-links`,
        method: "POST",
        encType: "application/json",
      },
    );
  };

  const submitCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setHasCopied(true);
  };

  return (
    <CreateTeamInviteLinkDialog
      name={name}
      maxUses={maxUses}
      inviteLink={inviteLink}
      hasCopied={hasCopied}
      isCreating={isCreating}
      onNameChanged={setName}
      onMaxUsesChanged={setMaxUses}
      onCreateClicked={submitCreate}
      onCopyClicked={submitCopy}
    />
  );
}
```

Submitting to the invite-links route action will also trigger revalidation of that route's loader, so the list refreshes in the background while the user sees the generated link in the dialog.

- [ ] **Step 3: Build the confirm-revoke dialog**

Create `app/modules/teams/components/confirmRevokeInviteDialog.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  inviteName: string;
  onConfirm: () => void;
}

export default function ConfirmRevokeInviteDialog({
  inviteName,
  onConfirm,
}: Props) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Revoke this invite link?</DialogTitle>
        <DialogDescription>
          "{inviteName}" will stop working immediately. This cannot be undone.
          The record (and anyone who already signed up) is preserved for audit.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Revoke
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
```

- [ ] **Step 4: Typecheck the combined Task 14 + Task 15 work**

Run: `yarn typecheck`
Expected: No errors. All route/dialog/component references resolve.

- [ ] **Step 5: Commit Task 14 + Task 15 together**

```bash
git add \
  app/modules/teams/containers/teamInviteLinks.route.tsx \
  app/modules/teams/components/teamInviteLinks.tsx \
  app/routes.ts \
  app/modules/teams/components/createTeamInviteLinkDialog.tsx \
  app/modules/teams/containers/createTeamInviteLinkDialog.container.tsx \
  app/modules/teams/components/confirmRevokeInviteDialog.tsx
git commit -m "Add invite-links list route, create dialog, and revoke confirmation

Fixes #2065"
```

---

## Task 16: Add route tests for `teamInviteLinks.route.tsx`

**Files:**

- Create: `app/modules/teams/__tests__/teamInviteLinks.route.test.ts`

- [ ] **Step 1: Write loader + action tests**

Create the test file. Use `app/modules/teams/__tests__/teamUsers.route.test.ts` as a reference for how loader/action are invoked in this codebase (pattern: `(await loader({ request, params } as any)) as any`).

```ts
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { TeamService } from "../team";
import { TeamInviteService } from "../teamInvites";
import { UserService } from "~/modules/users/user";
import { action, loader } from "../containers/teamInviteLinks.route";

async function setupAdmin() {
  const team = await TeamService.create({ name: "T" });
  const admin = await UserService.create({
    username: "admin",
    teams: [{ team: team._id, role: "ADMIN" }],
  });
  const cookie = await loginUser(admin._id);
  return { team, admin, cookie };
}

describe("teamInviteLinks.route", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  describe("loader", () => {
    it("redirects non-admins away", async () => {
      const team = await TeamService.create({ name: "T" });
      const member = await UserService.create({
        username: "member",
        teams: [{ team: team._id, role: "MEMBER" }],
      });
      const cookie = await loginUser(member._id);

      const resp = (await loader({
        request: new Request(
          `http://localhost/teams/${team._id}/invite-links`,
          {
            headers: { cookie },
          },
        ),
        params: { id: team._id },
      } as any)) as Response;

      expect(resp.status).toBe(302);
    });

    it("returns paginated invites for admins", async () => {
      const { team, admin, cookie } = await setupAdmin();
      await TeamInviteService.create({
        team: team._id,
        name: "Alpha",
        maxUses: 5,
        createdBy: admin._id,
      });
      const result = (await loader({
        request: new Request(
          `http://localhost/teams/${team._id}/invite-links`,
          {
            headers: { cookie },
          },
        ),
        params: { id: team._id },
      } as any)) as any;
      expect(result.invites.data).toHaveLength(1);
      expect(result.invites.data[0].name).toBe("Alpha");
    });
  });

  describe("action CREATE_TEAM_INVITE_LINK", () => {
    it("denies non-admins", async () => {
      const team = await TeamService.create({ name: "T" });
      const member = await UserService.create({
        username: "member",
        teams: [{ team: team._id, role: "MEMBER" }],
      });
      const cookie = await loginUser(member._id);
      const resp = (await action({
        request: new Request(
          `http://localhost/teams/${team._id}/invite-links`,
          {
            method: "POST",
            headers: { cookie, "content-type": "application/json" },
            body: JSON.stringify({
              intent: "CREATE_TEAM_INVITE_LINK",
              payload: { name: "Try", maxUses: 5 },
            }),
          },
        ),
        params: { id: team._id },
      } as any)) as any;
      expect(resp.init?.status).toBe(403);
    });

    it("rejects empty name", async () => {
      const { team, cookie } = await setupAdmin();
      const resp = (await action({
        request: new Request(
          `http://localhost/teams/${team._id}/invite-links`,
          {
            method: "POST",
            headers: { cookie, "content-type": "application/json" },
            body: JSON.stringify({
              intent: "CREATE_TEAM_INVITE_LINK",
              payload: { name: "   ", maxUses: 5 },
            }),
          },
        ),
        params: { id: team._id },
      } as any)) as any;
      expect(resp.init?.status).toBe(400);
    });

    it("rejects out-of-range maxUses", async () => {
      const { team, cookie } = await setupAdmin();
      const resp = (await action({
        request: new Request(
          `http://localhost/teams/${team._id}/invite-links`,
          {
            method: "POST",
            headers: { cookie, "content-type": "application/json" },
            body: JSON.stringify({
              intent: "CREATE_TEAM_INVITE_LINK",
              payload: { name: "OK", maxUses: 0 },
            }),
          },
        ),
        params: { id: team._id },
      } as any)) as any;
      expect(resp.init?.status).toBe(400);
    });

    it("ignores client-supplied role and creates MEMBER invite", async () => {
      const { team, cookie } = await setupAdmin();
      const resp = (await action({
        request: new Request(
          `http://localhost/teams/${team._id}/invite-links`,
          {
            method: "POST",
            headers: { cookie, "content-type": "application/json" },
            body: JSON.stringify({
              intent: "CREATE_TEAM_INVITE_LINK",
              payload: { name: "OK", maxUses: 5, role: "ADMIN" },
            }),
          },
        ),
        params: { id: team._id },
      } as any)) as any;
      expect(resp.data?.invite?.role).toBe("MEMBER");
    });
  });

  describe("action REVOKE_TEAM_INVITE_LINK", () => {
    it("prevents cross-team IDOR", async () => {
      const { team: teamA, cookie } = await setupAdmin();
      const teamB = await TeamService.create({ name: "B" });
      const fromB = await TeamInviteService.create({
        team: teamB._id,
        name: "Foreign",
        maxUses: 5,
        createdBy: "507f1f77bcf86cd799439012",
      });
      const resp = (await action({
        request: new Request(
          `http://localhost/teams/${teamA._id}/invite-links`,
          {
            method: "POST",
            headers: { cookie, "content-type": "application/json" },
            body: JSON.stringify({
              intent: "REVOKE_TEAM_INVITE_LINK",
              payload: { inviteLinkId: fromB._id },
            }),
          },
        ),
        params: { id: teamA._id },
      } as any)) as any;
      expect(resp.init?.status).toBe(404);

      const stillActive = await TeamInviteService.findById(fromB._id);
      expect(stillActive?.revokedAt).toBeFalsy();
    });
  });
});
```

- [ ] **Step 2: Run tests — expect pass**

Run: `yarn test app/modules/teams/__tests__/teamInviteLinks.route.test.ts`
Expected: PASS (6 tests). If failures, trace to implementation and fix.

- [ ] **Step 3: Commit**

```bash
git add app/modules/teams/__tests__/teamInviteLinks.route.test.ts
git commit -m "Test teamInviteLinks route loader and actions

Fixes #2065"
```

---

## Task 17: Add signup-items helper for the detail view

**Files:**

- Create: `app/modules/teams/helpers/getTeamInviteLinkSignupsItemAttributes.tsx`

- [ ] **Step 1: Implement the helper**

Create `app/modules/teams/helpers/getTeamInviteLinkSignupsItemAttributes.tsx`:

```tsx
import getDateString from "~/modules/app/helpers/getDateString";
import type { User } from "~/modules/users/users.types";

export default function getTeamInviteLinkSignupsItemAttributes(item: User) {
  const displayName = item.name || item.username || "User";
  const description = item.username || "";
  return {
    id: item._id,
    title: displayName,
    description,
    meta: [
      { text: item.isRegistered ? "Registered" : "Invited" },
      { text: `Joined ${getDateString(item.createdAt)}` },
    ],
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `yarn typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add app/modules/teams/helpers/getTeamInviteLinkSignupsItemAttributes.tsx
git commit -m "Add signups item attributes helper

Fixes #2065"
```

---

## Task 18: Build `teamInviteLink.route.tsx` detail view + register nested route + tests

**Files:**

- Create: `app/modules/teams/containers/teamInviteLink.route.tsx`
- Create: `app/modules/teams/components/teamInviteLink.tsx`
- Modify: `app/routes.ts` (register nested child)
- Test: `app/modules/teams/__tests__/teamInviteLink.route.test.ts`

- [ ] **Step 1: Write failing tests**

Create `app/modules/teams/__tests__/teamInviteLink.route.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import clearDocumentDB from "../../../../test/helpers/clearDocumentDB";
import loginUser from "../../../../test/helpers/loginUser";
import { TeamService } from "../team";
import { TeamInviteService } from "../teamInvites";
import { UserService } from "~/modules/users/user";
import { action, loader } from "../containers/teamInviteLink.route";

describe("teamInviteLink.route", () => {
  beforeEach(async () => {
    await clearDocumentDB();
  });

  it("prevents cross-team IDOR on loader", async () => {
    const teamA = await TeamService.create({ name: "A" });
    const teamB = await TeamService.create({ name: "B" });
    const admin = await UserService.create({
      username: "admin",
      teams: [{ team: teamA._id, role: "ADMIN" }],
    });
    const fromB = await TeamInviteService.create({
      team: teamB._id,
      name: "Foreign",
      maxUses: 5,
      createdBy: admin._id,
    });
    const cookie = await loginUser(admin._id);

    const resp = (await loader({
      request: new Request(
        `http://localhost/teams/${teamA._id}/invite-links/${fromB._id}`,
        { headers: { cookie } },
      ),
      params: { id: teamA._id, inviteLinkId: fromB._id },
    } as any)) as Response;

    expect(resp.status).toBe(302);
  });

  it("returns invite + signups for the owning team", async () => {
    const team = await TeamService.create({ name: "T" });
    const admin = await UserService.create({
      username: "admin",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const invite = await TeamInviteService.create({
      team: team._id,
      name: "Here",
      maxUses: 5,
      createdBy: admin._id,
    });
    await UserService.create({
      username: "signup1",
      teams: [{ team: team._id, role: "MEMBER", viaTeamInvite: invite._id }],
    });
    const cookie = await loginUser(admin._id);

    const result = (await loader({
      request: new Request(
        `http://localhost/teams/${team._id}/invite-links/${invite._id}`,
        { headers: { cookie } },
      ),
      params: { id: team._id, inviteLinkId: invite._id },
    } as any)) as any;

    expect(result.invite._id).toBe(invite._id);
    expect(result.signups).toHaveLength(1);
    expect(result.signups[0].username).toBe("signup1");
  });

  it("revokes via action and writes revokedBy", async () => {
    const team = await TeamService.create({ name: "T" });
    const admin = await UserService.create({
      username: "admin",
      teams: [{ team: team._id, role: "ADMIN" }],
    });
    const invite = await TeamInviteService.create({
      team: team._id,
      name: "Revoke",
      maxUses: 5,
      createdBy: admin._id,
    });
    const cookie = await loginUser(admin._id);

    await action({
      request: new Request(
        `http://localhost/teams/${team._id}/invite-links/${invite._id}`,
        {
          method: "POST",
          headers: { cookie, "content-type": "application/json" },
          body: JSON.stringify({ intent: "REVOKE_TEAM_INVITE_LINK" }),
        },
      ),
      params: { id: team._id, inviteLinkId: invite._id },
    } as any);

    const updated = await TeamInviteService.findById(invite._id);
    expect(updated?.revokedAt).toBeDefined();
    expect(updated?.revokedBy).toBe(admin._id);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `yarn test app/modules/teams/__tests__/teamInviteLink.route.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the detail view component (dumb)**

Create `app/modules/teams/components/teamInviteLink.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collection } from "@/components/ui/collection";
import {
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
} from "@/components/ui/pageHeader";
import { CopyIcon, TrashIcon } from "lucide-react";
import getDateString from "~/modules/app/helpers/getDateString";
import getTeamInviteLinkSignupsItemAttributes from "../helpers/getTeamInviteLinkSignupsItemAttributes";
import getTeamInviteStatus from "../helpers/getTeamInviteStatus";
import type { TeamInvite } from "../teamInvites.types";
import type { User } from "~/modules/users/users.types";

interface Props {
  invite: TeamInvite;
  signups: User[];
  creatorLabel: string;
  onCopyClicked: () => void;
  onRevokeClicked: () => void;
}

export default function TeamInviteLink({
  invite,
  signups,
  creatorLabel,
  onCopyClicked,
  onRevokeClicked,
}: Props) {
  const status = getTeamInviteStatus(invite);
  const isActive = status === "active";

  return (
    <div>
      <PageHeader>
        <PageHeaderLeft>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">{invite.name}</h2>
              <Badge variant={isActive ? "default" : "destructive"}>
                {status}
              </Badge>
            </div>
            <div className="text-muted-foreground text-xs">
              {invite.usedCount} of {invite.maxUses} used · Created by{" "}
              {creatorLabel} · {getDateString(invite.createdAt)}
            </div>
          </div>
        </PageHeaderLeft>
        {isActive && (
          <PageHeaderRight>
            <Button variant="outline" onClick={onCopyClicked}>
              <CopyIcon />
              Copy link
            </Button>
            <Button variant="destructive" onClick={onRevokeClicked}>
              <TrashIcon />
              Revoke
            </Button>
          </PageHeaderRight>
        )}
      </PageHeader>
      <h3 className="mt-4 mb-2 text-sm font-medium">
        Signups ({signups.length})
      </h3>
      <Collection
        items={signups}
        itemsLayout="list"
        getItemAttributes={getTeamInviteLinkSignupsItemAttributes}
        getItemActions={() => []}
      />
    </div>
  );
}
```

- [ ] **Step 4: Implement the detail container**

Create `app/modules/teams/containers/teamInviteLink.route.tsx`:

```tsx
import { useEffect } from "react";
import { data, redirect, useFetcher, useLoaderData } from "react-router";
import { toast } from "sonner";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import addDialog from "~/modules/dialogs/addDialog";
import { UserService } from "~/modules/users/user";
import TeamAuthorization from "../authorization";
import ConfirmRevokeInviteDialog from "../components/confirmRevokeInviteDialog";
import TeamInviteLink from "../components/teamInviteLink";
import { TeamInviteService } from "../teamInvites";
import type { Route } from "./+types/teamInviteLink.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireAuth({ request });
  if (!TeamAuthorization.Invites.canView(user, params.id)) {
    return redirect(`/teams/${params.id}`);
  }

  const invite = await TeamInviteService.findOne({
    _id: params.inviteLinkId,
    team: params.id,
  });
  if (!invite) return redirect(`/teams/${params.id}/invite-links`);

  const signups = await UserService.find({
    match: { "teams.viaTeamInvite": invite._id },
  });
  const creator = await UserService.findById(invite.createdBy);
  const creatorLabel = creator?.name || creator?.username || "Unknown";

  return { invite, signups, creatorLabel };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireAuth({ request });

  if (!TeamAuthorization.Invites.canRevoke(user, params.id)) {
    return data({ errors: { general: "Forbidden" } }, { status: 403 });
  }

  const { intent } = await request.json();
  if (intent !== "REVOKE_TEAM_INVITE_LINK") {
    return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
  }

  const invite = await TeamInviteService.findOne({
    _id: params.inviteLinkId,
    team: params.id,
  });
  if (!invite)
    return data({ errors: { general: "Not found" } }, { status: 404 });

  const updated = await TeamInviteService.revokeById(invite._id, user._id);
  return data({ success: true, invite: updated });
}

export default function TeamInviteLinkRoute() {
  const { invite, signups, creatorLabel } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if ("success" in fetcher.data && fetcher.data.success) {
      toast.success("Invite link revoked");
    }
  }, [fetcher.state, fetcher.data]);

  const onCopyClicked = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/join/${invite.slug}`,
    );
    toast.success("Link copied");
  };

  const onRevokeClicked = () => {
    addDialog(
      <ConfirmRevokeInviteDialog
        inviteName={invite.name}
        onConfirm={() => {
          fetcher.submit(
            JSON.stringify({ intent: "REVOKE_TEAM_INVITE_LINK" }),
            { method: "POST", encType: "application/json" },
          );
        }}
      />,
    );
  };

  return (
    <TeamInviteLink
      invite={invite}
      signups={signups}
      creatorLabel={creatorLabel}
      onCopyClicked={onCopyClicked}
      onRevokeClicked={onRevokeClicked}
    />
  );
}
```

- [ ] **Step 5: Register the nested detail route**

Edit `app/routes.ts`. Convert the list route added in Task 14 step 2 from a leaf route to a route with a children array, adding the detail route as a child:

```ts
route(
  "invite-links",
  "modules/teams/containers/teamInviteLinks.route.tsx",
  { id: "teamInviteLinks" },
  [
    route(
      ":inviteLinkId",
      "modules/teams/containers/teamInviteLink.route.tsx",
      { id: "teamInviteLink" },
    ),
  ],
),
```

- [ ] **Step 6: Run test — expect pass**

Run: `yarn test app/modules/teams/__tests__/teamInviteLink.route.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Full typecheck**

Run: `yarn typecheck`
Expected: No errors anywhere.

- [ ] **Step 8: Commit**

```bash
git add \
  app/modules/teams/containers/teamInviteLink.route.tsx \
  app/modules/teams/components/teamInviteLink.tsx \
  app/modules/teams/__tests__/teamInviteLink.route.test.ts \
  app/routes.ts
git commit -m "Add team invite link detail view with signups

Fixes #2065"
```

---

## Task 19: Integration smoke — verify single-use flow still works + build

**Files:**

- None (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `yarn test`
Expected: All tests pass. Pay particular attention to `generateInviteToTeam.route.test.ts`, `authorization.test.ts`, and any auth-related suites — confirm nothing regressed.

- [ ] **Step 2: Run the full build**

Run: `yarn app:build`
Expected: Build completes without errors.

- [ ] **Step 3: Manual smoke (local dev)**

Start Redis, workers, and dev server (`yarn local:redis`, `yarn workers:dev`, `yarn app:dev`). In the browser:

1. As a team admin, visit `/teams/:id/invite-links`. Create a new invite, confirm URL appears.
2. Copy the `/join/:slug` URL, open in an incognito window. Confirm landing page shows.
3. Verify an expired invite (manipulate `createdAt` in DB) redirects to `/signup?error=EXPIRED_INVITE` and the message renders correctly.
4. Verify that the existing single-use flow (`/invite/:id`) still works end-to-end.
5. Revoke a link as admin, confirm status badge updates, copy/revoke buttons disappear.

- [ ] **Step 4: Commit (if any minor fixes made during smoke)**

If no fixes needed, no commit. Otherwise:

```bash
git add -u
git commit -m "Fix <specific issue found in smoke test>

Fixes #2065"
```

---

## Self-Review Checklist

When execution is complete:

- [ ] All spec requirements implemented (data model, URL scheme, consume flow, admin UI, events, auth, tests)
- [ ] `yarn typecheck` clean
- [ ] `yarn test` all green
- [ ] `yarn app:build` succeeds
- [ ] `yarn lint` clean
- [ ] Manual smoke covers: create, copy, revoke, signup (new user + existing user + already-member), expired, full, single-use flow untouched
