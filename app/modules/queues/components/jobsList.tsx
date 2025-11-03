import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from 'dayjs';
import orderBy from "lodash/orderBy";
import { EllipsisVertical } from "lucide-react";
import { useMemo, useState } from "react";
import type { Job } from "../queues.types";
import SortableTableHead from "./sortableTableHead";

type SortField = 'name' | 'timestamp' | 'processedOn' | 'finishedOn' | 'attemptsMade';
type SortDirection = 'asc' | 'desc';

interface JobsListProps {
  jobs: Job[];
  state: string;
  onDisplayJobClick: (job: Job) => void;
  onRemoveJobClick: (job: Job) => void;
  totalJobs: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function JobsList({
  jobs,
  state,
  onDisplayJobClick,
  onRemoveJobClick,
  totalJobs,
  currentPage,
  pageSize,
  onPageChange
}: JobsListProps) {
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedJobs = useMemo(() => {
    const jobsWithSortValues = jobs.map(job => ({
      ...job,
      _sortValues: {
        name: job.name,
        timestamp: job.timestamp ? dayjs(job.timestamp).valueOf() : null,
        processedOn: job.processedOn ? dayjs(job.processedOn).valueOf() : null,
        finishedOn: job.finishedOn ? dayjs(job.finishedOn).valueOf() : null,
        attemptsMade: job.attemptsMade || 0,
      }
    }));

    return orderBy(
      jobsWithSortValues,
      [`_sortValues.${sortField}`],
      [sortDirection]
    );
  }, [jobs, sortField, sortDirection]);

  const totalPages = Math.ceil(totalJobs / pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field as SortField);
      setSortDirection('desc');
    }
  };

  const getVisiblePages = (totalPages: number, currentPage: number) => {
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

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
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                field="name"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={handleSort}
                className="w-[250px]"
              >
                Job Name
              </SortableTableHead>
              <SortableTableHead
                field="timestamp"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              >
                Created
              </SortableTableHead>
              <SortableTableHead
                field="processedOn"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              >
                Processed
              </SortableTableHead>
              <SortableTableHead
                field="finishedOn"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              >
                Finished
              </SortableTableHead>
              <SortableTableHead
                field="attemptsMade"
                currentSortField={sortField}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              >
                Attempts
              </SortableTableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">
                  <button
                    onClick={() => onDisplayJobClick(job)}
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
                      <DropdownMenuItem onClick={() => onDisplayJobClick(job)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onRemoveJobClick(job)}
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) onPageChange(currentPage - 1);
                  }}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {getVisiblePages(totalPages, currentPage).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) onPageChange(currentPage + 1);
                  }}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
