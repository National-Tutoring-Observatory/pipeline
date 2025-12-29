import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { ShuffleIcon } from "lucide-react";
import AnnotationTypeSelectorContainer from "~/modules/prompts/containers/annoationTypeSelectorContainer";
import ModelSelectorContainer from '~/modules/prompts/containers/modelSelectorContainer';
import PromptSelectorContainer from '~/modules/prompts/containers/promptSelectorContainer';
import SessionSelectorContainer from "~/modules/sessions/containers/sessionSelectorContainer";
import LeadRoleSelectorContainer from "../containers/leadRoleSelectorContainer";



export default function ProjectRunCreator({
  selectedAnnotationType,
  selectedPrompt,
  selectedPromptVersion,
  selectedModel,
  selectedLeadRole,
  availableRoles,
  selectedSessions,
  randomSampleSize,
  sessionsCount,
  isRunButtonDisabled,
  onSelectedAnnotationTypeChanged,
  onSelectedPromptChanged,
  onSelectedPromptVersionChanged,
  onSelectedModelChanged,
  onSelectedLeadRoleChanged,
  onSelectedSessionsChanged,
  onStartRunButtonClicked,
  onRandomSampleSizeChanged,
  onSelectRandomSampleSizeButtonClicked
}: {
  selectedAnnotationType: string,
  selectedPrompt: string | null,
  selectedPromptVersion: number | null,
  selectedModel: string,
  selectedLeadRole: string | null,
  availableRoles: string[],
  selectedSessions: string[],
  randomSampleSize: number,
  sessionsCount: number,
  isRunButtonDisabled: boolean,
  onSelectedAnnotationTypeChanged: (selectedAnnotationType: string) => void,
  onSelectedPromptChanged: (selectedPrompt: string) => void,
  onSelectedPromptVersionChanged: (selectedPromptVersion: number) => void,
  onSelectedModelChanged: (selectedModel: string) => void,
  onSelectedLeadRoleChanged: (selectedLeadRole: string) => void,
  onSelectedSessionsChanged: (selectedSessions: string[]) => void,
  onStartRunButtonClicked: () => void,
  onRandomSampleSizeChanged: (randomSampleSize: number) => void,
  onSelectRandomSampleSizeButtonClicked: () => void
}) {


  return (
    <div className="max-w-3xl w-full mx-0 pt-4 pb-8">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>1. Select annotation type</CardTitle>
          <CardDescription>Choose how you want to annotate data. This affects available prompts and models.</CardDescription>
        </CardHeader>
        <CardContent>
          <AnnotationTypeSelectorContainer
            annotationType={selectedAnnotationType}
            onSelectedAnnotationTypeChanged={onSelectedAnnotationTypeChanged}
          />
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>2. Select a prompt</CardTitle>
          <CardDescription>Pick a prompt and version the model will use to annotate the data.</CardDescription>
        </CardHeader>
        <CardContent>
          <PromptSelectorContainer
            annotationType={selectedAnnotationType}
            selectedPrompt={selectedPrompt}
            selectedPromptVersion={selectedPromptVersion}
            onSelectedPromptChanged={onSelectedPromptChanged}
            onSelectedPromptVersionChanged={onSelectedPromptVersionChanged}
          />
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>3. Select a model</CardTitle>
          <CardDescription>Select which AI model will be used for annotation. Different models may yield different results.</CardDescription>
        </CardHeader>
        <CardContent>
          <ModelSelectorContainer
            selectedModel={selectedModel}
            onSelectedModelChanged={onSelectedModelChanged}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>4. Select sessions</CardTitle>
          <CardDescription>Choose which sessions to annotate. You can select manually or use the randomizer to pick a sample.</CardDescription>
          <CardAction>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  role="combobox"
                  className=""
                >
                  <ShuffleIcon />
                  RandomizR
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-4">
                <div className="grid gap-3">
                  <Label htmlFor="sample-size">Sample size</Label>
                  <Input id="sample-size" name="sample-size" type="number" max={`${sessionsCount}`} min={"1"} value={randomSampleSize} onChange={(event) => onRandomSampleSizeChanged(Number(event.target.value))} />
                  <PopoverClose asChild>
                    <Button onClick={onSelectRandomSampleSizeButtonClicked}>
                      Select
                    </Button>
                  </PopoverClose>
                </div>
              </PopoverContent>
            </Popover></CardAction>
        </CardHeader>
        <CardContent>
          <SessionSelectorContainer
            selectedSessions={selectedSessions}
            onSelectedSessionsChanged={onSelectedSessionsChanged}
          />
          {availableRoles.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-sm text-muted-foreground mb-2 block">Lead role</Label>
              <LeadRoleSelectorContainer
                roles={availableRoles}
                selectedLeadRole={selectedLeadRole}
                onSelectedLeadRoleChanged={onSelectedLeadRoleChanged}
              />
            </div>
          )}
          <div className="flex justify-center mt-4">
            <Button
              size="sm"
              disabled={isRunButtonDisabled}
              onClick={onStartRunButtonClicked}
            >
              Start run
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
