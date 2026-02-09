import {
  redirect,
  useLoaderData,
  useNavigate,
  useOutletContext,
} from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { EvaluationService } from "~/modules/evaluations/evaluation";
import isAbleToCreateEvaluation from "~/modules/evaluations/helpers/isAbleToCreateEvaluation";
import RunSetEvaluations from "~/modules/runSets/components/runSetEvaluations";
import type { RunSet } from "~/modules/runSets/runSets.types";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/runSetEvaluations.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "-createdAt",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: { collection: params.runSetId },
    queryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
  });

  const evaluations = await EvaluationService.paginate({
    match: query.match,
    sort: query.sort,
    page: query.page,
  });

  return {
    evaluations,
  };
}

export default function RunSetEvaluationsRoute() {
  const { evaluations } = useLoaderData<typeof loader>();
  const { runSet, project } = useOutletContext<{
    runSet: RunSet;
    project: { _id: string; name: string };
  }>();
  const navigate = useNavigate();

  const {
    searchValue,
    setSearchValue,
    currentPage,
    setCurrentPage,
    sortValue,
    setSortValue,
    isSyncing,
  } = useSearchQueryParams({
    searchValue: "",
    currentPage: 1,
    sortValue: "-createdAt",
    filters: {},
  });

  const onItemClicked = (_id: string) => {};

  const onActionClicked = (action: string) => {
    if (action === "CREATE_EVALUATION") {
      navigate(
        `/projects/${project._id}/run-sets/${runSet._id}/create-evaluation`,
      );
    }
  };

  return (
    <RunSetEvaluations
      evaluations={evaluations.data}
      totalPages={evaluations.totalPages}
      currentPage={currentPage}
      searchValue={searchValue}
      sortValue={sortValue}
      isSyncing={isSyncing}
      isAbleToCreateEvaluation={isAbleToCreateEvaluation(runSet)}
      onSearchValueChanged={setSearchValue}
      onCurrentPageChanged={setCurrentPage}
      onSortValueChanged={setSortValue}
      onItemClicked={onItemClicked}
      onActionClicked={onActionClicked}
    />
  );
}
