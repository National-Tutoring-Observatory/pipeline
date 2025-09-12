import { useEffect, useState } from "react";
import ViewSession from "../components/viewSession";
import type { Session } from "../sessions.types";


export default function ViewSessionContainer({ session }: { session: Session }) {

  const [transcript, setTranscript] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {

      const response = await fetch("/api/storage", {
        method: "POST",
        body: JSON.stringify({ intent: "REQUEST_STORAGE", payload: { url: `storage/${session.project}/preAnalysis/${session._id}/${session.name}` } }),
        // …
      });

      console.log(response);


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();

      console.log(jsonData.requestUrl);



      const sessionRequest = await fetch(jsonData.requestUrl);

      if (!sessionRequest.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const sessionData = await sessionRequest.json();

      setTranscript(sessionData.transcript);

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