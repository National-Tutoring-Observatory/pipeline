import type { LoaderFunctionArgs } from "react-router";
import { emitter } from "../emitter";

export async function loader({ request }: LoaderFunctionArgs) {

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

      emitter.on("UPLOAD_FILES", handleUploadFiles);

      emitter.on("CONVERT_FILES", handleConvertFiles);

      emitter.on('ANNOTATE_RUN_SESSION', handleAnnotateRunSession);

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
      "Connection": "keep-alive",
    },
  });
}