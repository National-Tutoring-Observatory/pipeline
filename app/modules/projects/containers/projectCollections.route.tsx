import { useEffect } from "react";
import { useActionData, useLoaderData, useNavigate, useSubmit } from "react-router";
import { toast } from "sonner";
import type { Collection } from "~/modules/collections/collections.types";
import CreateCollectionDialog from "~/modules/collections/components/createCollectionDialog";
import DuplicateCollectionDialog from "~/modules/collections/components/duplicateCollectionDialog";
import EditCollectionDialog from "~/modules/collections/components/editCollectionDialog";
import addDialog from "~/modules/dialogs/addDialog";
import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import ProjectCollections from "../components/projectCollections";
import type { Route } from "./+types/projectCollections.route";

export async function loader({ params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const result = await documents.getDocuments<Collection>({ collection: 'collections', match: { project: params.id }, sort: {} });
  const collections = { data: result.data };
  return { collections };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json();

  const { name } = payload;
  let collection;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'CREATE_COLLECTION': {
      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      collection = await documents.createDocument({
        collection: 'collections', update: {
          project: params.id,
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
      await documents.updateDocument({
        collection: 'collections',
        match: {
          _id: entityId,
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
      const existingCollection = await documents.getDocument<Collection>({
        collection: 'collections',
        match: {
          _id: entityId,
        }
      });

      if (!existingCollection.data) {
        throw new Error('Collection not found');
      }

      const { project, sessions } = existingCollection.data;

      collection = await documents.createDocument({
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
