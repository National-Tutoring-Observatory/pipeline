import { Outlet, redirect, useLoaderData } from "react-router";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import type { User } from "~/modules/users/users.types";
import { QueueTypeTabs } from "../components";
import type { Route } from "./+types/queuesLayout.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }

  // Get queue counts - TODO: Replace with actual queue data
  const taskCount = 16;
  const cronCount = 2;

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
        <h1 className="text-2xl font-bold mb-4">Queue Management</h1>
        <QueueTypeTabs taskCount={data.taskCount} cronCount={data.cronCount} />
      </div>

      <Outlet />
    </div>
  );
}
