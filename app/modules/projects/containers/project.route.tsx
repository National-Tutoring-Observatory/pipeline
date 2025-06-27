
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/project.route";
import type { Project as ProjectType } from "../projects.types";
import Project from '../components/project';
import updateDocument from "~/core/documents/updateDocument";
import { useMatches, useRevalidator, useSubmit } from "react-router";
import { toast } from "sonner";
import uploadFile from "~/core/uploads/uploadFile";
import path from 'path';
import createDocument from "~/core/documents/createDocument";
import getDocuments from "~/core/documents/getDocuments";
import { emitter } from "~/core/events/emitter";
import throttle from 'lodash/throttle';
import { useState } from "react";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getDocument({ collection: 'projects', match: { _id: parseInt(params.id) } }) as { data: ProjectType };
  const files = await getDocuments({ collection: 'files', match: { project: parseInt(params.id) } }) as { count: number };
  const sessions = await getDocuments({ collection: 'sessions', match: { project: parseInt(params.id) } }) as { count: number };
  return { project, filesCount: files.count, sessionsCount: sessions.count };
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

    const uploadFiles = async () => {

      let completedFiles = 0;

      for (const file of files) {
        if (file instanceof File) {
          const name = path.basename(file.name);
          const document = await createDocument({
            collection: 'files',
            update: {
              project: parseInt(entityId),
              fileType: file.type,
              name,
              hasUploaded: false
            }
          }) as { data: any };
          console.log('before');
          await uploadFile({ file, outputDirectory: `./storage/${entityId}/files/${document.data._id}` }).then(() => {
            updateDocument({
              collection: 'files', match: {
                _id: parseInt(document.data._id)
              }, update: {
                hasUploaded: true
              }
            });
            completedFiles++;
            emitter.emit("UPLOAD_FILES", { projectId: parseInt(entityId), progress: Math.round((100 / files.length) * completedFiles), status: 'RUNNING' });
          });
          console.log('after');
        } else {
          console.warn('Expected a File, but got:', file);
        }
      }
      await updateDocument({ collection: 'projects', match: { _id: parseInt(entityId) }, update: { isUploadingFiles: false } }) as { data: ProjectType };
      emitter.emit("UPLOAD_FILES", { projectId: parseInt(entityId), progress: 100, status: 'DONE' });
    }
    uploadFiles();
    return await updateDocument({ collection: 'projects', match: { _id: parseInt(entityId) }, update: { isUploadingFiles: true, hasSetupProject: true } }) as { data: ProjectType };

  }
}


export function HydrateFallback() {
  return <div>Loading...</div>;
}

const debounceRevalidate = throttle((revalidate) => {
  revalidate();
}, 2000);

export default function ProjectRoute({ loaderData }: Route.ComponentProps) {
  const { project, filesCount, sessionsCount } = loaderData;

  const submit = useSubmit();

  const matches = useMatches();

  const { revalidate, state } = useRevalidator();

  const [uploadFilesProgress, setUploadFilesProgress] = useState(0);

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
    const eventSource = new EventSource("/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.projectId === project.data._id) {
        setUploadFilesProgress(data.progress);
        if (data.status === 'DONE') {
          debounceRevalidate(revalidate);
        }
      }
    };

    eventSource.onerror = () => {
      console.log('error');
      eventSource.close();
    };

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
      filesCount={filesCount}
      sessionsCount={sessionsCount}
      tabValue={matches[matches.length - 1].id}
      uploadFilesProgress={uploadFilesProgress}
      onUploadFiles={onUploadFiles}
    />
  );
}
