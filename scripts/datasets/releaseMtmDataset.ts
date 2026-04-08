import { execSync } from "child_process";
import fse from "fs-extra";
import path from "path";
import { createInterface } from "readline";
import { PROJECT_ROOT } from "../../app/helpers/projectRoot";
import { getDatasetLatestPath } from "../../app/modules/datasets/helpers/getDatasetStoragePath";

const STAGING = "staging.nto";
const PROD = "prod.nto";

function parseArgs() {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--version");
  const versionStr = idx !== -1 ? args[idx + 1] : undefined;

  if (!versionStr) {
    console.error("Usage: yarn dataset:release-mtm --version <N>");
    process.exit(1);
  }

  const version = parseInt(versionStr, 10);
  if (isNaN(version) || version < 1) {
    console.error("Version must be a positive integer");
    process.exit(1);
  }

  return { version };
}

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function run(cmd: string) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

async function main() {
  const { version } = parseArgs();

  const versionLocalPath = path.join(
    PROJECT_ROOT,
    `storage/datasets/mtm/v${version}/`,
  );
  const latestS3Path = getDatasetLatestPath();
  if (!fse.existsSync(versionLocalPath)) {
    console.error(`Prepared data not found: ${versionLocalPath}`);
    console.error(
      `Run: yarn dataset:prepare-mtm --version ${version} --input <folder>`,
    );
    process.exit(1);
  }

  console.log(`Releasing MTM dataset v${version}\n`);

  // 1. Write latest.json and upload everything to staging
  const latestLocalPath = path.join(PROJECT_ROOT, getDatasetLatestPath());
  await fse.outputJSON(latestLocalPath, { version });

  console.log("Uploading to staging...");
  run(
    `aws s3 sync ${versionLocalPath} s3://${STAGING}/storage/datasets/mtm/v${version}/`,
  );
  run(`aws s3 cp ${latestLocalPath} s3://${STAGING}/${latestS3Path}`);
  console.log();

  const stagingConfirm = await prompt(
    "Verify on staging, then proceed to prod? (y/N) ",
  );
  if (stagingConfirm !== "y") {
    console.log("Aborted.");
    process.exit(0);
  }

  // 2. Sync v{N} and latest.json staging → prod
  console.log("\nSyncing staging → prod...");
  run(
    `aws s3 sync s3://${STAGING}/storage/datasets/mtm/v${version}/ s3://${PROD}/storage/datasets/mtm/v${version}/`,
  );
  run(`aws s3 cp s3://${STAGING}/${latestS3Path} s3://${PROD}/${latestS3Path}`);
  console.log();

  console.log(`✓ Released MTM v${version}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
