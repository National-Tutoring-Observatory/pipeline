import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CircleAlert, CircleCheck, LoaderPinwheel } from "lucide-react";
import AnnotationSchemaViewer from "./annotationSchemaViewer";

const SavePromptVersionDialog = ({
  error,
  reasoning,
  suggestedPrompt,
  suggestedAnnotationSchema,
  isSubmitButtonDisabled,
  isFetching,
  isMatching,
  onSaveClicked,
}: {
  error: string;
  reasoning: string;
  suggestedPrompt: string;
  suggestedAnnotationSchema: [];
  isSubmitButtonDisabled: boolean;
  isFetching: boolean;
  isMatching: boolean;
  onSaveClicked: () => void;
}) => {
  return (
    <DialogContent className="min-w-3xl">
      <DialogHeader>
        <DialogTitle>Save prompt version</DialogTitle>
        <DialogDescription>
          Are you sure you want to save this prompt version? Saving this version
          will stop edits from being made to this version. You can always create
          a new prompt version.
        </DialogDescription>
      </DialogHeader>
      <div>
        {error && (
          <Alert>
            <CircleAlert className="stroke-red-500" />
            <AlertTitle>Alignment check failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!error && isFetching && (
          <Alert className="flex">
            <LoaderPinwheel className="animate-spin" />
            <AlertDescription>
              Checking for prompt and schema alignment
            </AlertDescription>
          </Alert>
        )}
        {!error && !isFetching && isMatching && (
          <Alert>
            <CircleCheck className="stroke-green-500" />
            <AlertTitle>Prompt and schema are aligned!</AlertTitle>
          </Alert>
        )}
        {!error && !isFetching && !isMatching && (
          <Alert>
            <CircleAlert className="stroke-red-500" />
            <AlertTitle>Prompt and schema are not aligned!</AlertTitle>
            <AlertDescription>{reasoning}</AlertDescription>
          </Alert>
        )}
      </div>
      {!error && !isFetching && !isMatching && (
        <div className="space-y-2">
          <p>
            We've suggested a few changes to your prompt and annotation schema:
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Write your prompt here."
                value={suggestedPrompt}
                className="h-80"
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <Label>Annotation schema</Label>
              <AnnotationSchemaViewer
                annotationSchema={suggestedAnnotationSchema}
              />
            </div>
          </div>
        </div>
      )}
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        {isMatching && (
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
        )}
        {!error && !isFetching && !isMatching && (
          <DialogClose asChild>
            <Button
              type="button"
              onClick={() => {
                onSaveClicked();
              }}
            >
              Accept suggestions
            </Button>
          </DialogClose>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default SavePromptVersionDialog;
