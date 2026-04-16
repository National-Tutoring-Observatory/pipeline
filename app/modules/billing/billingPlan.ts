import mongoose from "mongoose";
import billingPlanSchema from "~/lib/schemas/billingPlan.schema";
import type { BillingPlan } from "./billing.types";

const BillingPlanModel =
  mongoose.models.BillingPlan ||
  mongoose.model("BillingPlan", billingPlanSchema);

export class BillingPlanService {
  private static toBillingPlan(doc: mongoose.Document): BillingPlan {
    return doc.toJSON({ flattenObjectIds: true }) as BillingPlan;
  }

  static async findById(id: string): Promise<BillingPlan | null> {
    const doc = await BillingPlanModel.findById(id);
    return doc ? this.toBillingPlan(doc) : null;
  }

  static async findDefault(): Promise<BillingPlan | null> {
    const doc = await BillingPlanModel.findOne({ isDefault: true });
    return doc ? this.toBillingPlan(doc) : null;
  }

  static async find(): Promise<BillingPlan[]> {
    const docs = await BillingPlanModel.find().sort({ createdAt: -1 });
    return docs.map((doc) => this.toBillingPlan(doc));
  }

  static async create(
    data: Omit<BillingPlan, "_id" | "createdAt">,
  ): Promise<BillingPlan> {
    const doc = await BillingPlanModel.create(data);
    return this.toBillingPlan(doc);
  }
}
