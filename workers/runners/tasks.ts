import type { Job } from "bullmq";
import '~/modules/documents/documents';
import '~/modules/storage/storage';
import annotatePerUtterance from "../tasks/annotatePerUtterance";
import startRunAnnotation from "../tasks/startRunAnnoation";

export default async (job: Job) => {
  try {
    switch (job.name) {
      case 'START_RUN_ANNOTATION': {
        await startRunAnnotation(job);
        break;
      }
      case 'ANNOTATE_PER_UTTERANCE': {
        await annotatePerUtterance(job);
        break;
      }
      case 'ANNOTATE_PER_SESSION': {
        console.log('Annotating per session');
        break;
      }
    }
  } catch (error) {
    console.log(error);
    // @ts-ignore
    throw new Error(error);
  }
}
