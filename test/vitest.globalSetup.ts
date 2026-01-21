import * as dotenv from "dotenv";
import path from "path";
import type { TestProject } from "vitest/node";
import fse from "fs-extra";

export default async function setup(project: TestProject) {
  dotenv.config({ path: [".env.test", ".env.ci"] });
  process.env.DATA_PATH && fse.mkdirpSync(process.env.DATA_PATH);
}
