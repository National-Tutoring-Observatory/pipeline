import { type LoaderFunctionArgs } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import getSessionUserTeams from "~/modules/authentication/helpers/getSessionUserTeams";
import { userIsSuperAdmin } from "~/modules/authorization/helpers/superAdmin";
import { ProjectService } from "~/modules/projects/project";
import { emitter } from "../emitter";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getSessionUser({ request });
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Project IDs are snapshotted at connection time. If team membership or project
  // assignments change while the SSE stream is open, the filter will be stale
  // until the client reconnects.
  let allowedProjectIds: Set<string> | null = null;

  if (!userIsSuperAdmin(user)) {
    const teams = (await getSessionUserTeams({ request })) ?? [];
    const teamIds = teams.map((t: any) => t.team);
    const projects = await ProjectService.find({
      match: { team: { $in: teamIds } },
    });
    allowedProjectIds = new Set(projects.map((p) => p._id));
  }

  const isAllowed = (projectId: string) => {
    if (allowedProjectIds === null) return true;
    return allowedProjectIds.has(projectId);
  };

  const stream = new ReadableStream({
    start(controller) {
      console.log("SSE: Client connected");

      const handleUploadFiles = (message: any) => {
        if (!isAllowed(message.projectId)) return;
        controller.enqueue(
          `data: ${JSON.stringify({ ...message, event: "UPLOAD_FILES" })}\n\n`,
        );
      };

      const handleConvertFiles = (message: any) => {
        if (!isAllowed(message.projectId)) return;
        controller.enqueue(
          `data: ${JSON.stringify({ ...message, event: "CONVERT_FILES" })}\n\n`,
        );
      };

      const handleAnnotateRunSession = (message: any) => {
        if (!isAllowed(message.projectId)) return;
        controller.enqueue(
          `data: ${JSON.stringify({ ...message, event: "ANNOTATE_RUN_SESSION" })}\n\n`,
        );
      };

      emitter.on("UPLOAD_FILES", handleUploadFiles);
      emitter.on("CONVERT_FILES", handleConvertFiles);
      emitter.on("ANNOTATE_RUN_SESSION", handleAnnotateRunSession);

      request.signal.addEventListener("abort", () => {
        console.log("SSE: Client disconnected");
        controller.close();
        emitter.off("UPLOAD_FILES", handleUploadFiles);
        emitter.off("CONVERT_FILES", handleConvertFiles);
        emitter.off("ANNOTATE_RUN_SESSION", handleAnnotateRunSession);
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
