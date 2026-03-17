import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { BotIcon, UserIcon } from "lucide-react";
import type { PairwiseMatrix } from "../helpers/buildPairwiseMatrix";
import getKappaCellClass from "../helpers/getKappaCellClass";

function RunTypeIcon({ isHuman }: { isHuman: boolean }) {
  return isHuman ? (
    <UserIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
  ) : (
    <BotIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
  );
}

export default function EvaluationPairwiseMatrix({
  matrix,
}: {
  matrix: PairwiseMatrix;
}) {
  if (matrix.runs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Pairwise Agreement Matrix</h2>
        <p className="text-muted-foreground text-sm">
          {`Cohen's Kappa between all run pairs`}
        </p>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-background sticky left-0 z-10 min-w-50 shadow-[inset_-1px_0_0_0_var(--color-border)]" />
              {matrix.runs.map((run) => (
                <TableHead
                  key={run.runId}
                  className="min-w-50 border-r text-center whitespace-normal"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <RunTypeIcon isHuman={run.isHuman} />
                    {run.runName}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrix.runs.map((rowRun, rowIndex) => (
              <TableRow key={rowRun.runId}>
                <TableCell className="bg-background sticky left-0 z-10 min-w-50 font-medium whitespace-normal shadow-[inset_-1px_0_0_0_var(--color-border)]">
                  <div className="flex items-center gap-1.5">
                    <RunTypeIcon isHuman={rowRun.isHuman} />
                    {rowRun.runName}
                  </div>
                </TableCell>
                {matrix.cells[rowIndex].map((cell, colIndex) => (
                  <TableCell
                    key={matrix.runs[colIndex].runId}
                    className={cn(
                      "text-center",
                      cell.kappa !== null && getKappaCellClass(cell.kappa),
                    )}
                  >
                    {cell.kappa !== null ? (
                      <span className="text-sm font-medium">
                        {cell.kappa.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
