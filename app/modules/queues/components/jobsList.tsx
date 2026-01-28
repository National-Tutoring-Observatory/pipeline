import { Collection } from "@/components/ui/collection";
import getDateString from "~/modules/app/helpers/getDateString";
import queueJobsSortOptions from "../helpers/queueJobsSortOptions";
import type { Job } from "../queues.types";

interface JobsListProps {
  jobs: Job[];
  state: string;
  currentPage: number;
  totalPages: number;
  sortValue: string;
  isSyncing: boolean;
  onDisplayJobClick: (job: Job) => void;
  onRemoveJobClick: (job: Job) => void;
  onRetryJobClick: (job: Job) => void;
  onPaginationChanged: (page: number) => void;
  onSortValueChanged: (sortValue: string) => void;
}

export default function JobsList({
  jobs,
  state,
  currentPage,
  totalPages,
  sortValue,
  isSyncing,
  onDisplayJobClick,
  onRemoveJobClick,
  onRetryJobClick,
  onPaginationChanged,
  onSortValueChanged,
}: JobsListProps) {
  const getItemAttributes = (job: Job) => {
    const meta = [];
    if (job.processedOn) {
      meta.push({
        text: `Processed: ${getDateString(job.processedOn)}`,
      });
    }
    if (job.finishedOn) {
      meta.push({
        text: `Finished: ${getDateString(job.finishedOn)}`,
      });
    }
    meta.push({ text: `Attempts: ${job.attemptsMade || 0}` });

    return {
      id: job.id,
      title: job.name,
      description: job.timestamp
        ? `Created ${getDateString(job.timestamp)}`
        : undefined,
      meta,
    };
  };

  const getItemActions = (job: Job) => {
    const actions = [
      { action: "VIEW", text: "View Details" },
      ...(state === "failed" ? [{ action: "RETRY", text: "Retry Job" }] : []),
      { action: "REMOVE", text: "Remove", variant: "destructive" as const },
    ];
    return actions;
  };

  const onItemActionClicked = ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    switch (action) {
      case "VIEW":
        onDisplayJobClick(job);
        break;
      case "RETRY":
        onRetryJobClick(job);
        break;
      case "REMOVE":
        onRemoveJobClick(job);
        break;
    }
  };

  const onItemClicked = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (job) {
      onDisplayJobClick(job);
    }
  };

  return (
    <Collection
      items={jobs}
      itemsLayout="list"
      filters={[]}
      filtersValues={{}}
      sortOptions={queueJobsSortOptions}
      sortValue={sortValue}
      hasPagination={totalPages > 1}
      currentPage={currentPage}
      totalPages={totalPages}
      isSyncing={isSyncing}
      emptyAttributes={{
        title: `No ${state} jobs found`,
        description: `Jobs will appear here when they are ${state}`,
      }}
      getItemAttributes={getItemAttributes}
      getItemActions={getItemActions}
      onItemClicked={onItemClicked}
      onItemActionClicked={onItemActionClicked}
      onPaginationChanged={onPaginationChanged}
      onActionClicked={() => {}}
      onSortValueChanged={onSortValueChanged}
    />
  );
}
