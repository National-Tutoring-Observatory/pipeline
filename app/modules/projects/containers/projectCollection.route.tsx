import includes from 'lodash/includes';
import map from 'lodash/map';
import throttle from 'lodash/throttle';
import { useEffect } from "react";
import { redirect, useLoaderData, useRevalidator, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import type { Collection, CreateCollection } from "~/modules/collections/collections.types";
import exportCollection from "~/modules/collections/helpers/exportCollection";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Run } from "~/modules/runs/runs.types";
import ProjectCollection from "../components/projectCollection";
import type { Project } from "../projects.types";
import type { Route } from "./+types/projectCollection.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');

  const project = await documents.getDocument<Project>({ collection: 'projects', match: { _id: params.projectId, team: { $in: teamIds } }, });
  if (!project.data) {
    return redirect('/');
  }
  const collection = await documents.getDocument<Collection>({ collection: 'collections', match: { _id: params.collectionId, project: params.projectId }, });
  const result = await documents.getDocuments<Run>({
    collection: 'runs',
    match: (item: Run) => {
      if (includes(collection.data!.runs, item._id)) {
        return true;
      }
    }, sort: {}
  });
  const runs = { data: result.data };

  return { project, collection, runs };
}


export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, payload = {} } = await request.json();

  const {
    sessions,
    runs,
    exportType
  } = payload;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'SETUP_COLLECTION':
      await documents.updateDocument({
        collection: 'collections',
        match: { _id: params.collectionId },
        update: {
          hasSetup: true,
          sessions,
          runs
        }
      }) as { data: Collection };

      return {}
    case 'EXPORT_COLLECTION': {

      exportCollection({ collectionId: params.collectionId, exportType });

      return {};
    }
    default:
      return {};
  }
}

const debounceRevalidate = throttle((revalidate) => {
  revalidate();
}, 2000);

export default function ProjectCollectionRoute() {
  const { project, collection, runs } = useLoaderData();

  const submit = useSubmit();
  const { revalidate } = useRevalidator();

  const onSetupCollection = ({
    selectedSessions,
    selectedRuns
  }: CreateCollection) => {
    submit(JSON.stringify({
      intent: 'SETUP_COLLECTION',
      payload: {
        sessions: selectedSessions,
        runs: selectedRuns,
      }
    }), { method: 'POST', encType: 'application/json' });
  }

  const onExportCollectionButtonClicked = ({ exportType }: { exportType: string }) => {
    submit(JSON.stringify({
      intent: 'EXPORT_COLLECTION',
      payload: {
        exportType
      }
    }), { method: 'POST', encType: 'application/json' });
  }

  const onAddRunButtonClicked = () => {
    console.log('adding run');
  }

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.collectionId === collection.data._id) {
        switch (data.event) {
          case 'EXPORT_COLLECTION':
            debounceRevalidate(revalidate);
            break;
        }
      }
    };
    return () => {
      eventSource.close();
    }
  }, []);

  useEffect(() => {
    updateBreadcrumb([{
      text: 'Projects', link: `/`
    }, {
      text: project.data.name, link: `/projects/${project.data._id}`
    }, {
      text: 'Collections', link: `/projects/${project.data._id}/collections`
    }, {
      text: collection.data.name
    }])
  }, []);

  return (
    <ProjectCollection
      collection={collection.data}
      runs={runs.data}
      onSetupCollection={onSetupCollection}
      onExportCollectionButtonClicked={onExportCollectionButtonClicked}
      onAddRunButtonClicked={onAddRunButtonClicked}
    />
  )
}
