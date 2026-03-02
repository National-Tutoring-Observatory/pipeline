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
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import { RunSetService } from "~/modules/runSets/runSet";
import type { User } from "~/modules/users/users.types";
import RunAddToRunSet from "../components/runAddToRunSet";
import type { Route } from "./+types/runAddToRunSet.route";

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

  const eligibleRunSets = await RunSetService.findEligibleRunSetsForRun(
    params.runId,
    {
      page: queryParams.currentPage || 1,
      pageSize: 10,
      search: queryParams.searchValue || "",
    },
  );

  return {
    project,
    run,
    eligibleRunSets: eligibleRunSets.data,
    totalEligibleRunSets: eligibleRunSets.count,
    totalPages: eligibleRunSets.totalPages,
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
    case "ADD_TO_RUN_SETS": {
      const { runSetIds } = payload;
      for (const runSetId of runSetIds) {
        await RunSetService.addRunsToRunSet(runSetId, [params.runId]);
      }
      return data({
        success: true,
        intent: "ADD_TO_RUN_SETS",
        data: {
          count: runSetIds.length,
          redirectTo: `/projects/${params.projectId}/runs/${params.runId}`,
        },
      });
    }
    case "CREATE_RUN_SET": {
      const { name } = payload;
      if (typeof name !== "string" || name.trim().length < 3) {
        return data(
          {
            errors: {
              name: "Run set name must be at least 3 characters",
            },
          },
          { status: 400 },
        );
      }
      const runSet = await RunSetService.createRunSetForRun(
        params.runId,
        name.trim(),
      );
      return data({
        success: true,
        intent: "CREATE_RUN_SET",
        data: {
          redirectTo: `/projects/${params.projectId}/run-sets/${runSet._id}`,
        },
      });
    }
    default: {
      return data({ errors: { intent: "Invalid intent" } }, { status: 400 });
    }
  }
}

export default function RunAddToRunSetRoute() {
  const { project, run, eligibleRunSets, totalEligibleRunSets, totalPages } =
    useLoaderData<typeof loader>();
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

    if (fetcher.data.intent === "ADD_TO_RUN_SETS") {
      const count = fetcher.data.data.count;
      toast.success(`Added to ${count} run set${count !== 1 ? "s" : ""}`);
      navigate(fetcher.data.data.redirectTo);
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const submitAddToRunSets = (runSetIds: string[]) => {
    fetcher.submit(
      JSON.stringify({
        intent: "ADD_TO_RUN_SETS",
        payload: { runSetIds },
      }),
      { method: "POST", encType: "application/json" },
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
    { text: "Add to Run Set" },
  ];

  return (
    <RunAddToRunSet
      eligibleRunSets={eligibleRunSets}
      totalEligibleRunSets={totalEligibleRunSets}
      totalPages={totalPages}
      breadcrumbs={breadcrumbs}
      isSubmitting={isSubmitting}
      searchValue={searchValue}
      currentPage={currentPage}
      isSyncing={isSyncing}
      onAddToRunSetsClicked={submitAddToRunSets}
      onCancelClicked={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(`/projects/${project._id}/runs/${run._id}`);
        }
      }}
      onSearchValueChanged={setSearchValue}
      onPaginationChanged={setCurrentPage}
    />
  );
}
