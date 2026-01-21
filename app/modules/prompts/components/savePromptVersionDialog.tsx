import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  CircleAlert,
  CircleCheck,
  Loader,
  Loader2,
  LoaderCircle,
  LoaderPinwheel,
} from "lucide-react";

const SavePromptVersionDialog = ({
  reasoning,
  isSubmitButtonDisabled,
  isFetching,
  isMatching,
  onSaveClicked,
}: {
  reasoning: string;
  isSubmitButtonDisabled: boolean;
  isFetching: boolean;
  isMatching: boolean;
  onSaveClicked: () => void;
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save prompt version</DialogTitle>
        <DialogDescription>
          Are you sure you want to save this prompt version? Saving this version
          will stop edits from being made to this version. You can always create
          a new prompt version.
        </DialogDescription>
      </DialogHeader>
      <div>
        {isFetching && (
          <Alert className="flex">
            <LoaderPinwheel className="animate-spin" />
            <AlertDescription>
              Checking for prompt and schema alignment
            </AlertDescription>
          </Alert>
        )}
        {!isFetching && isMatching && (
          <Alert>
            <CircleCheck className="stroke-green-500" />
            <AlertTitle>Prompt and schema are aligned!</AlertTitle>
          </Alert>
        )}
        {!isFetching && !isMatching && (
          <Alert>
            <CircleAlert className="stroke-red-500" />
            <AlertTitle>Prompt and schema are not aligned!</AlertTitle>
            <AlertDescription>{reasoning}</AlertDescription>
          </Alert>
        )}
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isSubmitButtonDisabled}
            onClick={() => {
              onSaveClicked();
            }}
          >
            Save version
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default SavePromptVersionDialog;
