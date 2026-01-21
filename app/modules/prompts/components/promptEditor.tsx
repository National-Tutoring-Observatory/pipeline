import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookCheck, Save } from "lucide-react";
import { useEffect, useState } from "react";
import type { PromptVersion } from "../prompts.types";
import AnnotationSchemaBuilder from "./annotationSchemaBuilder";

export default function PromptEditor({
  promptVersion,
  isLoading,
  isProduction,
  onSavePromptVersion,
  onMakePromptVersionProduction,
}: {
  promptVersion: PromptVersion;
  isLoading: boolean;
  isProduction: boolean;
  onSavePromptVersion: ({
    name,
    userPrompt,
    annotationSchema,
  }: {
    name: string;
    userPrompt: string;
    annotationSchema: any[];
  }) => void;
  onMakePromptVersionProduction: () => void;
}) {
  const [hasChanges, setHasChanges] = useState(false);
  const [name, setName] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [annotationSchema, setAnnotationSchema] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasChanges(true);
    setName(event.target.value);
  };

  const onUserPromptChanged = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setHasChanges(true);
    setUserPrompt(event.target.value);
  };

  const onAnnotationSchemaChanged = (annotationSchema: any) => {
    setHasChanges(true);
    setAnnotationSchema(annotationSchema);
  };

  const onSavePromptVersionClicked = () => {
    setIsSaving(true);
    onSavePromptVersion({ name, userPrompt, annotationSchema });
  };

  const onMakePromptVersionProductionClicked = () => {
    onMakePromptVersionProduction();
  };

  useEffect(() => {
    if (promptVersion) {
      setHasChanges(false);
      setName(promptVersion.name);
      setUserPrompt(promptVersion.userPrompt || "");
      setAnnotationSchema(promptVersion.annotationSchema);
    }
  }, [promptVersion]);

  return (
    <div className="border-l">
      <div className="flex items-center justify-between border-b p-2 text-sm">
        <div>
          <div>{`Version: ${promptVersion.name}`}</div>
        </div>
        <div className="flex items-center space-x-4">
          {!isProduction && promptVersion.hasBeenSaved && (
            <Button
              variant="ghost"
              className="cursor-pointer hover:text-indigo-600"
              onClick={onMakePromptVersionProductionClicked}
            >
              <BookCheck />
              Make production version
            </Button>
          )}
          {!promptVersion.hasBeenSaved && (
            <Button
              variant="ghost"
              className="cursor-pointer hover:text-indigo-600"
              disabled={!hasChanges || isLoading}
              onClick={onSavePromptVersionClicked}
            >
              <Save />
              Save prompt version
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-8 p-8">
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={name}
            disabled={promptVersion.hasBeenSaved}
            autoComplete="off"
            onChange={onNameChanged}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Write your prompt here."
            value={userPrompt}
            className="h-80"
            disabled={promptVersion.hasBeenSaved}
            onChange={onUserPromptChanged}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="prompt">Annotation schema</Label>
          <AnnotationSchemaBuilder
            annotationSchema={annotationSchema}
            hasBeenSaved={promptVersion.hasBeenSaved}
            onAnnotationSchemaChanged={onAnnotationSchemaChanged}
          />
        </div>
      </div>
    </div>
  );
}
