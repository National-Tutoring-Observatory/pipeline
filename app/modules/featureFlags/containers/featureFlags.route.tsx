import React, { Component, useEffect } from 'react';
import { Outlet, redirect, useActionData, useNavigate, useSubmit } from 'react-router';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';
import FeatureFlags from '../components/featureFlags';
import addDialog from '~/modules/dialogs/addDialog';
import CreateFeatureFlagDialog from '../components/createFeatureFlagDialog';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import type { User } from '~/modules/users/users.types';
import type { Route } from './+types/featureFlags.route';
import type { FeatureFlag } from '../featureFlags.types';

type FeatureFlags = {
  data: FeatureFlag[]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const authentication = await getSessionUser({ request }) as User;
  if (authentication.role !== 'SUPER_ADMIN') {
    throw redirect('/');
  }

  console.log('taka');
  const featureFlags = await documents.getDocuments({ collection: 'featureFlags', match: {}, sort: {} }) as FeatureFlags;
  console.log('after taka', featureFlags);
  return { featureFlags };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const { intent, entityId, payload = {} } = await request.json()

  const { name } = payload;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'CREATE_FEATURE_FLAG':
      if (typeof name !== "string") {
        throw new Error("Feature flag name is required and must be a string.");
      }
      const featureFlag = await documents.createDocument({ collection: 'featureFlags', update: { name } }) as { data: FeatureFlag };
      return {
        intent: 'CREATE_FEATURE_FLAG',
        ...featureFlag
      }
    default:
      return {};
  }
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function FeatureFlagsRoute() {
  const submit = useSubmit();
  const actionData = useActionData();
  const navigate = useNavigate();

  useEffect(() => {
    updateBreadcrumb([{ text: 'Feature flags', link: '/featureFlags' }])
  }, []);

  useEffect(() => {
    if (actionData?.intent === 'CREATE_FEATURE_FLAG') {
      navigate(`/featureFlags/${actionData.data._id}`)
    }
  }, [actionData]);

  const onCreateFeatureFlagButtonClicked = () => {
    addDialog(
      <CreateFeatureFlagDialog
        onCreateNewFeatureFlagClicked={onCreateNewFeatureFlagClicked}
      />
    );
  }

  const onCreateNewFeatureFlagClicked = ({ name }: {
    name: string,
  }) => {
    submit(JSON.stringify({ intent: 'CREATE_FEATURE_FLAG', payload: { name } }), { method: 'POST', encType: 'application/json' });
  }

  return (
    <FeatureFlags
      onCreateFeatureFlagButtonClicked={onCreateFeatureFlagButtonClicked}
    />
  );
}