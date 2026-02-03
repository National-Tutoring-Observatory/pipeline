import { redirect, useLoaderData, useOutletContext } from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import type { Collection } from "~/modules/collections/collections.types";
import CollectionEvaluations from "~/modules/collections/components/collectionEvaluations";
import { EvaluationService } from "~/modules/evaluations/evaluation";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/collectionEvaluations.route";

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
    match: { collection: params.collectionId },
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

export default function CollectionEvaluationsRoute() {
  const { evaluations } = useLoaderData<typeof loader>();
  const { collection } = useOutletContext<{
    collection: Collection;
    project: { _id: string; name: string };
  }>();

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

  const onActionClicked = (_action: string) => {};

  return (
    <CollectionEvaluations
      collection={collection}
      evaluations={evaluations.data}
      totalPages={evaluations.totalPages}
      currentPage={currentPage}
      searchValue={searchValue}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onSearchValueChanged={setSearchValue}
      onCurrentPageChanged={setCurrentPage}
      onSortValueChanged={setSortValue}
      onItemClicked={onItemClicked}
      onActionClicked={onActionClicked}
    />
  );
}
