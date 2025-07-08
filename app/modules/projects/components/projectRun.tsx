import { Button } from "@/components/ui/button";
import type { Run } from "~/modules/runs/runs.types";
import PromptSelectorContainer from '~/modules/prompts/containers/promptSelectorContainer';
import ModelSelectorContainer from '~/modules/prompts/containers/modelSelectorContainer';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SessionSelectorContainer from "~/modules/sessions/containers/sessionSelectorContainer";
import { Progress } from "@/components/ui/progress";
import providers from "~/modules/prompts/providers";
import find from 'lodash/find';
import annotationTypes from "~/modules/prompts/annotationTypes";
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import type { Session } from "~/modules/sessions/sessions.types";
import map from 'lodash/map';

export default function ProjectRun({
  run,
  runPrompt,
  runPromptVersion,
  selectedPrompt,
  selectedPromptVersion,
  selectedModel,
  selectedSessions,
  runSessionsProgress,
  runSessionsStep,
  isRunButtonDisabled,
  onSelectedPromptChanged,
  onSelectedPromptVersionChanged,
  onSelectedModelChanged,
  onSelectedSessionsChanged,
  onStartRunClicked,
}: {
  run: Run,
  runPrompt: Prompt,
  runPromptVersion: PromptVersion,
  selectedPrompt: string,
  selectedPromptVersion: string,
  selectedModel: string,
  selectedSessions: string[],
  runSessionsProgress: number,
  runSessionsStep: string,
  isRunButtonDisabled: boolean,
  onSelectedPromptChanged: (selectedPrompt: string) => void,
  onSelectedPromptVersionChanged: (selectedPromptVersion: string) => void,
  onSelectedModelChanged: (selectedModel: string) => void,
  onSelectedSessionsChanged: (selectedSessions: string[]) => void,
  onStartRunClicked: () => void
}) {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 relative">

        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          {run.name}
        </h1>
        {(run.hasSetup && run.isRunning) && (
          <div className="relative">
            <div className="text-xs opacity-40 absolute right-0 top-3">Annotating {runSessionsStep}</div>
            <Progress value={runSessionsProgress} />
          </div>
        )}
      </div>
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
                  selectedPrompt={selectedPrompt}
                  selectedPromptVersion={selectedPromptVersion}
                  onSelectedPromptChanged={onSelectedPromptChanged}
                  onSelectedPromptVersionChanged={onSelectedPromptVersionChanged}
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
                  selectedModel={selectedModel}
                  onSelectedModelChanged={onSelectedModelChanged}
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
              onClick={onStartRunClicked}
            >
              Start run
            </Button>
          </div>
        </div>
      )}
      {(run.hasSetup) && (
        <div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-muted-foreground">Annotation type</div>
              <div>
                {find(annotationTypes, { value: run.annotationType })?.name}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Selected prompt</div>
              <div>
                <div>
                  {runPrompt.name}
                </div>
                <div>
                  <Badge >
                    Version {runPromptVersion.version}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Selected model</div>
              <div>
                {find(providers, { provider: run.model })?.name}
              </div>
            </div>
          </div>
          <div>
            <div className="border rounded-md h-80 overflow-y-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Name</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Finished</TableHead>
                    <TableHead>File type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {map(run.sessions, (session: { sessionId: number, name: string, startedAt: string, finishedAt: string, fileType: string, status: string }) => {
                    return (
                      <TableRow key={session.sessionId}>
                        <TableCell className="font-medium">
                          {session.name}
                        </TableCell>
                        <TableCell>{dayjs(session.startedAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
                        <TableCell>{dayjs(session.finishedAt).format('ddd, MMM D, YYYY - h:mm A')}</TableCell>
                        <TableCell>{session.fileType}</TableCell>
                        <TableCell>{session.status}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}