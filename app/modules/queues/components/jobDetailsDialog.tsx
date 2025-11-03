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
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
      <DialogHeader className="flex-shrink-0">
        <DialogTitle>Job Details</DialogTitle>
        <DialogDescription>
          View and manage queue job information
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto min-h-0 px-1">
        <div className="space-y-4 pb-4 px-3">
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

          {job.processedOn && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Processed On</label>
              <p className="text-sm text-muted-foreground">
                {dayjs(job.processedOn).format('ddd, MMM D, YYYY - h:mm A')}
              </p>
            </div>
          )}

          {job.finishedOn && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Finished On</label>
              <p className="text-sm text-muted-foreground">
                {dayjs(job.finishedOn).format('ddd, MMM D, YYYY - h:mm A')}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Attempts Made</label>
            <p className="text-sm text-muted-foreground">{job.attemptsMade || 0}</p>
          </div>

          {job.failedReason && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Failed Reason</label>
              <p className="text-sm text-muted-foreground">{job.failedReason}</p>
            </div>
          )}

          {job.returnvalue && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Return Value</label>
              <div className="border rounded bg-muted max-h-32 overflow-auto mx-2">
                <pre className="text-xs text-muted-foreground p-3 whitespace-pre-wrap break-words">
                  {JSON.stringify(job.returnvalue, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {job.data && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Data</label>
              <div className="border rounded bg-muted max-h-32 overflow-auto mx-2">
                <pre className="text-xs text-muted-foreground p-3 whitespace-pre-wrap break-words">
                  {JSON.stringify(job.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {job.opts && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Options</label>
              <div className="border rounded bg-muted max-h-32 overflow-auto mx-2">
                <pre className="text-xs text-muted-foreground p-3 whitespace-pre-wrap break-words">
                  {JSON.stringify(job.opts, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Danger Zone</p>
                <p className="text-xs text-muted-foreground">Remove this job from the queue</p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Remove Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="flex-shrink-0 border-t pt-4">
        <Button variant="destructive" onClick={handleDelete}>
          Delete Job
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
