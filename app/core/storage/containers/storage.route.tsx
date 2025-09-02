import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import getStorageAdapter from "../helpers/getStorageAdapter";

export async function action({ request }: ActionFunctionArgs) {

  const { intent, payload } = await request.json()

  if (intent === 'REQUEST_STORAGE') {
    const { url } = payload;
    const storage = getStorageAdapter();
    if (storage) {
      const requestUrl = await storage.request(url, {});
      return { requestUrl };
    }
  }

  return {};
}