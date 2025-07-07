import { Button } from "@/components/ui/button";
import type { Run } from "~/modules/runs/runs.types";
import PromptSelectorContainer from '~/modules/prompts/containers/promptSelectorContainer';
import ModelSelectorContainer from '~/modules/prompts/containers/modelSelectorContainer';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SessionSelectorContainer from "~/modules/sessions/containers/sessionSelectorContainer";

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
          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-3">
              <div className="flex">
                <Badge className="h-5 w-5 rounded-full mr-2" >1</Badge>
                <Label>Select a prompt</Label>
              </div>
              <div>
                <PromptSelectorContainer
                  annotationType={run.annotationType}
                />
              </div>
            </div>
            <div className="grid gap-3">
              <div className="flex">
                <Badge className="h-5 w-5 rounded-full mr-2" >2</Badge>
                <Label>Select a model</Label>
              </div>
              <div>
                <ModelSelectorContainer
                />
              </div>
            </div>
          </div>
          <div className="grid gap-3 mt-8">
            <div className="flex">
              <Badge className="h-5 w-5 rounded-full mr-2" >3</Badge>
              <Label>Select sessions</Label>
            </div>
            <div>
              <SessionSelectorContainer />
            </div>
          </div>
          <div className="mt-4 flex justify-center">
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