import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { useState } from "react";
import Flag from "~/modules/featureFlags/components/flag";
import AnnotationTypeSelectorContainer from "~/modules/prompts/containers/annoationTypeSelectorContainer";
import ModelSelectorContainer from "~/modules/prompts/containers/modelSelectorContainer";
import PromptSelectorContainer from "~/modules/prompts/containers/promptSelectorContainer";
import EstimateSummary from "~/modules/runSets/components/estimateSummary";
import InsufficientCreditsAlert from "~/modules/runSets/components/insufficientCreditsAlert";
import type { CreditAcknowledgment } from "~/modules/runSets/hooks/useCreditAcknowledgment";
import type { EstimationResult } from "~/modules/runSets/runSets.types";
import SessionSelectorContainer from "~/modules/sessions/containers/sessionSelectorContainer";
import type { SessionData } from "~/modules/sessions/sessions.types";
import RunNameAlert from "./runNameAlert";

export default function RunCreator({
  duplicateWarnings = [],
  runName,
  selectedAnnotationType,
  selectedPrompt,
  selectedPromptVersion,
  selectedModel,
  selectedSessions,
  estimation,
  balance,
  creditAcknowledgment,
  isSubmitting,
  isRunButtonDisabled,
  onRunNameChanged,
  onSelectedAnnotationTypeChanged,
  onSelectedPromptChanged,
  onSelectedPromptVersionChanged,
  onSelectedModelChanged,
  onSelectedSessionsChanged,
  shouldRunVerification,
  onShouldRunVerificationChanged,
  onStartRunButtonClicked,
}: {
  duplicateWarnings?: string[];
  runName: string;
  selectedAnnotationType: string;
  selectedPrompt: string | null;
  selectedPromptVersion: number | null;
  selectedModel: string;
  selectedSessions: string[];
  estimation: EstimationResult;
  balance: number;
  creditAcknowledgment: CreditAcknowledgment;
  isSubmitting: boolean;
  isRunButtonDisabled: boolean;
  onRunNameChanged: (name: string) => void;
  onSelectedAnnotationTypeChanged: (selectedAnnotationType: string) => void;
  onSelectedPromptChanged: (selectedPrompt: string) => void;
  onSelectedPromptVersionChanged: (
    selectedPromptVersion: number,
    inputTokens?: number,
  ) => void;
  onSelectedModelChanged: (selectedModel: string) => void;
  onSelectedSessionsChanged: (sessions: SessionData[]) => void;
  shouldRunVerification: boolean;
  onShouldRunVerificationChanged: (value: boolean) => void;
  onStartRunButtonClicked: () => void;
}) {
  const [runNameTouched, setRunNameTouched] = useState(false);

  const handleRunNameChange = (value: string) => {
    if (!runNameTouched) {
      setRunNameTouched(true);
    }
    onRunNameChanged(value);
  };

  return (
    <div className="mx-0 w-full max-w-3xl pt-4 pb-8">
      {duplicateWarnings.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Some settings are no longer available</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-inside list-disc">
              {duplicateWarnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
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
              autoFocus
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
      <Flag flag="HAS_RUN_VERIFICATION">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Verification</CardTitle>
            <CardDescription>
              When enabled, annotations will be verified by a second LLM pass to
              check for accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Checkbox
                id="shouldRunVerification"
                checked={shouldRunVerification}
                onCheckedChange={(checked) =>
                  onShouldRunVerificationChanged(Boolean(checked))
                }
              />
              <Label htmlFor="shouldRunVerification">
                Enable verification step
              </Label>
            </div>
          </CardContent>
        </Card>
      </Flag>
      <Card>
        <CardHeader>
          <CardTitle>Select sessions</CardTitle>
          <CardDescription>
            Choose which sessions to annotate. You can select manually or use
            the randomizer to pick a sample.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionSelectorContainer
            selectedSessions={selectedSessions}
            onSelectedSessionsChanged={onSelectedSessionsChanged}
          />
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-center gap-4">
              <EstimateSummary estimation={estimation} balance={balance} />
              <Button
                size="sm"
                disabled={isRunButtonDisabled}
                onClick={onStartRunButtonClicked}
              >
                {isSubmitting ? "Starting run..." : "Start run"}
              </Button>
            </div>
            <InsufficientCreditsAlert
              exceedsBalance={creditAcknowledgment.exceedsBalance}
              acknowledged={creditAcknowledgment.acknowledged}
              onAcknowledgedChanged={creditAcknowledgment.setAcknowledged}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
