
import filter from 'lodash/filter';
import has from 'lodash/has';
import throttle from 'lodash/throttle';
import { useEffect, useState } from "react";
import { redirect, useFetcher, useMatches, useRevalidator, useSubmit } from "react-router";
import { toast } from "sonner";
import useHandleSockets from '~/modules/app/hooks/useHandleSockets';
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { FileType } from '~/modules/files/files.types';
import type { Session } from "~/modules/sessions/sessions.types";
import splitMultipleSessionsIntoFiles from '~/modules/uploads/services/splitMultipleSessionsIntoFiles';
import uploadFiles from "~/modules/uploads/services/uploadFiles";
import type { User } from "~/modules/users/users.types";
import ProjectAuthorization from "../authorization";
import EditProjectDialog from "../components/editProjectDialog";
import Project from '../components/project';
import getAttributeMappingFromFile from '../helpers/getAttributeMappingFromFile';
import type { Project as ProjectType } from "../projects.types";
import createSessionsFromFiles from '../services/createSessionsFromFiles.server';
import type { Route } from "./+types/project.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const user = await getSessionUser({ request }) as User;

  if (!user) {
    return redirect('/');
  }

  const project = await documents.getDocument<ProjectType>({ collection: 'projects', match: { _id: params.id } });
  if (!project.data) {
    return redirect('/');
  }

  if (!ProjectAuthorization.canView(user, project.data)) {
    return redirect('/');
  }

  const filesCount = await documents.countDocuments({ collection: 'files', match: { project: params.id } });
  const sessions = await documents.getDocuments<Session>({ collection: 'sessions', match: { project: params.id }, sort: {} });
  const sessionsCount = sessions.count;
  const convertedSessionsCount = filter(sessions.data, { hasConverted: true }).length;
  const runsCount = await documents.countDocuments({ collection: 'runs', match: { project: params.id } });
  const collectionsCount = await documents.countDocuments({ collection: 'collections', match: { project: params.id } });
  return { project, filesCount, sessionsCount, convertedSessionsCount, runsCount, collectionsCount };
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
    const user = await getSessionUser({ request }) as User;

    if (!user) {
      return redirect('/');
    }

    const documents = getDocumentsAdapter();

    const project = await documents.getDocument<ProjectType>({ collection: 'projects', match: { _id: entityId } });
    if (!project.data) throw new Error('Project not found');

    if (!ProjectAuthorization.canUpdate(user, project.data)) {
      throw new Error("You do not have permission to upload files to this project.");
    }

    let files = formData.getAll('files') as File[];

    if (body.fileType === 'CSV' || body.fileType === 'JSONL') {
      files = await splitMultipleSessionsIntoFiles({ files, fileType: body.fileType });
    }

    const projectTeam = project.data.team as string;

    const attributesMapping = await getAttributeMappingFromFile({ file: files[0], team: projectTeam });

    uploadFiles({ files, entityId }).then(async () => {
      await createSessionsFromFiles({ projectId: entityId, shouldCreateSessionModels: true, attributesMapping });
    });

    return await documents.updateDocument<ProjectType>({ collection: 'projects', match: { _id: entityId }, update: { isUploadingFiles: true, hasSetupProject: true } });

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
  const fetcher = useFetcher();

  const matches = useMatches();

  const { revalidate, state } = useRevalidator();

  const [uploadFilesProgress, setUploadFilesProgress] = useState(0);
  const [convertFilesProgress, setConvertFilesProgress] = useState(0);

  const onUploadFiles = async ({
    acceptedFiles,
    fileType,
  }: {
    acceptedFiles: any[],
    fileType: FileType,
  }) => {
    const formData = new FormData();
    formData.append('body', JSON.stringify({
      intent: 'UPLOAD_PROJECT_FILES',
      entityId: project.data!._id,
      fileType,
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

  const onEditProjectButtonClicked = (project: ProjectType) => {
    addDialog(<EditProjectDialog project={project} onEditProjectClicked={(p: ProjectType) => {
      fetcher.submit(JSON.stringify({ intent: 'UPDATE_PROJECT', entityId: p._id, payload: { name: p.name } }), { method: 'PUT', encType: 'application/json', action: '/api/projects' });
    }} />);
  }

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      toast.success('Updated project');
    }
  }, [fetcher.state, fetcher.data]);

  useHandleSockets({
    event: 'CONVERT_FILES_TO_SESSIONS',
    matches: [{
      projectId: project.data!._id,
      task: 'CONVERT_FILES_TO_SESSIONS:START',
      status: 'FINISHED'
    }, {
      projectId: project.data!._id,
      task: 'CONVERT_FILES_TO_SESSIONS:PROCESS',
      status: 'STARTED'
    }, {
      projectId: project.data!._id,
      task: 'CONVERT_FILES_TO_SESSIONS:PROCESS',
      status: 'FINISHED'
    }, {
      projectId: project.data!._id,
      task: 'CONVERT_FILES_TO_SESSIONS:FINISH',
      status: 'FINISHED'
    }], callback: (payload) => {
      console.log(payload);
      if (has(payload, 'progress')) {
        setConvertFilesProgress(payload.progress);
      }
      debounceRevalidate(revalidate);
    }
  })

  useEffect(() => {

    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.projectId === project.data!._id) {
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
    updateBreadcrumb([{ text: 'Projects', link: `/` }, { text: project.data!.name }])
  }, [project.data]);

  return (
    <Project
      project={project.data!}
      filesCount={filesCount}
      sessionsCount={sessionsCount}
      convertedSessionsCount={convertedSessionsCount}
      runsCount={runsCount}
      collectionsCount={collectionsCount}
      tabValue={matches[matches.length - 1].id}
      convertFilesProgress={convertFilesProgress}
      uploadFilesProgress={uploadFilesProgress}
      onUploadFiles={onUploadFiles}
      onEditProjectButtonClicked={onEditProjectButtonClicked}
    />
  );
}
