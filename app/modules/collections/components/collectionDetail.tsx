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
  runsTotalPages,
  runsCurrentPage,
  runsSearchValue,
  runsSortValue,
  isRunsSyncing,
  sessions,
  sessionsTotalPages,
  sessionsCurrentPage,
  sessionsSearchValue,
  sessionsSortValue,
  isSessionsSyncing,
  breadcrumbs,
  onExportCollectionButtonClicked,
  onSessionItemClicked,
  onRunsSearchValueChanged,
  onRunsCurrentPageChanged,
  onRunsSortValueChanged,
  onSessionsSearchValueChanged,
  onSessionsCurrentPageChanged,
  onSessionsSortValueChanged,
  onAddRunsClicked,
  onMergeClicked,
  onDuplicateClicked,
  onEditClicked,
  onDeleteClicked,
  onRunActionClicked,
}: {
  collection: Collection;
  project: { _id: string; name: string };
  runs: Run[];
  runsTotalPages: number;
  runsCurrentPage: number;
  runsSearchValue: string;
  runsSortValue: string;
  isRunsSyncing: boolean;
  sessions: Session[];
  sessionsTotalPages: number;
  sessionsCurrentPage: number;
  sessionsSearchValue: string;
  sessionsSortValue: string;
  isSessionsSyncing: boolean;
  breadcrumbs: Breadcrumb[];
  onExportCollectionButtonClicked: ({
    exportType,
  }: {
    exportType: string;
  }) => void;
  onSessionItemClicked: (id: string) => void;
  onRunsSearchValueChanged: (value: string) => void;
  onRunsCurrentPageChanged: (page: number) => void;
  onRunsSortValueChanged: (sort: string) => void;
  onSessionsSearchValueChanged: (value: string) => void;
  onSessionsCurrentPageChanged: (page: number) => void;
  onSessionsSortValueChanged: (sort: string) => void;
  onAddRunsClicked: () => void;
  onMergeClicked: () => void;
  onDuplicateClicked: () => void;
  onEditClicked: () => void;
  onDeleteClicked: () => void;
  onRunActionClicked: ({ id, action }: { id: string; action: string }) => void;
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
            <div className="mt-2">
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
                hasSearch
                searchValue={sessionsSearchValue}
                onSearchValueChanged={onSessionsSearchValueChanged}
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
            <div className="mt-2">
              <CollectionUI
                items={runs}
                itemsLayout="list"
                getItemAttributes={(item) =>
                  getProjectRunsItemAttributes(item, {
                    collectionId: collection._id,
                  })
                }
                getItemActions={() => [
                  {
                    action: "REMOVE_FROM_COLLECTION",
                    text: "Remove",
                    icon: <Trash2 className="h-4 w-4" />,
                    variant: "destructive",
                  },
                ]}
                onActionClicked={() => {}}
                onItemActionClicked={onRunActionClicked}
                emptyAttributes={{
                  title: "No runs found",
                  description: "",
                }}
                hasSearch
                searchValue={runsSearchValue}
                onSearchValueChanged={onRunsSearchValueChanged}
                hasPagination
                currentPage={runsCurrentPage}
                totalPages={runsTotalPages}
                onPaginationChanged={onRunsCurrentPageChanged}
                sortValue={runsSortValue}
                sortOptions={[
                  { text: "Name", value: "name" },
                  { text: "Created", value: "createdAt" },
                ]}
                onSortValueChanged={onRunsSortValueChanged}
                isSyncing={isRunsSyncing}
                filters={[]}
                filtersValues={{}}
              />
            </div>
          </div>
        </div>

        <CollectionDownloads collection={collection} projectId={project._id} />
      </div>
    </div>
  );
}
