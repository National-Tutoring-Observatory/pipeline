import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle } from "lucide-react";

const RunNameAlert = ({
  name
}: { name: string }) => {

  return (
    <>
      {(name.length === 0) && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>Run name is required</AlertDescription>
        </Alert>
      )}
      {(name.length > 0 && name.trim().length === 0) && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>Run name must contain alpha numerical characters</AlertDescription>
        </Alert>
      )}
      {(name.length > 0 && name.trim().length > 0 && name.trim().length < 3) && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>Run name must be longer than 3 characters</AlertDescription>
        </Alert>
      )}
      {(name.length > 0 && name.trim().length >= 3) && (
        <Alert variant="default">
          <CheckCircle className="stroke-green-500" />
          <AlertDescription>Run name looks good</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default RunNameAlert;