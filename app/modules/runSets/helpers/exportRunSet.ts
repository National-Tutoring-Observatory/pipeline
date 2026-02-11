import TaskSequencer from "~/modules/queues/helpers/taskSequencer";

export default async function exportRunSet({
  runSetId,
  exportType,
}: {
  runSetId: string;
  exportType: string;
}) {
  const taskSequencer = new TaskSequencer("EXPORT_RUN_SET");

  taskSequencer.addTask("START", { runSetId });
  taskSequencer.addTask("PROCESS", { runSetId, exportType });
  taskSequencer.addTask("FINISH", { runSetId, exportType });

  await taskSequencer.run();
}
