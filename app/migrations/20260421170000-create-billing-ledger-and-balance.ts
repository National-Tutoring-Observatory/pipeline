import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260421170000-create-billing-ledger-and-balance",
  name: "Create Billing Ledger And Balance",
  description:
    "Creates billingledgerentries and teambillingbalances collections and indexes for the ledger-first billing redesign.",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Create Billing Ledger And Balance migration...");

    const existingCollections = new Set(
      (await db.listCollections({}, { nameOnly: true }).toArray()).map(
        (collection) => collection.name,
      ),
    );

    let createdCollections = 0;
    if (!existingCollections.has("billingledgerentries")) {
      await db.createCollection("billingledgerentries");
      createdCollections++;
    }

    if (!existingCollections.has("teambillingbalances")) {
      await db.createCollection("teambillingbalances");
      createdCollections++;
    }

    await db.collection("billingledgerentries").createIndexes([
      { key: { idempotencyKey: 1 }, name: "idempotencyKey_1", unique: true },
      { key: { team: 1, createdAt: -1 }, name: "team_1_createdAt_-1" },
      {
        key: { team: 1, direction: 1, createdAt: -1 },
        name: "team_1_direction_1_createdAt_-1",
      },
      {
        key: { team: 1, source: 1, createdAt: -1 },
        name: "team_1_source_1_createdAt_-1",
      },
    ]);

    await db
      .collection("teambillingbalances")
      .createIndexes([{ key: { team: 1 }, name: "team_1", unique: true }]);

    console.log(
      `Done: created ${createdCollections} collection(s) and ensured indexes`,
    );

    return {
      success: true,
      message: `Created ${createdCollections} collection(s) and ensured ledger/balance indexes`,
      stats: { migrated: createdCollections, failed: 0 },
    };
  },
} satisfies MigrationFile;
