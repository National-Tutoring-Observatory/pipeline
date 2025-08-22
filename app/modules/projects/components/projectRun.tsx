import { Button } from "@/components/ui/button";
import type { CreateRun, Run } from "~/modules/runs/runs.types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import providers from "~/modules/prompts/providers";
import find from 'lodash/find';
import annotationTypes from "~/modules/prompts/annotationTypes";
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";
import map from 'lodash/map';
import ProjectRunCreatorContainer from "../containers/projectRunCreator.container";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import ProjectRunDownloads from "./projectRunDownloads";
import { Link } from "react-router";

export default function ProjectRun({
  run,
  runPrompt,
  runPromptVersion,
  runSessionsProgress,
  runSessionsStep,
  onStartRunClicked,
  onExportRunButtonClicked,
  onReRunClicked
}: {
  run: Run,
  runPrompt: Prompt,
  runPromptVersion: PromptVersion,
  runSessionsProgress: number,
  runSessionsStep: string,
  onStartRunClicked: ({ selectedAnnotationType, selectedPrompt, selectedPromptVersion, selectedModel, selectedSessions }: CreateRun) => void,
  onExportRunButtonClicked: ({ exportType }: { exportType: string }) => void
  onReRunClicked: () => void
}) {

  return (
    <div className="max-w-6xl p-8">
      <div className="mb-8 relative">
        <div className="flex justify-between">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
            {run.name}
          </h1>
          <div>
            {(run.isComplete && (!run.hasExportedCSV || !run.hasExportedJSONL)) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    disabled={run.isExporting}
                    className="data-[state=open]:bg-muted text-muted-foreground flex"
                  >
                    <Download />
                    {run.isExporting ? <span>Exporting</span> : <span>Export</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onExportRunButtonClicked({ exportType: 'CSV' })}>
                    As Table (.csv file)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExportRunButtonClicked({ exportType: 'JSON' })}>
                    JSONL (.jsonl file)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
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
          <div className="mt-8">
            <div className="flex justify-between items-end">
              <div className="text-xs text-muted-foreground">Sessions</div>
              {(run.hasErrored) && (
                <Button onClick={onReRunClicked}>Re-run</Button>
              )}
            </div>
            <div className="border rounded-md h-80 overflow-y-auto mt-2">
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
                          {(session.status === 'DONE') && (

                            <Link to={`/projects/${run.project}/runs/${run._id}/sessions/${session.sessionId}`}>
                              {session.name}
                            </Link>
                          ) || (
                              session.name
                            )}
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
          <ProjectRunDownloads
            run={run}
          />
        </div>
      )}
    </div>
  );
}