import { Button } from "@/components/ui/button";
import type { CreateRun, Run } from "~/modules/runs/runs.types";
import PromptSelectorContainer from '~/modules/prompts/containers/promptSelectorContainer';
import ModelSelectorContainer from '~/modules/prompts/containers/modelSelectorContainer';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SessionSelectorContainer from "~/modules/sessions/containers/sessionSelectorContainer";
import AnnotationTypeSelectorContainer from "~/modules/prompts/containers/annoationTypeSelectorContainer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ShuffleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PopoverClose } from "@radix-ui/react-popover";
import LLMSettingsComponent from "~/modules/prompts/components/modelSettings";
import type { LLMSettings } from "~/core/llm/llm.types";
import { DEFAULT_LLM_SETTINGS } from "~/core/llm/llm.types";

export default function ProjectRunCreator({
  selectedAnnotationType,
  selectedPrompt,
  selectedPromptVersion,
  selectedModel,
  selectedSessions,
  randomSampleSize,
  sessionsCount,
  modelSettings = DEFAULT_LLM_SETTINGS,
  isRunButtonDisabled,
  onSelectedAnnotationTypeChanged,
  onSelectedPromptChanged,
  onSelectedPromptVersionChanged,
  onSelectedModelChanged,
  onSelectedSessionsChanged,
  onStartRunButtonClicked,
  onRandomSampleSizeChanged,
  onSelectRandomSampleSizeButtonClicked,
  onLLMSettingsChanged
}: {
  selectedAnnotationType: string,
  selectedPrompt: number | null,
  selectedPromptVersion: number | null,
  selectedModel: string,
  selectedSessions: number[],
  randomSampleSize: number,
  sessionsCount: number,
  modelSettings?: LLMSettings,
  isRunButtonDisabled: boolean,
  onSelectedAnnotationTypeChanged: (selectedAnnotationType: string) => void,
  onSelectedPromptChanged: (selectedPrompt: number) => void,
  onSelectedPromptVersionChanged: (selectedPromptVersion: number) => void,
  onSelectedModelChanged: (selectedModel: string) => void,
  onSelectedSessionsChanged: (selectedSessions: number[]) => void,
  onStartRunButtonClicked: () => void,
  onRandomSampleSizeChanged: (randomSampleSize: number) => void
  onSelectRandomSampleSizeButtonClicked: () => void
  onLLMSettingsChanged: (settings: LLMSettings) => void
}) {

  return (
    <div>
      <div className="grid grid-cols-4 gap-6">
        <div className="grid gap-3">
          <div className="flex">
            <Badge className="h-5 w-5 rounded-full mr-2" >1</Badge>
            <Label>Select annotation type</Label>
          </div>
          <div>
            <AnnotationTypeSelectorContainer
              annotationType={selectedAnnotationType}
              onSelectedAnnotationTypeChanged={onSelectedAnnotationTypeChanged}
            />
          </div>
        </div>
        <div className="grid gap-3 col-span-2">
          <div className="flex">
            <Badge className="h-5 w-5 rounded-full mr-2" >2</Badge>
            <Label>Select a prompt</Label>
          </div>
          <div>
            <PromptSelectorContainer
              annotationType={selectedAnnotationType}
              selectedPrompt={selectedPrompt}
              selectedPromptVersion={selectedPromptVersion}
              onSelectedPromptChanged={onSelectedPromptChanged}
              onSelectedPromptVersionChanged={onSelectedPromptVersionChanged}
            />
          </div>
        </div>
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <div className="flex">
              <Badge className="h-5 w-5 rounded-full mr-2" >3</Badge>
              <Label>Select a model</Label>
            </div>
            <LLMSettingsComponent
              settings={modelSettings}
              onSettingsChanged={onLLMSettingsChanged}
            />
          </div>
          <div>
            <ModelSelectorContainer
              selectedModel={selectedModel}
              onSelectedModelChanged={onSelectedModelChanged}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-3 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex">
            <Badge className="h-5 w-5 rounded-full mr-2" >4</Badge>
            <Label>Select sessions</Label>
          </div>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  role="combobox"
                  className=""
                >
                  <ShuffleIcon></ShuffleIcon>
                  RandomizR
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-4">
                <div className="grid gap-3">
                  <Label htmlFor="sample-size">Sample size</Label>
                  <div>
                    <Input id="sample-size" name="sample-size" type="number" max={`${sessionsCount}`} min={"1"} value={randomSampleSize} onChange={(event) => onRandomSampleSizeChanged(Number(event.target.value))} />
                  </div>
                  <PopoverClose asChild>
                    <Button onClick={onSelectRandomSampleSizeButtonClicked}>
                      Select
                    </Button>
                  </PopoverClose>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <SessionSelectorContainer
            selectedSessions={selectedSessions}
            onSelectedSessionsChanged={onSelectedSessionsChanged}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-center">
        <Button
          size="lg"
          disabled={isRunButtonDisabled}
          onClick={onStartRunButtonClicked}
        >
          Start run
        </Button>
      </div>
    </div>

  );
}