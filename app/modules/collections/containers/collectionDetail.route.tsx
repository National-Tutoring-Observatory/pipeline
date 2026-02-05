import {
  data,
  redirect,
  useLoaderData,
  useLocation,
  useNavigate,
  useSubmit,
} from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import CollectionDetail from "~/modules/collections/components/collectionDetail";
import exportCollection from "~/modules/collections/helpers/exportCollection";
import requireCollectionsFeature from "~/modules/collections/helpers/requireCollectionsFeature";
import { useCollectionActions } from "~/modules/collections/hooks/useCollectionActions";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
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

  return {
    collection,
    project,
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

export default function CollectionDetailRoute() {
  const { collection, project } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();
  const location = useLocation();

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
