import { PassThrough } from "node:stream";

import { SpanStatusCode, trace } from "@opentelemetry/api";
import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import type {
  AppLoadContext,
  EntryContext,
  unstable_ServerInstrumentation,
} from "react-router";
import { ServerRouter } from "react-router";

import createQueue from "./modules/queues/helpers/createQueue";
import "./modules/storage/storage";

const tracer = trace.getTracer("react-router");

const otelServerInstrumentation: unstable_ServerInstrumentation = {
  handler(requestHandler) {
    requestHandler.instrument({
      request: async (fn, { request }) => {
        return tracer.startActiveSpan(
          `RR ${request.method} ${new URL(request.url).pathname}`,
          async (span) => {
            const { status, error } = await fn();
            if (status === "error") {
              span.recordException(error);
              span.setStatus({ code: SpanStatusCode.ERROR });
            }
            span.end();
          },
        );
      },
    });
  },
  route(route) {
    const instrumentFn = (label: string) => {
      return async (
        fn: () => Promise<{ status: string; error: Error | undefined }>,
        info: { unstable_pattern: string },
      ) => {
        return tracer.startActiveSpan(
          `RR ${label} ${info.unstable_pattern}`,
          async (span) => {
            const { status, error } = await fn();
            if (status === "error") {
              span.recordException(error!);
              span.setStatus({ code: SpanStatusCode.ERROR });
            }
            span.end();
          },
        );
      };
    };

    route.instrument({
      loader: instrumentFn("loader"),
      action: instrumentFn("action"),
    });
  },
};

export const unstable_instrumentations = [otelServerInstrumentation];

const setupQueues = async () => {
  createQueue("tasks");
  createQueue("general");
  createQueue("cron");
};

setTimeout(() => {
  setupQueues();
}, 0);

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext,
  // If you have middleware enabled:
  // loadContext: unstable_RouterContextProvider
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    setTimeout(abort, streamTimeout + 1000);
  });
}
