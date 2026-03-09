#!/usr/bin/env node

import fs from "fs";

const REGISTRY_LINE = "@taskforcesh:registry=https://npm.taskforce.sh/\n";
const NPMRC_PATH = ".npmrc";

function getToken() {
  if (process.env.BULLMQ_PRO_TOKEN) {
    return process.env.BULLMQ_PRO_TOKEN;
  }

  if (fs.existsSync(".env")) {
    const match = fs
      .readFileSync(".env", "utf8")
      .match(/BULLMQ_PRO_TOKEN=['"]?([^'"\n]+)/);
    if (match) return match[1];
  }

  return null;
}

const token = getToken();
if (!token) process.exit(0);

let content = fs.existsSync(NPMRC_PATH)
  ? fs.readFileSync(NPMRC_PATH, "utf8")
  : "";

if (!content.includes("@taskforcesh:registry")) {
  content += REGISTRY_LINE;
  fs.writeFileSync(NPMRC_PATH, content);
}

if (!content.includes("_authToken")) {
  fs.appendFileSync(NPMRC_PATH, `//npm.taskforce.sh/:_authToken=${token}\n`);
}
