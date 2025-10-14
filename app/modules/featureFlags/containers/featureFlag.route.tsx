import React, { Component, useEffect } from 'react';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';
import FeatureFlag from '../components/featureFlag';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';
import type { Route } from './+types/featureFlag.route';
import { redirect, useSubmit } from 'react-router';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import type { User } from '~/modules/users/users.types';
import type { FeatureFlag as FeatureFlagType } from '../featureFlags.types';
import addDialog from '~/modules/dialogs/addDialog';
import AddUsersToFeatureFlagDialogContainer from './addUsersToFeatureFlagDialog.container';
import remove from 'lodash/remove';

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();

  let match = {};

  const userSession = await getSessionUser({ request }) as User;

  if (userSession.role !== 'SUPER_ADMIN') {
    return redirect('/');
  }

  const featureFlag = await documents.getDocument({ collection: 'featureFlags', match: { _id: params.id } }) as { data: FeatureFlagType };

  const users = await documents.getDocuments({ collection: 'users', match: { featureFlags: { $in: [featureFlag.data._id] } } }) as { data: User };

  return { featureFlag, users };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const { intent, payload = {} } = await request.json()

  const { userIds, userId } = payload;

  const documents = getDocumentsAdapter();

  const sessionUser = await getSessionUser({ request }) as User;

  if (sessionUser.role !== 'SUPER_ADMIN') return {};

  switch (intent) {
    case 'ADD_USERS_TO_FEATURE_FLAG':

      for (const userId of userIds) {
        const user = await documents.getDocument({ collection: 'users', match: { _id: userId } }) as { data: User };

        if (user.data) {
          if (!user.data.featureFlags) {
            user.data.featureFlags = [];
          }
          user.data.featureFlags.push(params.id);
          await documents.updateDocument({ collection: 'users', match: { _id: userId }, update: { featureFlags: user.data.featureFlags } });
        }
      }
      return {};
    case 'REMOVE_USER_FROM_FEATURE_FLAG':
      const user = await documents.getDocument({ collection: 'users', match: { _id: userId } }) as { data: User };

      const featureFlags = remove(user.data.featureFlags, userId);

      await documents.updateDocument({ collection: 'users', match: { _id: userId }, update: { featureFlags } });
      return {};
    default:
      return {};
  }
}

export default function FeatureFlagRoute({ loaderData }: {
  loaderData: {
    featureFlag: { data: FeatureFlagType },
    users: { data: User[] }
  }
}) {

  const { featureFlag, users } = loaderData;

  const submit = useSubmit();

  useEffect(() => {
    setTimeout(() => {
      updateBreadcrumb([{ text: 'Feature flags', link: '/featureFlags' }, { text: featureFlag.data.name }])
    }, 0);
  });

  const onAddUsersButtonClicked = () => {
    addDialog(
      <AddUsersToFeatureFlagDialogContainer
        featureFlagId={featureFlag.data._id}
        onAddUsersClicked={onAddUsersClicked}
      />
    );
  }

  const onAddUsersClicked = (userIds: string[]) => {
    submit(JSON.stringify({ intent: 'ADD_USERS_TO_FEATURE_FLAG', payload: { userIds } }), { method: 'PUT', encType: 'application/json' });
  }

  const onRemoveUserFromFeatureFlagClicked = (userId: string) => {
    submit(JSON.stringify({ intent: 'REMOVE_USER_FROM_FEATURE_FLAG', payload: { userId } }), { method: 'PUT', encType: 'application/json' });
  }

  return (
    <FeatureFlag
      featureFlag={featureFlag.data}
      users={users.data}
      onAddUsersClicked={onAddUsersButtonClicked}
      onRemoveUserFromFeatureFlagClicked={onRemoveUserFromFeatureFlagClicked}
    />
  );
} 