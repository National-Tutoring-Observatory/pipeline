import dotenv from "dotenv";
import fse from "fs-extra";
import path from "path";
import prepareMtmDataset from "../../app/modules/datasets/services/prepareMtmDataset";
import "../../app/modules/storage/storage";

dotenv.config({ path: ".env" });

const args = process.argv.slice(2);
const versionFlag = args.indexOf("--version");
if (versionFlag === -1 || !args[versionFlag + 1]) {
  console.error("Usage: yarn dataset:prepare-mtm --version <number>");
  process.exit(1);
}
const version = parseInt(args[versionFlag + 1], 10);
if (isNaN(version) || version < 1) {
  console.error("Version must be a positive integer");
  process.exit(1);
}

async function main() {
  const csvPath = path.resolve(`datasets/mtm/v${version}.csv`);
  if (!fse.existsSync(csvPath)) {
    console.error(`datasets/mtm/v${version}.csv not found`);
    process.exit(1);
  }

  console.log(`Preparing MTM dataset v${version}...`);
  const csvContent = await fse.readFile(csvPath, "utf-8");
  await prepareMtmDataset({ version, csvContent });
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
