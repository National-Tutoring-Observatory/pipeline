import { Button } from "@/components/ui/button";
import type { Run } from "~/modules/runs/runs.types";
import PromptSelectorContainer from '~/modules/prompts/containers/promptSelectorContainer';

export default function ProjectRun({ run }: { run: Run }) {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        {run.name}
      </h1>
      {(run.hasSetup) && (
        <div>
          Has been setup and is running
        </div>
      )}
      {(!run.hasSetup) && (
        <div>
          <div className="grid grid-cols-2">
            <div>
              <PromptSelectorContainer
                annotationType={run.annotationType}
              />
            </div>
            <div>
              Model selector to go here
            </div>
          </div>
          <div>
            Sessions selector to go here
          </div>
          <div className="mt-2 flex justify-center">
            <Button
              size="lg"
              disabled
            >
              Start run
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}