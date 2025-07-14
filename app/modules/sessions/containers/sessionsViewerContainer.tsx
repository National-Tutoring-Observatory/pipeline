import SessionViewer from '../components/sessionViewer';
import type { Session, SessionFile } from '../sessions.types';

export default function SessionViewerContainer({ session, sessionFile }: { session: Session, sessionFile: SessionFile }) {
  return (
    <SessionViewer
      session={session}
      sessionFile={sessionFile}
    />
  );
}