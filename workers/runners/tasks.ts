import type { Job } from "bullmq";
import finishConvertedFilesToSessions from "workers/tasks/finishConvertedFilesToSessions";
import '~/modules/documents/documents';
import '~/modules/storage/storage';
import annotatePerSession from "../tasks/annotatePerSession";
import annotatePerUtterance from "../tasks/annotatePerUtterance";
import convertFileToSession from "../tasks/convertFileToSession";
import finishAnnotateRun from "../tasks/finishAnnotateRun";
import handleAnnotateRun from '../tasks/handleAnnotateRun';
import startAnnotateRun from "../tasks/startAnnotateRun";
import startConvertFilesToSessions from "../tasks/startConvertFilesToSessions";

export default async (job: Job) => {
  try {
    switch (job.name) {
      case 'START_ANNOTATE_RUN': {
        return startAnnotateRun(job);
      }
      case 'ANNOTATE_PER_UTTERANCE': {
        return annotatePerUtterance(job);
      }
      case 'ANNOTATE_PER_SESSION': {
        return annotatePerSession(job);
      }
      case 'FINISH_ANNOTATE_RUN': {
        return finishAnnotateRun(job);
      }
      case 'ANNOTATE_RUN': {
        return handleAnnotateRun(job);
      }
      case 'START_CONVERT_FILES_TO_SESSIONS': {
        return startConvertFilesToSessions(job);
      }
      case 'CONVERT_FILE_TO_SESSION': {
        return convertFileToSession(job);
      }
      case 'FINISH_CONVERT_FILES_TO_SESSIONS': {
        return finishConvertedFilesToSessions(job);
      }
      case 'CONVERT_FILES_TO_SESSIONS': {
        return console.log('FINAL', 'CONVERT_FILES_TO_SESSIONS');
      }
      default: {
        return { status: 'ERRORED', message: `Missing task for ${job.name}` }
      }
    }
  } catch (error) {
    console.log(error);
    // @ts-ignore
    throw new Error(error);
  }
}
