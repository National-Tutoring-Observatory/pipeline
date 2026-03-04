import { data, redirect } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunSetService } from "~/modules/runSets/runSet";
import type { User } from "~/modules/users/users.types";
import analyzeHumanCsv from "../services/analyzeHumanCsv.server";
import type { Route } from "./+types/humanAnnotations.route";

export async function action({ request, params }: Route.ActionArgs) {
  const user = (await getSessionUser({ request })) as User;
  if (!user) {
    throw new Error("Authentication required");
  }

  const runSet = await RunSetService.findById(params.runSetId);
  if (!runSet) {
    return data(
      { errors: { general: "Run set not found" } },
      { status: 404 },
    );
  }

  const project = await ProjectService.findById(runSet.project);
  if (!project) {
    return data(
      { errors: { general: "Project not found" } },
      { status: 404 },
    );
  }

  if (!ProjectAuthorization.Runs.canManage(user, project)) {
    return data({ errors: { general: "Access denied" } }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const { intent, payload } = await request.json();

    if (intent === "ANALYZE_HUMAN_CSV") {
      const result = await analyzeHumanCsv({
        headers: payload.headers,
        sessionIds: payload.sessionIds,
        runSetId: params.runSetId,
      });
      return data({ success: true, intent, data: result });
    }

    return data({ errors: { general: "Invalid intent" } }, { status: 400 });
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const body = JSON.parse(String(formData.get("body")));

    if (body.intent === "UPLOAD_HUMAN_CSV") {
      // TODO: Phase D — upload CSV to storage and queue worker jobs
      return data({ success: true, intent: "UPLOAD_HUMAN_CSV" });
    }

    return data({ errors: { general: "Invalid intent" } }, { status: 400 });
  }

  return data({ errors: { general: "Invalid request" } }, { status: 400 });
}
