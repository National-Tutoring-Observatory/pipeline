import {
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
} from "@/components/ui/pageHeader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { Run, SessionNavigation } from "~/modules/runs/runs.types";
import SessionViewerContainer from "~/modules/sessions/containers/sessionViewerContainer";
import type { Session, SessionFile } from "~/modules/sessions/sessions.types";
import SessionNavigationButton from "./sessionNavigationButton";

export default function RunSessions({
  run,
  sessionFile,
  session,
  breadcrumbs,
  sessionNavigation,
}: {
  run: Run;
  sessionFile: SessionFile;
  session: Session;
  breadcrumbs: Breadcrumb[];
  sessionNavigation: SessionNavigation;
}) {
  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
        <PageHeaderRight>
          <span className="text-sm">
            Session {sessionNavigation.currentIndex + 1} of{" "}
            {sessionNavigation.totalDone} done
          </span>
          <SessionNavigationButton url={sessionNavigation.prevSessionUrl}>
            <ChevronLeft className="h-4 w-4" />
          </SessionNavigationButton>
          <SessionNavigationButton url={sessionNavigation.nextSessionUrl}>
            <ChevronRight className="h-4 w-4" />
          </SessionNavigationButton>
        </PageHeaderRight>
      </PageHeader>
      <SessionViewerContainer
        run={run}
        session={session}
        sessionFile={sessionFile}
      />
    </div>
  );
}
