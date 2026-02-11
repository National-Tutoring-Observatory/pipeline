import TaskSequencer from "~/modules/queues/helpers/taskSequencer";

export default async function exportRun({
  runId,
  exportType,
}: {
  runId: string;
  exportType: string;
}) {
  const taskSequencer = new TaskSequencer("EXPORT_RUN");

  taskSequencer.addTask("START", { runId });
  taskSequencer.addTask("PROCESS", { runId, exportType });
  taskSequencer.addTask("FINISH", { runId, exportType });

  await taskSequencer.run();
}
