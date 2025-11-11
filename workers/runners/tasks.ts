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
      case 'ANNOTATE_RUN:START': {
        return startAnnotateRun(job);
      }
      case 'ANNOTATE_RUN:PROCESS': {
        if (job.data.annotationType === 'ANNOTATE_PER_UTTERANCE') {
          return annotatePerUtterance(job);
        } else if (job.data.annotationType === 'ANNOTATE_PER_SESSION') {
          return annotatePerSession(job);
        }
      }
      case 'ANNOTATE_RUN:FINISH': {
        return finishAnnotateRun(job);
      }
      case 'CONVERT_FILES_TO_SESSIONS:START': {
        return startConvertFilesToSessions(job);
      }
      case 'CONVERT_FILES_TO_SESSIONS:PROCESS': {
        return convertFileToSession(job);
      }
      case 'CONVERT_FILES_TO_SESSIONS:FINISH': {
        return finishConvertedFilesToSessions(job);
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
