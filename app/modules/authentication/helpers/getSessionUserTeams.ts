import { sessionStorage } from "../authentication.server";
import getSessionUser from "./getSessionUser";

export default async ({ request }: { request: Request }) => {
  const sessionUser = await getSessionUser({ request })
  return sessionUser.teams;
}