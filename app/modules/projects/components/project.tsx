import UploadFilesContainer from "~/modules/files/containers/uploadFiles.container";
import type { Project } from "../projects.types";
import { Link, Outlet } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import clsx from "clsx";
import { Progress } from "@/components/ui/progress";

interface ProjectProps {
  project: Project,
  filesCount: number,
  sessionsCount: number,
  tabValue: string,
  uploadFilesProgress: number,
  convertSessionsProgress: number,
  onUploadFiles: (acceptedFiles: any[]) => void
}

export default function Project({
  project,
  filesCount,
  sessionsCount,
  tabValue,
  uploadFilesProgress,
  convertSessionsProgress,
  onUploadFiles
}: ProjectProps) {

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        {project.name}
      </h1>
      {(!project.hasSetupProject) && (
        <div>
          <UploadFilesContainer
            onUploadFiles={onUploadFiles}
          />
        </div>
      )}
      {(project.hasSetupProject) && (
        <div>
          <div className="grid grid-cols-3 gap-8">
            <Link to={`/projects/${project._id}`} >
              <Card className={clsx("transition-all", {
                "border-accent-foreground": tabValue === 'RUNS'
              })}>
                <CardHeader>
                  <CardTitle>Runs</CardTitle>
                  <CardDescription>Runs are a way to annotate your data via Prompts</CardDescription>
                </CardHeader>
                <CardContent className="h-8">
                  <p>0 runs</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={`/projects/${project._id}/sessions`}>
              <Card className={clsx("transition-all", {
                "border-accent-foreground": tabValue === 'SESSIONS'
              })}>
                <CardHeader>
                  <CardTitle>Sessions</CardTitle>
                  <CardDescription>Sessions are your files converted to our standard format</CardDescription>
                </CardHeader>
                <CardContent className="h-8">
                  {(!project.isConvertingFiles) && (
                    <div>
                      {`${sessionsCount} sessions`}
                    </div>
                  )}
                  {(project.isConvertingFiles) && (
                    <div>
                      <Progress value={convertSessionsProgress} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
            <Link to={`/projects/${project._id}/files`}>
              <Card className={clsx("transition-all", {
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
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      )}
    </div>
  )
}