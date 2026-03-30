import fse from "fs-extra";
import filter from "lodash/filter";
import find from "lodash/find.js";
import buildAnnotationSchema from "../../app/modules/llm/helpers/buildAnnotationSchema";
import classifyLLMError from "../../app/modules/llm/helpers/classifyLLMError";
import LLM from "../../app/modules/llm/llm";
import { RunService } from "../../app/modules/runs/run";
import getConversationFromJSON from "../../app/modules/sessions/helpers/getConversationFromJSON";
import getStorageAdapter from "../../app/modules/storage/helpers/getStorageAdapter";
import buildAdjudicationPrompt from "../helpers/buildAdjudicationPrompt";
import emitFromJob from "../helpers/emitFromJob";
import updateRunSession from "../helpers/updateRunSession";
import adjudicatePerUtterancePrompts from "../prompts/adjudicatePerUtterance.prompts.json";

export default async function adjudicatePerUtterance(job: any) {
  const { runId, sessionId, inputFile, outputFolder, prompt, model, team } =
    job.data;

  const currentRun = await RunService.findById(runId);

  try {
    await updateRunSession({
      runId,
      sessionId,
      update: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    await emitFromJob(job, { runId, sessionId }, "STARTED");

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

    console.log("[adjudicatePerUtterance] Session:", sessionId);

    const {
      hasDisagreements,
      adjudicationContext,
      firstSourceRunSessionFile,
      agreedAnnotations,
    } = await buildAdjudicationPrompt({
      sessionId,
      sourceRunIds: currentRun!.adjudication!.sourceRuns,
      projectId: job.data.projectId,
      annotationType: "PER_UTTERANCE",
      originalJSON,
    });

    if (!hasDisagreements) {
      console.log(
        "[adjudicatePerUtterance] No disagreements — copying from first source run",
      );

      for (const utterance of originalJSON.transcript) {
        const srcUtterance = find(firstSourceRunSessionFile?.transcript, {
          _id: utterance._id,
        });
        if (srcUtterance?.annotations) {
          utterance.annotations = [
            ...utterance.annotations,
            ...srcUtterance.annotations,
          ];
        }
      }
    } else {
      console.log("[adjudicatePerUtterance] Calling LLM for adjudication");

      const responseSchema = buildAnnotationSchema(
        prompt.annotationSchema,
        prompt.schemaItems,
      );

      const llm = new LLM({
        model,
        user: team,
        schema: responseSchema,
        source: "adjudication:per-utterance",
        sourceId: sessionId,
        timeout: 360_000,
      });

      llm.addSystemMessage(adjudicatePerUtterancePrompts.system, {
        annotationSchema: JSON.stringify(prompt.annotationSchema),
        leadRole: originalJSON.leadRole || "TEACHER",
      });

      llm.addUserMessage(
        `${prompt.prompt}\n\n{{adjudicationContext}}\n\nConversation: {{conversation}}`,
        { adjudicationContext, conversation },
      );

      const response = await llm.createChat();
      const adjudicatedAnnotations = response.annotations || [];

      console.log(
        "[adjudicatePerUtterance] LLM returned",
        adjudicatedAnnotations.length,
        "adjudicated annotations",
      );

      // Merge agreed annotations
      for (const utterance of originalJSON.transcript) {
        const agreedAnnotation = agreedAnnotations.get(utterance._id);
        if (agreedAnnotation) {
          utterance.annotations = [...utterance.annotations, agreedAnnotation];
        }
      }

      // Merge adjudicated annotations
      for (const annotation of adjudicatedAnnotations) {
        const currentUtterance = find(originalJSON.transcript, {
          _id: annotation._id,
        });
        if (currentUtterance) {
          currentUtterance.annotations = [
            ...currentUtterance.annotations,
            annotation,
          ];
        }
      }
    }

    // Write output — same as standard flow
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

    return { status: "SUCCESS" };
  } catch (error: any) {
    const errorMessage = classifyLLMError(error);

    await updateRunSession({
      runId,
      sessionId,
      update: {
        error: errorMessage,
        status: "ERRORED",
        finishedAt: new Date(),
      },
    });

    await emitFromJob(job, { runId, sessionId }, "ERRORED");

    return { status: "ERRORED", error: errorMessage };
  }
}
