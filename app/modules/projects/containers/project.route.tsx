
import filter from 'lodash/filter';
import map from 'lodash/map';
import throttle from 'lodash/throttle';
import { useEffect, useState } from "react";
import { redirect, useMatches, useRevalidator, useSubmit } from "react-router";
import { toast } from "sonner";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import type { Collection } from "~/modules/collections/collections.types";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Run } from "~/modules/runs/runs.types";
import type { Session } from "~/modules/sessions/sessions.types";
import convertFileToFiles from "~/modules/uploads/convertFileToFiles";
import convertFilesToSessions from "~/modules/uploads/convertFilesToSessions";
import uploadFiles from "~/modules/uploads/uploadFiles";
import type { User } from "~/modules/users/users.types";
import Project from '../components/project';
import { validateProjectOwnership } from "../helpers/projectOwnership";
import type { Project as ProjectType } from "../projects.types";
import type { Route } from "./+types/project.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');
  const project = await documents.getDocument({ collection: 'projects', match: { _id: params.id, team: { $in: teamIds } } }) as { data: ProjectType };
  if (!project.data) {
    return redirect('/');
  }
  const files = await documents.getDocuments({ collection: 'files', match: { project: params.id }, sort: {} }) as { count: number };
  const sessions = await documents.getDocuments({ collection: 'sessions', match: { project: params.id }, sort: {} }) as { count: number, data: Session[] };
  const convertedSessionsCount = filter(sessions.data, { hasConverted: true }).length;
  const runs = await documents.getDocuments({ collection: 'runs', match: { project: params.id }, sort: {} }) as { count: number, data: Run[] };
  const collections = await documents.getDocuments({ collection: 'collections', match: { project: params.id }, sort: {} }) as { count: number, data: Collection[] };
  return { project, filesCount: files.count, sessionsCount: sessions.count, convertedSessionsCount, runsCount: runs.count, collectionsCount: collections.count };
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
    let files = formData.getAll('files');

    if (files.length === 1) {

      if (files[0] instanceof File) {
        if (files[0].type === 'application/jsonl') {
          files = await convertFileToFiles({ file: files[0], entityId });
        }
      }
    }

    const user = await getSessionUser({ request }) as User;

    if (!user) {
      return redirect('/');
    }

    await validateProjectOwnership({ user, projectId: entityId });

    uploadFiles({ files, entityId }).then(() => {
      convertFilesToSessions({ entityId });
    });

    const documents = getDocumentsAdapter();

    return await documents.updateDocument({ collection: 'projects', match: { _id: entityId }, update: { isUploadingFiles: true, isConvertingFiles: true, hasSetupProject: true } }) as { data: ProjectType };

  }
}


export function HydrateFallback() {
  return <div>Loading...</div>;
}

const debounceRevalidate = throttle((revalidate) => {
  revalidate();
}, 2000);

export default function ProjectRoute({ loaderData }: Route.ComponentProps) {
  const { project, filesCount, sessionsCount, convertedSessionsCount, runsCount, collectionsCount } = loaderData;

  const submit = useSubmit();

  const matches = useMatches();

  const { revalidate, state } = useRevalidator();

  const [uploadFilesProgress, setUploadFilesProgress] = useState(0);
  const [convertFilesProgress, setConvertFilesProgress] = useState(0);

  const onUploadFiles = async (acceptedFiles: any[]) => {
    const formData = new FormData();
    formData.append('body', JSON.stringify({
      intent: 'UPLOAD_PROJECT_FILES',
      entityId: project.data._id,
      files: Array.from(acceptedFiles).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
    }))
    for (const file of acceptedFiles) {
      const blob = new Blob([file], { type: file.type });
      formData.append('files', blob, file.name);
    }

    await submit(formData, {
      method: 'POST',
      encType: 'multipart/form-data',
    }).then(() => {
      toast.success('Uploading files');
    });
  }

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.projectId === project.data._id) {
        switch (data.event) {
          case 'UPLOAD_FILES':
            setUploadFilesProgress(data.progress);
            break;
          case 'CONVERT_FILES':
            setConvertFilesProgress(data.progress);
            break;
        }
        if (data.status === 'STARTED') {
          debounceRevalidate(revalidate);
        }
        if (data.status === 'DONE') {
          debounceRevalidate(revalidate);
          eventSource.close();
        }
      }
    };

    eventSource.onerror = () => {
      console.log('error');
      eventSource.close();
    };
    return () => {
      eventSource.close();
    }
  }, []);

  useEffect(() => {
    updateBreadcrumb([{ text: 'Projects', link: `/` }, { text: project.data.name }])
  }, []);

  return (
    <Project
      project={project.data}
      filesCount={filesCount}
      sessionsCount={sessionsCount}
      convertedSessionsCount={convertedSessionsCount}
      runsCount={runsCount}
      collectionsCount={collectionsCount}
      tabValue={matches[matches.length - 1].id}
      convertFilesProgress={convertFilesProgress}
      uploadFilesProgress={uploadFilesProgress}
      onUploadFiles={onUploadFiles}
    />
  );
}
