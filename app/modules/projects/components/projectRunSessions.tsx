import SessionViewerContainer from "~/modules/sessions/containers/sessionViewerContainer";
import type { Session, SessionFile } from "~/modules/sessions/sessions.types";

export default function ProjectRunSessions({ sessionFile, session }: { sessionFile: SessionFile, session: Session }) {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 relative">
        <div className="flex justify-between">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {session.name}
          </h1>
        </div>
      </div>
      <SessionViewerContainer
        session={session}
        sessionFile={sessionFile}
      />
    </div>
  )
}