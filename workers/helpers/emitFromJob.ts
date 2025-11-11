import type { Job } from "bullmq";
import getSockets from "./getSockets";

export default async (job: Job, data: any, status: "STARTED" | "FINISHED" | "UPDATED" | "ERRORED") => {
  const sockets = await getSockets();
  console.log("event", job.data.props.event);
  console.log("task", job.data.props.task);
  console.log("status", status);
  sockets.emit(job.data.props.event, {
    ...data,
    task: job.data.props.task,
    status
  })
}
