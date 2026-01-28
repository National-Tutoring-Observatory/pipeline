import { Button } from "@/components/ui/button";
import { Collection as CollectionUI } from "@/components/ui/collection";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
} from "@/components/ui/pageHeader";
import { StatItem } from "@/components/ui/stat-item";
import {
  Copy,
  GitMerge,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getDateString from "~/modules/app/helpers/getDateString";
import type { Collection } from "~/modules/collections/collections.types";
import ProjectDownloadDropdown from "~/modules/projects/components/projectDownloadDropdown";
import getProjectRunsItemAttributes from "~/modules/projects/helpers/getProjectRunsItemAttributes";
import getProjectSessionsItemAttributes from "~/modules/projects/helpers/getProjectSessionsItemAttributes";
import type { Run } from "~/modules/runs/runs.types";
import type { Session } from "~/modules/sessions/sessions.types";
import CollectionDownloads from "./collectionDownloads";

export default function CollectionDetail({
  collection,
  project,
  runs,
  sessions,
  breadcrumbs,
  onExportCollectionButtonClicked,
  onSessionItemClicked,
  onAddRunsClicked,
  onMergeClicked,
  onDuplicateClicked,
  onEditClicked,
  onDeleteClicked,
}: {
  collection: Collection;
  project: { _id: string; name: string };
  runs: Run[];
  sessions: Session[];
  breadcrumbs: Breadcrumb[];
  onExportCollectionButtonClicked: ({
    exportType,
  }: {
    exportType: string;
  }) => void;
  onSessionItemClicked: (id: string) => void;
  onAddRunsClicked: () => void;
  onMergeClicked: () => void;
  onDuplicateClicked: () => void;
  onEditClicked: () => void;
  onDeleteClicked: () => void;
}) {
  return (
    <div className="p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
        <PageHeaderRight>
          <div className="text-muted-foreground flex gap-1">
            <ProjectDownloadDropdown
              isExporting={collection.isExporting || false}
              hasExportedCSV={collection.hasExportedCSV || false}
              hasExportedJSONL={collection.hasExportedJSONL || false}
              onExportButtonClicked={onExportCollectionButtonClicked}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="data-[state=open]:bg-muted">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onAddRunsClicked}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Runs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMergeClicked}>
                  <GitMerge className="mr-2 h-4 w-4" />
                  Merge
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicateClicked}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEditClicked}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDeleteClicked}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PageHeaderRight>
      </PageHeader>
      <div>
        <div className="grid max-w-6xl grid-cols-3 justify-start gap-6">
          <StatItem label="Created">
            {getDateString(collection.createdAt)}
          </StatItem>
          <StatItem label="Sessions">
            {collection.sessions?.length || 0}
          </StatItem>
          <StatItem label="Runs">{collection.runs?.length || 0}</StatItem>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="mt-8">
            <div className="text-muted-foreground text-xs">Sessions</div>
            <div className="mt-2 rounded-md border">
              <CollectionUI
                items={sessions}
                itemsLayout="list"
                getItemAttributes={getProjectSessionsItemAttributes}
                getItemActions={() => []}
                onActionClicked={() => {}}
                onItemClicked={onSessionItemClicked}
                emptyAttributes={{
                  title: "No sessions found",
                  description: "",
                }}
                currentPage={1}
                totalPages={1}
                onPaginationChanged={() => {}}
                filters={[]}
                filtersValues={{}}
                onSortValueChanged={() => {}}
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="text-muted-foreground text-xs">Runs</div>
            <div className="mt-2 rounded-md border">
              <CollectionUI
                items={runs}
                itemsLayout="list"
                getItemAttributes={getProjectRunsItemAttributes}
                getItemActions={() => []}
                onActionClicked={() => {}}
                emptyAttributes={{
                  title: "No runs found",
                  description: "",
                }}
                currentPage={1}
                totalPages={1}
                onPaginationChanged={() => {}}
                filters={[]}
                filtersValues={{}}
                onSortValueChanged={() => {}}
              />
            </div>
          </div>
        </div>

        <CollectionDownloads collection={collection} projectId={project._id} />
      </div>
    </div>
  );
}
