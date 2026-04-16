import fse from "fs-extra";
import { json2csv } from "json-2-csv";
import requireAuth from "~/modules/authentication/helpers/requireAuth";
import type { AnnotationTemplateConfig } from "~/modules/humanAnnotations/humanAnnotations.types";
import ProjectAuthorization from "~/modules/projects/authorization";
import { ProjectService } from "~/modules/projects/project";
import { RunSetService } from "~/modules/runSets/runSet";
import { SessionService } from "~/modules/sessions/session";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import buildAnnotationTemplateColumns from "../helpers/buildAnnotationTemplateColumns";
import buildAnnotationTemplateRows from "../helpers/buildAnnotationTemplateRows";
import type { Route } from "./+types/downloadAnnotationTemplate.route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireAuth({ request });

  const runSet = await RunSetService.findById(params.runSetId);
  if (!runSet) throw new Error("Run set not found");

  const project = await ProjectService.findById(runSet.project);
  if (!project) throw new Error("Project not found");

  if (!ProjectAuthorization.Runs.canManage(user, project)) {
    throw new Error("Access denied");
  }

  const url = new URL(request.url);
  const configParam = url.searchParams.get("config");
  if (!configParam) throw new Error("Missing config parameter");

  let config: AnnotationTemplateConfig;
  try {
    config = JSON.parse(atob(configParam));
  } catch {
    throw new Error("Invalid config parameter");
  }

  if (!config.annotators?.length || !config.fields?.length) {
    throw new Error("Config must include annotators and fields");
  }

  const sessions = await SessionService.find({
    match: { _id: { $in: runSet.sessions } },
  });

  const storage = getStorageAdapter();
  const sessionTranscripts = [];

  for (const session of sessions) {
    const sourcePath = `storage/${runSet.project}/preAnalysis/${session._id}/${session.name}`;
    const downloadedPath = await storage.download({ sourcePath });
    const json = await fse.readJSON(downloadedPath);

    sessionTranscripts.push({
      sessionName: session.name,
      transcript: json.transcript || [],
    });
  }

  const columns = buildAnnotationTemplateColumns(config);
  const rows = buildAnnotationTemplateRows(sessionTranscripts, columns);

  const csv = json2csv(rows, {
    keys: columns,
    emptyFieldValue: "",
  });

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="annotation-template-${runSet.name}.csv"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
