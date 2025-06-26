import UploadFilesContainer from "~/modules/files/containers/uploadFiles.container";
import type { Project } from "../projects.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Outlet } from "react-router";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import clsx from "clsx";

export default function Project({
  project,
  filesCount,
  tabValue,
  onUploadFiles
}: { project: Project, filesCount: number, tabValue: string, onUploadFiles: (acceptedFiles: any[]) => void }) {

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
          <div className="grid grid-cols-2 gap-20">
            <Link to={`/projects/${project._id}`} >
              <Card className={clsx("transition-all", {
                "border-accent-foreground": tabValue === 'RUNS'
              })}>
                <CardHeader>
                  <CardTitle>Runs</CardTitle>
                  <CardDescription>Runs are a way to annotate your data via Prompts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>0 runs</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={`/projects/${project._id}/files`}>
              <Card className={clsx("transition-all", {
                "border-accent-foreground": tabValue === 'FILES'
              })}>
                <CardHeader>
                  <CardTitle>Files</CardTitle>
                  <CardDescription>Files are your data files</CardDescription>
                </CardHeader>
                <CardContent>
                  {`${filesCount} files`}
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