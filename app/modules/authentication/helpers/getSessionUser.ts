import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { User } from "~/modules/users/users.types";
// @ts-ignore
import sessionStorage from '../../../../sessionStorage.js';

export default async ({ request }: { request: Request }) => {
  let session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user = session.get("user");
  if (!user) return null;
  const documents = getDocumentsAdapter();
  const sessionUser = await documents.getDocument<User>({ collection: 'users', match: { _id: user._id } });
  return sessionUser.data;
}
