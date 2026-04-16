import find from "lodash/find";
import map from "lodash/map";
import { useContext, useEffect } from "react";
import { data, useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import { AuthenticationContext } from "~/modules/authentication/authentication.context";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import CodebookAuthorization from "~/modules/codebooks/authorization";
import addDialog from "~/modules/dialogs/addDialog";
import type { User } from "~/modules/users/users.types";
import { CodebookService } from "../codebook";
import type { Codebook } from "../codebooks.types";
import { CodebookVersionService } from "../codebookVersion";
import Codebooks from "../components/codebooks";
import CreateCodebookDialog from "../components/createCodebookDialog";
import DeleteCodebookDialog from "../components/deleteCodebookDialog";
import EditCodebookDialog from "../components/editCodebookDialog";
import type { Route } from "./+types/codebooks.route";

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
  });

  const codebooks = await CodebookService.paginate({
    ...query,
    populate: ["team"],
  });

  return { codebooks };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireAuth({ request });

  const { intent, entityId, payload = {} } = await request.json();

  const { name, description, team } = payload;

  switch (intent) {
    case "CREATE_CODEBOOK": {
      if (typeof name !== "string") {
        return data(
          {
            errors: {
              general: "Codebook name is required and must be a string.",
            },
          },
          { status: 400 },
        );
      }

      if (!CodebookAuthorization.canCreate(user, team)) {
        return data(
          {
            errors: {
              general:
                "You do not have permission to create codebooks in this team.",
            },
          },
          { status: 403 },
        );
      }

      const codebook = await CodebookService.create({
        name,
        description: description || "",
        team,
        productionVersion: 1,
        createdBy: user._id,
      });

      await CodebookVersionService.create({
        name: "initial",
        codebook: codebook._id,
        version: 1,
        categories: [
          { name: "New category", description: "", codes: [] },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any,
      });

      return data({
        success: true,
        intent: "CREATE_CODEBOOK",
        data: codebook,
      });
    }
    case "UPDATE_CODEBOOK": {
      const codebook = await CodebookService.findById(entityId);
      if (!codebook) {
        return data(
          { errors: { general: "Codebook not found" } },
          { status: 404 },
        );
      }
      if (!CodebookAuthorization.canUpdate(user, codebook)) {
        return data(
          {
            errors: {
              general: "You do not have permission to update this codebook.",
            },
          },
          { status: 403 },
        );
      }
      const updated = await CodebookService.updateById(entityId, {
        name,
        description,
      });
      return data({
        success: true,
        intent: "UPDATE_CODEBOOK",
        data: updated,
      });
    }
    case "DELETE_CODEBOOK": {
      const codebook = await CodebookService.findById(entityId);
      if (!codebook) {
        return data(
          { errors: { general: "Codebook not found" } },
          { status: 404 },
        );
      }
      if (!CodebookAuthorization.canDelete(user, codebook)) {
        return data(
          {
            errors: {
              general: "You do not have permission to delete this codebook.",
            },
          },
          { status: 403 },
        );
      }

      await CodebookService.updateById(entityId, {
        deletedAt: new Date(),
      });

      return data({
        success: true,
        intent: "DELETE_CODEBOOK",
      });
    }
    default:
      return data({ errors: { general: "Invalid intent" } }, { status: 400 });
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function CodebooksRoute({ loaderData }: Route.ComponentProps) {
  const { codebooks } = loaderData;
  const user = useContext(AuthenticationContext) as User;
  const fetcher = useFetcher();
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
    sortValue: "name",
    filters: {},
  });

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success && fetcher.data.intent === "CREATE_CODEBOOK") {
        toast.success("Codebook created");
        addDialog(null);
        navigate(
          `/codebooks/${fetcher.data.data._id}/${fetcher.data.data.productionVersion}`,
        );
      } else if (
        fetcher.data.success &&
        fetcher.data.intent === "UPDATE_CODEBOOK"
      ) {
        toast.success("Codebook updated");
        addDialog(null);
      } else if (
        fetcher.data.success &&
        fetcher.data.intent === "DELETE_CODEBOOK"
      ) {
        toast.success("Codebook deleted");
        addDialog(null);
      } else if (fetcher.data.errors) {
        toast.error(fetcher.data.errors.general || "An error occurred");
      }
    }
  }, [fetcher.state, fetcher.data, navigate]);

  const breadcrumbs = [{ text: "Codebooks" }];

  const openCreateCodebookDialog = () => {
    addDialog(
      <CreateCodebookDialog
        onCreateNewCodebookClicked={submitCreateCodebook}
        isSubmitting={fetcher.state === "submitting"}
      />,
    );
  };

  const openEditCodebookDialog = (codebook: Codebook) => {
    addDialog(
      <EditCodebookDialog
        codebook={codebook}
        onEditCodebookClicked={submitEditCodebook}
        isSubmitting={fetcher.state === "submitting"}
      />,
    );
  };

  const openDeleteCodebookDialog = (codebook: Codebook) => {
    addDialog(
      <DeleteCodebookDialog
        codebook={codebook}
        onDeleteCodebookClicked={submitDeleteCodebook}
        isSubmitting={fetcher.state === "submitting"}
      />,
    );
  };

  const submitCreateCodebook = ({
    name,
    description,
    team,
  }: {
    name: string;
    description: string;
    team: string | null;
  }) => {
    fetcher.submit(
      JSON.stringify({
        intent: "CREATE_CODEBOOK",
        payload: { name, description, team },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const submitEditCodebook = (codebook: Codebook) => {
    fetcher.submit(
      JSON.stringify({
        intent: "UPDATE_CODEBOOK",
        entityId: codebook._id,
        payload: { name: codebook.name, description: codebook.description },
      }),
      { method: "PUT", encType: "application/json" },
    );
  };

  const submitDeleteCodebook = (codebookId: string) => {
    fetcher.submit(
      JSON.stringify({ intent: "DELETE_CODEBOOK", entityId: codebookId }),
      { method: "DELETE", encType: "application/json" },
    );
  };

  const onActionClicked = (action: string) => {
    if (action === "CREATE") {
      openCreateCodebookDialog();
    }
  };

  const onItemActionClicked = ({
    id,
    action,
  }: {
    id: string;
    action: string;
  }) => {
    const codebook = find(codebooks.data, { _id: id });
    if (!codebook) return null;
    switch (action) {
      case "EDIT":
        openEditCodebookDialog(codebook);
        break;

      case "DELETE":
        openDeleteCodebookDialog(codebook);
        break;
    }
  };

  const onSearchValueChanged = (searchValue: string) => {
    setSearchValue(searchValue);
  };

  const onPaginationChanged = (currentPage: number) => {
    setCurrentPage(currentPage);
  };

  const onSortValueChanged = (sortValue: string) => {
    setSortValue(sortValue);
  };

  return (
    <Codebooks
      codebooks={codebooks?.data}
      user={user}
      breadcrumbs={breadcrumbs}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={codebooks.totalPages}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onActionClicked={onActionClicked}
      onItemActionClicked={onItemActionClicked}
      onSearchValueChanged={onSearchValueChanged}
      onPaginationChanged={onPaginationChanged}
      onSortValueChanged={onSortValueChanged}
    />
  );
}
