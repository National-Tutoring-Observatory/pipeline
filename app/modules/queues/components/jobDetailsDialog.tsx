import { Button } from "@/components/ui/button";
import {
  DangerZone,
  DangerZoneActionRow,
  DangerZonePanel,
  DangerZoneTitle,
} from "@/components/ui/dangerZone";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pre } from "@/components/ui/pre";
import dayjs from "dayjs";
import type { Job } from "../queues.types";
import JobDetailField from "./jobDetailField";

interface JobDetailsDialogProps {
  job: Job | null;
  onDelete: (job: Job) => void;
}

export default function JobDetailsDialog({
  job,
  onDelete,
}: JobDetailsDialogProps) {
  if (!job) return null;

  const handleDelete = () => {
    onDelete(job);
  };

  return (
    <DialogContent className="max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Job Details</DialogTitle>
        <DialogDescription>
          View and manage queue job information
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-4 pb-4">
          <JobDetailField label="Job Name" value={job.name} />

          <JobDetailField
            label="Job ID"
            value={job.id}
            valueClassName="font-mono"
          />

          <JobDetailField
            label="Queue"
            value={job.queue.name}
            valueClassName="capitalize"
          />

          <JobDetailField
            label="Created"
            value={
              job.timestamp
                ? dayjs(job.timestamp).format("ddd, MMM D, YYYY - h:mm A")
                : "Unknown"
            }
          />

          <JobDetailField
            label="Processed On"
            value={
              job.processedOn
                ? dayjs(job.processedOn).format("ddd, MMM D, YYYY - h:mm A")
                : "Not processed yet"
            }
          />

          <JobDetailField
            label="Finished On"
            value={
              job.finishedOn
                ? dayjs(job.finishedOn).format("ddd, MMM D, YYYY - h:mm A")
                : "Not finished yet"
            }
          />

          <JobDetailField label="Attempts Made" value={job.attemptsMade || 0} />

          <JobDetailField label="Return Value">
            <Pre>
              {job.returnvalue
                ? JSON.stringify(job.returnvalue, null, 2)
                : "No return value yet"}
            </Pre>
          </JobDetailField>

          <JobDetailField label="Job Data">
            <Pre>
              {job.data ? JSON.stringify(job.data, null, 2) : "No job data"}
            </Pre>
          </JobDetailField>

          <JobDetailField label="Job Options">
            <Pre>
              {job.opts ? JSON.stringify(job.opts, null, 2) : "No job options"}
            </Pre>
          </JobDetailField>

          <JobDetailField
            label="Failed Reason"
            value={job.failedReason || "No failure reason"}
          />

          <JobDetailField label="Stack Trace">
            <Pre>{job.stacktrace?.join("\n") || "No stack trace"}</Pre>
          </JobDetailField>

          <DangerZone>
            <DangerZoneTitle />
            <DangerZonePanel>
              <DangerZoneActionRow
                title="Remove from the queue"
                description={`Remove this job from the ${job.queue.name} queue`}
                buttonLabel="Remove Job"
                buttonOnClick={handleDelete}
              />
            </DangerZonePanel>
          </DangerZone>
        </div>
      </div>

      <DialogFooter className="flex-shrink-0 border-t pt-4">
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
