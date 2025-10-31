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
