import { Outlet, redirect, useLoaderData } from "react-router";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import type { User } from "~/modules/users/users.types";
import QueueTypeTabs from "../components/queueTypeTabs";
import getQueue from "../helpers/getQueue";
import type { Route } from "./+types/queuesLayout.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }

  const tasksQueue = getQueue('tasks');
  const cronQueue = getQueue('cron');

  const taskCount = await tasksQueue.count();
  const cronCount = await cronQueue.count();

  return {
    taskCount,
    cronCount
  };
}

export default function QueuesLayoutRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
          Queues
        </h1>
        <QueueTypeTabs taskCount={data.taskCount} cronCount={data.cronCount} />
      </div>

      <Outlet />
    </div>
  );
}
