import { Button } from "@/components/ui/button";
import { PageHeader, PageHeaderLeft, PageHeaderRight } from "@/components/ui/pageHeader";
import map from 'lodash/map';
import { CirclePlus, Pencil } from "lucide-react";
import { Outlet } from "react-router";
import { getAnnotationLabel } from "~/modules/annotations/helpers/annotationTypes";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
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
  breadcrumbs,
  onCreatePromptVersionClicked,
  onEditPromptButtonClicked,
}: PromptProps) {
  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
        <PageHeaderRight>

          {onEditPromptButtonClicked && (
            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onEditPromptButtonClicked(prompt)}>
              <Pencil />
              Edit
            </Button>
          )}
        </PageHeaderRight>
      </PageHeader>
      <div className="mb-2">
        <p className="text-sm text-muted-foreground">Annotation Type: {getAnnotationLabel(prompt.annotationType)}</p>
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
