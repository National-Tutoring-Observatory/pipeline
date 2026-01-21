import filter from "lodash/filter";
import has from "lodash/has";
import throttle from "lodash/throttle";
import { useEffect, useState } from "react";
import {
  data,
  redirect,
  useFetcher,
  useMatches,
  useNavigate,
  useRevalidator,
} from "react-router";
import { toast } from "sonner";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import { FileService } from "~/modules/files/file";
import { RunService } from "~/modules/runs/run";
import { SessionService } from "~/modules/sessions/session";
import splitMultipleSessionsIntoFiles from "~/modules/uploads/services/splitMultipleSessionsIntoFiles";
import uploadFiles from "~/modules/uploads/services/uploadFiles";
import type { User } from "~/modules/users/users.types";
import ProjectAuthorization from "../authorization";
import Project from "../components/project";
import { useProjectActions } from "../hooks/useProjectActions";
import getAttributeMappingFromFile from "../helpers/getAttributeMappingFromFile";
import { ProjectService } from "../project";
import createSessionsFromFiles from "../services/createSessionsFromFiles.server";
import type { Route } from "./+types/project.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;

  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.id);
  if (!project) {
    return redirect("/");
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect("/");
  }

  const filesCount = await FileService.count({ project: params.id });
  const sessions = await SessionService.find({ match: { project: params.id } });
  const sessionsCount = sessions.length;
  const convertedSessionsCount = filter(sessions, {
    hasConverted: true,
  }).length;
  const runsCount = await RunService.count({ project: params.id });
  const collectionsCount = await CollectionService.count({
    project: params.id,
  });
  return {
    project,
    filesCount,
    sessionsCount,
    convertedSessionsCount,
    runsCount,
    collectionsCount,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const user = (await getSessionUser({ request })) as User;

  if (!user) {
    return redirect("/");
  }

  const formData = await request.formData();
  const body = JSON.parse(String(formData.get("body")));
  const { entityId } = body;

  const project = await ProjectService.findById(entityId);
  if (!project) {
    return data({ errors: { general: "Project not found" } }, { status: 404 });
  }

  if (!ProjectAuthorization.canUpdate(user, project)) {
    return data(
      {
        errors: {
          general:
            "You do not have permission to upload files to this project.",
        },
      },
      { status: 403 },
    );
  }

  const uploadedFiles = formData.getAll("files") as File[];

  if (uploadedFiles.length === 0) {
    return data(
      { errors: { files: "Please select at least one file." } },
      { status: 400 },
    );
  }

  let splitFiles: File[] = [];

  try {
    splitFiles = await splitMultipleSessionsIntoFiles({ files: uploadedFiles });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return data(
      { errors: { files: `File processing failed: ${errorMessage}` } },
      { status: 400 },
    );
  }

  if (splitFiles.length === 0) {
    return data(
      { errors: { files: "No valid sessions found in uploaded files." } },
      { status: 400 },
    );
  }

  const projectTeam = project.team as string;

  const attributesMapping = await getAttributeMappingFromFile({
    file: splitFiles[0],
    team: projectTeam,
  });

  uploadFiles({ files: splitFiles, entityId }).then(async () => {
    await createSessionsFromFiles({
      projectId: entityId,
      shouldCreateSessionModels: true,
      attributesMapping,
    });
  });

  const result = await ProjectService.updateById(entityId, {
    isUploadingFiles: true,
    hasSetupProject: true,
  });

  if (!result) {
    return data(
      { errors: { general: "Failed to update project" } },
      { status: 500 },
    );
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
  const {
    project,
    filesCount,
    sessionsCount,
    convertedSessionsCount,
    runsCount,
    collectionsCount,
  } = loaderData;

  const uploadFetcher = useFetcher();
  const matches = useMatches();
  const navigate = useNavigate();
  const { revalidate } = useRevalidator();
  const { openEditProjectDialog, openDeleteProjectDialog } = useProjectActions({
    onDeleteSuccess: () => navigate("/"),
  });

  const [uploadFilesProgress, setUploadFilesProgress] = useState(0);
  const [convertFilesProgress, setConvertFilesProgress] = useState(0);

  useEffect(() => {
    if (uploadFetcher.data?.success) {
      toast.success("Files uploaded successfully");
    } else if (uploadFetcher.data?.errors) {
      toast.error("Upload failed");
    }
  }, [uploadFetcher.data]);

  useHandleSockets({
    event: "CONVERT_FILES_TO_SESSIONS",
    matches: [
      {
        projectId: project._id,
        task: "CONVERT_FILES_TO_SESSIONS:START",
        status: "FINISHED",
      },
      {
        projectId: project._id,
        task: "CONVERT_FILES_TO_SESSIONS:PROCESS",
        status: "STARTED",
      },
      {
        projectId: project._id,
        task: "CONVERT_FILES_TO_SESSIONS:PROCESS",
        status: "FINISHED",
      },
      {
        projectId: project._id,
        task: "CONVERT_FILES_TO_SESSIONS:FINISH",
        status: "FINISHED",
      },
    ],
    callback: (payload) => {
      console.log(payload);
      if (has(payload, "progress")) {
        setConvertFilesProgress(payload.progress);
      }
      debounceRevalidate(revalidate);
    },
  });

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.projectId === project._id) {
        switch (data.event) {
          case "UPLOAD_FILES":
            setUploadFilesProgress(data.progress);
            break;
          case "CONVERT_FILES":
            setConvertFilesProgress(data.progress);
            break;
        }
        if (data.status === "STARTED") {
          debounceRevalidate(revalidate);
        }
        if (data.status === "DONE") {
          debounceRevalidate(revalidate);
          eventSource.close();
        }
      }
    };

    eventSource.onerror = () => {
      console.log("error");
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  }, []);

  const breadcrumbs = [{ text: "Projects", link: "/" }, { text: project.name }];

  return (
    <Project
      project={project}
      filesCount={filesCount}
      sessionsCount={sessionsCount}
      convertedSessionsCount={convertedSessionsCount}
      runsCount={runsCount}
      collectionsCount={collectionsCount}
      tabValue={matches[matches.length - 1].id}
      uploadFilesProgress={uploadFilesProgress}
      convertFilesProgress={convertFilesProgress}
      breadcrumbs={breadcrumbs}
      uploadFetcher={uploadFetcher}
      onEditProjectButtonClicked={openEditProjectDialog}
      onDeleteProjectButtonClicked={openDeleteProjectDialog}
    />
  );
}
