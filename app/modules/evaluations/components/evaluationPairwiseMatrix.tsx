import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PairwiseMatrix } from "../helpers/buildPairwiseMatrix";
import getKappaCellClass from "../helpers/getKappaCellClass";

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            {matrix.runs.map((run) => (
              <TableHead
                key={run.runId}
                className="max-w-24 text-center whitespace-normal"
              >
                <div>{run.runName}</div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.runs.map((rowRun, rowIndex) => (
            <TableRow key={rowRun.runId}>
              <TableCell className="max-w-48 font-medium whitespace-normal">
                {rowRun.runName}
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
  );
}
