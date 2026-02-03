import find from "lodash/find";
import throttle from "lodash/throttle";
import { useEffect } from "react";
import {
  redirect,
  useLoaderData,
  useOutletContext,
  useRevalidator,
} from "react-router";
import buildQueryFromParams from "~/modules/app/helpers/buildQueryFromParams";
import getQueryParamsFromRequest from "~/modules/app/helpers/getQueryParamsFromRequest.server";
import useHandleSockets from "~/modules/app/hooks/useHandleSockets";
import { useSearchQueryParams } from "~/modules/app/hooks/useSearchQueryParams";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import CollectionOverview from "~/modules/collections/components/collectionOverview";
import addDialog from "~/modules/dialogs/addDialog";
import { RunService } from "~/modules/runs/run";
import ViewSessionContainer from "~/modules/sessions/containers/viewSessionContainer";
import { SessionService } from "~/modules/sessions/session";
import type { User } from "~/modules/users/users.types";
import type { Route } from "./+types/collectionOverview.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    return redirect("/");
  }

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
    runs,
    sessions,
  };
}

export default function CollectionOverviewRoute() {
  const { runs, sessions } = useLoaderData<typeof loader>();
  const { collection, project } = useOutletContext<any>();
  const revalidator = useRevalidator();

  const {
    searchValue: runsSearchValue,
    setSearchValue: setRunsSearchValue,
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
    searchValue: sessionsSearchValue,
    setSearchValue: setSessionsSearchValue,
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

  const debounceRevalidate = throttle(() => {
    revalidator.revalidate();
  }, 500);

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
    <CollectionOverview
      collection={collection}
      project={project}
      runs={runs.data}
      runsTotalPages={runs.totalPages}
      runsCurrentPage={runsCurrentPage}
      runsSearchValue={runsSearchValue}
      runsSortValue={runsSortValue}
      isRunsSyncing={isRunsSyncing}
      sessions={sessions.data}
      sessionsTotalPages={sessions.totalPages}
      sessionsCurrentPage={sessionsCurrentPage}
      sessionsSearchValue={sessionsSearchValue}
      sessionsSortValue={sessionsSortValue}
      isSessionsSyncing={isSessionsSyncing}
      onSessionItemClicked={onSessionItemClicked}
      onRunsSearchValueChanged={setRunsSearchValue}
      onRunsCurrentPageChanged={setRunsCurrentPage}
      onRunsSortValueChanged={setRunsSortValue}
      onSessionsSearchValueChanged={setSessionsSearchValue}
      onSessionsCurrentPageChanged={setSessionsCurrentPage}
      onSessionsSortValueChanged={setSessionsSortValue}
    />
  );
}
