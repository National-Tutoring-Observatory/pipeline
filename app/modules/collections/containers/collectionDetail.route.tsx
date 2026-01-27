import find from "lodash/find";
import throttle from "lodash/throttle";
import { useEffect } from "react";
import {
  data,
  redirect,
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSubmit,
} from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import CollectionDetail from "~/modules/collections/components/collectionDetail";
import exportCollection from "~/modules/collections/helpers/exportCollection";
import requireCollectionsFeature from "~/modules/collections/helpers/requireCollectionsFeature";
import { useCollectionActions } from "~/modules/collections/hooks/useCollectionActions";
import addDialog from "~/modules/dialogs/addDialog";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import ViewSessionContainer from "~/modules/sessions/containers/viewSessionContainer";
import { SessionService } from "~/modules/sessions/session";
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

  const runsQueryParams = getQueryParamsFromRequest(
    request,
    {
      searchValue: "",
      currentPage: 1,
      sort: "-createdAt",
      filters: {},
    },
    { paramPrefix: "runs" },
  );

  const runsQuery = buildQueryFromParams({
    match: { _id: { $in: collection.runs || [] } },
    queryParams: runsQueryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
  });

  const runs = await RunService.paginate({
    match: runsQuery.match,
    sort: runsQuery.sort,
    page: runsQuery.page,
  });

  const sessionsQueryParams = getQueryParamsFromRequest(
    request,
    {
      searchValue: "",
      currentPage: 1,
      sort: "-createdAt",
      filters: {},
    },
    { paramPrefix: "sessions" },
  );

  const sessionsQuery = buildQueryFromParams({
    match: { _id: { $in: collection.sessions || [] } },
    queryParams: sessionsQueryParams,
    searchableFields: ["name"],
    sortableFields: ["name", "createdAt"],
  });

  const sessions = await SessionService.paginate({
    match: sessionsQuery.match,
    sort: sessionsQuery.sort,
    page: sessionsQuery.page,
  });

  return {
    collection,
    project,
    runs,
    sessions,
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
  const { collection, project, runs, sessions } =
    useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const submit = useSubmit();
  const navigate = useNavigate();

  const {
    currentPage: runsCurrentPage,
    setCurrentPage: setRunsCurrentPage,
    sortValue: runsSortValue,
    setSortValue: setRunsSortValue,
    isSyncing: isRunsSyncing,
  } = useSearchQueryParams(
    {
      searchValue: "",
      currentPage: 1,
      sortValue: "-createdAt",
      filters: {},
    },
    { paramPrefix: "runs" },
  );

  const {
    currentPage: sessionsCurrentPage,
    setCurrentPage: setSessionsCurrentPage,
    sortValue: sessionsSortValue,
    setSortValue: setSessionsSortValue,
    isSyncing: isSessionsSyncing,
  } = useSearchQueryParams(
    {
      searchValue: "",
      currentPage: 1,
      sortValue: "-createdAt",
      filters: {},
    },
    { paramPrefix: "sessions" },
  );

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

  const debounceRevalidate = throttle(() => {
    revalidator.revalidate();
  }, 500);

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

  const onSessionItemClicked = (id: string) => {
    const session = find(sessions.data, { _id: id });
    if (!session) return;
    addDialog(<ViewSessionContainer session={session} />);
  };

  useHandleSockets({
    event: "ANNOTATE_RUN",
    matches: runs.data
      .map((run) => [
        {
          runId: run._id,
          task: "ANNOTATE_RUN:START",
          status: "FINISHED",
        },
        {
          runId: run._id,
          task: "ANNOTATE_RUN:PROCESS",
          status: "STARTED",
        },
        {
          runId: run._id,
          task: "ANNOTATE_RUN:PROCESS",
          status: "FINISHED",
        },
        {
          runId: run._id,
          task: "ANNOTATE_RUN:FINISH",
          status: "FINISHED",
        },
      ])
      .flat(),
    callback: () => {
      debounceRevalidate();
    },
  });

  const breadcrumbs = [
    { text: "Projects", link: "/" },
    { text: project.name, link: `/projects/${project._id}` },
    { text: "Collections", link: `/projects/${project._id}/collections` },
    { text: collection.name },
  ];

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.collectionId === collection._id) {
        switch (data.event) {
          case "EXPORT_COLLECTION":
            debounceRevalidate();
            if (data.status === "DONE" && data.url) {
              const a = document.createElement("a");
              a.href = data.url;
              a.target = "_blank";
              a.rel = "noopener";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
            break;
        }
      }
    };

    return () => {
      eventSource.close();
    };
  }, [collection._id]);

  return (
    <CollectionDetail
      collection={collection}
      project={project}
      runs={runs.data}
      runsTotalPages={runs.totalPages}
      runsCurrentPage={runsCurrentPage}
      runsSortValue={runsSortValue}
      isRunsSyncing={isRunsSyncing}
      sessions={sessions.data}
      sessionsTotalPages={sessions.totalPages}
      sessionsCurrentPage={sessionsCurrentPage}
      sessionsSortValue={sessionsSortValue}
      isSessionsSyncing={isSessionsSyncing}
      breadcrumbs={breadcrumbs}
      onExportCollectionButtonClicked={onExportCollectionButtonClicked}
      onSessionItemClicked={onSessionItemClicked}
      onRunsCurrentPageChanged={setRunsCurrentPage}
      onRunsSortValueChanged={setRunsSortValue}
      onSessionsCurrentPageChanged={setSessionsCurrentPage}
      onSessionsSortValueChanged={setSessionsSortValue}
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
    />
  );
}
