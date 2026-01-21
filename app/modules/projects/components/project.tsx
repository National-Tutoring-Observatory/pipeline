import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, PageHeaderLeft, PageHeaderRight } from "@/components/ui/pageHeader";
import { Progress } from "@/components/ui/progress";
import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";
import { useContext } from "react";
import type { FetcherWithComponents } from "react-router";
import { Link, Outlet } from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import UploadFilesContainer from "~/modules/files/containers/uploadFiles.container";
import ProjectAuthorization from "~/modules/projects/authorization";
import type { User } from "~/modules/users/users.types";
import type { Project } from "../projects.types";

interface UploadFilesData {
  errors?: Record<string, string>;
  success?: boolean;
}

interface ProjectProps {
  project: Project;
  filesCount: number;
  sessionsCount: number;
  convertedSessionsCount: number;
  runsCount: number;
  collectionsCount: number;
  tabValue: string;
  uploadFilesProgress: number;
  convertFilesProgress: number;
  breadcrumbs: Breadcrumb[];
  uploadFetcher: FetcherWithComponents<UploadFilesData>;
  onEditProjectButtonClicked: (project: Project) => void;
  onDeleteProjectButtonClicked: (project: Project) => void;
}

export default function Project({
  project,
  filesCount,
  sessionsCount,
  convertedSessionsCount,
  runsCount,
  collectionsCount,
  tabValue,
  uploadFilesProgress,
  convertFilesProgress,
  breadcrumbs,
  uploadFetcher,
  onEditProjectButtonClicked,
  onDeleteProjectButtonClicked
}: ProjectProps) {
  const user = useContext(AuthenticationContext) as User | null;
  const canUpdate = ProjectAuthorization.canUpdate(user, project);
  const canDelete = ProjectAuthorization.canDelete(user, project);

  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
        <PageHeaderRight>
          {(canUpdate || canDelete) && (
            <div className="flex gap-1">
              {canUpdate && (
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onEditProjectButtonClicked(project)}>
                  <Pencil />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => onDeleteProjectButtonClicked(project)}>
                  <Trash2 />
                  Delete
                </Button>
              )}
            </div>
          )}
        </PageHeaderRight>
      </PageHeader>
      {(!project.hasSetupProject) && (
        <div>
          <UploadFilesContainer
            projectId={project._id}
            uploadFetcher={uploadFetcher}
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
