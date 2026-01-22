import { FileService } from "~/modules/files/file";
import { ProjectService } from "~/modules/projects/project";
import { SessionService } from "~/modules/sessions/session";
import { handler as convertSessionDataToJSON } from "../../../functions/convertSessionDataToJSON/app";
import { emitter } from "../../events/emitter";

export default async function convertFilesToSessions({
  entityId,
}: {
  entityId: string;
}) {
  const projectFiles = await FileService.findByProject(entityId);

  const project = await ProjectService.findById(entityId);
  if (!project) throw new Error("Project not found");

  const inputDirectory = `storage/${entityId}/files`;

  const outputDirectory = `storage/${entityId}/preAnalysis`;

  for (const projectFile of projectFiles) {
    await SessionService.create({
      project: projectFile.project,
      file: projectFile._id,
      fileType: "application/json",
      name: `${projectFile.name.replace(/\.[^.]+$/, "")}.json`,
      hasConverted: false,
    });
  }

  emitter.emit("CONVERT_FILES", {
    projectId: entityId,
    progress: 0,
    status: "STARTED",
  });

  const projectSessions = await SessionService.find({
    match: { project: entityId },
  });

  let completedFiles = 0;

  for (const projectFile of projectSessions) {
    let hasErrored;
    let hasConverted;
    const file = await FileService.findById(projectFile.file as string);
    if (!file) throw new Error("File not found");
    try {
      await convertSessionDataToJSON({
        body: {
          inputFile: `${inputDirectory}/${projectFile.file}/${file.name}`,
          outputFolder: `${outputDirectory}/${projectFile._id}`,
          team: project.team,
        },
      });
      hasErrored = false;
      hasConverted = true;
    } catch (error) {
      hasErrored = true;
      hasConverted = false;
    }
    await SessionService.updateById(projectFile._id, {
      hasConverted,
      hasErrored,
    });
    completedFiles++;
    emitter.emit("CONVERT_FILES", {
      projectId: entityId,
      progress: Math.round((100 / projectSessions.length) * completedFiles),
      status: "RUNNING",
    });
  }

  await ProjectService.updateById(entityId, { isConvertingFiles: false });
  emitter.emit("CONVERT_FILES", {
    projectId: entityId,
    progress: 100,
    status: "DONE",
  });
}
