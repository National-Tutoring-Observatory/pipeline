import { UserService } from "~/modules/users/user";
// @ts-ignore
import sessionStorage from '../../../../sessionStorage.js';

export default async ({ request }: { request: Request }) => {
  let session = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const user = session.get("user");
  if (!user) return null;
  const sessionUser = await UserService.findById(user._id);
  return sessionUser;
}
