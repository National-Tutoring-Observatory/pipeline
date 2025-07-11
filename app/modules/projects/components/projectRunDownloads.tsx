import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Run } from "~/modules/runs/runs.types";

export default function ProjectRunDownloads({ run }: { run: Run }) {
  console.log(run);

  if (run.hasExportedCSV || run.hasExportedJSONL) {
    return (
      <div className="mt-8">
        <div className="text-xs text-muted-foreground">Downloads</div>
        <div className="grid grid-cols-2 gap-6 mt-2">
          {(run.hasExportedCSV) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  CSV download
                </CardTitle>
              </CardHeader>
            </Card>
          )}
          {(run.hasExportedJSONL) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  JSONL download
                </CardTitle>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return null;
}