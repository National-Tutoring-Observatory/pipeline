import trackServerEvent from "~/modules/analytics/helpers/trackServerEvent.server";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import { getMtmFullDatasetZipPath } from "../helpers/getDatasetStoragePath";

export async function action({ request }: { request: Request }) {
  const user = await getSessionUser({ request });
  if (!user) throw new Error("Authentication required");

  const { intent, agreed } = await request.json();

  if (intent === "REQUEST_MTM_DOWNLOAD") {
    if (!agreed) throw new Error("Data-use agreement must be accepted");

    console.log(
      `MTM dataset download: user ${user._id} accepted data-use agreement`,
    );
    trackServerEvent({ name: "mtm_dataset_downloaded", userId: user._id });

    const storage = getStorageAdapter();
    const downloadUrl = await storage.request({
      url: getMtmFullDatasetZipPath(),
    });
    return { downloadUrl };
  }

  return {};
}
