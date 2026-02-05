import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  PageHeaderLeft,
  PageHeaderRight,
} from "@/components/ui/pageHeader";
import { Progress } from "@/components/ui/progress";
import { StatItem } from "@/components/ui/stat-item";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import find from "lodash/find";
import map from "lodash/map";
import {
  FolderPlus,
  ListPlus,
  MoreHorizontal,
  Pencil,
  Stamp,
} from "lucide-react";
import { Link } from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getDateString from "~/modules/app/helpers/getDateString";
import type { Collection } from "~/modules/collections/collections.types";
import Flag from "~/modules/featureFlags/components/flag";
import annotationTypes from "~/modules/prompts/annotationTypes";
import { getRunModelDisplayName } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";
import DownloadDropdown from "./downloadDropdown";
import RunCollections from "./runCollections";
import RunDownloads from "./runDownloads";

export default function RunDetail({
  run,
  promptInfo,
  collections,
  collectionsCount,
  runSessionsProgress,
  runSessionsStep,
  breadcrumbs,
  onExportRunButtonClicked,
  onReRunClicked,
  onEditRunButtonClicked,
  onAddToExistingCollectionClicked,
  onAddToNewCollectionClicked,
  onUseAsTemplateClicked,
}: {
  run: Run;
  promptInfo: { name: string; version: number };
  collections: Collection[];
  collectionsCount: number;
  runSessionsProgress: number;
  runSessionsStep: string;
  breadcrumbs: Breadcrumb[];
  onExportRunButtonClicked: ({ exportType }: { exportType: string }) => void;
  onReRunClicked: () => void;
  onEditRunButtonClicked: (run: Run) => void;
  onAddToExistingCollectionClicked: (run: Run) => void;
  onAddToNewCollectionClicked: (run: Run) => void;
  onUseAsTemplateClicked: (run: Run) => void;
}) {
  const projectId =
    typeof run.project === "string" ? run.project : run.project._id;
  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
        <PageHeaderRight>
          {run.isComplete && (
            <DownloadDropdown
              isExporting={run.isExporting || false}
              hasExportedCSV={run.hasExportedCSV}
              hasExportedJSONL={run.hasExportedJSONL}
              onExportButtonClicked={onExportRunButtonClicked}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="data-[state=open]:bg-muted">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Flag flag="HAS_PROJECT_COLLECTIONS">
                <>
                  <DropdownMenuItem
                    onClick={() => onAddToExistingCollectionClicked(run)}
                  >
                    <ListPlus className="mr-2 h-4 w-4" />
                    Add to Existing Collection
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onAddToNewCollectionClicked(run)}
                  >
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Add to New Collection
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUseAsTemplateClicked(run)}>
                    <Stamp className="mr-2 h-4 w-4" />
                    Use as Collection Template
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              </Flag>
              <DropdownMenuItem onClick={() => onEditRunButtonClicked(run)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <StatItem label="Annotation type">
            {find(annotationTypes, { value: run.annotationType })?.name}
          </StatItem>
          <StatItem label="Selected prompt">
            <div>{promptInfo.name}</div>
            <div>
              <Badge>Version {promptInfo.version}</Badge>
            </div>
          </StatItem>
          <StatItem label="Selected model">
            {getRunModelDisplayName(run)}
          </StatItem>
        </div>
        <div className="mt-6">
          <RunCollections
            projectId={projectId}
            runId={run._id}
            collections={collections}
            collectionsCount={collectionsCount}
          />
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
                              to={`/projects/${projectId}/runs/${run._id}/sessions/${session.sessionId}`}
                            >
                              {session.name}
                            </Link>
                          )) ||
                            session.name}
                        </TableCell>
                        <TableCell>
                          {session.status !== "NOT_STARTED"
                            ? getDateString(session.startedAt)
                            : "--"}
                        </TableCell>
                        <TableCell>
                          {getDateString(session.finishedAt)}
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
        <RunDownloads run={run} />
      </div>
    </div>
  );
}
