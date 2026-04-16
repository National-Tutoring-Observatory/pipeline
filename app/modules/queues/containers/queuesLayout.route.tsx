import { redirect, useLoaderData } from "react-router";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import SystemAdminAuthorization from "~/modules/authorization/systemAdminAuthorization";
import QueuesLayout from "../components/queuesLayout";
import getQueue from "../helpers/getQueue";
import isQueuePro from "../helpers/isQueuePro";
import type { Route } from "./+types/queuesLayout.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAuth({ request });
  if (!SystemAdminAuthorization.Queues.canManage(user)) {
    return redirect("/");
  }

  const tasksQueue = getQueue("tasks");
  const generalQueue = getQueue("general");
  const cronQueue = getQueue("cron");

  let taskCount = await tasksQueue.count();
  const generalCount = await generalQueue.count();
  const cronCount = await cronQueue.count();

  if (isQueuePro(tasksQueue)) {
    const groupedJobsCount = await tasksQueue.getGroupsJobsCount();
    taskCount += groupedJobsCount;
  }

  const queues = [
    { key: "tasks", label: "Tasks", count: taskCount },
    { key: "general", label: "General", count: generalCount },
    { key: "cron", label: "Cron", count: cronCount },
  ];

  return {
    queues,
  };
}

export default function QueuesLayoutRoute() {
  const data = useLoaderData<typeof loader>();
  const queues = data.queues;
  const breadcrumbs = [
    {
      text: "Queues",
    },
  ];
  return <QueuesLayout queues={queues} breadcrumbs={breadcrumbs} />;
}
