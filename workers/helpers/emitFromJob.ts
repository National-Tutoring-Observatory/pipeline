import type { Job } from "bullmq";
import getSockets from "./getSockets";

export default async (job: Job, data: any, status: "STARTED" | "FINISHED" | "UPDATED") => {
  const sockets = await getSockets();
  sockets.emit(job.data.parentName, {
    ...data,
    task: job.name,
    status
  })
}
