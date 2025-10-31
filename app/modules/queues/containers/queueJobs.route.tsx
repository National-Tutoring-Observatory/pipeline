import { redirect, useLoaderData, useParams } from "react-router";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import type { User } from "~/modules/users/users.types";
import { JobsList } from "../components";
import getQueue from "../helpers/getQueue";
import type { Job } from "../queues.types";
import type { Route } from "./+types/queueJobs.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }

  const { type, state } = params;
  const queue = getQueue(type as string);

  let jobs: Job[] = [];

  switch (state) {
    case 'active':
      jobs = await queue.getActive();
      break;
    case 'wait':
      jobs = await queue.getWaiting();
      break;
    case 'completed':
      jobs = await queue.getCompleted();
      break;
    case 'failed':
      jobs = await queue.getFailed();
      break;
    case 'delayed':
      jobs = await queue.getDelayed();
      break;
  }

  return {
    queueType: type,
    state,
    jobs
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }

  const { intent, entityId } = await request.json();
  const { type } = params;

  switch (intent) {
    case 'DELETE_JOB':
      try {
        const queue = getQueue(type as string);

        if (!queue) {
          throw new Error(`Queue "${type}" not found`);
        }

        const job = await queue.getJob(entityId);

        if (!job) {
          throw new Error(`Job with ID "${entityId}" not found`);
        }

        await job.remove();

        return {
          intent: 'DELETE_JOB',
          success: true
        };
      } catch (error) {
        console.error('Error removing job:', error);
        throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    default:
      throw new Error(`Unknown intent: ${intent}`);
  }
}

export default function QueueJobsRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
  const state = params.state as string;

  return (
    <JobsList
      jobs={data.jobs}
      state={state}
    />
  );
}
