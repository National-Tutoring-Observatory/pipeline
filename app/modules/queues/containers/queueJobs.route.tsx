import capitalize from "lodash/capitalize";
import { useEffect } from "react";
import { redirect, useLoaderData, useParams, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import addDialog from '~/modules/dialogs/addDialog';
import type { User } from "~/modules/users/users.types";
import DeleteJobDialog from "../components/deleteJobDialog";
import JobDetailsDialog from "../components/jobDetailsDialog";
import JobsList from "../components/jobsList";
import RetryJobDialog from "../components/retryJobDialog";
import getQueue from "../helpers/getQueue";
import type { Job } from "../queues.types";
import type { Route } from "./+types/queueJobs.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }

  const { type, state } = params;

  const queue = getQueue(type);
  const jobs = await queue.getJobs(state);

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

        await queue.remove(entityId);

        return {
          intent: 'DELETE_JOB',
          success: true
        };
      } catch (error) {
        throw error;
      }
    case 'RETRY_JOB':
      try {
        const queue = getQueue(type as string);

        if (!queue) {
          throw new Error(`Queue "${type}" not found`);
        }

        const job = await queue.getJob(entityId);

        if (!job) {
          throw new Error(`Job "${entityId}" not found`);
        }

        if (job.state !== 'failed') {
          throw new Error(`Job "${entityId}" is not in a failed state`);
        }

        await job.retry(true);

        return {
          intent: 'RETRY_JOB',
          success: true
        };
      } catch (error) {
        throw error;
      }
    default:
      throw new Error(`Unknown intent: ${intent}`);
  }
}

export default function QueueJobsRoute() {
  const data = useLoaderData<typeof loader>();
  const params = useParams();
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

  const handleRetryJob = (job: Job) => {
    addDialog(
      <RetryJobDialog
        job={job}
        onRetryJobClicked={onRetryJobClicked}
      />
    );
  };

  const onRemoveJobClicked = (jobId: string) => {
    submit(JSON.stringify({ intent: 'DELETE_JOB', entityId: jobId }), {
      method: 'DELETE',
      encType: 'application/json'
    });
  };

  const onRetryJobClicked = (jobId: string) => {
    submit(JSON.stringify({ intent: 'RETRY_JOB', entityId: jobId }), {
      method: 'POST',
      encType: 'application/json'
    });
  };

  return (
    <JobsList
      jobs={data.jobs}
      state={state}
      onDisplayJobClick={handleJobClick}
      onRemoveJobClick={handleRemoveJob}
      onRetryJobClick={handleRetryJob}
    />
  );
}
