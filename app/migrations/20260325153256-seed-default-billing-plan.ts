import type { Db } from "mongodb";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

export default {
  id: "20260325153256-seed-default-billing-plan",
  name: "Seed Default Billing Plan",
  description:
    "Creates the default billing plan with a 50% markup rate (markupRate: 1.5)",

  async up(db: Db): Promise<MigrationResult> {
    console.log("Starting Seed Default Billing Plan migration...");

    const billingPlans = db.collection("billingplans");

    const existing = await billingPlans.findOne({ isDefault: true });
    if (existing) {
      console.log("Default billing plan already exists, skipping...");
      return {
        success: true,
        message: "Default billing plan already exists",
        stats: { migrated: 0, failed: 0 },
      };
    }

    await billingPlans.insertOne({
      name: "Standard",
      markupRate: 1.5,
      isDefault: true,
      createdAt: new Date(),
    });

    console.log("\n✓ Created default billing plan: Standard (markupRate: 1.5)");

    return {
      success: true,
      message: "Created default billing plan: Standard (markupRate: 1.5)",
      stats: { migrated: 1, failed: 0 },
    };
  },
} satisfies MigrationFile;
