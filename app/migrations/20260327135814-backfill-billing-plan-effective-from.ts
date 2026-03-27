import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260327135814-backfill-billing-plan-effective-from",
  name: "Backfill Billing Plan Effective From",
  description:
    "Adds effectiveFrom to existing teamBillingPlan records that predate the billing period system",

  async up(db: Db): Promise<MigrationResult> {
    const collection = db.collection("teambillingplans");
    const docs = await collection
      .find({ effectiveFrom: { $exists: false } })
      .toArray();

    console.log(
      `Found ${docs.length} teamBillingPlan records without effectiveFrom`,
    );

    let migrated = 0;
    let failed = 0;

    for (const doc of docs) {
      try {
        const createdAt =
          doc.createdAt instanceof Date
            ? doc.createdAt
            : new Date(doc.createdAt ?? 0);
        const effectiveFrom = new Date(
          Date.UTC(createdAt.getUTCFullYear(), createdAt.getUTCMonth(), 1),
        );

        await collection.updateOne(
          { _id: doc._id },
          { $set: { effectiveFrom } },
        );

        console.log(
          `Migrated teamBillingPlan ${doc._id}: effectiveFrom = ${effectiveFrom.toISOString()}`,
        );
        migrated++;
      } catch (err) {
        console.error(`Failed to migrate teamBillingPlan ${doc._id}:`, err);
        failed++;
      }
    }

    return {
      success: failed === 0,
      message: `Backfilled effectiveFrom on ${migrated} teamBillingPlan records${failed > 0 ? `, ${failed} failed` : ""}`,
      stats: { migrated, failed },
    };
  },
} satisfies MigrationFile;
