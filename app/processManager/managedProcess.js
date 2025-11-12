import chalk from 'chalk';
import { spawn } from 'child_process';

export function getRandomColorFn() {
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
