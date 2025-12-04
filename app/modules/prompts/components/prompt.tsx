import { Button } from "@/components/ui/button";
import map from 'lodash/map';
import { CirclePlus, Pencil } from "lucide-react";
import { Outlet } from "react-router";
import { getAnnotationLabel } from "~/modules/annotations/helpers/annotationTypes";
import type { Prompt, PromptVersion } from "../prompts.types";
import PromptVersionItem from './promptVersionItem';

type PromptProps = {
  prompt: Prompt;
  promptVersions: PromptVersion[];
  version: number;
  onCreatePromptVersionClicked: () => void;
  onEditPromptButtonClicked: (prompt: Prompt) => void;
}

export default function Prompt({
  prompt,
  promptVersions,
  version,
  onCreatePromptVersionClicked,
  onEditPromptButtonClicked,
}: PromptProps) {
  return (
    <div className="max-w-6xl p-8">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-2">
            {prompt.name}
          </h1>
          <p className="text-sm text-muted-foreground">Annotation Type: {getAnnotationLabel(prompt.annotationType)}</p>
        </div>
        {onEditPromptButtonClicked && (
          <div>
            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onEditPromptButtonClicked(prompt)}>
              <Pencil />
              Edit
            </Button>
          </div>
        )}
      </div>
      <div className="border rounded-md flex">

        <div className="w-1/4 h-full">
          <div className="border-b p-2 text-sm flex justify-between items-center">
            <div>
              Versions
            </div>
            <div>
              <Button
                size="icon"
                variant="ghost"
                className="size-4 cursor-pointer hover:text-indigo-600"
                onClick={onCreatePromptVersionClicked}
                asChild>
                <CirclePlus />
              </Button>
            </div>
          </div>
          {map(promptVersions, (promptVersion) => {
            const isSelected = version === promptVersion.version;
            const isProduction = prompt.productionVersion === promptVersion.version;
            return (
              <PromptVersionItem
                key={promptVersion._id}
                prompt={promptVersion.prompt}
                name={promptVersion.name}
                version={promptVersion.version}
                createdAt={promptVersion.createdAt}
                isSelected={isSelected}
                isProduction={isProduction}
              />
            );
          })}
        </div>
        <div className="w-3/4 h-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
