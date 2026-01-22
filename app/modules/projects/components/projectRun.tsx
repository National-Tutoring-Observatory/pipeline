import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
} from "@/components/ui/pageHeader";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import find from "lodash/find";
import map from "lodash/map";
import { Pencil } from "lucide-react";
import { Link } from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import annotationTypes from "~/modules/prompts/annotationTypes";
import { getRunModelDisplayName } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";
import ProjectDownloadDropdown from "./projectDownloadDropdown";
import ProjectRunDownloads from "./projectRunDownloads";

export default function ProjectRun({
  run,
  promptInfo,
  runSessionsProgress,
  runSessionsStep,
  breadcrumbs,
  onExportRunButtonClicked,
  onReRunClicked,
  onEditRunButtonClicked,
  onCreateCollectionButtonClicked,
}: {
  run: Run;
  promptInfo: { name: string; version: number };
  runSessionsProgress: number;
  runSessionsStep: string;
  breadcrumbs: Breadcrumb[];
  onExportRunButtonClicked: ({ exportType }: { exportType: string }) => void;
  onReRunClicked: () => void;
  onEditRunButtonClicked?: (run: Run) => void;
  onCreateCollectionButtonClicked?: (run: Run) => void;
}) {
  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
        <PageHeaderRight>
          {run.isComplete && (
            <ProjectDownloadDropdown
              isExporting={run.isExporting || false}
              hasExportedCSV={run.hasExportedCSV}
              hasExportedJSONL={run.hasExportedJSONL}
              onExportButtonClicked={onExportRunButtonClicked}
            />
          )}
          {onEditRunButtonClicked && (
            <Button
              variant="ghost"
              onClick={() => onEditRunButtonClicked(run)}
              className="ml-2"
            >
              <Pencil />
              Edit
            </Button>
          )}
        </PageHeaderRight>
      </PageHeader>
      <div className="relative mb-8">
        {run.isRunning && (
          <div className="relative">
            <div className="absolute top-3 right-0 text-xs opacity-40">
              Annotating {runSessionsStep}
            </div>
            <Progress value={runSessionsProgress} />
          </div>
        )}
      </div>
      <div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-muted-foreground text-xs">Annotation type</div>
            <div>
              {find(annotationTypes, { value: run.annotationType })?.name}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Selected prompt</div>
            <div>
              <div>{promptInfo.name}</div>
              <div>
                <Badge>Version {promptInfo.version}</Badge>
              </div>
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Selected model</div>
            <div>{getRunModelDisplayName(run)}</div>
          </div>
        </div>
        <div className="mt-8">
          <div className="flex items-end justify-between">
            <div className="text-muted-foreground text-xs">Sessions</div>
            {run.hasErrored && (
              <Button onClick={onReRunClicked}>Re-run errored</Button>
            )}
          </div>
          <div className="mt-2 h-80 overflow-y-auto rounded-md border">
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
                {map(
                  run.sessions,
                  (session: {
                    sessionId: number;
                    name: string;
                    startedAt: string;
                    finishedAt: string;
                    fileType: string;
                    status: string;
                  }) => {
                    return (
                      <TableRow key={session.sessionId}>
                        <TableCell className="font-medium">
                          {(session.status === "DONE" && (
                            <Link
                              to={`/projects/${run.project}/runs/${run._id}/sessions/${session.sessionId}`}
                            >
                              {session.name}
                            </Link>
                          )) ||
                            session.name}
                        </TableCell>
                        <TableCell>
                          {session.status !== "NOT_STARTED"
                            ? dayjs(session.startedAt).format(
                                "ddd, MMM D, YYYY - h:mm A",
                              )
                            : "--"}
                        </TableCell>
                        <TableCell>
                          {session.finishedAt
                            ? dayjs(session.finishedAt).format(
                                "ddd, MMM D, YYYY - h:mm A",
                              )
                            : "--"}
                        </TableCell>
                        <TableCell>{session.fileType}</TableCell>
                        <TableCell>{session.status}</TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <ProjectRunDownloads run={run} />
      </div>
    </div>
  );
}
