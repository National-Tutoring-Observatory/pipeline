import type { Db, ObjectId } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

async function getLedgerTotals(
  db: Db,
  teamId: ObjectId,
): Promise<{ credits: number; rawCosts: number; billedCosts: number }> {
  const result = await db
    .collection("billingledgerentries")
    .aggregate([
      { $match: { team: teamId } },
      {
        $group: {
          _id: null,
          credits: {
            $sum: {
              $cond: [{ $eq: ["$direction", "credit"] }, "$amount", 0],
            },
          },
          rawCosts: {
            $sum: {
              $cond: [{ $eq: ["$direction", "debit"] }, "$rawAmount", 0],
            },
          },
          billedCosts: {
            $sum: {
              $cond: [{ $eq: ["$direction", "debit"] }, "$amount", 0],
            },
          },
        },
      },
    ])
    .toArray();

  return {
    credits: result[0]?.credits ?? 0,
    rawCosts: result[0]?.rawCosts ?? 0,
    billedCosts: result[0]?.billedCosts ?? 0,
  };
}

export default {
  id: "20260423142341-backfill-team-billing-balance-running-totals",
  name: "Backfill Team Billing Balance Running Totals",
  description:
    "Backfills totalCredits, totalRawCosts, and totalBilledCosts on TeamBillingBalance documents from ledger entries.",

  async up(db: Db): Promise<MigrationResult> {
    console.log(
      "Starting Backfill Team Billing Balance Running Totals migration...",
    );

    const balanceDocs = await db
      .collection("teambillingbalances")
      .find({}, { projection: { _id: 1, team: 1 } })
      .toArray();

    console.log(`Found ${balanceDocs.length} balance document(s) to backfill`);

    let migrated = 0;
    let failed = 0;

    for (const doc of balanceDocs) {
      try {
        const totals = await getLedgerTotals(db, doc.team);

        await db.collection("teambillingbalances").updateOne(
          { _id: doc._id },
          {
            $set: {
              totalCredits: totals.credits,
              totalRawCosts: totals.rawCosts,
              totalBilledCosts: totals.billedCosts,
            },
          },
        );

        console.log(
          `Backfilled team ${doc.team}: credits=${totals.credits}, rawCosts=${totals.rawCosts}, billedCosts=${totals.billedCosts}`,
        );
        migrated++;
      } catch (error) {
        console.error(
          `Failed to backfill running totals for team ${doc.team}:`,
          error,
        );
        failed++;
      }
    }

    console.log(
      `Done: backfilled ${migrated} balance doc(s), ${failed} failed`,
    );

    return {
      success: failed === 0,
      message: `Backfilled ${migrated} balance doc(s)`,
      stats: { migrated, failed },
    };
  },
} satisfies MigrationFile;
