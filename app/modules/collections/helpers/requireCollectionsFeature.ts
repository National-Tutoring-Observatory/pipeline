import { redirect } from "react-router";
import hasFeatureFlag from "~/modules/featureFlags/helpers/hasFeatureFlag";

export default async function requireCollectionsFeature(
  request: Request,
  params: { projectId?: string; id?: string }
) {
  const hasFeature = await hasFeatureFlag('HAS_PROJECT_COLLECTIONS', { request }, { defaultValue: false });
  if (!hasFeature) {
    throw redirect(`/projects/${params.projectId || params.id}`);
  }
}
