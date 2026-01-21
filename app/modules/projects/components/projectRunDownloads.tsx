import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadIcon } from "lucide-react";
import { Link } from "react-router";
import type { Run } from "~/modules/runs/runs.types";

export default function ProjectRunDownloads({ run }: { run: Run }) {
  if (run.hasExportedCSV || run.hasExportedJSONL) {
    return (
      <div className="mt-8">
        <div className="text-muted-foreground text-xs">Downloads</div>
        <div className="mt-2 grid grid-cols-2 gap-6">
          {run.hasExportedCSV && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>CSV download</div>
                  <div>
                    <Link
                      to={`/api/downloads/${run.project}/${run._id}?exportType=CSV`}
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
          {run.hasExportedJSONL && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>JSONL download</div>
                  <div>
                    <Link
                      to={`/api/downloads/${run.project}/${run._id}?exportType=JSONL`}
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
