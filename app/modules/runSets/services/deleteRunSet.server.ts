import { flowProducer } from "~/modules/queues/helpers/createQueue";
import { RunSetService } from "~/modules/runSets/runSet";

export default async function deleteRunSet({ runSetId }: { runSetId: string }) {
  const runSet = await RunSetService.findById(runSetId);

  if (!runSet) {
    throw new Error("Run set not found");
  }

  await RunSetService.deleteById(runSetId);

  try {
    await flowProducer.add({
      name: "DELETE_RUN_SET:DATA",
      queueName: "general",
      opts: { attempts: 3 },
      data: {
        runSetId,
        projectId: runSet.project,
        props: {
          event: "DELETE_RUN_SET",
          task: "DELETE_RUN_SET:DATA",
        },
      },
    });
  } catch (error) {
    console.error("[deleteRunSet] failed to enqueue cleanup job", error);
  }

  return { status: "DELETED" };
}
