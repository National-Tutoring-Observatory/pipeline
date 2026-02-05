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
import type { Collection as CollectionType } from "~/modules/collections/collections.types";

interface RunCollectionsProps {
  projectId: string;
  runId: string;
  collections: CollectionType[];
  collectionsCount: number;
}

export default function RunCollections({
  projectId,
  runId,
  collections,
  collectionsCount,
}: RunCollectionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const fetcher = useFetcher<{ collections: CollectionType[] }>();
  const hasMore = collectionsCount > 3;
  const displayCollections = collections.slice(0, 3);
  const remainingCount = collectionsCount - 3;

  const handleDialogOpen = (open: boolean) => {
    setDialogOpen(open);
    if (open && fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(
        `/projects/${projectId}/runs/${runId}?intent=GET_ALL_COLLECTIONS`,
      );
    }
  };

  const allCollections = fetcher.data?.collections || collections;

  if (collectionsCount === 0) {
    return (
      <StatItem label="Collections">
        <span className="text-muted-foreground">None</span>
      </StatItem>
    );
  }

  return (
    <StatItem label="Collections">
      <div className="flex flex-wrap items-center gap-1">
        {displayCollections.map((collection) => (
          <Link
            key={collection._id}
            to={`/projects/${projectId}/collections/${collection._id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Badge
              variant="secondary"
              className="hover:bg-accent max-w-[120px] cursor-pointer truncate"
            >
              {collection.name}
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
                  Collections containing this run
                </DialogTitle>
              </DialogHeader>
              <div className="max-h-[400px] overflow-y-auto">
                {fetcher.state === "loading" ? (
                  <div className="text-muted-foreground py-8 text-center">
                    Loading collections...
                  </div>
                ) : (
                  <ItemGroup className="rounded-sm border">
                    {allCollections.map((collection, index) => {
                      const runCount = collection.runs?.length || 0;
                      return (
                        <div key={collection._id}>
                          <Item asChild>
                            <Link
                              to={`/projects/${projectId}/collections/${collection._id}`}
                            >
                              <div className="flex flex-1 flex-col gap-1 py-2">
                                <div className="font-medium">
                                  {collection.name}
                                </div>
                                <div className="text-muted-foreground flex items-center gap-4 text-xs">
                                  <span className="flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    {runCount} run{runCount !== 1 ? "s" : ""}
                                  </span>
                                  <span>
                                    Created{" "}
                                    {getDateString(collection.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          </Item>
                          {index !== allCollections.length - 1 && (
                            <ItemSeparator />
                          )}
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
