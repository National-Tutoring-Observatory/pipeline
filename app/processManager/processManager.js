import { getRandomColorFn, ManagedProcess } from "./managedProcess.js";

export class ProcessManager {
  constructor() {
    this.processes = [];
    this.labelColors = {};
    this.shuttingDown = false;
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
      process.on(signal, () => {
        console.log(`🛑 Received ${signal}, shutting down gracefully...`);
        this.killAllProcesses();
      });
    });

    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught exception:", error);
      this.killAllProcesses();
    });

    process.on("unhandledRejection", (reason) => {
      console.error("❌ Unhandled rejection:", reason);
      this.killAllProcesses();
    });
  }

  spawn(command, args = [], options = {}) {
    const label = options.label || `${command}`;
    if (!this.labelColors[label]) {
      this.labelColors[label] = getRandomColorFn();
    }

    const colorFn = this.labelColors[label];
    const proc = new ManagedProcess(command, args, {
      label,
      colorFn,
      ...options,
    });
    const child = proc.start();

    this.processes.push(proc);

    child.on("exit", (code, signal) => {
      // Remove from process list
      this.processes = this.processes.filter((p) => p !== proc);

      // If a child dies unexpectedly, log and only shutdown if not already shutting down
      if (code !== 0 && !signal && !this.shuttingDown) {
        console.log(
          `💥 Process ${proc.label} died unexpectedly, shutting down all processes...`,
        );
        this.killAllProcesses();
      }
    });

    return child;
  }

  async runSequential(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`⏳ Waiting for: ${command} ${args.join(" ")}`);
      const child = this.spawn(command, args, options);

      child.on("exit", (code) => {
        console.log(
          `🏁 Command completed: ${command} ${args.join(" ")} (code: ${code})`,
        );
        if (code === 0) resolve();
        else
          reject(
            new Error(
              `Command failed with code ${code}: ${command} ${args.join(" ")}`,
            ),
          );
      });
    });
  }

  async killAllProcesses() {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    if (this.processes.length === 0) return process.exit(0);

    console.log(`🔪 Killing ${this.processes.length} processes...`);

    const termPromises = this.processes.map((proc) => proc.kill("SIGTERM"));

    // Wait for exit or timeout
    const timeout = new Promise((resolve) => setTimeout(resolve, 5000));
    await Promise.race([Promise.all(termPromises), timeout]);

    // Force kill any remaining
    this.processes.forEach((proc) => {
      console.log(`🔪 Force killing [${proc.label}]...`);
      proc.kill("SIGKILL");
    });

    console.log("✅ All processes terminated, exiting...");
    process.exit(0);
  }

  async waitForRedisReady({
    host = "127.0.0.1",
    port = 6379,
    timeout = 10000,
  } = {}) {
    const net = await import("net");
    return new Promise((resolve, reject) => {
      const start = Date.now();
      function tryConnect() {
        const socket = net.createConnection(port, host);
        socket.on("connect", () => {
          socket.end();
          resolve();
        });
        socket.on("error", () => {
          socket.destroy();
          if (Date.now() - start > timeout) {
            reject(new Error("Timed out waiting for Redis to start."));
          } else {
            setTimeout(tryConnect, 500);
          }
        });
      }
      tryConnect();
    });
  }

  async start(startupFn) {
    try {
      if (typeof startupFn !== "function") {
        throw new Error(
          "A startup function must be provided to ProcessManager.start(fn)",
        );
      }
      await startupFn(this);
    } catch (error) {
      console.error("❌ Error during startup:", error.message);
      this.killAllProcesses();
    }
  }
}
