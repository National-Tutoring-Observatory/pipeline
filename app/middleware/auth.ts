import { redirect } from "react-router";
import { userContext } from "~/context";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";

export const authMiddleware = async ({
  request,
  context,
}: any) => {
  const user = await getSessionUser({ request });

  if (!user) {
    throw redirect("/login");
  }

  context.set(userContext, user);
};
