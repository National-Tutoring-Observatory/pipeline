import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Item, ItemGroup, ItemSeparator } from "@/components/ui/item";
import { StatItem } from "@/components/ui/stat-item";
import { FolderOpen, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useFetcher } from "react-router";
import getDateString from "~/modules/app/helpers/getDateString";
import type { RunSet } from "~/modules/runSets/runSets.types";

interface RunRunSetsProps {
  projectId: string;
  runId: string;
  runSets: RunSet[];
  runSetsCount: number;
}

export default function RunRunSets({
  projectId,
  runId,
  runSets,
  runSetsCount,
}: RunRunSetsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const fetcher = useFetcher<{ runSets: RunSet[] }>();
  const hasMore = runSetsCount > 3;
  const displayRunSets = runSets.slice(0, 3);
  const remainingCount = runSetsCount - 3;

  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open);
    if (open && fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(
        `/projects/${projectId}/runs/${runId}?intent=GET_ALL_RUN_SETS`,
      );
    }
  };

  const allRunSets = fetcher.data?.runSets || runSets;

  if (runSetsCount === 0) {
    return (
      <StatItem label="Run Sets">
        <span className="text-muted-foreground">None</span>
      </StatItem>
    );
  }

  return (
    <StatItem label="Run Sets">
      <div className="flex flex-wrap items-center gap-1">
        {displayRunSets.map((runSet) => (
          <Link
            key={runSet._id}
            to={`/projects/${projectId}/run-sets/${runSet._id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Badge
              variant="secondary"
              className="hover:bg-accent max-w-[120px] cursor-pointer truncate"
            >
              {runSet.name}
            </Badge>
          </Link>
        ))}
        {hasMore && (
          <Dialog open={dialogOpen} onOpenChange={handleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                +{remainingCount} more
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Run sets containing this run
                </DialogTitle>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto">
                {fetcher.state === "loading" ? (
                  <div className="text-muted-foreground py-8 text-center">
                    Loading run sets...
                  </div>
                ) : (
                  <ItemGroup className="rounded-sm border">
                    {allRunSets.map((runSet, index) => {
                      const runCount = runSet.runs?.length || 0;
                      return (
                        <div key={runSet._id}>
                          <Item asChild>
                            <Link
                              to={`/projects/${projectId}/run-sets/${runSet._id}`}
                            >
                              <div className="flex flex-1 flex-col gap-1 py-2">
                                <div className="font-medium">{runSet.name}</div>
                                <div className="text-muted-foreground flex items-center gap-4 text-xs">
                                  <span className="flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    {runCount} run{runCount !== 1 ? "s" : ""}
                                  </span>
                                  <span>
                                    Created {getDateString(runSet.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </Item>
                          {index !== allRunSets.length - 1 && <ItemSeparator />}
                        </div>
                      );
                    })}
                  </ItemGroup>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </StatItem>
  );
}
