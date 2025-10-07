import { PassThrough } from "node:stream";

import type { AppLoadContext, EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";

import './modules/storage/storage';
import './modules/documents/documents';
import getDocumentsAdapter from "./modules/documents/helpers/getDocumentsAdapter";
import type { User } from "./modules/users/users.types";

const checkSuperAdminExists = async () => {
  const documents = getDocumentsAdapter();

  const user = await documents.getDocument({
    collection: 'users',
    match: { role: 'SUPER_ADMIN', githubId: parseInt(process.env.SUPER_ADMIN_GITHUB_ID as string) }
  }) as { data: User | undefined };

  if (!user.data) {
    await documents.createDocument({
      collection: 'users',
      update: {
        role: 'SUPER_ADMIN',
        username: 'local',
        githubId: process.env.SUPER_ADMIN_GITHUB_ID,
        hasGithubSSO: process.env.SUPER_ADMIN_GITHUB_ID ? true : false,
        isRegistered: true,
        registeredAt: new Date()
      }
    })
  }
}

setTimeout(() => {
  checkSuperAdminExists();
}, 0)

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext
  // If you have middleware enabled:
  // loadContext: unstable_RouterContextProvider
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    let readyOption: keyof RenderToPipeableStreamOptions =
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
            })
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
      }
    );

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    setTimeout(abort, streamTimeout + 1000);
  });
}
