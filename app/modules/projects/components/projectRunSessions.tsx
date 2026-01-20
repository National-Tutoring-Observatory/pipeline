import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { Run } from "~/modules/runs/runs.types";
import SessionViewerContainer from "~/modules/sessions/containers/sessionViewerContainer";
import type { Session, SessionFile } from "~/modules/sessions/sessions.types";

export default function ProjectRunSessions({
  run,
  sessionFile,
  session,
  breadcrumbs
}: {
  run: Run,
  sessionFile: SessionFile,
  session: Session,
  breadcrumbs: Breadcrumb[]
}) {
  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs
            breadcrumbs={breadcrumbs}
          />
        </PageHeaderLeft>
      </PageHeader>
      <SessionViewerContainer
        run={run}
        session={session}
        sessionFile={sessionFile}
      />
    </div>
  )
}
