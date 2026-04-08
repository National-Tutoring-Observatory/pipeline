import type { Job } from "bullmq";
import adjudicatePerSession from "../tasks/adjudicatePerSession";
import adjudicatePerUtterance from "../tasks/adjudicatePerUtterance";
import annotatePerSession from "../tasks/annotatePerSession";
import annotatePerUtterance from "../tasks/annotatePerUtterance";
import convertFileToSession from "../tasks/convertFileToSession";
import finishAnnotateRun from "../tasks/finishAnnotateRun";
import finishConvertedFilesToSessions from "../tasks/finishConvertedFilesToSessions";
import finishCreateEvaluation from "../tasks/finishCreateEvaluation";
import finishExportRun from "../tasks/finishExportRun";
import finishExportRunSet from "../tasks/finishExportRunSet";
import finishInsertMtmDataset from "../tasks/finishInsertMtmDataset";
import finishUploadHumanAnnotations from "../tasks/finishUploadHumanAnnotations";
import processCreateEvaluation from "../tasks/processCreateEvaluation";
import processExportRun from "../tasks/processExportRun";
import processExportRunSet from "../tasks/processExportRunSet";
import processInsertMtmSession from "../tasks/processInsertMtmSession";
import processUploadHumanAnnotations from "../tasks/processUploadHumanAnnotations";
import startAnnotateRun from "../tasks/startAnnotateRun";
import startConvertFilesToSessions from "../tasks/startConvertFilesToSessions";
import startCreateEvaluation from "../tasks/startCreateEvaluation";
import startExportRun from "../tasks/startExportRun";
import startExportRunSet from "../tasks/startExportRunSet";
import startUploadHumanAnnotations from "../tasks/startUploadHumanAnnotations";

export default async (job: Job) => {
  try {
    switch (job.name) {
      case "ANNOTATE_RUN:START": {
        return startAnnotateRun(job);
      }
      case "ANNOTATE_RUN:PROCESS": {
        if (job.data.isAdjudication) {
          if (job.data.annotationType === "ANNOTATE_PER_UTTERANCE") {
            return adjudicatePerUtterance(job);
          } else if (job.data.annotationType === "ANNOTATE_PER_SESSION") {
            return adjudicatePerSession(job);
          }
        }
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
      case "CREATE_EVALUATION:START": {
        return startCreateEvaluation(job);
      }
      case "CREATE_EVALUATION:PROCESS": {
        return processCreateEvaluation(job);
      }
      case "CREATE_EVALUATION:FINISH": {
        return finishCreateEvaluation(job);
      }
      case "UPLOAD_HUMAN_ANNOTATIONS:START": {
        return startUploadHumanAnnotations(job);
      }
      case "UPLOAD_HUMAN_ANNOTATIONS:PROCESS": {
        return processUploadHumanAnnotations(job);
      }
      case "UPLOAD_HUMAN_ANNOTATIONS:FINISH": {
        return finishUploadHumanAnnotations(job);
      }
      case "INSERT_MTM_DATASET:START": {
        return startConvertFilesToSessions(job);
      }
      case "INSERT_MTM_DATASET:PROCESS": {
        return processInsertMtmSession(job);
      }
      case "INSERT_MTM_DATASET:FINISH": {
        return finishInsertMtmDataset(job);
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
