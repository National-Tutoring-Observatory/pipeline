import { useEffect } from "react";
import { data, redirect, useActionData, useLoaderData, useNavigate, useSubmit } from "react-router";
import { toast } from "sonner";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { CollectionService } from "~/modules/collections/collection";
import type { Collection } from "~/modules/collections/collections.types";
import CreateCollectionDialog from "~/modules/collections/components/createCollectionDialog";
import DuplicateCollectionDialog from "~/modules/collections/components/duplicateCollectionDialog";
import EditCollectionDialog from "~/modules/collections/components/editCollectionDialog";
import addDialog from "~/modules/dialogs/addDialog";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import type { User } from "~/modules/users/users.types";
import ProjectCollections from "../components/projectCollections";
import type { Route } from "./+types/projectCollections.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const project = await ProjectService.findById(params.id);
  if (!project) {
    return redirect('/');
  }

  if (!ProjectAuthorization.canView(user, project)) {
    return redirect('/');
  }

  const collections = await CollectionService.findByProject(params.id);
  return { collections };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    return redirect('/');
  }

  const project = await ProjectService.findById(params.id);
  if (!project) {
    throw new Error('Project not found');
  }

  if (!ProjectAuthorization.Runs.canManage(user, project)) {
    return data({ errors: { project: 'Access denied' } }, { status: 403 });
  }

  const { intent, entityId, payload = {} } = await request.json();

  const { name } = payload;
  let collection;

  switch (intent) {
    case 'CREATE_COLLECTION': {
      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      collection = await CollectionService.create({
        project: params.id,
        name,
        sessions: [],
        runs: [],
        hasSetup: false
      });
      return {
        intent: 'CREATE_COLLECTION',
        ...collection
      }
    }
    case 'UPDATE_COLLECTION': {

      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      await CollectionService.updateById(entityId, {
        name
      });
      return {};
    }
    case 'DUPLICATE_COLLECTION': {

      if (typeof name !== "string") {
        throw new Error("Collection name is required and must be a string.");
      }
      const existingCollection = await CollectionService.findById(entityId);

      if (!existingCollection) {
        throw new Error('Collection not found');
      }

      const { project, sessions } = existingCollection;

      collection = await CollectionService.create({
        project,
        name: name,
        sessions,
        runs: [],
        hasSetup: true
      });
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
