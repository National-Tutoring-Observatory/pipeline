
import filter from 'lodash/filter';
import has from 'lodash/has';
import throttle from 'lodash/throttle';
import { useEffect, useState } from "react";
import { redirect, useFetcher, useMatches, useRevalidator, data } from "react-router";
import { toast } from "sonner";
import useHandleSockets from '~/modules/app/hooks/useHandleSockets';
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
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
  const user = await getSessionUser({ request }) as User;

  if (!user) {
    return redirect('/');
  }

  const documents = getDocumentsAdapter();

  const formData = await request.formData();
    const body = JSON.parse(String(formData.get('body')));
    const { entityId } = body;

    const project = await documents.getDocument<ProjectType>({ collection: 'projects', match: { _id: entityId } });
    if (!project.data) {
      return data({ errors: { general: 'Project not found' } }, { status: 400 });
    }

    if (!ProjectAuthorization.canUpdate(user, project.data)) {
      return data(
        { errors: { general: 'You do not have permission to upload files to this project.' } },
        { status: 403 }
      );
    }

    const uploadedFiles = formData.getAll('files') as File[];

    if (uploadedFiles.length === 0) {
      return data({ errors: { files: 'Please select at least one file.' } }, { status: 400 });
    }

    let splitFiles: File[] = [];

    try {
      splitFiles = await splitMultipleSessionsIntoFiles({ files: uploadedFiles });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return data(
        { errors: { files: `File processing failed: ${errorMessage}` } },
        { status: 400 }
      );
    }

    if (splitFiles.length === 0) {
      return data(
        { errors: { files: 'No valid sessions found in uploaded files.' } },
        { status: 400 }
      );
    }

    const projectTeam = project.data.team as string;

    const attributesMapping = await getAttributeMappingFromFile({ file: splitFiles[0], team: projectTeam });

    uploadFiles({ files: splitFiles, entityId }).then(async () => {
      await createSessionsFromFiles({ projectId: entityId, shouldCreateSessionModels: true, attributesMapping });
    });

    const result = await documents.updateDocument<ProjectType>({
      collection: 'projects',
      match: { _id: entityId },
      update: { isUploadingFiles: true, hasSetupProject: true }
    });

    if (!result.data) {
      return data({ errors: { general: 'Failed to update project' } }, { status: 500 });
    }

    return data({ success: true });
}


export function HydrateFallback() {
  return <div>Loading...</div>;
}

const debounceRevalidate = throttle((revalidate) => {
  revalidate();
}, 2000);

export default function ProjectRoute({ loaderData }: Route.ComponentProps) {
  const { project, filesCount, sessionsCount, convertedSessionsCount, runsCount, collectionsCount } = loaderData;

  const uploadFetcher = useFetcher();
  const editFetcher = useFetcher();

  const matches = useMatches();

  const { revalidate, state } = useRevalidator();

  const [uploadFilesProgress, setUploadFilesProgress] = useState(0);
  const [convertFilesProgress, setConvertFilesProgress] = useState(0);

  const onEditProjectButtonClicked = (project: ProjectType) => {
    addDialog(<EditProjectDialog project={project} onEditProjectClicked={(p: ProjectType) => {
      editFetcher.submit(JSON.stringify({ intent: 'UPDATE_PROJECT', entityId: p._id, payload: { name: p.name } }), { method: 'PUT', encType: 'application/json', action: '/api/projects' });
    }} />);
  }

  useEffect(() => {
    console.log(editFetcher)
    if (editFetcher.state === 'idle' && editFetcher.data) {
      toast.success('Updated project');
    }
  }, [editFetcher.state, editFetcher.data]);

  useEffect(() => {
    if (uploadFetcher.data?.success) {
      toast.success('Files uploaded successfully');
    } else if (uploadFetcher.data?.errors) {
      toast.error('Upload failed');
    }
  }, [uploadFetcher.data]);

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
      uploadFetcher={uploadFetcher}
      onEditProjectButtonClicked={onEditProjectButtonClicked}
    />
  );
}
