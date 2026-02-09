import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle } from "lucide-react";

const RunSetNameAlert = ({ name }: { name: string }) => {
  return (
    <>
      {name.length === 0 && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>Run set name is required</AlertDescription>
        </Alert>
      )}
      {name.length > 0 && name.trim().length === 0 && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>
            Run set name must contain alpha numerical characters
          </AlertDescription>
        </Alert>
      )}
      {name.length > 0 && name.trim().length > 0 && name.trim().length < 3 && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>
            Run set name must be longer than 3 characters
          </AlertDescription>
        </Alert>
      )}
      {name.length > 0 && name.trim().length >= 3 && (
        <Alert variant="default">
          <CheckCircle className="stroke-green-500" />
          <AlertDescription>Run set name looks good</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default RunSetNameAlert;
