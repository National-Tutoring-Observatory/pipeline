import fse from "fs-extra";
import trackServerEvent from "~/modules/analytics/helpers/trackServerEvent.server";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import type { MtmLatest } from "../datasets.types";
import {
  getDatasetLatestPath,
  getMtmFullDatasetZipPath,
} from "../helpers/getDatasetStoragePath";

export async function action({ request }: { request: Request }) {
  const user = await requireAuth({ request });

  const { intent, agreed } = await request.json();

  if (intent === "REQUEST_MTM_DOWNLOAD") {
    if (!agreed) throw new Error("Data-use agreement must be accepted");

    console.log(
      `MTM dataset download: user ${user._id} accepted data-use agreement`,
    );
    trackServerEvent({ name: "mtm_dataset_downloaded", userId: user._id });

    const storage = getStorageAdapter();

    const latestPath = await storage.download({
      sourcePath: getDatasetLatestPath(),
    });
    const { version }: MtmLatest = await fse.readJSON(latestPath);

    const downloadUrl = await storage.request({
      url: getMtmFullDatasetZipPath(version),
    });
    return { downloadUrl };
  }

  return {};
}
