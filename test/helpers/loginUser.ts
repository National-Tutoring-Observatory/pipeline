import sessionStorage from "../../sessionStorage";

export default async function loginUser(
  userId: string,
  extras?: Record<string, any>,
): Promise<string> {
  const session = await sessionStorage.getSession();
  session.set("user", { _id: userId });

  for (const [key, value] of Object.entries(extras ?? {})) {
    session.set(key, value);
  }

  const setCookie = await sessionStorage.commitSession(session);
  const cookieHeader = setCookie.split(";")[0];
  return cookieHeader;
}
