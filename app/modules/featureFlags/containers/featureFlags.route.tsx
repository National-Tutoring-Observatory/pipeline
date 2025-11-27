import { useEffect } from 'react';
import { redirect, useActionData, useNavigate, useSubmit } from 'react-router';
import updateBreadcrumb from '~/modules/app/updateBreadcrumb';
import getSessionUser from '~/modules/authentication/helpers/getSessionUser';
import { isSuperAdmin, validateSuperAdmin } from '~/modules/authentication/helpers/superAdmin';
import addDialog from '~/modules/dialogs/addDialog';
import getDocumentsAdapter from '~/modules/documents/helpers/getDocumentsAdapter';
import type { User } from '~/modules/users/users.types';
import CreateFeatureFlagDialog from '../components/createFeatureFlagDialog';
import FeatureFlags from '../components/featureFlags';
import type { FeatureFlag } from '../featureFlags.types';
import type { Route } from './+types/featureFlags.route';

export async function loader({ request, params }: Route.LoaderArgs) {
  const documents = getDocumentsAdapter();
  const user = await getSessionUser({ request }) as User;
  if (!isSuperAdmin(user)) {
    return redirect('/');
  }
  const result = await documents.getDocuments({ collection: 'featureFlags', match: {}, sort: {} });
  const featureFlags = { data: result.data as FeatureFlag[] };
  return { featureFlags };
}

export async function action({
  request,
}: Route.ActionArgs) {

  const user = await getSessionUser({ request }) as User;
  validateSuperAdmin(user);

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

export default function FeatureFlagsRoute({ loaderData }: Route.ComponentProps) {
  const { featureFlags } = loaderData;
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
      featureFlags={featureFlags?.data}
      onCreateFeatureFlagButtonClicked={onCreateFeatureFlagButtonClicked}
    />
  );
}
