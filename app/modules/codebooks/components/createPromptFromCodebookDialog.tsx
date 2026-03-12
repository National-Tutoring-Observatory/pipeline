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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { annotationTypeOptions } from "~/modules/annotations/helpers/annotationTypes";
import type { CodebookVersion } from "../codebooks.types";

export default function CreatePromptFromCodebookDialog({
  codebookVersions,
  productionVersion,
  onCreatePromptClicked,
  isSubmitting = false,
}: {
  codebookVersions: CodebookVersion[];
  productionVersion: number;
  onCreatePromptClicked: (options: {
    codebookVersionId: string;
    annotationType: string;
  }) => void;
  isSubmitting: boolean;
}) {
  const defaultVersion = codebookVersions.find(
    (v) => v.version === productionVersion,
  );

  const [codebookVersionId, setCodebookVersionId] = useState(
    defaultVersion?._id ?? codebookVersions[0]?._id ?? "",
  );
  const [annotationType, setAnnotationType] = useState("PER_UTTERANCE");

  const isSubmitButtonDisabled = !codebookVersionId || isSubmitting;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create prompt from codebook</DialogTitle>
        <DialogDescription>
          Generate a prompt using AI from the selected codebook version. The
          codebook categories and codes will be used to build the annotation
          schema.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="codebook-version">Codebook version</Label>
        <Select value={codebookVersionId} onValueChange={setCodebookVersionId}>
          <SelectTrigger id="codebook-version" className="w-[240px]">
            <SelectValue placeholder="Select a version" />
          </SelectTrigger>
          <SelectContent>
            {codebookVersions.map((v) => (
              <SelectItem key={v._id} value={v._id}>
                {v.name} (v{v.version})
                {v.version === productionVersion ? " - Production" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Label htmlFor="annotation-type">Annotation type</Label>
        <Select value={annotationType} onValueChange={setAnnotationType}>
          <SelectTrigger id="annotation-type" className="w-[240px]">
            <SelectValue placeholder="Select an annotation type" />
          </SelectTrigger>
          <SelectContent>
            {annotationTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              onCreatePromptClicked({ codebookVersionId, annotationType });
            }}
          >
            Create prompt
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
