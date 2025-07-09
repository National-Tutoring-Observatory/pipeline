import { Button } from "@/components/ui/button";
import type { CreateRun, Run } from "~/modules/runs/runs.types";
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
import ProjectRunCreatorContainer from "../containers/projectRunCreator.container";

export default function ProjectRun({
  run,
  runPrompt,
  runPromptVersion,
  runSessionsProgress,
  runSessionsStep,
  onStartRunClicked,
}: {
  run: Run,
  runPrompt: Prompt,
  runPromptVersion: PromptVersion,
  runSessionsProgress: number,
  runSessionsStep: string,
  onStartRunClicked: ({ selectedAnnotationType, selectedPrompt, selectedPromptVersion, selectedModel, selectedSessions }: CreateRun) => void
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
        <ProjectRunCreatorContainer run={run} onStartRunClicked={onStartRunClicked} />
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