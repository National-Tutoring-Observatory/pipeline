
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/project.route";
import type { Project as ProjectType } from "../projects.types";
import Project from '../components/project';
import updateDocument from "~/core/documents/updateDocument";
import { useMatches, useNavigation, useParams, useSubmit } from "react-router";
import { toast } from "sonner";
import uploadFile from "~/core/uploads/uploadFile";
import path from 'path';
import createDocument from "~/core/documents/createDocument";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getDocument({ collection: 'projects', document: { _id: parseInt(params.id) } }) as { data: ProjectType };
  return { project };
}

export async function action({
  request,
}: Route.ActionArgs) {

  if (request.headers.get('content-type') === 'application/json') {
    const { intent, entityId, payload } = await request.json()
    return {};
  } else {
    const formData = await request.formData();
    // @ts-ignore
    const body = JSON.parse(formData.get('body'));
    const { entityId } = body;
    const files = formData.getAll('files');
    for (const file of files) {
      if (file instanceof File) {
        const name = path.basename(file.name);
        const document = await createDocument({
          collection: 'files', update: {
            project: parseInt(entityId),
            fileType: file.type,
            name
          }
        }) as { data: any };

        console.log(document);
        uploadFile({ file, outputDirectory: `./files/${entityId}/raw/${document.data._id}` });
      } else {
        console.warn('Expected a File, but got:', file);
      }
    }
    return await updateDocument({ collection: 'projects', document: { _id: parseInt(entityId) }, update: { isUploadingFiles: true, hasSetupProject: true } }) as { data: ProjectType };

  }
}


export function HydrateFallback() {
  return <div>Loading...</div>;
}


export default function ProjectRoute({ loaderData }: Route.ComponentProps) {
  const { project } = loaderData;

  const submit = useSubmit();

  const matches = useMatches();

  console.log(matches);

  const onUploadFiles = async (acceptedFiles: any[]) => {
    const formData = new FormData();
    formData.append('body', JSON.stringify({
      intent: 'UPLOAD_PROJECT_FILES', // Note the plural
      entityId: project.data._id,
      files: Array.from(acceptedFiles).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    }))
    for (const file of acceptedFiles) {
      formData.append('files', file);
    }
    await submit(formData, {
      method: 'POST',
      encType: 'multipart/form-data',
    }).then(() => {
      toast.success('Uploading files');
    });
  }

  return (
    <Project
      project={project.data}
      tabValue={matches[matches.length - 1].id}
      onUploadFiles={onUploadFiles}
    />
  );
}
