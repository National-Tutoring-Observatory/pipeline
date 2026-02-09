import throttle from "lodash/throttle";
import {
  data,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
  useRevalidator,
  useSubmit,
} from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import CollectionDetail from "~/modules/collections/components/collectionDetail";
import exportCollection from "~/modules/collections/helpers/exportCollection";
import requireCollectionsFeature from "~/modules/collections/helpers/requireCollectionsFeature";
import { useCollectionActions } from "~/modules/collections/hooks/useCollectionActions";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/collectionDetail.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.projectId);
  if (!project) {
    return redirect("/");
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect("/");
  }

  await requireCollectionsFeature(request, params);

  const collection = await CollectionService.findById(params.collectionId);
  if (!collection) {
    return redirect(`/projects/${params.projectId}/collections`);
  }

  const runIds = collection.runs ?? [];
  const totalRuns = runIds.length;
  let runsProgress = { total: totalRuns, completed: 0, running: 0 };

  if (totalRuns > 0) {
    const [completed, running] = await Promise.all([
      RunService.count({ _id: { $in: runIds }, isComplete: true }),
      RunService.count({ _id: { $in: runIds }, isRunning: true }),
    ]);
    runsProgress = { total: totalRuns, completed, running };
  }

  return {
    collection,
    project,
    runsProgress,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const project = await ProjectService.findById(params.projectId);
  if (!project) {
    return data({ errors: { project: "Project not found" } }, { status: 404 });
  }

  if (!ProjectAuthorization.Runs.canManage(user, project)) {
    return data({ errors: { project: "Access denied" } }, { status: 403 });
  }

  const { intent, payload = {} } = await request.json();

  switch (intent) {
    case "EXPORT_COLLECTION": {
      const { exportType } = payload;
      await exportCollection({ collectionId: params.collectionId, exportType });
      return {};
    }
    default: {
      return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
    }
  }
}

const debounceRevalidate = throttle((revalidate) => {
  revalidate();
}, 500);

export default function CollectionDetailRoute() {
  const { collection, project, runsProgress } = useLoaderData<typeof loader>();
  const runIds = collection.runs ?? [];
  const submit = useSubmit();
  const navigate = useNavigate();
  const location = useLocation();
  const { revalidate } = useRevalidator();

  const parts = location.pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  const activeView = last === "evaluations" ? "evaluations" : "overview";

  const onActiveViewChange = (value: string) => {
    const basePath = `/projects/${project._id}/collections/${collection._id}`;
    if (value === "overview") {
      navigate(basePath);
    } else {
      navigate(`${basePath}/${value}`);
    }
  };

  const {
    openEditCollectionDialog,
    openDeleteCollectionDialog,
    openDuplicateCollectionDialog,
  } = useCollectionActions({
    projectId: project._id,
    onDeleteSuccess: () => {
      navigate(`/projects/${project._id}/collections`);
    },
  });

  const onExportCollectionButtonClicked = ({
    exportType,
  }: {
    exportType: string;
  }) => {
    submit(
      JSON.stringify({
        intent: "EXPORT_COLLECTION",
        payload: {
          exportType,
        },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  useHandleSockets({
    event: "ANNOTATE_RUN",
    matches: runIds.map((runId) => ({
      runId,
      task: "ANNOTATE_RUN:FINISH",
      status: "FINISHED",
    })),
    callback: () => {
      debounceRevalidate(revalidate);
    },
  });

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Collections", link: `/projects/${project._id}/collections` },
  ] as Breadcrumb[];

  if (activeView === "evaluations") {
    breadcrumbs.push(
      {
        text: collection.name,
        link: `/projects/${project._id}/collections/${collection._id}`,
      },
      {
        text: "Evaluations",
      },
    );
  } else {
    breadcrumbs.push({ text: collection.name });
  }

  return (
    <CollectionDetail
      collection={collection}
      project={project}
      breadcrumbs={breadcrumbs}
      runsProgress={runsProgress}
      onExportCollectionButtonClicked={onExportCollectionButtonClicked}
      onAddRunsClicked={() =>
        navigate(
          `/projects/${project._id}/collections/${collection._id}/add-runs`,
        )
      }
      onMergeClicked={() =>
        navigate(`/projects/${project._id}/collections/${collection._id}/merge`)
      }
      onDuplicateClicked={() => openDuplicateCollectionDialog(collection)}
      onEditClicked={() => openEditCollectionDialog(collection)}
      onDeleteClicked={() => openDeleteCollectionDialog(collection)}
      activeView={activeView}
      onActiveViewChange={onActiveViewChange}
    />
  );
}
