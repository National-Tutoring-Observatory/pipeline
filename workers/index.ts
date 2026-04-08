import { initializeDatabase } from "app/lib/database";
import "app/modules/storage/storage";
import createWorker from "./helpers/createWorker";
import cronProcessor from "./runners/cron";
import generalProcessor from "./runners/general";
import tasksProcessor from "./runners/tasks";

console.log("[workers] Initializing database connection...");
const dbStartDate = Date.now();
await initializeDatabase();
console.log(`[workers] Database ready (${Date.now() - dbStartDate}ms)`);

createWorker({ name: "tasks", isGrouped: true }, tasksProcessor);
createWorker({ name: "general" }, generalProcessor);
createWorker({ name: "cron" }, cronProcessor);
