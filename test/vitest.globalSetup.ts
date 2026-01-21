import * as dotenv from "dotenv";
import fse from "fs-extra";
import type { TestProject } from "vitest/node";

export default async function setup(project: TestProject) {
  dotenv.config({ path: [".env.test", ".env.ci"] });
  process.env.DATA_PATH && fse.mkdirpSync(process.env.DATA_PATH);
}
