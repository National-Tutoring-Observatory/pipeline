import map from 'lodash/map';
import throttle from 'lodash/throttle';
import { useEffect } from "react";
import { redirect, useLoaderData, useRevalidator, useSubmit } from "react-router";
import updateBreadcrumb from "~/modules/app/updateBreadcrumb";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { CollectionService } from "~/modules/collections/collection";
import type { CreateCollection } from "~/modules/collections/collections.types";
import exportCollection from "~/modules/collections/helpers/exportCollection";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import ProjectCollection from "../components/projectCollection";
import type { Route } from "./+types/projectCollection.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const authenticationTeams = await getSessionUserTeams({ request });
  const teamIds = map(authenticationTeams, 'team');

  const project = await ProjectService.findOne({ _id: params.projectId, team: { $in: teamIds } });
  if (!project) {
    return redirect('/');
  }
  const collection = await CollectionService.findOne({ _id: params.collectionId, project: params.projectId });
  if (!collection) {
    return redirect('/');
  }
  const runs = await RunService.find({ match: { _id: { $in: collection.runs || [] } } });

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
      await CollectionService.updateById(params.collectionId, {
        hasSetup: true,
        sessions,
        runs
      });

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
