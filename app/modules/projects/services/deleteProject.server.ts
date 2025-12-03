import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { flowProducer } from "~/modules/queues/helpers/createQueue";

export default async function deleteProject({ projectId }: { projectId: string }) {
  const documents = getDocumentsAdapter();

  // Soft delete
  await documents.updateDocument({
    collection: "projects",
    match: { _id: projectId },
    update: { isDeleted: true },
  });

  try {
    const flow = {
      name: `DELETE_PROJECT:FINISH`,
      queueName: 'general',
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
      },
      data: {
        projectId,
        props: {
          event: 'DELETE_PROJECT',
          task: `DELETE_PROJECT:FINISH`
        }
      },
      children: [
        {
          name: `DELETE_PROJECT:FILES`,
          queueName: 'general',
          opts: { attempts: 3 },
          data: {
            projectId,
            props: {
              event: 'DELETE_PROJECT',
              task: `DELETE_PROJECT:FILES`
            }
          }
        },
        {
          name: `DELETE_PROJECT:SESSIONS`,
          queueName: 'general',
          opts: { attempts: 3 },
          data: {
            projectId,
            props: {
              event: 'DELETE_PROJECT',
              task: `DELETE_PROJECT:SESSIONS`
            }
          }
        },
        {
          name: `DELETE_PROJECT:RUNS`,
          queueName: 'general',
          opts: { attempts: 3 },
          data: {
            projectId,
            props: {
              event: 'DELETE_PROJECT',
              task: `DELETE_PROJECT:RUNS`
            }
          }
        }
      ]
    } as any;

    await flowProducer.add(flow);
  } catch (error) {
    console.error('[deleteProject] failed to enqueue deletion flow', error);
  }

  return { status: "PENDING_DELETION" };
}
