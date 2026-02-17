import TaskSequencer from "~/modules/queues/helpers/taskSequencer";
import type { Evaluation } from "../evaluations.types";

export default async function createEvaluationReport(evaluation: Evaluation) {
  const taskSequencer = new TaskSequencer("CREATE_EVALUATION");

  taskSequencer.addTask("START", {
    evaluationId: evaluation._id,
  });

  taskSequencer.addTask("PROCESS", {
    evaluationId: evaluation._id,
  });

  taskSequencer.addTask("FINISH", {
    evaluationId: evaluation._id,
  });

  await taskSequencer.run();
}
