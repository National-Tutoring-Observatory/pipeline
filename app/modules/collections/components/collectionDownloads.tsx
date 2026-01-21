import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DownloadIcon } from "lucide-react";
import { Link } from "react-router";
import type { Collection } from "~/modules/collections/collections.types";

export default function CollectionDownloads({
  collection,
  projectId,
}: {
  collection: Collection;
  projectId: string;
}) {
  if (collection.hasExportedCSV || collection.hasExportedJSONL) {
    return (
      <div className="mt-8">
        <div className="text-muted-foreground text-xs">Downloads</div>
        <div className="mt-2 grid grid-cols-2 gap-6">
          {collection.hasExportedCSV && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>CSV download</div>
                  <div>
                    <Link
                      to={`/api/downloads/${projectId}/collections/${collection._id}?exportType=CSV`}
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
          {collection.hasExportedJSONL && (
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>JSONL download</div>
                  <div>
                    <Link
                      to={`/api/downloads/${projectId}/collections/${collection._id}?exportType=JSONL`}
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
