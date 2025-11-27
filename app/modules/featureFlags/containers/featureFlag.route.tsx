import pull from 'lodash/pull';
import { useEffect } from 'react';
import { redirect, useSubmit } from 'react-router';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import addDialog from '~/modules/dialogs/addDialog';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';
import type { User } from '~/modules/users/users.types';
import FeatureFlag from '../components/featureFlag';
import type { FeatureFlag as FeatureFlagType } from '../featureFlags.types';
import type { Route } from './+types/featureFlag.route';
import AddUsersToFeatureFlagDialogContainer from './addUsersToFeatureFlagDialog.container';

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();

  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }

  const featureFlag = await documents.getDocument({ collection: 'featureFlags', match: { _id: params.id } }) as { data: FeatureFlagType };

  const result = await documents.getDocuments({ collection: 'users', match: { featureFlags: { $in: [featureFlag.data.name] } } });
  const users = { data: result.data as User[] };

  return { featureFlag, users };
}

export async function action({
  request,
  params,
}: Route.ActionArgs) {

  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return {};
  }

  const { intent, payload = {} } = await request.json();

  const { userIds, userId } = payload;

  const documents = getDocumentsAdapter();

  switch (intent) {
    case 'ADD_USERS_TO_FEATURE_FLAG':

      for (const userId of userIds) {
        const user = await documents.getDocument({ collection: 'users', match: { _id: userId } }) as { data: User };

        if (user.data) {
          if (!user.data.featureFlags) {
            user.data.featureFlags = [];
          }
          const featureFlag = await documents.getDocument({ collection: 'featureFlags', match: { _id: params.id } }) as { data: FeatureFlagType };
          if (featureFlag) {
            user.data.featureFlags.push(featureFlag.data.name);
            await documents.updateDocument({ collection: 'users', match: { _id: userId }, update: { featureFlags: user.data.featureFlags } });
          }
        }
      }
      return {};
    case 'REMOVE_USER_FROM_FEATURE_FLAG':
      const user = await documents.getDocument({ collection: 'users', match: { _id: userId } }) as { data: User };
      const featureFlag = await documents.getDocument({ collection: 'featureFlags', match: { _id: params.id } }) as { data: FeatureFlagType };
      if (featureFlag) {
        pull(user.data.featureFlags, featureFlag.data.name);
        await documents.updateDocument({ collection: 'users', match: { _id: userId }, update: { featureFlags: user.data.featureFlags } });
      }
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
