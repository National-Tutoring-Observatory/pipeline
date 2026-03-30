import { Label } from "@/components/ui/label";
import SessionSelectorContainer from "~/modules/sessions/containers/sessionSelectorContainer";
import type { SessionData } from "~/modules/sessions/sessions.types";

export default function RunSetSessionsField({
  selectedSessions,
  onSessionsChanged,
}: {
  selectedSessions: string[];
  onSessionsChanged: (sessions: SessionData[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="font-bold">Sessions</Label>
      <div>
        <SessionSelectorContainer
          selectedSessions={selectedSessions}
          onSelectedSessionsChanged={onSessionsChanged}
        />
      </div>
    </div>
  );
}
