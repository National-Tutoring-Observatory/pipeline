import { type LoaderFunctionArgs } from "react-router";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import { emitter } from "../emitter";

export async function loader({ request }: LoaderFunctionArgs) {

  const user = await getSessionUser({ request });
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      console.log("SSE: Client connected");

      const handleUploadFiles = (message: any) => {
        controller.enqueue(`data: ${JSON.stringify({ ...message, event: 'UPLOAD_FILES' })}\n\n`);
      };

      const handleConvertFiles = (message: any) => {
        controller.enqueue(`data: ${JSON.stringify({ ...message, event: 'CONVERT_FILES' })}\n\n`);
      };

      const handleAnnotateRunSession = (message: any) => {
        controller.enqueue(`data: ${JSON.stringify({ ...message, event: 'ANNOTATE_RUN_SESSION' })}\n\n`);
      }

      const handleExportRun = (message: any) => {
        controller.enqueue(`data: ${JSON.stringify({ ...message, event: 'EXPORT_RUN' })}\n\n`);
      }

      const handleExportCollection = (message: any) => {
        controller.enqueue(`data: ${JSON.stringify({ ...message, event: 'EXPORT_COLLECTION' })}\n\n`);
      }

      emitter.on("UPLOAD_FILES", handleUploadFiles);

      emitter.on("CONVERT_FILES", handleConvertFiles);

      emitter.on('ANNOTATE_RUN_SESSION', handleAnnotateRunSession);

      emitter.on('EXPORT_RUN', handleExportRun);

      emitter.on('EXPORT_COLLECTION', handleExportCollection);

      request.signal.addEventListener("abort", () => {
        console.log("SSE: Client disconnected");
        controller.close();
        emitter.off("UPLOAD_FILES", handleUploadFiles);
        emitter.off("CONVERT_FILES", handleConvertFiles);
        emitter.off("ANNOTATE_RUN_SESSION", handleAnnotateRunSession);
        emitter.off("EXPORT_RUN", handleExportRun);
        emitter.off("EXPORT_COLLECTION", handleExportCollection);
      });

    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
