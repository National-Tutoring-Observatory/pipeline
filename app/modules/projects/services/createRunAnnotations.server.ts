import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { PromptVersionService } from "~/modules/prompts/promptVersion";
import type { AnnotationSchemaItem } from "~/modules/prompts/prompts.types";
import TaskSequencer from "~/modules/queues/helpers/taskSequencer";
import { getRunModelCode } from "~/modules/runs/helpers/runModel";
import type { Run } from "~/modules/runs/runs.types";
import { ProjectService } from "../project";
import type { Session } from "~/modules/sessions/sessions.types";

export default async function createRunAnnotations(run: Run) {

  const documents = getDocumentsAdapter();

  const project = await ProjectService.findById(run.project as string);
  if (!project) throw new Error(`Project not found: ${run.project}`);

  if (run.isRunning) { return; }

  const inputFolder = `storage/${run.project}/preAnalysis`;

  const outputFolder = `storage/${run.project}/runs/${run._id}`;

  const promptVersion = await PromptVersionService.findOne({ prompt: run.prompt, version: Number(run.promptVersion) });
  if (!promptVersion) throw new Error('Prompt version not found');
  const userPrompt = promptVersion.userPrompt;

  let annotationFields: Record<string, any> = {};

  for (const annotationSchemaItem of promptVersion.annotationSchema as AnnotationSchemaItem[]) {
    annotationFields[annotationSchemaItem.fieldKey] = annotationSchemaItem.value;
  }
  const annotationSchema = { "annotations": [annotationFields] };

  let currentSessionIndex = 0;

  const annotationType = run.annotationType === 'PER_UTTERANCE' ? 'ANNOTATE_PER_UTTERANCE' : 'ANNOTATE_PER_SESSION';

  const taskSequencer = new TaskSequencer('ANNOTATE_RUN');

  taskSequencer.addTask('START', {
    projectId: run.project,
    runId: run._id
  });

  for (const session of run.sessions) {
    currentSessionIndex++;
    if (session.status === 'DONE') {
      continue;
    }
    const sessionModel = await documents.getDocument<Session>({ collection: 'sessions', match: { _id: session.sessionId } });
    if (!sessionModel.data) {
      throw new Error(`Session not found: ${session.sessionId}`);
    }
    taskSequencer.addTask('PROCESS', {
      annotationType,
      projectId: run.project,
      runId: run._id,
      sessionId: session.sessionId,
      inputFile: `${inputFolder}/${sessionModel.data._id}/${sessionModel.data.name}`,
      outputFolder: `${outputFolder}/${sessionModel.data._id}`,
      prompt: { prompt: userPrompt, annotationSchema },
      model: getRunModelCode(run),
      team: project.team,
      currentSessionIndex
    });
  }

  taskSequencer.addTask('FINISH', {
    projectId: run.project,
    runId: run._id
  });

  taskSequencer.run();

}
