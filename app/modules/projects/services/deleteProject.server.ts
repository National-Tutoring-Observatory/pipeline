import { ProjectService } from "~/modules/projects/project";
import { flowProducer } from "~/modules/queues/helpers/createQueue";

export default async function deleteProject({
  projectId,
}: {
  projectId: string;
}) {
  // Soft delete
  await ProjectService.updateById(projectId, { isDeleted: true });

  try {
    const flow = {
      name: `DELETE_PROJECT:FINISH`,
      queueName: "general",
      opts: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
      },
      data: {
        projectId,
        props: {
          event: "DELETE_PROJECT",
          task: `DELETE_PROJECT:FINISH`,
        },
      },
      children: [
        {
          name: `DELETE_PROJECT:DATA`,
          queueName: "general",
          opts: { attempts: 3 },
          data: {
            projectId,
            props: {
              event: "DELETE_PROJECT",
              task: `DELETE_PROJECT:DATA`,
            },
          },
        },
      ],
    } as any;

    await flowProducer.add(flow);
  } catch (error) {
    console.error("[deleteProject] failed to enqueue deletion flow", error);
  }

  return { status: "PENDING_DELETION" };
}
