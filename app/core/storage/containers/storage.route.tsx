import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import getStorage from "../helpers/getStorage";

export async function action({ request }: ActionFunctionArgs) {

  const { intent, payload } = await request.json()
  console.log(intent, payload);

  if (intent === 'REQUEST_STORAGE') {
    const { url } = payload;
    const storage = getStorage();
    if (storage) {
      const requestUrl = await storage.request(url, {});
      console.log("requestUrl", requestUrl);
      return { requestUrl };
    }
  }

  return {};
}