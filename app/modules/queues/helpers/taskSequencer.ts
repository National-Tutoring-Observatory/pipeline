import filter from "lodash/filter.js";
import find from "lodash/find.js";
import createTaskJob from "./createTaskJob";

type Action = "START" | "FINISH" | "PROCESS";
type Task = {
  action: Action;
  data: any;
};

export default class TaskSequencer {
  tasks: Task[] = [];
  name;

  constructor(name: string) {
    this.name = name;
  }

  addTask = (action: Action, data: any) => {
    if (action === "START") {
      const hasStartJob = !!find(this.tasks, { action: "START" });
      if (hasStartJob) {
        console.warn("START job has already been added");
        return;
      }
      this.tasks.push({ action, data });
      return;
    }

    if (action === "FINISH") {
      const hasStartJob = !!find(this.tasks, { action: "FINISH" });
      if (hasStartJob) {
        console.warn("FINISH job has already been added");
        return;
      }
      this.tasks.push({ action, data });
      return;
    }

    if (action !== "PROCESS") {
      console.warn(`${action} job is not a defined action`);
      return;
    }

    this.tasks.push({ action, data });
  };

  run = async () => {
    const startTask = find(this.tasks, { action: "START" });
    const finishTask = find(this.tasks, { action: "FINISH" });
    const processTasks = filter(this.tasks, { action: "PROCESS" });

    if (!startTask) {
      console.warn("No START task created");
      return;
    }

    if (!finishTask) {
      console.warn("No FINISH task created");
      return;
    }

    const childrenJobs = [];

    if (startTask) {
      childrenJobs.push({
        name: `${this.name}:START`,
        data: startTask.data,
      });
    }

    for (const processTask of processTasks) {
      childrenJobs.push({
        name: `${this.name}:PROCESS`,
        data: processTask.data,
      });
    }

    await createTaskJob({
      name: this.name,
      data: finishTask.data,
      children: childrenJobs,
    });
  };
}
