import { useEffect, useState } from "react";
import ViewSession from "../components/viewSession";
import type { Session } from "../sessions.types";


export default function ViewSessionContainer({ session }: { session: Session }) {

  const [transcript, setTranscript] = useState(null);
  const [leadRole, setLeadRole] = useState('');

  useEffect(() => {
    const fetchSession = async () => {

      const response = await fetch("/api/storage", {
        method: "POST",
        body: JSON.stringify({ intent: "REQUEST_STORAGE", payload: { url: `storage/${session.project}/preAnalysis/${session._id}/${session.name}` } }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();

      const sessionRequest = await fetch(jsonData.requestUrl);

      if (!sessionRequest.ok) {
        throw new Error(`HTTP error! status: ${sessionRequest.status}`);
      }

      const sessionData = await sessionRequest.json();

      setTranscript(sessionData.transcript);
      setLeadRole(sessionData.leadRole);

    }
    fetchSession();
  }, []);

  return (
    <ViewSession
      transcript={transcript}
      session={session}
      leadRole={leadRole}
    />
  );
}
