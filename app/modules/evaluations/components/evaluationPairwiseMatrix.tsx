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
import getKappaInterpretation from "../helpers/getKappaInterpretation";

function getKappaCellClass(kappa: number): string {
  const interpretation = getKappaInterpretation(kappa);
  if (interpretation === "Almost Perfect" || interpretation === "Substantial") {
    return "bg-green-50 dark:bg-green-950/30";
  }
  if (interpretation === "Moderate") {
    return "bg-amber-50 dark:bg-amber-950/30";
  }
  return "bg-red-50 dark:bg-red-950/30";
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            {matrix.runs.map((run) => (
              <TableHead key={run.runId} className="text-center">
                <div className="max-w-24 truncate" title={run.runName}>
                  {run.runName}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.runs.map((rowRun, rowIndex) => (
            <TableRow key={rowRun.runId}>
              <TableCell className="font-medium">
                <div className="max-w-32 truncate" title={rowRun.runName}>
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
  );
}
