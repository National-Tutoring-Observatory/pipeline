import { Collection as CollectionUI } from "@/components/ui/collection";
import { StatItem } from "@/components/ui/stat-item";
import getDateString from "~/modules/app/helpers/getDateString";
import type { Collection } from "~/modules/collections/collections.types";
import getProjectRunsItemAttributes from "~/modules/projects/helpers/getProjectRunsItemAttributes";
import getProjectSessionsItemAttributes from "~/modules/projects/helpers/getProjectSessionsItemAttributes";
import type { Run } from "~/modules/runs/runs.types";
import type { Session } from "~/modules/sessions/sessions.types";
import CollectionDownloads from "./collectionDownloads";

export default function CollectionOverview({
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
  onSessionItemClicked,
  onRunsSearchValueChanged,
  onRunsCurrentPageChanged,
  onRunsSortValueChanged,
  onSessionsSearchValueChanged,
  onSessionsCurrentPageChanged,
  onSessionsSortValueChanged,
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
  onSessionItemClicked: (id: string) => void;
  onRunsSearchValueChanged: (value: string) => void;
  onRunsCurrentPageChanged: (page: number) => void;
  onRunsSortValueChanged: (sort: string) => void;
  onSessionsSearchValueChanged: (value: string) => void;
  onSessionsCurrentPageChanged: (page: number) => void;
  onSessionsSortValueChanged: (sort: string) => void;
}) {
  return (
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
              getItemActions={() => []}
              onActionClicked={() => {}}
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
  );
}
