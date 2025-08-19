import path from "path";
import createDocument from "../documents/createDocument";
import uploadFile from "./uploadFile";
import updateDocument from "../documents/updateDocument";
import { emitter } from "../events/emitter";
import type { Project } from "~/modules/projects/projects.types";

export default async function uploadFiles({ files, entityId }: { files: any, entityId: string }) {

  let completedFiles = 0;

  for (const file of files) {
    if (file instanceof File) {
      const name = path.basename(file.name);
      const document = await createDocument({
        collection: 'files',
        update: {
          project: parseInt(entityId),
          fileType: file.type,
          name,
          hasUploaded: false
        }
      }) as { data: any };

      await uploadFile({ file, uploadDirectory: `storage/${entityId}/files/${document.data._id}` }).then(async () => {
        await updateDocument({
          collection: 'files',
          match: {
            _id: parseInt(document.data._id)
          },
          update: {
            hasUploaded: true
          }
        });
        completedFiles++;
        emitter.emit("UPLOAD_FILES", { projectId: parseInt(entityId), progress: Math.round((100 / files.length) * completedFiles), status: 'RUNNING' });
      });

    } else {
      console.warn('Expected a File, but got:', file);
    }
  }
  await updateDocument({ collection: 'projects', match: { _id: parseInt(entityId) }, update: { isUploadingFiles: false } }) as { data: Project };
  emitter.emit("UPLOAD_FILES", { projectId: parseInt(entityId), progress: 100, status: 'DONE' });
}