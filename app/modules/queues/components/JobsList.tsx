import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from 'dayjs';
import { EllipsisVertical } from "lucide-react";
import type { Job } from "../queues.types";

interface JobsListProps {
  jobs: Job[];
  state: string;
  onJobClick: (job: Job) => void;
  onDeleteJob: (job: Job) => void;
}

export default function JobsList({ jobs, state, onJobClick, onDeleteJob }: JobsListProps) {

  if (jobs.length === 0) {
    return (
      <div className="border rounded-md">
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">No {state} jobs found</p>
            <p className="text-sm">Jobs will appear here when they are {state}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Job Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Processed</TableHead>
            <TableHead>Finished</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job._id}>
              <TableCell className="font-medium">
                <button
                  onClick={() => onJobClick(job)}
                  className="text-left w-full hover:underline"
                >
                  {job.name}
                </button>
              </TableCell>
              <TableCell>
                {job.timestamp
                  ? dayjs(job.timestamp).format('MMM D, h:mm A')
                  : '-'
                }
              </TableCell>
              <TableCell>
                {job.processedOn
                  ? dayjs(job.processedOn).format('MMM D, h:mm A')
                  : '-'
                }
              </TableCell>
              <TableCell>
                {job.finishedOn
                  ? dayjs(job.finishedOn).format('MMM D, h:mm A')
                  : '-'
                }
              </TableCell>
              <TableCell>
                {job.attemptsMade || 0}
              </TableCell>
              <TableCell className="text-right flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                      size="icon"
                    >
                      <EllipsisVertical />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onJobClick(job)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDeleteJob(job)}
                    >
                      Delete Job
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
