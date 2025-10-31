import { Outlet, redirect, useLoaderData, useParams } from "react-router";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin, validateSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import type { User } from "~/modules/users/users.types";
import { QueueControls, QueueStateTabs } from "../components";
import type { Route } from "./+types/queue.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }

  const queueType = params.type;

  return {
    queueType,
    stateCounts: {
      active: queueType === 'tasks' ? 2 : 0,
      waiting: 0,
      completed: 0,
      failed: 0,
      delayed: 0
    }
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getSessionUser({ request }) as User;
  validateSuperAdmin(user);

  const { intent, queueType } = await request.json();

  // TODO: Implement actual queue operations
  switch (intent) {
    case 'pauseQueue':
      console.log(`Pausing ${queueType} queue`);
      return { success: true, message: `${queueType} queue paused` };

    case 'resumeQueue':
      console.log(`Resuming ${queueType} queue`);
      return { success: true, message: `${queueType} queue resumed` };

    default:
      throw new Error(`Unknown intent: ${intent}`);
  }
}

export default function QueueRoute() {
  const params = useParams();
  const data = useLoaderData();
  const queueType = params.type as string;

  const states = [
    { key: 'active', label: 'Active', count: data.stateCounts.active },
    { key: 'waiting', label: 'Waiting', count: data.stateCounts.waiting },
    { key: 'completed', label: 'Completed', count: data.stateCounts.completed },
    { key: 'failed', label: 'Failed', count: data.stateCounts.failed },
    { key: 'delayed', label: 'Delayed', count: data.stateCounts.delayed }
  ];

  const handlePauseResume = () => {
    console.log('Pause/Resume clicked for', queueType);
  };

  return (
    <div>
      <div className="mb-6">
        <QueueControls
          queueType={queueType}
          onPauseResume={handlePauseResume}
        />

        <QueueStateTabs
          queueType={queueType}
          states={states}
        />
      </div>

      <Outlet />
    </div>
  );
}
