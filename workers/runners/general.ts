import { initializeDatabase } from "app/lib/database";
import "app/modules/storage/storage";
import type { Job } from "bullmq";
import deleteProject from "../general/deleteProject";
import deleteProjectData from "../general/deleteProjectData";
import deleteRunSetData from "../general/deleteRunSetData";
import removeExpiredTeamAssignment from "../general/removeExpiredTeamAssignment";
import removeFeatureFlagFromUsers from "../general/removeFeatureFlagFromUsers";
import runMigration from "../general/runMigration";
import trackFirstPrompt from "../general/trackFirstPrompt";
import trackFirstRun from "../general/trackFirstRun";

console.log("[general] Initializing database connection...");
const _dbStart = Date.now();
await initializeDatabase();
console.log(`[general] Database ready (${Date.now() - _dbStart}ms)`);

export default async (job: Job) => {
  try {
    switch (job.name) {
      case "DELETE_RUN_SET:DATA": {
        return deleteRunSetData(job);
      }
      case "DELETE_PROJECT:DATA": {
        return deleteProjectData(job);
      }
      case "DELETE_PROJECT:FINISH": {
        return deleteProject(job);
      }
      case "REMOVE_FEATURE_FLAG": {
        return removeFeatureFlagFromUsers(job);
      }
      case "REMOVE_EXPIRED_TEAM_ASSIGNMENT": {
        return removeExpiredTeamAssignment(job);
      }
      case "RUN_MIGRATION": {
        return runMigration(job);
      }
      case "TRACK_FIRST_RUN": {
        return trackFirstRun(job);
      }
      case "TRACK_FIRST_PROMPT": {
        return trackFirstPrompt(job);
      }
      default: {
        return {
          status: "ERRORED",
          message: `Missing handler for ${job.name}`,
        };
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error("General worker failed", { cause: error });
  }
};
