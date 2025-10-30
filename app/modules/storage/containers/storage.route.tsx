import type { ActionFunctionArgs } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import type { User } from "~/modules/users/users.types";
import getStorageAdapter from "../helpers/getStorageAdapter";

export async function action({ request }: ActionFunctionArgs) {
  const user = await getSessionUser({ request }) as User;
  if (!user) {
    throw new Error("Authentication required");
  }

  const { intent, payload } = await request.json()

  if (intent === 'REQUEST_STORAGE') {
    const { url } = payload;
    const storage = getStorageAdapter();

    const requestUrl = await storage.request(url, {});
    return { requestUrl };
  }

  return {};
}
