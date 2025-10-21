import type { User } from "~/modules/users/users.types";
import getSessionUser from "./getSessionUser";

export default async ({ request }: { request: Request }) => {
  const sessionUser = await getSessionUser({ request }) as User;

  if (sessionUser) {
    return sessionUser.teams;
  }
}