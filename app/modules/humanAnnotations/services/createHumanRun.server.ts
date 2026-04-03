import type { AnnotationSchemaItem } from "~/modules/prompts/prompts.types";
import { RunService } from "~/modules/runs/run";
import type { Run, RunSession } from "~/modules/runs/runs.types";
import { SessionService } from "~/modules/sessions/session";

interface CreateHumanRunProps {
  project: string;
  name: string;
  annotationType: "PER_UTTERANCE" | "PER_SESSION";
  sessionIds: string[];
  annotationSchema: AnnotationSchemaItem[];
}

export default async function createHumanRun({
  project,
  name,
  annotationType,
  sessionIds,
  annotationSchema,
}: CreateHumanRunProps): Promise<Run> {
  const sessions: RunSession[] = [];
  for (const sessionId of sessionIds) {
    const session = await SessionService.findById(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    sessions.push({
      name: session.name,
      fileType: session.fileType || "",
      sessionId,
      status: "NOT_STARTED",
      startedAt: new Date(),
      finishedAt: new Date(),
    });
  }

  return RunService.createFromData({
    project,
    name,
    annotationType,
    isHuman: true,
    annotator: { name },
    sessions,
    snapshot: {
      prompt: {
        name: "Human Annotation",
        userPrompt: "",
        annotationSchema,
        annotationType,
        version: 1,
      },
    },
    isRunning: false,
    isComplete: false,
    shouldRunVerification: false,
  });
}
