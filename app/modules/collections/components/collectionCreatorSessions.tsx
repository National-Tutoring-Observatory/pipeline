import { Label } from "@/components/ui/label";
import SessionSelectorContainer from "~/modules/sessions/containers/sessionSelectorContainer";

const CollectionCreatorSessions = ({
  selectedSessions,
  onSessionsChanged
}: {
  selectedSessions: string[],
  onSessionsChanged: (sessions: string[]) => void;
}) => {
  return (
    <div className="space-y-2">
      <Label>Sessions</Label>
      <div>
        <p className="text-sm text-muted-foreground">Collections are locked to sessions. Once chosen, you will not be able to change this for this collection.</p>
      </div>
      <div >
        <SessionSelectorContainer
          selectedSessions={selectedSessions}
          onSelectedSessionsChanged={onSessionsChanged}
        />
      </div>
    </div>
  );
};

export default CollectionCreatorSessions;
