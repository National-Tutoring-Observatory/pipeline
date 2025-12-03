import "app/modules/documents/documents";
import "app/modules/storage/storage";
import type { Job } from "bullmq";
import deleteProject from "../general/deleteProject";
import deleteProjectFiles from "../general/deleteProjectFiles";
import deleteProjectRuns from "../general/deleteProjectRuns";
import deleteProjectSessions from "../general/deleteProjectSessions";
import removeFeatureFlagFromUsers from "../general/removeFeatureFlagFromUsers";

export default async (job: Job) => {
  try {
    switch (job.name) {
      case 'DELETE_PROJECT:FILES':
        return deleteProjectFiles(job);
      case 'DELETE_PROJECT:SESSIONS':
        return deleteProjectSessions(job);
      case 'DELETE_PROJECT:RUNS': {
        return deleteProjectRuns(job);
      }
      case 'DELETE_PROJECT:FINISH': {
        return deleteProject(job);
      }
      case 'REMOVE_FEATURE_FLAG': {
        return removeFeatureFlagFromUsers(job);
      }
      default: {
        return { status: 'ERRORED', message: `Missing handler for ${job.name}` }
      }
    }
  } catch (error) {
    console.log(error);
    // @ts-ignore
    throw new Error(error);
  }
}
