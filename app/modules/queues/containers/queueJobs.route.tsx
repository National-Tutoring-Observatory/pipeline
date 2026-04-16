import type { JobType } from "bullmq";
import { useEffect } from "react";
import {
  data,
  redirect,
  useFetcher,
  useLoaderData,
  useParams,
} from "react-router";
import { toast } from "sonner";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import SystemAdminAuthorization from "~/modules/authorization/systemAdminAuthorization";
import addDialog from "~/modules/dialogs/addDialog";
import DeleteJobDialog from "../components/deleteJobDialog";
import JobDetailsDialog from "../components/jobDetailsDialog";
import JobsList from "../components/jobsList";
import RetryAllFailedJobsDialog from "../components/retryAllFailedJobsDialog";
import RetryJobDialog from "../components/retryJobDialog";
import getQueue from "../helpers/getQueue";
import isQueuePro from "../helpers/isQueuePro";
import type { Job } from "../queues.types";
import type { Route } from "./+types/queueJobs.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireAuth({ request });
  if (!SystemAdminAuthorization.Queues.canManage(user)) {
    return redirect("/");
  }

  const { type, state } = params;

  const queryParams = getQueryParamsFromRequest(request, {
    currentPage: 1,
    sort: "-timestamp",
  });

  const pagination = getPaginationParams(queryParams.currentPage);
  const asc = queryParams.sort === "timestamp";

  const queue = getQueue(type);

  if (state === "groups" && isQueuePro(queue)) {
    const total = await queue.getGroupsJobsCount();
    const groups = await queue.getGroups(0, -1);

    const allJobs: Job[] = [];
    for (const group of groups) {
      const groupJobs = (await queue.getGroupJobs(group.id, 0, -1)) as Job[];
      allJobs.push(...groupJobs);
    }

    // Sort by timestamp descending by default
    allJobs.sort((a, b) => {
      const timeA = Number(a.timestamp) || 0;
      const timeB = Number(b.timestamp) || 0;
      return asc ? timeA - timeB : timeB - timeA;
    });

    const paginatedJobs = allJobs.slice(
      pagination.skip,
      pagination.skip + pagination.limit,
    );

    console.log(
      `[queues] Groups state: ${groups.length} groups, ${allJobs.length} total jobs, showing ${paginatedJobs.length}`,
    );

    return {
      queueType: type,
      state,
      jobs: paginatedJobs,
      currentPage: queryParams.currentPage ?? 1,
      totalPages: getTotalPages(total),
      sortValue: queryParams.sort ?? "-timestamp",
    };
  }

  const jobState = state as JobType;

  const jobs = (await queue.getJobs(
    jobState,
    pagination.skip,
    pagination.skip + pagination.limit - 1,
    asc,
  )) as unknown as Job[];

  const total = await queue.getJobCountByTypes(jobState);

  return {
    queueType: type,
    state,
    jobs,
    currentPage: queryParams.currentPage ?? 1,
    totalPages: getTotalPages(total),
    sortValue: queryParams.sort ?? "-timestamp",
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireAuth({ request });
  if (!SystemAdminAuthorization.Queues.canManage(user)) {
    return data({ errors: { general: "Access denied" } }, { status: 403 });
  }

  const { intent, entityId } = await request.json();
  const { type } = params;

  const queue = getQueue(type as string);
  if (!queue) {
    return data(
      { errors: { general: `Queue "${type}" not found` } },
      { status: 400 },
    );
  }

  try {
    switch (intent) {
      case "DELETE_JOB": {
        await queue.remove(entityId);
        return data({
          success: true,
          intent: "DELETE_JOB",
        });
      }
      case "RETRY_JOB": {
        const job = await queue.getJob(entityId);

        if (!job) {
          return data(
            { errors: { general: `Job "${entityId}" not found` } },
            { status: 404 },
          );
        }

        const jobState = await job.getState();
        if (jobState === "failed" || jobState === "unknown") {
          await job.retry();
        } else {
          return data(
            {
              errors: { general: `Job "${entityId}" is not in a failed state` },
            },
            { status: 400 },
          );
        }

        return data({
          success: true,
          intent: "RETRY_JOB",
        });
      }
      case "RETRY_ALL_FAILED": {
        const failedJobs = await queue.getJobs("failed");
        let retried = 0;
        let failed = 0;

        for (const job of failedJobs) {
          try {
            await job.retry();
            retried++;
          } catch {
            failed++;
          }
        }

        return data({
          success: true,
          intent: "RETRY_ALL_FAILED",
          data: { retried, failed },
        });
      }
      default:
        return data(
          { errors: { general: `Unknown intent: ${intent}` } },
          { status: 400 },
        );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";
    return data({ errors: { general: errorMessage } }, { status: 500 });
  }
}

export default function QueueJobsRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const params = useParams();
  const state = params.state as string;
  const fetcher = useFetcher();

  const { currentPage, setCurrentPage, sortValue, setSortValue, isSyncing } =
    useSearchQueryParams({
      currentPage: loaderData.currentPage,
      sortValue: loaderData.sortValue,
    });

  const onPaginationChanged = (page: number) => {
    setCurrentPage(page);
  };

  const onSortValueChanged = (value: string) => {
    setSortValue(value);
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        if (fetcher.data.intent === "DELETE_JOB") {
          toast.success("Job deleted");
        } else if (fetcher.data.intent === "RETRY_JOB") {
          toast.success("Job retried");
        }
        addDialog(null);
      } else if (fetcher.data.errors) {
        toast.error(fetcher.data.errors.general || "An error occurred");
      }
    }
  }, [fetcher.state, fetcher.data]);

  const openJobDetailsDialog = (job: Job) => {
    addDialog(<JobDetailsDialog job={job} onDelete={openDeleteJobDialog} />);
  };

  const openDeleteJobDialog = (job: Job) => {
    addDialog(
      <DeleteJobDialog
        job={job}
        onRemoveJobClicked={submitDeleteJob}
        isSubmitting={fetcher.state === "submitting"}
      />,
    );
  };

  const openRetryJobDialog = (job: Job) => {
    addDialog(
      <RetryJobDialog
        job={job}
        onRetryJobClicked={submitRetryJob}
        isSubmitting={fetcher.state === "submitting"}
      />,
    );
  };

  const submitDeleteJob = (jobId: string) => {
    fetcher.submit(JSON.stringify({ intent: "DELETE_JOB", entityId: jobId }), {
      method: "DELETE",
      encType: "application/json",
    });
  };

  const submitRetryJob = (jobId: string) => {
    fetcher.submit(JSON.stringify({ intent: "RETRY_JOB", entityId: jobId }), {
      method: "POST",
      encType: "application/json",
    });
  };

  const openRetryAllFailedJobsDialog = () => {
    addDialog(
      <RetryAllFailedJobsDialog
        onRetryAllClicked={submitRetryAllFailed}
        isSubmitting={fetcher.state === "submitting"}
      />,
    );
  };

  const submitRetryAllFailed = () => {
    addDialog(null);
    toast.success("Retrying all failed jobs");
    fetcher.submit(JSON.stringify({ intent: "RETRY_ALL_FAILED" }), {
      method: "POST",
      encType: "application/json",
    });
  };

  return (
    <JobsList
      jobs={loaderData.jobs}
      state={state}
      currentPage={currentPage}
      totalPages={loaderData.totalPages}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onDisplayJobClick={openJobDetailsDialog}
      onRemoveJobClick={openDeleteJobDialog}
      onRetryJobClick={openRetryJobDialog}
      onRetryAllFailedClicked={openRetryAllFailedJobsDialog}
      onPaginationChanged={onPaginationChanged}
      onSortValueChanged={onSortValueChanged}
    />
  );
}
