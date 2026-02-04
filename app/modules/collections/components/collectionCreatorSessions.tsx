import { Label } from "@/components/ui/label";
import SessionSelectorContainer from "~/modules/sessions/containers/sessionSelectorContainer";

export default function CollectionSessionsField({
  selectedSessions,
  onSessionsChanged,
}: {
  selectedSessions: string[];
  onSessionsChanged: (sessions: string[]) => void;
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
