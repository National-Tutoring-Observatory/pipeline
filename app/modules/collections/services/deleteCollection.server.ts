import { CollectionService } from "~/modules/collections/collection";
import { flowProducer } from "~/modules/queues/helpers/createQueue";

export default async function deleteCollection({
  collectionId,
}: {
  collectionId: string;
}) {
  const collection = await CollectionService.findById(collectionId);

  if (!collection) {
    throw new Error("Collection not found");
  }

  // Delete the collection document
  await CollectionService.deleteById(collectionId);

  // Queue cleanup of exported files if any exist
  if (collection.hasExportedCSV || collection.hasExportedJSONL) {
    try {
      await flowProducer.add({
        name: "DELETE_COLLECTION:DATA",
        queueName: "general",
        opts: { attempts: 3 },
        data: {
          collectionId,
          projectId: collection.project,
          props: {
            event: "DELETE_COLLECTION",
            task: "DELETE_COLLECTION:DATA",
          },
        },
      });
    } catch (error) {
      console.error("[deleteCollection] failed to enqueue cleanup job", error);
    }
  }

  return { status: "DELETED" };
}
