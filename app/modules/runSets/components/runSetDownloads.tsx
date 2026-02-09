import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadIcon } from "lucide-react";
import { Link } from "react-router";
import type { RunSet } from "~/modules/runSets/runSets.types";

export default function RunSetDownloads({
  runSet,
  projectId,
}: {
  runSet: RunSet;
  projectId: string;
}) {
  if (runSet.hasExportedCSV || runSet.hasExportedJSONL) {
    return (
      <div className="mt-8">
        <div className="text-muted-foreground text-xs">Downloads</div>
        <div className="mt-2 grid grid-cols-2 gap-6">
          {runSet.hasExportedCSV && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>CSV download</div>
                  <div>
                    <Link
                      to={`/api/downloads/${projectId}/run-sets/${runSet._id}?exportType=CSV`}
                      reloadDocument
                      target="_blank"
                    >
                      <Button size="icon" variant="ghost">
                        <DownloadIcon></DownloadIcon>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {runSet.hasExportedJSONL && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>JSONL download</div>
                  <div>
                    <Link
                      to={`/api/downloads/${projectId}/run-sets/${runSet._id}?exportType=JSONL`}
                      reloadDocument
                      target="_blank"
                    >
                      <Button size="icon" variant="ghost">
                        <DownloadIcon></DownloadIcon>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return null;
}
