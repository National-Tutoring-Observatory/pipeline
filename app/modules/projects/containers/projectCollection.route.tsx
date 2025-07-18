import { useLoaderData, useRevalidator, useRouteLoaderData, useSubmit } from "react-router";
import ProjectCollection from "../components/projectCollection";
import type { CreateCollection, Collection as CollectionType } from "~/modules/collections/collections.types";
import getDocument from "~/core/documents/getDocument";
import type { Route } from "./+types/projectCollection.route";
import { useEffect, useState } from "react";
import updateDocument from "~/core/documents/updateDocument";
//import annotateCollectionSessions from "~/core/annotations/annotateCollectionSessions";
import throttle from 'lodash/throttle';
import type { Prompt, PromptVersion } from "~/modules/prompts/prompts.types";
import type { Session } from "~/modules/sessions/sessions.types";
import updateBreadcrumb from "~/core/app/updateBreadcrumb";
import type { Project } from "../projects.types";
// import exportCollection from "~/modules/collections/helpers/exportCollection";

type Collection = {
  data: CollectionType,
};

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getDocument({ collection: 'projects', match: { _id: parseInt(params.projectId), }, }) as Project;
  const collection = await getDocument({ collection: 'collections', match: { _id: parseInt(params.collectionId), project: parseInt(params.projectId) }, }) as Collection;

  return { project, collection };
}


export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const {
    prompt,
    promptVersion,
    model,
    sessions,
    exportType
  } = payload;

  switch (intent) {
    case 'START_COLLECTION':
      const collection = await getDocument({
        collection: 'collections',
        match: { _id: Number(params.collectionId), project: Number(params.projectId) }
      }) as Collection;

      const sessionsAsObjects = [];

      for (const session of sessions) {
        const sessionModel = await getDocument({ collection: 'sessions', match: { _id: session } }) as { data: Session };
        sessionsAsObjects.push({
          name: sessionModel.data.name,
          fileType: sessionModel.data.fileType,
          sessionId: session,
          status: 'NOT_STARTED'
        });
      }

      await updateDocument({
        collection: 'collections',
        match: { _id: Number(params.collectionId) },
        update: {
          hasSetup: true,
          prompt,
          promptVersion,
          model,
          sessions: sessionsAsObjects
        }
      }) as Collection;

      //annotateCollectionSessions({ collectionId: collection.data._id });

      return {}
    case 'EXPORT_COLLECTION': {

      // exportCollection({ collectionId: Number(params.collectionId), exportType });

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
  const { project, collection } = useLoaderData();

  const [collectionSessionsProgress, setCollectionSessionsProgress] = useState(0);
  const [collectionSessionsStep, setCollectionSessionsStep] = useState('');
  const submit = useSubmit();
  const { revalidate, state } = useRevalidator();

  const onStartCollectionClicked = ({
    selectedSessions,
    selectedRuns
  }: CreateCollection) => {
    submit(JSON.stringify({
      intent: 'START_COLLECTION',
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
      onStartCollectionClicked={onStartCollectionClicked}
      onExportCollectionButtonClicked={onExportCollectionButtonClicked}
    />
  )
}