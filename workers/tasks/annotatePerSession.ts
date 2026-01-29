import fse from "fs-extra";
import filter from "lodash/filter";
import map from "lodash/map.js";
import getConversationFromJSON from "workers/helpers/getConversationFromJSON";
import buildAnnotationSchema from "../../app/modules/llm/helpers/buildAnnotationSchema";
import LLM from "../../app/modules/llm/llm";
import { RunService } from "../../app/modules/runs/run";
import getStorageAdapter from "../../app/modules/storage/helpers/getStorageAdapter";
import emitFromJob from "../helpers/emitFromJob";
import updateRunSession from "../helpers/updateRunSession";
import annotationPerSessionPrompts from "../prompts/annotatePerSession.prompts.json";

export default async function annotatePerSession(job: any) {
  const {
    projectId,
    runId,
    sessionId,
    inputFile,
    outputFolder,
    prompt,
    model,
    team,
  } = job.data;

  try {
    await updateRunSession({
      runId,
      sessionId,
      update: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    await emitFromJob(
      job,
      {
        runId,
        sessionId,
      },
      "STARTED",
    );

    const storage = getStorageAdapter();

    const downloadedPath = await storage.download({ sourcePath: inputFile });
    const data = await fse.readFile(downloadedPath);

    const inputFileSplit = inputFile.split("/");
    const outputFileName = inputFileSplit[inputFileSplit.length - 1].replace(
      ".json",
      "",
    );

    const originalJSON = JSON.parse(data.toString());

    const conversation = getConversationFromJSON(originalJSON);

    const responseSchema = buildAnnotationSchema(prompt.annotationSchema);

    const llm = new LLM({ model, user: team, schema: responseSchema });

    llm.addSystemMessage(annotationPerSessionPrompts.system, {
      annotationSchema: JSON.stringify(prompt.annotationSchema),
      leadRole: originalJSON.leadRole || "TEACHER",
    });

    llm.addUserMessage(`${prompt.prompt}\n\nConversation: {{conversation}}`, {
      conversation,
    });

    const response = await llm.createChat();

    console.log(response);

    originalJSON.annotations = map(
      response.annotations || [],
      (annotation: any, index: number) => {
        annotation._id = `${index}`;
        return annotation;
      },
    );

    await fse.outputJSON(
      `tmp/${outputFolder}/${outputFileName}.json`,
      originalJSON,
    );

    const buffer = await fse.readFile(
      `tmp/${outputFolder}/${outputFileName}.json`,
    );

    await storage.upload({
      file: { buffer, size: buffer.length, type: "application/json" },
      uploadPath: `${outputFolder}/${outputFileName}.json`,
    });

    await fse.remove(`tmp/${outputFolder}/${outputFileName}.json`);

    await updateRunSession({
      runId,
      sessionId,
      update: {
        status: "DONE",
        finishedAt: new Date(),
      },
    });

    const run = await RunService.findById(runId);

    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }

    const sessionsCount = run.sessions.length;

    const completedSessionsCount = filter(run.sessions, {
      status: "DONE",
    }).length;

    await emitFromJob(
      job,
      {
        runId,
        sessionId,
        progress: Math.round((100 / sessionsCount) * completedSessionsCount),
        step: `${completedSessionsCount}/${sessionsCount}`,
      },
      "FINISHED",
    );

    return {
      status: "SUCCESS",
    };
  } catch (error: any) {
    await updateRunSession({
      runId,
      sessionId,
      update: {
        status: "ERRORED",
        finishedAt: new Date(),
      },
    });
    await emitFromJob(
      job,
      {
        runId,
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
