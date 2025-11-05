import { Outlet, redirect, useFetcher, useLoaderData, useParams } from "react-router";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin, validateSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import type { User } from "~/modules/users/users.types";
import QueueControls from "../components/queueControls";
import QueueStateTabs from "../components/queueStateTabs";
import getQueue from "../helpers/getQueue";
import type { Route } from "./+types/queue.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }

  const queueType = params.type as string;
  const queue = getQueue(queueType);

  const jobCounts = await queue.getJobCounts();
  const isPaused = await queue.isPaused();

  return {
    queueType,
    jobCounts,
    isPaused
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getSessionUser({ request }) as User;
  validateSuperAdmin(user);

  const { intent } = await request.json();
  const { type: queueType } = params;
  const queue = getQueue(queueType as string);

  if (!queue) {
    throw new Error(`Queue ${queueType} not found`);
  }

  switch (intent) {
    case 'PAUSE_QUEUE':
      await queue.pause();
      return { success: true, message: `${queueType} queue paused` };

    case 'RESUME_QUEUE':
      await queue.resume();
      return { success: true, message: `${queueType} queue resumed` };

    default:
      throw new Error(`Unknown intent: ${intent}`);
  }
}

export default function QueueRoute() {
  const params = useParams();
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const queueType = params.type as string;

  const states = [
    { key: 'active', label: 'Active', count: data.jobCounts.active },
    { key: 'waiting', label: 'Waiting', count: data.jobCounts.waiting },
    { key: 'completed', label: 'Completed', count: data.jobCounts.completed },
    { key: 'failed', label: 'Failed', count: data.jobCounts.failed },
    { key: 'delayed', label: 'Delayed', count: data.jobCounts.delayed }
  ];

  const handlePauseResume = () => {
    const intent = data.isPaused ? 'RESUME_QUEUE' : 'PAUSE_QUEUE';
    fetcher.submit(
      { intent },
      {
        method: 'POST',
        encType: 'application/json'
      }
    );
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <QueueStateTabs
            queueType={queueType}
            states={states}
          />

          <QueueControls
            queueType={queueType}
            onPauseResume={handlePauseResume}
            isPaused={data.isPaused}
          />
        </div>
      </div>
      <Outlet />
    </div>
  );
}
