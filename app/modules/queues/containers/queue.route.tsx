import { redirect, useParams } from "react-router";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin, validateSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import type { User } from "~/modules/users/users.types";
import { QueueControls, QueueStateTabs, QueueTypeTabs } from "../components";
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
  const queueType = params.type as string;

  const states = [
    { key: 'active', label: 'Active', count: queueType === 'tasks' ? 2 : 0 },
    { key: 'waiting', label: 'Waiting', count: 0 },
    { key: 'completed', label: 'Completed', count: 0 },
    { key: 'failed', label: 'Failed', count: 0 },
    { key: 'delayed', label: 'Delayed', count: 0 }
  ];

  const handlePauseResume = () => {
    console.log('Pause/Resume clicked for', queueType);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Queue Management</h1>

        <QueueTypeTabs taskCount={16} cronCount={2} />

        <QueueControls
          queueType={queueType}
          onPauseResume={handlePauseResume}
        />

        <QueueStateTabs
          queueType={queueType}
          states={states}
        />
      </div>

      <div className="text-center py-8 text-gray-500">
        Select a state to view jobs
      </div>
    </div>
  );
}
