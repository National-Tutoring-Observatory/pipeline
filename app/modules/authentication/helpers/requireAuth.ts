import { redirect } from "react-router";
import getSessionUser from "./getSessionUser";

export default async function requireAuth({ request }: { request: Request }) {
  const user = await getSessionUser({ request });
  if (!user) throw redirect("/");
  return user;
}
