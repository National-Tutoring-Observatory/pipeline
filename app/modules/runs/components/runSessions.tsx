import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { Spinner } from "@/components/ui/spinner";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { Run, RunSession } from "~/modules/runs/runs.types";
import SessionListSidebar from "~/modules/sessions/components/sessionListSidebar";
import RunSessionViewerContainer from "~/modules/sessions/containers/runSessionViewerContainer";
import type { SessionFile } from "~/modules/sessions/sessions.types";

export default function RunSessions({
  run,
  sessionFile,
  session,
  breadcrumbs,
  runLink,
  currentSessionId,
  paginatedSessions,
  sidebarSearchValue,
  sidebarCurrentPage,
  sidebarIsSyncing,
  isLoadingSession,
  onSidebarSearchValueChanged,
  onSidebarPaginationChanged,
}: {
  run: Run;
  sessionFile: SessionFile;
  session: RunSession;
  breadcrumbs: Breadcrumb[];
  runLink: string;
  currentSessionId: string;
  paginatedSessions: { data: RunSession[]; count: number; totalPages: number };
  sidebarSearchValue: string;
  sidebarCurrentPage: number;
  sidebarIsSyncing: boolean;
  isLoadingSession: boolean;
  onSidebarSearchValueChanged: (value: string) => void;
  onSidebarPaginationChanged: (value: number) => void;
}) {
  return (
    <div className="max-w-7xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <div className="flex h-[calc(100vh-140px)] rounded-md border">
        <SessionListSidebar
          sessions={paginatedSessions.data}
          totalPages={paginatedSessions.totalPages}
          count={paginatedSessions.count}
          currentSessionId={currentSessionId}
          runLink={runLink}
          searchValue={sidebarSearchValue}
          currentPage={sidebarCurrentPage}
          isSyncing={sidebarIsSyncing}
          onSearchValueChanged={onSidebarSearchValueChanged}
          onPaginationChanged={onSidebarPaginationChanged}
        />
        {isLoadingSession ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner className="size-6" />
          </div>
        ) : (
          <RunSessionViewerContainer
            run={run}
            session={session}
            sessionFile={sessionFile}
          />
        )}
      </div>
    </div>
  );
}
