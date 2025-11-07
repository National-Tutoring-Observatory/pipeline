import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { AnnotationSchemaItem, PromptVersion } from "~/modules/prompts/prompts.types";
import createTaskJob from "~/modules/queues/helpers/createTaskJob";
import type { Run } from "~/modules/runs/runs.types";
import type { Session } from "~/modules/sessions/sessions.types";
import type { Project } from "../projects.types";

export default async function createRunAnnotations({ runId }: { runId: string }, { request }: { request: Request }) {

  const documents = getDocumentsAdapter();

  const run = await documents.getDocument({ collection: 'runs', match: { _id: runId } }) as { data: Run };
  const project = await documents.getDocument({ collection: 'projects', match: { _id: run.data.project } }) as { data: Project };

  if (run.data.isRunning) { return {} }

  const inputDirectory = `storage/${run.data.project}/preAnalysis`;

  const outputDirectory = `storage/${run.data.project}/runs/${run.data._id}`;

  const promptVersion = await documents.getDocument({ collection: 'promptVersions', match: { prompt: run.data.prompt, version: Number(run.data.promptVersion) } }) as { data: PromptVersion };
  const userPrompt = promptVersion.data.userPrompt;

  let annotationFields: Record<string, any> = {};

  for (const annotationSchemaItem of promptVersion.data.annotationSchema as AnnotationSchemaItem[]) {
    annotationFields[annotationSchemaItem.fieldKey] = annotationSchemaItem.value;
  }
  const annotationSchema = { "annotations": [annotationFields] };

  let currentSessionIndex = 0;

  const childrenJobs = [];

  const annotationJobName = run.data.annotationType === 'PER_UTTERANCE' ? 'ANNOTATE_PER_UTTERANCE' : 'ANNOTATE_PER_SESSION';

  childrenJobs.push({
    name: 'START_ANNOTATE_RUN',
    data: {
      projectId: run.data.project,
      runId: run.data._id
    }
  })

  for (const session of run.data.sessions) {
    const sessionModel = await documents.getDocument({ collection: 'sessions', match: { _id: session.sessionId } }) as { data: Session };
    currentSessionIndex++;
    childrenJobs.push({
      name: annotationJobName,
      data: {
        projectId: run.data.project,
        runId: run.data._id,
        sessionId: session.sessionId,
        inputFile: `${inputDirectory}/${sessionModel.data._id}/${sessionModel.data.name}`,
        outputFolder: `${outputDirectory}/${sessionModel.data._id}`,
        prompt: { prompt: userPrompt, annotationSchema },
        model: run.data.model,
        team: project.data.team,
        currentSessionIndex
      }
    })
  }

  childrenJobs.push({
    name: 'FINISH_ANNOTATE_RUN',
    data: {
      projectId: run.data.project,
      runId: run.data._id
    }
  })

  createTaskJob({
    name: 'ANNOTATE_RUN',
    data: {
      projectId: run.data.project,
      runId: run.data._id,
    },
    children: childrenJobs
  });

}
