import { redirect, useNavigate } from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { FileService } from "~/modules/files/file";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import type { User } from "~/modules/users/users.types";
import Files from "../components/files";
import type { Route } from "./+types/files.route";

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

  const canUpdate = ProjectAuthorization.canUpdate(user, project);
  const isProcessing = project.isUploadingFiles || project.isConvertingFiles;

  const queryParams = getQueryParamsFromRequest(request, {
    searchValue: "",
    currentPage: 1,
    sort: "-createdAt",
    filters: {},
  });

  const query = buildQueryFromParams({
    match: { project: params.id },
    queryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
  });

  const files = await FileService.paginate(query);

  return { files, projectId: params.id, canUpdate, isProcessing };
}

export default function ProjectFilesRoute({
  loaderData,
}: Route.ComponentProps) {
  const { files, projectId, canUpdate, isProcessing } = loaderData;
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

  const actions =
    canUpdate && !isProcessing
      ? [{ action: "UPLOAD_FILES", text: "Upload files" }]
      : [];

  const onActionClicked = (action: string) => {
    if (action === "UPLOAD_FILES") {
      navigate(`/projects/${projectId}/upload-files`);
    }
  };

  return (
    <Files
      files={files.data}
      actions={actions}
      searchValue={searchValue}
      currentPage={currentPage}
      totalPages={files.totalPages}
      sortValue={sortValue}
      isSyncing={isSyncing}
      onActionClicked={onActionClicked}
      onSearchValueChanged={setSearchValue}
      onPaginationChanged={setCurrentPage}
      onSortValueChanged={setSortValue}
    />
  );
}
