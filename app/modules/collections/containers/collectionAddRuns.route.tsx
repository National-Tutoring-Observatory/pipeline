import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collection } from "@/components/ui/collection";
import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import cloneDeep from "lodash/cloneDeep";
import includes from "lodash/includes";
import map from "lodash/map";
import pull from "lodash/pull";
import { useState } from "react";
import {
  data,
  redirect,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "react-router";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import requireCollectionsFeature from "~/modules/collections/helpers/requireCollectionsFeature";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { getRunModelDisplayName } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/collectionAddRuns.route";

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

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "-createdAt",
  });

  const eligibleRunsResult =
    await CollectionService.findEligibleRunsForCollection(params.collectionId, {
      page: queryParams.currentPage || 1,
      pageSize: 10,
      search: queryParams.searchValue || "",
    });

  return {
    collection,
    project,
    eligibleRuns: eligibleRunsResult.data,
    totalEligibleRuns: eligibleRunsResult.count,
    totalPages: eligibleRunsResult.totalPages,
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
    case "ADD_RUNS": {
      const { runIds } = payload;
      await CollectionService.addRunsToCollection(params.collectionId, runIds);
      return redirect(
        `/projects/${params.projectId}/collections/${params.collectionId}`,
      );
    }
    default: {
      return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
    }
  }
}

export default function CollectionAddRunsRoute() {
  const { collection, project, eligibleRuns, totalEligibleRuns, totalPages } =
    useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

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

  const onSelectAllToggled = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedRuns(map(eligibleRuns, "_id"));
    } else {
      setSelectedRuns([]);
    }
  };

  const onSelectRunToggled = (runId: string, isChecked: boolean) => {
    const clonedSelectedRuns = cloneDeep(selectedRuns);
    if (isChecked) {
      clonedSelectedRuns.push(runId);
      setSelectedRuns(clonedSelectedRuns);
    } else {
      pull(clonedSelectedRuns, runId);
      setSelectedRuns(clonedSelectedRuns);
    }
  };

  const onAddRunsClicked = () => {
    submit(
      JSON.stringify({
        intent: "ADD_RUNS",
        payload: { runIds: selectedRuns },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const onCancelClicked = () => {
    navigate(`/projects/${project._id}/collections/${collection._id}`);
  };

  const getItemAttributes = (run: Run) => ({
    id: run._id,
    title: run.name,
    meta: [
      { text: `Model: ${getRunModelDisplayName(run) || "-"}` },
      {
        text: `Status: ${run.isComplete ? "Complete" : run.isRunning ? "Running" : "Pending"}`,
      },
    ],
  });

  const renderItem = (run: Run) => (
    <div className="flex w-full items-center gap-4 p-4">
      <Checkbox
        checked={includes(selectedRuns, run._id)}
        onCheckedChange={(checked) =>
          onSelectRunToggled(run._id, Boolean(checked))
        }
        onClick={(e) => e.stopPropagation()}
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium">{run.name}</div>
        <div className="text-muted-foreground flex gap-4 text-sm">
          <span>Model: {getRunModelDisplayName(run) || "-"}</span>
          <span>
            Status:{" "}
            {run.isComplete
              ? "Complete"
              : run.isRunning
                ? "Running"
                : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Collections", link: `/projects/${project._id}/collections` },
    {
      text: collection.name,
      link: `/projects/${project._id}/collections/${collection._id}`,
    },
    { text: "Add Runs" },
  ];

  const allSelected =
    eligibleRuns.length > 0 && selectedRuns.length === eligibleRuns.length;

  return (
    <div className="p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <div className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Add Runs
        </h1>
        <p className="text-muted-foreground mt-2">
          Select runs to add to "{collection.name}". Only compatible runs are
          shown.
        </p>
      </div>

      {totalEligibleRuns === 0 && !searchValue ? (
        <div className="text-muted-foreground py-12 text-center">
          <p>No eligible runs found.</p>
          <p className="mt-2 text-sm">
            Runs must have the same sessions and annotation type as this
            collection.
          </p>
          <Button variant="outline" className="mt-4" onClick={onCancelClicked}>
            Go Back
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-4">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) =>
                onSelectAllToggled(Boolean(checked))
              }
            />
            <span className="text-muted-foreground text-sm">
              Select all ({selectedRuns.length} of {totalEligibleRuns} selected)
            </span>
          </div>

          <Collection
            items={eligibleRuns}
            itemsLayout="list"
            hasSearch
            hasPagination
            searchValue={searchValue}
            currentPage={currentPage}
            totalPages={totalPages}
            isSyncing={isSyncing}
            emptyAttributes={{
              title: "No runs found",
              description: searchValue
                ? "Try a different search term"
                : "No eligible runs available",
            }}
            getItemAttributes={getItemAttributes}
            getItemActions={() => []}
            renderItem={renderItem}
            onItemClicked={(id) => {
              const isSelected = includes(selectedRuns, id);
              onSelectRunToggled(id, !isSelected);
            }}
            onActionClicked={() => {}}
            onSearchValueChanged={setSearchValue}
            onPaginationChanged={setCurrentPage}
            onFiltersValueChanged={() => {}}
            onSortValueChanged={() => {}}
            filters={[]}
            filtersValues={{}}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onCancelClicked}>
              Cancel
            </Button>
            <Button
              onClick={onAddRunsClicked}
              disabled={selectedRuns.length === 0}
            >
              Add {selectedRuns.length} Run
              {selectedRuns.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
