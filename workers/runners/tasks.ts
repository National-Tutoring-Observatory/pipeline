import type { Job } from "bullmq";
import finishConvertedFilesToSessions from "workers/tasks/finishConvertedFilesToSessions";
import '~/modules/documents/documents';
import '~/modules/storage/storage';
import annotatePerSession from "../tasks/annotatePerSession";
import annotatePerUtterance from "../tasks/annotatePerUtterance";
import convertFileToSession from "../tasks/convertFileToSession";
import finishAnnotateRun from "../tasks/finishAnnotateRun";
import startAnnotateRun from "../tasks/startAnnotateRun";
import startConvertFilesToSessions from "../tasks/startConvertFilesToSessions";

export default async (job: Job) => {
  try {
    switch (job.name) {
      case 'START_ANNOTATE_RUN': {
        await startAnnotateRun(job);
        break;
      }
      case 'ANNOTATE_PER_UTTERANCE': {
        await annotatePerUtterance(job);
        break;
      }
      case 'ANNOTATE_PER_SESSION': {
        await annotatePerSession(job);
        break;
      }
      case 'FINISH_ANNOTATE_RUN': {
        await finishAnnotateRun(job);
      }
      case 'START_CONVERT_FILES_TO_SESSIONS': {
        await startConvertFilesToSessions(job);
        break;
      }
      case 'CONVERT_FILE_TO_SESSION': {
        await convertFileToSession(job);
        break;
      }
      case 'FINISH_CONVERT_FILES_TO_SESSIONS': {
        await finishConvertedFilesToSessions(job);
      }
    }
  } catch (error) {
    console.log(error);
    // @ts-ignore
    throw new Error(error);
  }
}
