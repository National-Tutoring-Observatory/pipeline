import { redirect } from "react-router";
import sessionStorage from "../../../../sessionStorage";
import getSessionUser from "./getSessionUser";

export default async function requireAuth({ request }: { request: Request }) {
  const user = await getSessionUser({ request });
  if (!user) {
    const { pathname, search } = new URL(request.url);
    const session = await sessionStorage.getSession(
      request.headers.get("cookie"),
    );
    session.flash("returnTo", pathname + search);
    throw redirect("/signup", {
      headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
    });
  }
  return user;
}
