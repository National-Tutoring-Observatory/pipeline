import dotenv from "dotenv";
import fse from "fs-extra";
import { encode } from "gpt-tokenizer";
import path from "path";
import isValidTranscript from "../../app/lib/validation/validateTranscript";
import getConversationFromJSON from "../../app/modules/sessions/helpers/getConversationFromJSON";
import { SessionService } from "../../app/modules/sessions/session";
import getStorageAdapter from "../../app/modules/storage/helpers/getStorageAdapter";
import emitFromJob from "../helpers/emitFromJob";
import mapFileToTranscript from "../helpers/mapFileToTranscript";
dotenv.config({ path: ".env" });

export default async function convertFileToSession(job: any) {
  const { projectId, sessionId, inputFile, outputFolder, attributesMapping } =
    job.data;

  try {
    await emitFromJob(
      job,
      {
        projectId,
        sessionId,
      },
      "STARTED",
    );

    const storage = getStorageAdapter();

    const downloadedPath = await storage.download({ sourcePath: inputFile });

    const outputFileName = path
      .basename(inputFile)
      .replace(".json", "")
      .replace(".vtt", "");

    if (
      attributesMapping.session_id &&
      attributesMapping.role &&
      attributesMapping.content &&
      attributesMapping.sequence_id
    ) {
      const jsonFile = await fse.readJSON(downloadedPath);

      const transcript = mapFileToTranscript(jsonFile, attributesMapping);

      const json = {
        session_id: jsonFile[0]?.[attributesMapping.session_id],
        transcript,
        leadRole: attributesMapping.leadRole,
        annotations: [],
      };

      const validation = isValidTranscript(json);
      if (!validation.valid) {
        const messages = validation
          .errors!.map((e) =>
            e.field ? `${e.field}: ${e.message}` : e.message,
          )
          .join("; ");
        throw new Error(`Invalid transcript: ${messages}`);
      }

      const inputTokens = encode(getConversationFromJSON(json)).length;
      await fse.outputJSON(`tmp/${outputFolder}/${outputFileName}.json`, json);

      const buffer = await fse.readFile(
        `tmp/${outputFolder}/${outputFileName}.json`,
      );

      await storage.upload({
        file: { buffer, size: buffer.length, type: "application/json" },
        uploadPath: `${outputFolder}/${outputFileName}.json`,
      });

      await SessionService.updateById(sessionId, {
        hasConverted: true,
        inputTokens,
      });
    } else {
      throw new Error("Files do not match the given format");
    }

    const sessionsCount = await SessionService.count({ project: projectId });
    const completedSessionsCount = await SessionService.count({
      project: projectId,
      hasConverted: true,
    });

    await emitFromJob(
      job,
      {
        projectId,
        sessionId,
        progress: Math.round((100 / sessionsCount) * completedSessionsCount),
      },
      "FINISHED",
    );
  } catch (error: any) {
    await SessionService.updateById(sessionId, {
      hasErrored: true,
      error: error.message,
    });

    await emitFromJob(
      job,
      {
        projectId,
        sessionId,
      },
      "ERRORED",
    );
    return {
      status: "ERRORED",
      error: error.message,
    };
  }
}
