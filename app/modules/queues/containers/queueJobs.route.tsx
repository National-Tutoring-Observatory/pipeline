import { redirect, useLoaderData, useParams } from "react-router";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin, validateSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import type { User } from "~/modules/users/users.types";
import { JobsList, QueueControls, QueueStateTabs, QueueTypeTabs } from "../components";
import type { Route } from "./+types/queueJobs.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }

  const { type, state } = params;

  // Mock job data - we'll replace with actual queue data later
  const mockJobs = type === 'tasks' && state === 'active' ? [
    {
      id: '1',
      name: 'Task item',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '2',
      name: 'Task item',
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  ] : [];

  return {
    queueType: type,
    state,
    jobs: mockJobs
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getSessionUser({ request }) as User;
  validateSuperAdmin(user);

  const { intent, jobId, queueType } = await request.json();

  // TODO: Implement actual queue operations
  switch (intent) {
    case 'deleteJob':
      console.log(`Deleting job ${jobId} from ${queueType} queue`);
      // Here you would integrate with your actual queue system
      return { success: true, message: `Job ${jobId} removed from queue` };

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

export default function QueueJobsRoute() {
  const params = useParams();
  const data = useLoaderData();
  const queueType = params.type as string;
  const state = params.state as string;

  const states = [
    { key: 'active', label: 'Active', count: queueType === 'tasks' ? 2 : 0 },
    { key: 'waiting', label: 'Waiting', count: 0 },
    { key: 'completed', label: 'Completed', count: 0 },
    { key: 'failed', label: 'Failed', count: 0 },
    { key: 'delayed', label: 'Delayed', count: 0 }
  ];

  const handlePauseResume = () => {
    // TODO: Implement pause/resume functionality
    console.log('Pause/Resume clicked for', queueType);
  };

  const handleDeleteJob = (job: any) => {
    // TODO: Implement actual job deletion from queue
    console.log('Delete job:', job);
    alert(`Job "${job.name}" would be removed from the queue here`);
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
          currentState={state}
        />
      </div>

      <JobsList
        jobs={data.jobs}
        state={state}
        onDeleteJob={handleDeleteJob}
      />
    </div>
  );
}
