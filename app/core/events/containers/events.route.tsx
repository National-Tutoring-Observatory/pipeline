import type { LoaderFunctionArgs } from "react-router";
import { emitter } from "../emitter";

export async function loader({ request }: LoaderFunctionArgs) {

  const stream = new ReadableStream({
    start(controller) {
      console.log("SSE: Client connected");

      const handleUploadFiles = (message: any) => {
        controller.enqueue(`data: ${JSON.stringify(message)}\n\n`);
      };

      emitter.on("UPLOAD_FILES", handleUploadFiles);

      request.signal.addEventListener("abort", () => {
        console.log("SSE: Client disconnected");
        controller.close();
        emitter.off("UPLOAD_FILES", handleUploadFiles);
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