import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
// @ts-ignore
import sessionStorage from '../../../../sessionStorage.js';
import { authenticator } from "../authentication.server";
import getSessionUser from "../helpers/getSessionUser";
import type { Route } from "./+types/authentication.route";

export async function loader({ request }: Route.LoaderArgs) {
  let user = await getSessionUser({ request });

  if (!user) {
    if (!process.env.DOCUMENTS_ADAPTER || process.env.DOCUMENTS_ADAPTER === 'LOCAL') {
      user = await authenticator.authenticate("local", request);

      let session = await sessionStorage.getSession(
        request.headers.get("cookie")
      );

      session.set("user", user);

      const headers = new Headers({
        "Set-Cookie": await sessionStorage.commitSession(session),
      });

      return Response.json({ authentication: { data: user }, isAppRunningLocally: process.env.DOCUMENTS_ADAPTER === 'LOCAL' }, { headers });
    }
    return {
      authentication: {}
    }
  }

  return { authentication: { data: user }, isAppRunningLocally: process.env.DOCUMENTS_ADAPTER === 'LOCAL' };

}

export async function action({ request }: Route.ActionArgs) {
  const clonedRequest = request.clone();

  const data = await clonedRequest.json();

  if (clonedRequest.method === 'DELETE') {
    let session = await sessionStorage.getSession(clonedRequest.headers.get("cookie"));

    return Response.json({}, { headers: { "Set-Cookie": await sessionStorage.destroySession(session) } });
  }

  const referrerSplit = clonedRequest.headers.get('Referer')?.split('/') || [];
  let session = await sessionStorage.getSession(clonedRequest.headers.get("cookie"));

  if (referrerSplit[referrerSplit.length - 1] === data.inviteId && referrerSplit[referrerSplit.length - 2] === 'invite') {
    const documents = getDocumentsAdapter();
    const invitedUser = await documents.getDocument<User>({ collection: 'users', match: { inviteId: data.inviteId, isRegistered: false } });
    if (!invitedUser.data) {
      return Response.json({ ok: false, error: "Invalid invite" }, { status: 404 })
    }
    session.flash("inviteId", data.inviteId);
  }
  try {
    await authenticator.authenticate(data.provider, request);
  } catch (error) {
    if (error instanceof Response) {
      error.headers.append("Set-Cookie", await sessionStorage.commitSession(session));
      throw error;
    }
    throw error;
  }

}
