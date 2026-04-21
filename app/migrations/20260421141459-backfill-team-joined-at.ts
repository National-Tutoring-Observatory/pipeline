import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260421141459-backfill-team-joined-at",
  name: "Backfill Team Joined At",
  description:
    "Backfill joinedAt on every user's team memberships using registeredAt or createdAt as the source date",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Backfill Team Joined At migration...");

    const cursor = db.collection("users").find({
      "teams.0": { $exists: true },
    });

    let migrated = 0;
    let failed = 0;
    let membershipsBackfilled = 0;

    while (await cursor.hasNext()) {
      const user = await cursor.next();
      if (!user) continue;
      const fallbackDate = user.registeredAt || user.createdAt;
      if (!fallbackDate) continue;

      let changed = false;
      const updatedTeams = user.teams.map(
        (team: { joinedAt?: Date; [key: string]: unknown }) => {
          if (team.joinedAt) return team;
          changed = true;
          membershipsBackfilled += 1;
          return { ...team, joinedAt: fallbackDate };
        },
      );

      if (!changed) continue;

      try {
        await db
          .collection("users")
          .updateOne({ _id: user._id }, { $set: { teams: updatedTeams } });
        migrated += 1;
        console.log(`  Updated user ${user._id}`);
      } catch (err) {
        console.error(`  Failed to update user ${user._id}:`, err);
        failed += 1;
      }
    }

    console.log(
      `\n✓ Migration complete: ${migrated} users updated, ${membershipsBackfilled} memberships backfilled, ${failed} failed`,
    );

    return {
      success: failed === 0,
      message: `Updated ${migrated} users (${membershipsBackfilled} memberships)`,
      stats: { migrated, failed, membershipsBackfilled },
    };
  },
} satisfies MigrationFile;
