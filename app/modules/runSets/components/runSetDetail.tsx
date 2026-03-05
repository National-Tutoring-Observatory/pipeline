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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  FileInput,
  GitMerge,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Outlet } from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import Flag from "~/modules/featureFlags/components/flag";
import DownloadDropdown from "~/modules/runs/components/downloadDropdown";
import formatTimeRemaining from "~/modules/runs/helpers/formatTimeRemaining";
import type { RunSet } from "~/modules/runSets/runSets.types";

export default function RunSetDetail({
  runSet,
  isExporting,
  project,
  breadcrumbs,
  annotationProgress,
  onExportRunSetButtonClicked,
  onAddRunsClicked,
  onUploadHumanAnnotationsClicked,
  onMergeClicked,
  onDuplicateClicked,
  onUseAsTemplateClicked,
  onEditClicked,
  onDeleteClicked,
  activeView,
  onActiveViewChange,
}: {
  runSet: RunSet;
  isExporting: boolean;
  project: { _id: string; name: string };
  breadcrumbs: Breadcrumb[];
  annotationProgress: {
    totalRuns: number;
    completedRuns: number;
    totalSessions: number;
    completedSessions: number;
    running: number;
    startedAt: string | null;
  };
  onExportRunSetButtonClicked: ({ exportType }: { exportType: string }) => void;
  onAddRunsClicked: () => void;
  onUploadHumanAnnotationsClicked: () => void;
  onMergeClicked: () => void;
  onDuplicateClicked: () => void;
  onUseAsTemplateClicked: () => void;
  onEditClicked: () => void;
  onDeleteClicked: () => void;
  activeView: "overview" | "evaluations";
  onActiveViewChange: (value: string) => void;
}) {
  return (
    <div className="p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
        <PageHeaderRight>
          <div className="text-muted-foreground flex gap-1">
            {annotationProgress.totalRuns > 0 &&
              annotationProgress.completedRuns ===
                annotationProgress.totalRuns && (
                <DownloadDropdown
                  isExporting={isExporting}
                  onExportButtonClicked={onExportRunSetButtonClicked}
                />
              )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="data-[state=open]:bg-muted">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onAddRunsClicked}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Runs
                </DropdownMenuItem>
                <Flag flag="HAS_EVALUATIONS">
                  <DropdownMenuItem onClick={onUploadHumanAnnotationsClicked}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Human Annotations
                  </DropdownMenuItem>
                </Flag>
                <DropdownMenuItem onClick={onMergeClicked}>
                  <GitMerge className="mr-2 h-4 w-4" />
                  Merge
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicateClicked}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onUseAsTemplateClicked}>
                  <FileInput className="mr-2 h-4 w-4" />
                  Use as Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEditClicked}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDeleteClicked}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PageHeaderRight>
      </PageHeader>
      {annotationProgress.running > 0 &&
        annotationProgress.completedSessions <
          annotationProgress.totalSessions && (
          <div className="relative mb-6">
            <div className="absolute top-3 right-0 text-xs opacity-40">
              {annotationProgress.completedSessions === 0 ? (
                "Starting..."
              ) : (
                <>
                  {annotationProgress.completedRuns}/
                  {annotationProgress.totalRuns} runs ·{" "}
                  {annotationProgress.completedSessions}/
                  {annotationProgress.totalSessions} sessions completed
                  {(() => {
                    const estimate = formatTimeRemaining(
                      annotationProgress.startedAt,
                      annotationProgress.completedSessions,
                      annotationProgress.totalSessions,
                    );
                    return estimate ? ` · ${estimate}` : null;
                  })()}
                </>
              )}
            </div>
            <Progress
              value={
                (annotationProgress.completedSessions /
                  annotationProgress.totalSessions) *
                100
              }
            />
          </div>
        )}
      <Flag flag="HAS_EVALUATIONS">
        <Tabs
          value={activeView}
          onValueChange={onActiveViewChange}
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          </TabsList>
        </Tabs>
      </Flag>
      <Outlet context={{ runSet, project }} />
    </div>
  );
}
