import path from "path";
import createWorker from "./helpers/createWorker";

declare global {
  var root: string;
}

const root = path.resolve(`./`);
global.root = root;

createWorker(
  { name: "tasks", isGrouped: true },
  `${global.root}/runners/tasks.ts`,
);
createWorker({ name: "general" }, `${global.root}/runners/general.ts`);
createWorker({ name: "cron" }, `${global.root}/runners/cron.ts`);
