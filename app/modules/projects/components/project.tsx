import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import clsx from "clsx";
import { Link, Outlet } from "react-router";
import UploadFilesContainer from "~/modules/files/containers/uploadFiles.container";
import type { FileType } from "~/modules/files/files.types";
import type { Project } from "../projects.types";
import { Pencil } from "lucide-react";

interface ProjectProps {
  project: Project,
  filesCount: number,
  sessionsCount: number,
  runsCount: number,
  collectionsCount: number,
  tabValue: string,
  uploadFilesProgress: number,
  convertFilesProgress: number,
  convertedSessionsCount: number,
  onUploadFiles: ({ acceptedFiles, fileType }: { acceptedFiles: any[], fileType: FileType }) => void,
  onEditProjectButtonClicked: (project: Project) => void
}

export default function Project({
  project,
  filesCount,
  sessionsCount,
  runsCount,
  collectionsCount,
  tabValue,
  uploadFilesProgress,
  convertFilesProgress,
  convertedSessionsCount,
  onUploadFiles
  , onEditProjectButtonClicked
}: ProjectProps) {


  return (
    <div className="max-w-6xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          {project.name}
        </h1>
        <div>
          <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onEditProjectButtonClicked(project)}>
            <Pencil />
            Edit
          </Button>
        </div>
      </div>
      {(!project.hasSetupProject) && (
        <div>
          <UploadFilesContainer
            onUploadFiles={onUploadFiles}
          />
        </div>
      )}
      {(project.hasSetupProject) && (
        <div>
          <div className="grid grid-cols-4 gap-8">
            <Link to={`/projects/${project._id}/files`} replace className="h-full">
              <Card className={clsx("transition-all h-full", {
                "border-accent-foreground": tabValue === 'FILES'
              })}>
                <CardHeader>
                  <CardTitle>Files</CardTitle>
                  <CardDescription>Files are your original data files</CardDescription>
                </CardHeader>
                <CardContent className="h-8">
                  {(!project.isUploadingFiles) && (
                    <div>
                      {`${filesCount} files`}
                    </div>
                  )}
                  {(project.isUploadingFiles) && (
                    <div>
                      <Progress value={uploadFilesProgress} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
            <Link to={`/projects/${project._id}/sessions`} replace className="h-full">
              <Card className={clsx("transition-all h-full", {
                "border-accent-foreground": tabValue === 'SESSIONS'
              })}>
                <CardHeader>
                  <CardTitle>Sessions</CardTitle>
                  <CardDescription>Sessions are your files converted to our standard format</CardDescription>
                </CardHeader>
                <CardContent className="h-8">
                  <div>
                    {`${sessionsCount} sessions`}
                    {!project.isConvertingFiles && (
                      <div className="text-xs opacity-40">
                        {convertedSessionsCount} converted
                      </div>
                    )}
                  </div>
                  {(project.isConvertingFiles) && (
                    <div className="relative">
                      <div className="text-xs opacity-40 absolute right-0 top-3">Converting</div>
                      <Progress value={convertFilesProgress} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
            <Link to={`/projects/${project._id}`} replace className="h-full">
              <Card className={clsx("transition-all h-full", {
                "border-accent-foreground": tabValue === 'RUNS'
              })}>
                <CardHeader>
                  <CardTitle>Runs</CardTitle>
                  <CardDescription>Runs are a way to annotate your data via Prompts</CardDescription>
                </CardHeader>
                <CardContent className="h-8">
                  <p>{runsCount} runs</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={`/projects/${project._id}/collections`} replace className="h-full">
              <Card className={clsx("transition-all h-full", {
                "border-accent-foreground": tabValue === 'COLLECTIONS'
              })}>
                <CardHeader>
                  <CardTitle>Collections</CardTitle>
                  <CardDescription>Collections are a grouping of runs to help you compare different run settings across the same dataset</CardDescription>
                </CardHeader>
                <CardContent className="h-8">
                  <p>{collectionsCount} collections</p>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      )}
    </div>
  )
}
