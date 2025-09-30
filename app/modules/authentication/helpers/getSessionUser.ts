import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import { sessionStorage } from "../authentication.server";
import type { User } from "~/modules/users/users.types";

export default async ({ request }: { request: Request }) => {
  let session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user = session.get("user");
  const documents = getDocumentsAdapter();
  const sessionUser = await documents.getDocument({ collection: 'users', match: { _id: user._id } }) as { data: User };
  return sessionUser.data;
}