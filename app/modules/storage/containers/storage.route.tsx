import type { ActionFunctionArgs } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { isProjectOwner } from "~/modules/projects/helpers/projectOwnership";
import type { User } from "~/modules/users/users.types";
import getStorageAdapter from "../helpers/getStorageAdapter";

function extractProjectIdFromUrl(rawUrl: string): string {
  const parts = rawUrl.split('/');

  if (parts[0] !== 'storage' || !parts[1]) {
    throw new Error('Invalid request path');
  }

  return parts[1];
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    throw new Error("Authentication required");
  }

  const { intent, payload } = await request.json()

  if (intent === 'REQUEST_STORAGE') {
    const { url } = payload;

    if (!url) {
      throw new Error("Storage URL is required");
    }

    const projectId = extractProjectIdFromUrl(url);

    if (!(await isProjectOwner({ user, projectId }))) {
      throw new Error("You do not have permission to access files from this project");
    }

    const storage = getStorageAdapter();
    const requestUrl = await storage.request({ url });
    return { requestUrl };
  }

  return {};
}
