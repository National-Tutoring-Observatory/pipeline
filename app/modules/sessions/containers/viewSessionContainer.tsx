import { useEffect, useState } from "react";
import ViewSession from "../components/viewSession";
import type { Session } from "../sessions.types";


export default function ViewSessionContainer({ session }: { session: Session }) {

  const [transcript, setTranscript] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {

      const response = await fetch(`/storage/${session.project}/preAnalysis/${session._id}/${session.name}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();

      setTranscript(jsonData.transcript);

    }
    fetchSession();
  }, []);

  return (
    <ViewSession
      transcript={transcript}
      session={session}
    />
  );
}