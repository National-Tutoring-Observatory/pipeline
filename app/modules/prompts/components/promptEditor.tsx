import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";
import { useState } from "react";
import type { PromptVersion } from "../prompts.types";

export default function PromptEditor({
  promptVersion
}: { promptVersion: PromptVersion }) {

  const [name, setName] = useState(promptVersion.name);
  const [userPrompt, setUserPrompt] = useState(promptVersion.userPrompt || '');

  const onNameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  }

  const onUserPromptChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserPrompt(event.target.value);
  }


  return (
    <div>
      <div className="border-b p-2 text-sm flex justify-between items-center">
        <div>
          <div>{`Version: ${promptVersion.name}`}</div>
        </div>
        <div>
          <Button
            size="icon"
            variant="ghost"
            className="size-4 cursor-pointer hover:text-indigo-600"
            asChild>
            <Trash />
          </Button>
        </div>
      </div>
      <div className="p-8 grid gap-8">
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={name} autoComplete="off" onChange={onNameChanged} />
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