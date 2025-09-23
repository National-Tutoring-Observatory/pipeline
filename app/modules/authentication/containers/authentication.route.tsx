import getDocumentsAdapter from "~/modules/documents/helpers/getDocumentsAdapter";
import type { Route } from "./+types/authentication.route";
import type { User } from "~/modules/users/users.types";

export async function loader({ request }: Route.LoaderArgs) {

  const documents = getDocumentsAdapter();
  const authentication = await documents.getDocument({ collection: 'users', match: {} }) as User;
  return { authentication };

}