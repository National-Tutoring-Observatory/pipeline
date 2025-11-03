import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from 'dayjs';
import type { Job } from "../queues.types";

interface JobDetailsDialogProps {
  job: Job | null;
  onDelete: (job: Job) => void;
}

export default function JobDetailsDialog({ job, onDelete }: JobDetailsDialogProps) {
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Name</label>
            <p className="text-sm text-muted-foreground">{job.name}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job ID</label>
            <p className="text-sm text-muted-foreground font-mono">{job._id}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Queue</label>
            <p className="text-sm text-muted-foreground capitalize">{job.queue}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">State</label>
            <div>
              <Badge variant="outline" className="capitalize">
                {job.state}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Created</label>
            <p className="text-sm text-muted-foreground">
              {job.timestamp
                ? dayjs(job.timestamp).format('ddd, MMM D, YYYY - h:mm A')
                : 'Unknown'
              }
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Processed On</label>
            <p className="text-sm text-muted-foreground">
              {job.processedOn
                ? dayjs(job.processedOn).format('ddd, MMM D, YYYY - h:mm A')
                : 'Not processed yet'
              }
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Finished On</label>
            <p className="text-sm text-muted-foreground">
              {job.finishedOn
                ? dayjs(job.finishedOn).format('ddd, MMM D, YYYY - h:mm A')
                : 'Not finished yet'
              }
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Attempts Made</label>
            <p className="text-sm text-muted-foreground">{job.attemptsMade || 0}</p>
          </div>



          <div className="space-y-2">
            <label className="text-sm font-medium">Failed Reason</label>
            <p className="text-sm text-muted-foreground">
              {job.failedReason || 'No failure reason'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stack Trace</label>
            <div className="border rounded bg-muted max-h-32 overflow-auto mt-2">
              <pre className="text-xs text-muted-foreground p-3 whitespace-pre-wrap break-words">
                {job.stacktrace && job.stacktrace.length > 0
                  ? job.stacktrace.join('\n')
                  : 'No stack trace'
                }
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Return Value</label>
            <div className="border rounded bg-muted max-h-32 overflow-auto mx-2 mt-2">
              <pre className="text-xs text-muted-foreground p-3 whitespace-pre-wrap break-words">
                {job.returnvalue ? JSON.stringify(job.returnvalue, null, 2) : 'No return value yet'}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job Data</label>
            <div className="border rounded bg-muted max-h-32 overflow-auto mt-2">
              <pre className="text-xs text-muted-foreground p-3 whitespace-pre-wrap break-words">
                {job.data ? JSON.stringify(job.data, null, 2) : 'No job data'}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job Options</label>
            <div className="border rounded bg-muted max-h-32 overflow-auto mt-2">
              <pre className="text-xs text-muted-foreground p-3 whitespace-pre-wrap break-words">
                {job.opts ? JSON.stringify(job.opts, null, 2) : 'No job options'}
              </pre>
            </div>
          </div>

        </div>
      </div>

      <DialogFooter className="flex-shrink-0 border-t pt-4">
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-sm font-medium text-destructive">Danger Zone</p>
            <p className="text-xs text-muted-foreground">Remove this job from the queue</p>
          </div>
          <Button variant="destructive" onClick={handleDelete}>
            Remove Job
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
