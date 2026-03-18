#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";

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

const isInstalled = fs.existsSync(
  "node_modules/@taskforcesh/bullmq-pro/package.json",
);
if (isInstalled) process.exit(0);

console.log("[postinstall] Installing @taskforcesh/bullmq-pro...");

try {
  execSync(
    "npm install --no-save --no-package-lock --legacy-peer-deps @taskforcesh/bullmq-pro@^7.42.1",
    { stdio: "inherit" },
  );
} catch {
  console.warn(
    "[postinstall] Failed to install @taskforcesh/bullmq-pro, falling back to BullMQ",
  );
}
