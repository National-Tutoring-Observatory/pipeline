import path from "path";
import createWorker from "./helpers/createWorker";

declare global {
  var root: string;
}

const root = path.resolve(`./`);
global.root = root;

createWorker({ name: "tasks" }, `${global.root}/runners/tasks.ts`);
createWorker({ name: "general" }, `${global.root}/runners/general.ts`);
