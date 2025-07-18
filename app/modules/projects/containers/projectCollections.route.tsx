import getDocuments from "~/core/documents/getDocuments";
import { useActionData, useLoaderData, useNavigate, useSubmit } from "react-router";
import ProjectCollections from "../components/projectCollections";
import addDialog from "~/core/dialogs/addDialog";
import type { Collection } from "~/modules/collections/collections.types";
import createDocument from "~/core/documents/createDocument";
import type { Route } from "./+types/projectCollections.route";
import { toast } from "sonner";
import updateDocument from "~/core/documents/updateDocument";
import getDocument from "~/core/documents/getDocument";
import { useEffect } from "react";
import DuplicateCollectionDialog from "~/modules/collections/components/duplicateCollectionDialog";
import CreateCollectionDialog from "~/modules/collections/components/createCollectionDialog";
import EditCollectionDialog from "~/modules/collections/components/editCollectionDialog";

type Collections = {
  data: [],
};

export async function loader({ params }: Route.LoaderArgs) {
  const collections = await getDocuments({ collection: 'collections', match: { project: parseInt(params.id) }, sort: {} }) as Collections;
  return { collections };
}


export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const { name } = payload;
  let collection;

  switch (intent) {
    case 'CREATE_COLLECTION': {
      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      collection = await createDocument({
        collection: 'collections', update: {
          project: Number(params.id),
          name,
          sessions: [],
          runs: [],
          hasSetup: false
        }
      }) as { data: Collection };
      return {
        intent: 'CREATE_COLLECTION',
        ...collection
      }
    }
    case 'UPDATE_COLLECTION': {

      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      await updateDocument({
        collection: 'collections',
        match: {
          _id: Number(entityId),
        },
        update: {
          name
        }
      }) as { data: Collection };
      return {};
    }
    case 'DUPLICATE_COLLECTION': {

      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      const existingCollection = await getDocument({
        collection: 'collections',
        match: {
          _id: Number(entityId),
        }
      }) as { data: Collection };
      const { project, sessions } = existingCollection.data;

      collection = await createDocument({
        collection: 'collections',
        update: {
          project,
          name: name,
          sessions,
          runs: [],
          hasSetup: true
        }
      }) as { data: Collection };
      return {
        intent: 'DUPLICATE_COLLECTION',
        ...collection
      };
    }
    default: {
      return {};
    }
  }
}

export default function ProjectCollectionsRoute() {
  const { collections } = useLoaderData();
  const submit = useSubmit();
  const actionData = useActionData();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.intent === 'CREATE_COLLECTION' || actionData?.intent === 'DUPLICATE_COLLECTION') {
      navigate(`/projects/${actionData.data.project}/collections/${actionData.data._id}`)
    }
  }, [actionData]);

  const onCreateNewCollectionClicked = ({ name }: { name: string }) => {
    submit(JSON.stringify({ intent: 'CREATE_COLLECTION', payload: { name } }), { method: 'POST', encType: 'application/json' });
  }

  const onEditCollectionClicked = (collection: Collection) => {
    submit(JSON.stringify({ intent: 'UPDATE_COLLECTION', entityId: collection._id, payload: { name: collection.name } }), { method: 'PUT', encType: 'application/json' }).then(() => {
      toast.success('Updated collection');
    });
  }

  const onDuplicateNewCollectionClicked = ({ name, collectionId }: { name: string, collectionId: string }) => {
    submit(JSON.stringify({ intent: 'DUPLICATE_COLLECTION', entityId: collectionId, payload: { name: name } }), { method: 'POST', encType: 'application/json' }).then(() => {
      toast.success('Duplicated collection');
    });
  }

  const onEditCollectionButtonClicked = (collection: Collection) => {
    addDialog(<EditCollectionDialog
      collection={collection}
      onEditCollectionClicked={onEditCollectionClicked}
    />);
  }

  const onCreateCollectionButtonClicked = () => {
    addDialog(
      <CreateCollectionDialog
        onCreateNewCollectionClicked={onCreateNewCollectionClicked}
      />
    );
  }

  const onDuplicateCollectionButtonClicked = (collection: Collection) => {
    addDialog(<DuplicateCollectionDialog
      collection={collection}
      onDuplicateNewCollectionClicked={onDuplicateNewCollectionClicked}
    />
    );
  }

  return (
    <ProjectCollections
      collections={collections.data}
      onCreateCollectionButtonClicked={onCreateCollectionButtonClicked}
      onEditCollectionButtonClicked={onEditCollectionButtonClicked}
      onDuplicateCollectionButtonClicked={onDuplicateCollectionButtonClicked}
    />
  )
}