import { Outlet } from "react-router";
import type { Prompt, PromptVersion } from "../prompts.types";
import map from 'lodash/map';
import PromptVersionItem from './promptVersionItem';
import { Button } from "@/components/ui/button";
import { CirclePlus, Icon } from "lucide-react";

export default function Prompt({
  prompt,
  promptVersions,
  version,
  onCreatePromptVersionClicked,
}: { prompt: Prompt, promptVersions: PromptVersion[], version: number, onCreatePromptVersionClicked: () => void }) {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        {prompt.name}
      </h1>
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