import { redirect, useLoaderData } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import SystemAdminAuthorization from "~/modules/authorization/systemAdminAuthorization";
import type { User } from "~/modules/users/users.types";
import QueuesLayout from "../components/queuesLayout";
import getQueue from "../helpers/getQueue";
import type { Route } from "./+types/queuesLayout.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!SystemAdminAuthorization.Queues.canManage(user)) {
    return redirect("/");
  }

  const tasksQueue = getQueue("tasks");
  const generalQueue = getQueue("general");
  const cronQueue = getQueue("cron");

  const taskCount = await tasksQueue.count();
  const generalCount = await generalQueue.count();
  const cronCount = await cronQueue.count();

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
