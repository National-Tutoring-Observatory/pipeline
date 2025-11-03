import capitalize from "lodash/capitalize";
import { useEffect } from "react";
import { redirect, useLoaderData, useNavigate, useParams, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import addDialog from '~/modules/dialogs/addDialog';
import type { User } from "~/modules/users/users.types";
import DeleteJobDialog from "../components/deleteJobDialog";
import JobDetailsDialog from "../components/jobDetailsDialog";
import JobsList from "../components/jobsList";
import getQueue from "../helpers/getQueue";
import type { Job } from "../queues.types";
import type { Route } from "./+types/queueJobs.route";

const PAGE_SIZE = 50;

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }

  const { type, state } = params;
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const start = (page - 1) * PAGE_SIZE;

  const queue = getQueue(type as string);

  let jobs: Job[] = [];
  let totalJobs = 0;

  switch (state) {
    case 'active':
      jobs = await queue.getActive(start, PAGE_SIZE);
      totalJobs = await queue.getActiveCount();
      break;
    case 'wait':
      jobs = await queue.getWaiting(start, PAGE_SIZE);
      totalJobs = await queue.getWaitingCount();
      break;
    case 'completed':
      jobs = await queue.getCompleted(start, PAGE_SIZE);
      totalJobs = await queue.getCompletedCount();
      break;
    case 'failed':
      jobs = await queue.getFailed(start, PAGE_SIZE);
      totalJobs = await queue.getFailedCount();
      break;
    case 'delayed':
      jobs = await queue.getDelayed(start, PAGE_SIZE);
      totalJobs = await queue.getDelayedCount();
      break;
  }

  return {
    queueType: type,
    state,
    jobs,
    totalJobs,
    currentPage: page,
    pageSize: PAGE_SIZE
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

        await queue.remove(entityId);

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
  const navigate = useNavigate();
  const queueType = params.type as string;
  const state = params.state as string;
  const submit = useSubmit();

  useEffect(() => {
    updateBreadcrumb([
      { text: 'Queues', link: '/queues' },
      { text: `${capitalize(queueType)} Queue`, link: `/queues/${queueType}` },
      { text: `${capitalize(state)} Jobs` }
    ]);
  }, [queueType, state]);

  const handleJobClick = (job: Job) => {
    addDialog(
      <JobDetailsDialog
        job={job}
        onDelete={handleRemoveJob}
      />
    );
  };

  const handleRemoveJob = (job: Job) => {
    addDialog(
      <DeleteJobDialog
        job={job}
        onRemoveJobClicked={onRemoveJobClicked}
      />
    );
  };

  const onRemoveJobClicked = (jobId: string) => {
    submit(JSON.stringify({ intent: 'DELETE_JOB', entityId: jobId }), {
      method: 'DELETE',
      encType: 'application/json'
    });
  };

  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set('page', page.toString());
    navigate(`/queues/${queueType}/${state}?${searchParams.toString()}`);
  };

  return (
    <JobsList
      jobs={data.jobs}
      state={state}
      onDisplayJobClick={handleJobClick}
      onRemoveJobClick={handleRemoveJob}
      totalJobs={data.totalJobs}
      currentPage={data.currentPage}
      pageSize={data.pageSize}
      onPageChange={handlePageChange}
    />
  );
}
