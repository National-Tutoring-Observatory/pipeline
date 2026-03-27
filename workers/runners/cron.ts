import { initializeDatabase } from "app/lib/database";
import "app/modules/storage/storage";
import type { Job } from "bullmq";
import closeBillingPeriods from "../general/closeBillingPeriods";

console.log("[cron] Initializing database connection...");
const _dbStart = Date.now();
await initializeDatabase();
console.log(`[cron] Database ready (${Date.now() - _dbStart}ms)`);

export default async (job: Job) => {
  try {
    switch (job.name) {
      case "BILLING:CLOSE_PERIODS": {
        return closeBillingPeriods(job);
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
