import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import AnnotationTypeSelectorContainer from "~/modules/prompts/containers/annoationTypeSelectorContainer";
import ModelSelectorContainer from "~/modules/prompts/containers/modelSelectorContainer";
import PromptSelectorContainer from "~/modules/prompts/containers/promptSelectorContainer";
import SessionRandomizer from "~/modules/sessions/components/sessionRandomizer";
import SessionSelectorContainer from "~/modules/sessions/containers/sessionSelectorContainer";
import RunNameAlert from "./runNameAlert";

export default function ProjectRunCreator({
  runName,
  selectedAnnotationType,
  selectedPrompt,
  selectedPromptVersion,
  selectedModel,
  selectedSessions,
  randomSampleSize,
  sessionsCount,
  isRunButtonDisabled,
  onRunNameChanged,
  onSelectedAnnotationTypeChanged,
  onSelectedPromptChanged,
  onSelectedPromptVersionChanged,
  onSelectedModelChanged,
  onSelectedSessionsChanged,
  onStartRunButtonClicked,
  onRandomSampleSizeChanged,
  onSelectRandomSampleSizeButtonClicked,
}: {
  runName: string;
  selectedAnnotationType: string;
  selectedPrompt: string | null;
  selectedPromptVersion: number | null;
  selectedModel: string;
  selectedSessions: string[];
  randomSampleSize: number;
  sessionsCount: number;
  isRunButtonDisabled: boolean;
  onRunNameChanged: (name: string) => void;
  onSelectedAnnotationTypeChanged: (selectedAnnotationType: string) => void;
  onSelectedPromptChanged: (selectedPrompt: string) => void;
  onSelectedPromptVersionChanged: (selectedPromptVersion: number) => void;
  onSelectedModelChanged: (selectedModel: string) => void;
  onSelectedSessionsChanged: (selectedSessions: string[]) => void;
  onStartRunButtonClicked: () => void;
  onRandomSampleSizeChanged: (randomSampleSize: number) => void;
  onSelectRandomSampleSizeButtonClicked: () => void;
}) {
  const [runNameTouched, setRunNameTouched] = useState(false);

  const handleRunNameChange = (value: string) => {
    if (!runNameTouched) {
      setRunNameTouched(true);
    }
    onRunNameChanged(value);
  };

  return (
    <div className="max-w-3xl w-full mx-0 pt-4 pb-8">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Name your run</CardTitle>
          <CardDescription>
            Give your run a descriptive name to make it easier to find later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={runName}
              autoComplete="off"
              onChange={(e) => handleRunNameChange(e.target.value)}
              className="w-96"
            />
            {runNameTouched && <RunNameAlert name={runName} />}
          </div>
        </CardContent>
      </Card>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Select annotation type</CardTitle>
          <CardDescription>
            Choose how you want to annotate data. This affects available prompts
            and models.
          </CardDescription>
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
          <CardTitle>Select a prompt</CardTitle>
          <CardDescription>
            Pick a prompt and version the model will use to annotate the data.
          </CardDescription>
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
          <CardTitle>Select a model</CardTitle>
          <CardDescription>
            Select which AI model will be used for annotation. Different models
            may yield different results.
          </CardDescription>
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
          <CardTitle>Select sessions</CardTitle>
          <CardDescription>
            Choose which sessions to annotate. You can select manually or use
            the randomizer to pick a sample.
          </CardDescription>
          <CardAction>
            <SessionRandomizer
              sampleSize={randomSampleSize}
              maxSize={sessionsCount}
              onSampleSizeChanged={onRandomSampleSizeChanged}
              onRandomizeClicked={onSelectRandomSampleSizeButtonClicked}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <SessionSelectorContainer
            selectedSessions={selectedSessions}
            onSelectedSessionsChanged={onSelectedSessionsChanged}
          />
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
