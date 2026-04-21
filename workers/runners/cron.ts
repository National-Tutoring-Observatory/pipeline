import type { Job } from "bullmq";
import closeBillingPeriods from "../general/closeBillingPeriods";
import reconcileBillingBalances from "../general/reconcileBillingBalances";
import reportLowCredits from "../general/reportLowCredits";

export default async (job: Job) => {
  try {
    switch (job.name) {
      case "BILLING:CLOSE_PERIODS": {
        return closeBillingPeriods(job);
      }
      case "BILLING:RECONCILE_BALANCES": {
        return reconcileBillingBalances(job);
      }
      case "NOTIFY:LOW_CREDITS_REPORT": {
        return reportLowCredits(job);
      }
      default: {
        return {
          status: "ERRORED",
          message: `Missing handler for ${job.name}`,
        };
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error("Cron worker failed", { cause: error });
  }
};
