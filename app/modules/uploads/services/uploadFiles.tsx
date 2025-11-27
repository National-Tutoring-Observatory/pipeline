import path from "path";
import type { Project } from "~/modules/projects/projects.types";
import type { File } from "~/modules/files/files.types";
import getDocumentsAdapter from "../../documents/helpers/getDocumentsAdapter";
import { emitter } from "../../events/emitter";
import { getProjectFileStoragePath } from "../helpers/projectFileStorage";
import uploadFile from "./uploadFile";

export default async function uploadFiles({ files, entityId }: { files: any, entityId: string }) {

  const documents = getDocumentsAdapter();

  let completedFiles = 0;

  for (const file of files) {
    if (file instanceof File) {
      const name = path.basename(file.name);
      const document = await documents.createDocument<File>({
        collection: 'files',
        update: {
          project: entityId,
          fileType: file.type,
          name,
          hasUploaded: false
        }
      });

      const uploadPath = getProjectFileStoragePath(entityId, document.data._id, file.name);
      await uploadFile({ file, uploadPath }).then(async () => {
        await documents.updateDocument({
          collection: 'files',
          match: {
            _id: document.data._id
          },
          update: {
            hasUploaded: true
          }
        });
        completedFiles++;
        emitter.emit("UPLOAD_FILES", { projectId: entityId, progress: Math.round((100 / files.length) * completedFiles), status: 'RUNNING' });
      });

    } else {
      console.warn('Expected a File, but got:', file);
    }
  }
  await documents.updateDocument<Project>({ collection: 'projects', match: { _id: entityId }, update: { isUploadingFiles: false } });
  emitter.emit("UPLOAD_FILES", { projectId: entityId, progress: 100, status: 'DONE' });
}
