import UploadFilesContainer from "~/modules/files/containers/uploadFiles.container";
import type { Project } from "../projects.types";

export default function Project({
  project,
  onUploadFiles
}: { project: Project, onUploadFiles: (acceptedFiles: any[]) => void }) {

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        {project.name}
      </h1>
      <div>
        <UploadFilesContainer
          onUploadFiles={onUploadFiles}
        />
      </div>
    </div>
  )
}