import find from "lodash/find";
import map from "lodash/map";
import { useContext, useEffect } from "react";
import { data, redirect, useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import { getPaginationParams, getTotalPages } from "~/helpers/pagination";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import { AuthenticationContext } from "~/modules/authentication/authentication.context";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import addDialog from "~/modules/dialogs/addDialog";
import PromptAuthorization from "~/modules/prompts/authorization";
import { usePromptActions } from "~/modules/prompts/hooks/usePromptActions";
import type { User } from "~/modules/users/users.types";
import CreatePromptDialog from "../components/createPromptDialog";
import Prompts from "../components/prompts";
import { PromptService } from "../prompt";
import { PromptVersionService } from "../promptVersion";
import type { Route } from "./+types/prompts.route";

export async function loader({ request }: Route.LoaderArgs) {
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, "team");

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "name",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: {
      team: { $in: teamIds },
      deletedAt: { $exists: false },
    },
    queryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
    filterableFields: ["annotationType"],
  });

  const pagination = getPaginationParams(query.page);

  const prompts = await PromptService.find({
    match: query.match,
    populate: ["team"],
    sort: query.sort,
    pagination,
  });

  const total = await PromptService.count(query.match);

  return { prompts: { data: prompts, totalPages: getTotalPages(total) } };
}

export async function action({ request }: Route.ActionArgs) {
  const { intent, payload = {} } = await request.json();

  const { name, annotationType, team } = payload;

  const user = (await getSessionUser({ request })) as User;

  if (!user) {
    return redirect("/");
  }

  switch (intent) {
    case "CREATE_PROMPT": {
      if (typeof name !== "string") {
        return data(
          {
            errors: {
              general: "Prompt name is required and must be a string.",
            },
          },
          { status: 400 },
        );
      }

      if (!PromptAuthorization.canCreate(user, team)) {
        return data(
          {
            errors: {
              general:
                "You do not have permission to create prompts in this team.",
            },
          },
          { status: 403 },
        );
      }

      const prompt = await PromptService.create({
        name,
        annotationType,
        team,
        productionVersion: 1,
        createdBy: user._id,
      });

      await PromptVersionService.create({
        name: "initial",
        prompt: prompt._id,
        version: 1,
        annotationSchema: [
          {
            isSystem: true,
            fieldKey: "_id",
            fieldType: "string",
            value: "",
          },
          {
            isSystem: true,
            fieldKey: "identifiedBy",
            fieldType: "string",
            value: "AI",
          },
          {
            isSystem: true,
            fieldKey: "reasoning",
            fieldType: "string",
            value: "",
          },
        ],
      });

      return data({
        success: true,
        intent: "CREATE_PROMPT",
        data: prompt,
      });
    }
    default:
      return data({ errors: { general: "Invalid intent" } }, { status: 400 });
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function PromptsRoute({ loaderData }: Route.ComponentProps) {
  const { prompts } = loaderData;
  const user = useContext(AuthenticationContext) as User;
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const { openEditPromptDialog, openDeletePromptDialog } = usePromptActions();

  const {
    searchValue,
    setSearchValue,
    currentPage,
    setCurrentPage,
    sortValue,
    setSortValue,
    filtersValues,
    setFiltersValues,
    isSyncing,
  } = useSearchQueryParams({
    searchValue: "",
    currentPage: 1,
    sortValue: "name",
    filters: {},
  });

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success && fetcher.data.intent === "CREATE_PROMPT") {
        toast.success("Prompt created");
        addDialog(null);
        navigate(
          `/prompts/${fetcher.data.data._id}/${fetcher.data.data.productionVersion}`,
        );
      } else if (fetcher.data.errors) {
        toast.error(fetcher.data.errors.general || "An error occurred");
      }
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const breadcrumbs = [{ text: "Prompts" }];

  const openCreatePromptDialog = () => {
    addDialog(
      <CreatePromptDialog
        hasTeamSelection={true}
        onCreateNewPromptClicked={submitCreatePrompt}
        isSubmitting={fetcher.state === "submitting"}
      />,
    );
  };

  const submitCreatePrompt = ({
    name,
    annotationType,
    team,
  }: {
    name: string;
    annotationType: string;
    team: string | null;
  }) => {
    fetcher.submit(
      JSON.stringify({
        intent: "CREATE_PROMPT",
        payload: { name, annotationType, team },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const onActionClicked = (action: string) => {
    if (action === "CREATE") {
      openCreatePromptDialog();
    }
  };

  const onItemActionClicked = ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => {
    const prompt = find(prompts.data, { _id: id });
    if (!prompt) return null;
    switch (action) {
      case "EDIT":
        openEditPromptDialog(prompt);
        break;

      case "DELETE":
        openDeletePromptDialog(prompt);
        break;
    }
  };

  const onSearchValueChanged = (searchValue: string) => {
    setSearchValue(searchValue);
  };

  const onPaginationChanged = (currentPage: number) => {
    setCurrentPage(currentPage);
  };

  const onFiltersValueChanged = (filterValue: any) => {
    setFiltersValues({ ...filtersValues, ...filterValue });
  };

  const onSortValueChanged = (sortValue: string) => {
    setSortValue(sortValue);
  };

  return (
    <Prompts
      prompts={prompts?.data}
      user={user}
      breadcrumbs={breadcrumbs}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={prompts.totalPages}
      filtersValues={filtersValues}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onActionClicked={onActionClicked}
      onItemActionClicked={onItemActionClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onFiltersValueChanged={onFiltersValueChanged}
      onSortValueChanged={onSortValueChanged}
    />
  );
}
