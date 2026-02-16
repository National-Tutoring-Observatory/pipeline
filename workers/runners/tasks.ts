import type { Job } from "bullmq";
import { initializeDatabase } from "../../app/lib/database";
import "../../app/modules/storage/storage";
import annotatePerSession from "../tasks/annotatePerSession";
import annotatePerUtterance from "../tasks/annotatePerUtterance";
import convertFileToSession from "../tasks/convertFileToSession";
import finishAnnotateRun from "../tasks/finishAnnotateRun";
import finishConvertedFilesToSessions from "../tasks/finishConvertedFilesToSessions";
import finishExportRun from "../tasks/finishExportRun";
import finishExportRunSet from "../tasks/finishExportRunSet";
import processExportRun from "../tasks/processExportRun";
import processExportRunSet from "../tasks/processExportRunSet";
import startAnnotateRun from "../tasks/startAnnotateRun";
import startConvertFilesToSessions from "../tasks/startConvertFilesToSessions";
import startExportRun from "../tasks/startExportRun";
import startExportRunSet from "../tasks/startExportRunSet";

console.log("[tasks] Initializing database connection...");
const dbStartDate = Date.now();
await initializeDatabase();
console.log(`[tasks] Database ready (${Date.now() - dbStartDate}ms)`);

export default async (job: Job) => {
  try {
    switch (job.name) {
      case "ANNOTATE_RUN:START": {
        return startAnnotateRun(job);
      }
      case "ANNOTATE_RUN:PROCESS": {
        if (job.data.annotationType === "ANNOTATE_PER_UTTERANCE") {
          return annotatePerUtterance(job);
        } else if (job.data.annotationType === "ANNOTATE_PER_SESSION") {
          return annotatePerSession(job);
        }
        return {
          status: "ERRORED",
          message: `Unknown annotation type: ${job.data.annotationType}`,
        };
      }
      case "ANNOTATE_RUN:FINISH": {
        return finishAnnotateRun(job);
      }
      case "CONVERT_FILES_TO_SESSIONS:START": {
        return startConvertFilesToSessions(job);
      }
      case "CONVERT_FILES_TO_SESSIONS:PROCESS": {
        return convertFileToSession(job);
      }
      case "CONVERT_FILES_TO_SESSIONS:FINISH": {
        return finishConvertedFilesToSessions(job);
      }
      case "EXPORT_RUN:START": {
        return startExportRun(job);
      }
      case "EXPORT_RUN:PROCESS": {
        return processExportRun(job);
      }
      case "EXPORT_RUN:FINISH": {
        return finishExportRun(job);
      }
      case "EXPORT_RUN_SET:START": {
        return startExportRunSet(job);
      }
      case "EXPORT_RUN_SET:PROCESS": {
        return processExportRunSet(job);
      }
      case "EXPORT_RUN_SET:FINISH": {
        return finishExportRunSet(job);
      }
      default: {
        return { status: "ERRORED", message: `Missing task for ${job.name}` };
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error("Task worker failed", { cause: error });
  }
};
