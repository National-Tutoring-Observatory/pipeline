import { useEffect } from "react";
import {
  data,
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "react-router";
import { toast } from "sonner";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import requireCollectionsFeature from "~/modules/collections/helpers/requireCollectionsFeature";
import addDialog from "~/modules/dialogs/addDialog";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import type { User } from "~/modules/users/users.types";
import CreateCollectionForRunDialog from "../components/createCollectionForRunDialog";
import RunAddToCollection from "../components/runAddToCollection";
import type { Route } from "./+types/runAddToCollection.route";

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

  const run = await RunService.findOne({
    _id: params.runId,
    project: params.projectId,
  });
  if (!run) {
    return redirect(`/projects/${params.projectId}`);
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "-createdAt",
  });

  const eligibleCollections =
    await CollectionService.findEligibleCollectionsForRun(params.runId, {
      page: queryParams.currentPage || 1,
      pageSize: 10,
      search: queryParams.searchValue || "",
    });

  return {
    project,
    run,
    eligibleCollections: eligibleCollections.data,
    totalEligibleCollections: eligibleCollections.count,
    totalPages: eligibleCollections.totalPages,
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
    case "ADD_TO_COLLECTIONS": {
      const { collectionIds } = payload;
      for (const collectionId of collectionIds) {
        await CollectionService.addRunsToCollection(collectionId, [
          params.runId,
        ]);
      }
      return data({
        success: true,
        intent: "ADD_TO_COLLECTIONS",
        data: {
          count: collectionIds.length,
          redirectTo: `/projects/${params.projectId}/runs/${params.runId}`,
        },
      });
    }
    case "CREATE_COLLECTION": {
      const { name } = payload;
      if (typeof name !== "string" || name.trim().length < 3) {
        return data(
          { errors: { name: "Collection name must be at least 3 characters" } },
          { status: 400 },
        );
      }
      const collection = await CollectionService.createCollectionForRun(
        params.runId,
        name.trim(),
      );
      return data({
        success: true,
        intent: "CREATE_COLLECTION",
        data: {
          collectionId: collection._id,
          redirectTo: `/projects/${params.projectId}/collections/${collection._id}`,
        },
      });
    }
    default: {
      return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
    }
  }
}

export default function RunAddToCollectionRoute() {
  const {
    project,
    run,
    eligibleCollections,
    totalEligibleCollections,
    totalPages,
  } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const isSubmitting = fetcher.state !== "idle";

  const {
    searchValue,
    setSearchValue,
    currentPage,
    setCurrentPage,
    isSyncing,
  } = useSearchQueryParams({
    searchValue: "",
    currentPage: 1,
  });

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (!fetcher.data || !("success" in fetcher.data)) return;

    if (fetcher.data.intent === "ADD_TO_COLLECTIONS") {
      const count = fetcher.data.data.count;
      toast.success(`Added to ${count} collection${count !== 1 ? "s" : ""}`);
      navigate(fetcher.data.data.redirectTo);
    }

    if (fetcher.data.intent === "CREATE_COLLECTION") {
      toast.success("Collection created");
      navigate(fetcher.data.data.redirectTo);
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const submitAddToCollections = (collectionIds: string[]) => {
    fetcher.submit(
      JSON.stringify({
        intent: "ADD_TO_COLLECTIONS",
        payload: { collectionIds },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const submitCreateCollection = (name: string) => {
    fetcher.submit(
      JSON.stringify({
        intent: "CREATE_COLLECTION",
        payload: { name },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const openCreateCollectionDialog = () => {
    addDialog(
      <CreateCollectionForRunDialog
        onCreateCollectionClicked={submitCreateCollection}
      />,
    );
  };

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Runs", link: `/projects/${project._id}` },
    {
      text: run.name,
      link: `/projects/${project._id}/runs/${run._id}`,
    },
    { text: "Add to Collection" },
  ];

  return (
    <RunAddToCollection
      eligibleCollections={eligibleCollections}
      totalEligibleCollections={totalEligibleCollections}
      totalPages={totalPages}
      breadcrumbs={breadcrumbs}
      isSubmitting={isSubmitting}
      searchValue={searchValue}
      currentPage={currentPage}
      isSyncing={isSyncing}
      onAddToCollectionsClicked={submitAddToCollections}
      onCreateCollectionClicked={openCreateCollectionDialog}
      onCancelClicked={() =>
        navigate(`/projects/${project._id}/runs/${run._id}`)
      }
      onSearchValueChanged={setSearchValue}
      onPaginationChanged={setCurrentPage}
    />
  );
}
