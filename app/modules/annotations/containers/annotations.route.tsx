import fse from "fs-extra";
import { redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunService } from "~/modules/runs/run";
import { SessionService } from "~/modules/sessions/session";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import type { Route } from "./+types/annotations.route";

function updateAnnotationVote(
  annotation: Record<string, unknown>,
  payload: { markedAs?: string; votingReason?: string },
) {
  if (payload.markedAs) {
    const isSameVote = annotation.markedAs === payload.markedAs;
    annotation.markedAs = isSameVote ? undefined : payload.markedAs;
    annotation.votingReason = undefined;
  }

  if ("votingReason" in payload) {
    annotation.votingReason = payload.votingReason;
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const payload = await request.json();

  const user = await getSessionUser({ request });
  if (!user) {
    return redirect("/");
  }

  const run = await RunService.findById(params.runId);

  if (!run) {
    throw new Error("Run not found.");
  }

  const projectId = run.project as string;
  const project = await ProjectService.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (!ProjectAuthorization.Annotations.canManage(user, project)) {
    throw new Error(
      "You do not have permission to update annotations in this project.",
    );
  }

  const session = await SessionService.findOne({
    _id: params.sessionId,
    project: projectId,
  });

  if (!session) {
    throw new Error("Session not found or does not belong to this project.");
  }

  const sessionPath = `storage/${run.project}/runs/${params.runId}/${params.sessionId}/${session.name}`;

  const storage = getStorageAdapter();

  const downloadedPath = await storage.download({ sourcePath: sessionPath });
  const sessionFile = await fse.readJSON(downloadedPath);

  const annotationIndex = Number(params.annotationIndex);

  if (run.annotationType === "PER_UTTERANCE") {
    const currentUtterance = sessionFile.transcript.find(
      (utterance: { _id: string }) => utterance._id === params.utteranceId,
    );

    if (
      currentUtterance?.annotations &&
      currentUtterance.annotations[annotationIndex]
    ) {
      updateAnnotationVote(
        currentUtterance.annotations[annotationIndex],
        payload,
      );
    }
  } else {
    if (sessionFile.annotations && sessionFile.annotations[annotationIndex]) {
      updateAnnotationVote(sessionFile.annotations[annotationIndex], payload);
    }
  }

  await fse.outputJSON(`tmp/${sessionPath}`, sessionFile);

  const buffer = await fse.readFile(`tmp/${sessionPath}`);

  await storage.upload({
    file: { buffer, size: buffer.length, type: "application/json" },
    uploadPath: `${sessionPath}`,
  });
}
