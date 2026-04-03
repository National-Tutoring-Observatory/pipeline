import fse from "fs-extra";
import type { Db } from "mongodb";
import path from "path";
import { PROJECT_ROOT } from "~/helpers/projectRoot";
import prepareMtmDataset from "~/modules/datasets/services/prepareMtmDataset";
import type {
  MigrationFile,
  MigrationResult,
} from "~/modules/migrations/types";

const VERSION = 1;
const CSV_PATH = `datasets/mtm/v${VERSION}.csv`;

export default {
  id: "20260403131908-prepare-mtm-dataset",
  name: "Prepare MTM Dataset",
  description:
    "Reads datasets/mtm/v1.csv and uploads session JSONs + manifest to storage for the MTM dataset feature",

  async up(_db: Db): Promise<MigrationResult> {
    console.log(`Starting MTM dataset preparation (v${VERSION})...`);

    const csvPath = path.join(PROJECT_ROOT, CSV_PATH);
    if (!fse.existsSync(csvPath)) {
      return {
        success: false,
        message: `${CSV_PATH} not found at ${csvPath}`,
        stats: { migrated: 0, failed: 0 },
      };
    }

    const csvContent = await fse.readFile(csvPath, "utf-8");
    const result = await prepareMtmDataset({ version: VERSION, csvContent });

    return {
      success: result.failedCount === 0,
      message: `Prepared MTM dataset v${VERSION}: ${result.sessionCount} sessions, ${result.totalUtterances} utterances (${result.failedCount} failed)`,
      stats: { migrated: result.sessionCount, failed: result.failedCount },
    };
  },
} satisfies MigrationFile;
