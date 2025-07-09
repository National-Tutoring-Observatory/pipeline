import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import map from 'lodash/map';
import { EllipsisVertical } from "lucide-react";
import { Link } from "react-router";
import type { Run } from "~/modules/runs/runs.types";

export default function ProjectRuns({
  runs,
  onCreateRunButtonClicked,
  onEditRunButtonClicked,
  onDuplicateRunButtonClicked
}: {
  runs: Run[],
  onCreateRunButtonClicked: () => void,
  onEditRunButtonClicked: (run: Run) => void,
  onDuplicateRunButtonClicked: (run: Run) => void,
}) {
  return (
    <div className="mt-8">
      {(runs.length === 0) && (
        <div className="mt-4 mb-4 p-8 border border-black/10 rounded-md text-center">
          No runs created
          <div className="mt-3">
            <Button onClick={onCreateRunButtonClicked}>Create run</Button>
          </div>
        </div>
      )}
      {(runs.length > 0) && (
        <div className="border rounded-md">
          <div className="flex justify-end border-b p-2">
            <Button onClick={onCreateRunButtonClicked}>Create run</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {map(runs, (run) => {
                return (
                  <TableRow key={run._id}>
                    <TableCell className="font-medium">
                      <Link to={`/projects/${run.project}/runs/${run._id}`}>
                        {run.name}
                      </Link>
                    </TableCell>
                    <TableCell>{dayjs(run.createdAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
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
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => onEditRunButtonClicked(run)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicateRunButtonClicked(run)}>
                            Duplicate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}