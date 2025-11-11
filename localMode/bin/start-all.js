#!/usr/bin/env node

import chalk from 'chalk';
import { spawn } from 'child_process';

function getRandomColorFn() {
  const chalkColorFns = [
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'gray',
  ];
  const fnName = chalkColorFns[Math.floor(Math.random() * chalkColorFns.length)];
  return chalk[fnName] || chalk.white;
}

export class ManagedProcess {
  constructor(command, args = [], { label, colorFn, ...options } = {}) {
    this.command = command;
    this.args = args;
    this.label = label || command;
    this.colorFn = colorFn || ((x) => x);
    this.options = {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      detached: false,
      ...options,
    };
    this.child = null;
  }

  start() {
    const prefix = this.colorFn(`[${this.label}]`);
    console.log(`🚀 Starting: ${this.command} ${this.args.join(' ')}`);

    const child = spawn(this.command, this.args, this.options);
    this.child = child;

    // Prefix stdout
    child.stdout?.on('data', (data) => {
      data
        .toString()
        .split('\n')
        .forEach((line) => {
          if (line.trim()) console.log(`${prefix} ${line}`);
        });
    });

    // Prefix stderr
    child.stderr?.on('data', (data) => {
      data
        .toString()
        .split('\n')
        .forEach((line) => {
          if (line.trim()) console.error(`${prefix} ${line}`);
        });
    });

    child.on('spawn', () => {
      console.log(`✅ Process spawned successfully: ${this.label} (PID: ${child.pid})`);
    });

    child.on('error', (error) => {
      console.error(`❌ Process error (${this.label}):`, error.message);
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        console.log(this.colorFn(`⚡ Process ${this.label} killed by signal ${signal}`));
      } else {
        console.log(this.colorFn(`📋 Process ${this.label} exited with code ${code}`));
      }
      this.cleanup();
    });

    return child;
  }

  kill(signal = 'SIGTERM') {
    if (!this.child || this.child.killed) return Promise.resolve();
    return new Promise(resolve => {
      this.child.once('exit', () => {
        this.cleanup();
        resolve();
      });
      this.child.kill(signal);
    });
  }

  cleanup() {
    this.child?.stdout?.removeAllListeners();
    this.child?.stderr?.removeAllListeners();
  }
}

export class ProcessManager {
  constructor() {
    this.processes = [];
    this.labelColors = {};
    this.shuttingDown = false;
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
      process.on(signal, () => {
        console.log(`🛑 Received ${signal}, shutting down gracefully...`);
        this.killAllProcesses();
      });
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught exception:', error);
      this.killAllProcesses();
    });

    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled rejection:', reason);
      this.killAllProcesses();
    });
  }

  spawn(command, args = [], options = {}) {
    const label = options.label || `${command}`;
    if (!this.labelColors[label]) {
      this.labelColors[label] = getRandomColorFn();
    }

    const colorFn = this.labelColors[label];
    const proc = new ManagedProcess(command, args, { label, colorFn, ...options });
    const child = proc.start();

    this.processes.push(proc);

    child.on('exit', (code, signal) => {
      // Remove from process list
      this.processes = this.processes.filter((p) => p !== proc);

      // If a child dies unexpectedly, log and only shutdown if not already shutting down
      if (code !== 0 && !signal && !this.shuttingDown) {
        console.log(`💥 Process ${proc.label} died unexpectedly, shutting down all processes...`);
        this.killAllProcesses();
      }
    });

    return child;
  }

  async runSequential(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`⏳ Waiting for: ${command} ${args.join(' ')}`);
      const child = this.spawn(command, args, options);

      child.on('exit', (code) => {
        console.log(
          `🏁 Command completed: ${command} ${args.join(' ')} (code: ${code})`
        );
        if (code === 0) resolve();
        else reject(new Error(`Command failed with code ${code}: ${command} ${args.join(' ')}`));
      });
    });
  }

  async killAllProcesses() {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    if (this.processes.length === 0) return process.exit(0);

    console.log(`🔪 Killing ${this.processes.length} processes...`);

    const termPromises = this.processes.map(proc => proc.kill('SIGTERM'));

    // Wait for exit or timeout
    const timeout = new Promise(resolve => setTimeout(resolve, 5000));
    await Promise.race([Promise.all(termPromises), timeout]);

    // Force kill any remaining
    this.processes.forEach(proc => {
      console.log(`🔪 Force killing [${proc.label}]...`);
      proc.kill('SIGKILL');
    });

    console.log('✅ All processes terminated, exiting...');
    process.exit(0);
  }

  async waitForRedisReady({ host = '127.0.0.1', port = 6379, timeout = 10000 } = {}) {
    const net = await import('net');
    return new Promise((resolve, reject) => {
      const start = Date.now();
      function tryConnect() {
        const socket = net.createConnection(port, host);
        socket.on('connect', () => {
          socket.end();
          resolve();
        });
        socket.on('error', () => {
          socket.destroy();
          if (Date.now() - start > timeout) {
            reject(new Error('Timed out waiting for Redis to start.'));
          } else {
            setTimeout(tryConnect, 500);
          }
        });
      }
      tryConnect();
    });
  }

  async start() {
    try {
      console.log('🏗️  Building NTO Pipeline...');
      await this.runSequential('yarn', ['app:build'], { label: 'build' });

      console.log('✅ Build completed successfully!');
      this.spawn('yarn', ['local:redis'], { label: 'redis' });

      await this.waitForRedisReady();

      this.spawn('yarn', ['app:prod'], { label: 'server' });
      this.spawn('yarn', ['workers:prod'], { label: 'workers' });
      console.log('🎉 All processes started! Press Ctrl+C to stop.');

      process.stdin.resume();
    } catch (error) {
      console.error('❌ Error during startup:', error.message);
      this.killAllProcesses();
    }
  }
}

// Entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new ProcessManager();
  manager.start();
}
