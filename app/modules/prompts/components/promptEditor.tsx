import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Archive, Save, SaveOff, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import type { PromptVersion } from "../prompts.types";

export default function PromptEditor({
  promptVersion,
  isLoading,
  onSavePromptVersion
}: {
  promptVersion: PromptVersion,
  isLoading: boolean,
  onSavePromptVersion: ({ name, userPrompt, _id }: { name: string; userPrompt: string; _id: string }) => void
}) {

  const [hasChanges, setHasChanges] = useState(false);
  const [name, setName] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasChanges(true);
    setName(event.target.value);
  }

  const onUserPromptChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasChanges(true);
    setUserPrompt(event.target.value);
  }

  const onSavePromptVersionClicked = () => {
    setIsSaving(true);
    onSavePromptVersion({ name, userPrompt, _id: promptVersion._id });
  }

  useEffect(() => {
    if (promptVersion) {
      setHasChanges(false);
      setName(promptVersion.name);
      setUserPrompt(promptVersion.userPrompt || '')
    }
  }, [promptVersion]);

  console.log(userPrompt);

  return (
    <div>
      <div className="border-b p-2 text-sm flex justify-between items-center">
        <div>
          <div>{`Version: ${promptVersion.name}`}</div>
        </div>
        <div className="space-x-4 flex items-center">
          <Button
            size="icon"
            variant="ghost"
            className="size-4 cursor-pointer hover:text-indigo-600"
            disabled={!hasChanges || isLoading}
            onClick={onSavePromptVersionClicked}
          >
            {(hasChanges) && (<Save />) || (<SaveOff />)}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-4 cursor-pointer hover:text-indigo-600"
            title="Archive version"
            disabled={isLoading}>
            <Archive />
          </Button>
        </div>
      </div>
      <div className="p-8 grid gap-8">
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={name} autoComplete="off" onChange={onNameChanged} />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Write your prompt here."
            value={userPrompt}
            onChange={onUserPromptChanged}
          />
        </div>
      </div>
    </div>
  );
}