import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle } from "lucide-react";

const TeamNameAlert = ({ name }: { name: string }) => {
  return (
    <>
      {name.length === 0 && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>Team name is required</AlertDescription>
        </Alert>
      )}
      {name.length > 0 && name.trim().length === 0 && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>
            Team name must contain alpha numerical characters
          </AlertDescription>
        </Alert>
      )}
      {name.length > 0 && name.trim().length > 0 && name.trim().length < 3 && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>
            Team name must be longer than 3 characters
          </AlertDescription>
        </Alert>
      )}
      {name.length > 0 && name.trim().length >= 3 && (
        <Alert variant="default">
          <CheckCircle className="stroke-green-500" />
          <AlertDescription>Team name looks good</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default TeamNameAlert;
