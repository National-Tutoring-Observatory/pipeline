import { sessionStorage } from "../authentication.server";

export default async ({ request }: { request: Request }) => {
  let session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const authentication = session.get("user");
  return authentication.teams;
}