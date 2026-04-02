#!/usr/bin/env node

import { ProcessManager } from "../../app/processManager/processManager.js";

// Entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new ProcessManager();
  manager.start(async (pm) => {
    console.log("🏗️  Building Sandpiper...");
    await pm.runSequential("yarn", ["app:build"], { label: "build" });

    console.log("✅ Build completed successfully!");
    pm.spawn("yarn", ["local:redis"], { label: "redis" });

    await pm.waitForRedisReady();

    pm.spawn("yarn", ["app:prod"], { label: "server" });
    pm.spawn("yarn", ["workers:prod"], { label: "workers" });
    console.log("🎉 All processes started! Press Ctrl+C to stop.");

    process.stdin.resume();
  });
}
