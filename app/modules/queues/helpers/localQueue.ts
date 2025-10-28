import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";

export default class LocalQueue {

  name;

  constructor(name: string) {
    this.name = name;
  }

  add = async (task: string, job: any, options: any) => {

    const documents = getDocumentsAdapter();

    const taskObject = await documents.createDocument({
      collection: 'queues',
      update: {
        queue: this.name,
        name: task,
        data: job,
        opts: options,
      }
    }) as { data: any };

    return { ...taskObject.data };

  }
}