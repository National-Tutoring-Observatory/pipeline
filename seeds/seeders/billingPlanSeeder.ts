import { BillingPlanService } from "../../app/modules/billing/billingPlan.js";

const SEED_BILLING_PLANS = [
  {
    name: "Standard",
    markupRate: 1.5,
    isDefault: true,
  },
];

export async function seedBillingPlans() {
  for (const planData of SEED_BILLING_PLANS) {
    const existing = await BillingPlanService.find();
    const found = existing.find((p) => p.name === planData.name);

    if (found) {
      console.log(
        `  ⏭️  Billing plan '${planData.name}' already exists, skipping...`,
      );
      continue;
    }

    await BillingPlanService.create(planData);
    console.log(
      `  ✓ Created billing plan: ${planData.name} (markupRate: ${planData.markupRate})`,
    );
  }
}
