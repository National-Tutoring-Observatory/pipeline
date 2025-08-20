import { useLoaderData, useRevalidator, useSubmit } from "react-router";
import ProjectCollection from "../components/projectCollection";
import type { CreateCollection, Collection as CollectionType } from "~/modules/collections/collections.types";
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/projectCollection.route";
import { useEffect } from "react";
import updateDocument from "~/core/documents/updateDocument";
import throttle from 'lodash/throttle';
import updateBreadcrumb from "~/core/app/updateBreadcrumb";
import type { Project } from "../projects.types";
import getDocuments from "~/core/documents/getDocuments";
import includes from 'lodash/includes';
import type { Run } from "~/modules/runs/runs.types";
import exportCollection from "~/modules/collections/helpers/exportCollection";

type Collection = {
  data: CollectionType,
};

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getDocument({ collection: 'projects', match: { _id: parseInt(params.projectId), }, }) as Project;
  const collection = await getDocument({ collection: 'collections', match: { _id: parseInt(params.collectionId), project: parseInt(params.projectId) }, }) as Collection;
  const runs = await getDocuments({
    collection: 'runs',
    match: (item: Run) => {
      if (includes(collection.data.runs, Number(item._id))) {
        return true;
      }
    }, sort: {}
  }) as Collection;

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

  switch (intent) {
    case 'SETUP_COLLECTION':
      const collection = await getDocument({
        collection: 'collections',
        match: { _id: Number(params.collectionId), project: Number(params.projectId) }
      }) as Collection;

      await updateDocument({
        collection: 'collections',
        match: { _id: Number(params.collectionId) },
        update: {
          hasSetup: true,
          sessions,
          runs
        }
      }) as Collection;

      return {}
    case 'EXPORT_COLLECTION': {

      exportCollection({ collectionId: Number(params.collectionId), exportType });

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