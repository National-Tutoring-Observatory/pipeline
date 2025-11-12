import type { Job } from "bullmq";
import getSockets from "./getSockets";

export default async (job: Job, data: any, status: "STARTED" | "FINISHED" | "UPDATED" | "ERRORED") => {
  const sockets = await getSockets();
  sockets.emit(job.data.props.event, {
    ...data,
    task: job.data.props.task,
    status
  })
}
