#!/usr/bin/env node

import { ProcessManager } from '../app/processManager/processManager.js';

if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new ProcessManager();
  manager.start(async (pm) => {
    const redis = pm.spawn('yarn', ['local:redis'], { label: 'redis' });
    const exitPromise = new Promise((resolve) => {
      redis.once('exit', (code) => resolve(code));
    });
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve(undefined), 3000);
    });
    const code = await Promise.race([exitPromise, timeoutPromise]);
    if (code !== 0) {
      await pm.waitForRedisReady();
    }
    pm.spawn('yarn', ['app:dev'], { label: 'server' });
    pm.spawn('yarn', ['workers:dev'], { label: 'workers' });
    console.log('🎉 Dev processes started! Press Ctrl+C to stop.');
    process.stdin.resume();
  });
}
