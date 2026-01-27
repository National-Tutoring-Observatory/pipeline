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
  sessionsTotalPages,
  sessionsCurrentPage,
  sessionsSortValue,
  isSessionsSyncing,
  breadcrumbs,
  onExportCollectionButtonClicked,
  onSessionItemClicked,
  onSessionsCurrentPageChanged,
  onSessionsSortValueChanged,
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
  sessionsTotalPages: number;
  sessionsCurrentPage: number;
  sessionsSortValue: string;
  isSessionsSyncing: boolean;
  breadcrumbs: Breadcrumb[];
  onExportCollectionButtonClicked: ({
    exportType,
  }: {
    exportType: string;
  }) => void;
  onSessionItemClicked: (id: string) => void;
  onSessionsCurrentPageChanged: (page: number) => void;
  onSessionsSortValueChanged: (sort: string) => void;
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
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-muted-foreground text-xs">Created</div>
            <div>
              {collection.createdAt
                ? new Date(collection.createdAt).toLocaleDateString()
                : "--"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Sessions</div>
            <div>{collection.sessions?.length || 0}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Runs</div>
            <div>{collection.runs?.length || 0}</div>
          </div>
        </div>

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
              hasPagination
              currentPage={sessionsCurrentPage}
              totalPages={sessionsTotalPages}
              onPaginationChanged={onSessionsCurrentPageChanged}
              sortValue={sessionsSortValue}
              sortOptions={[
                { text: "Name", value: "name" },
                { text: "Created", value: "createdAt" },
              ]}
              onSortValueChanged={onSessionsSortValueChanged}
              isSyncing={isSessionsSyncing}
              filters={[]}
              filtersValues={{}}
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

        <CollectionDownloads collection={collection} projectId={project._id} />
      </div>
    </div>
  );
}
