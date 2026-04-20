import find from "lodash/find";
import { redirect } from "react-router";
import consumeTeamInvite from "~/modules/teams/services/consumeTeamInvite.server";

export default async function handleTeamInviteSignup({
  teamInviteId,
  githubUser,
  emails,
}: {
  teamInviteId: string;
  githubUser: { id: number; login: string; name?: string };
  emails: Array<{ primary?: boolean; email: string }>;
}) {
  const primaryEmail =
    (
      find(emails, (e: { primary?: boolean; email: string }) => !!e.primary) ||
      emails[0] || { email: "" }
    ).email || "";

  const result = await consumeTeamInvite({
    inviteId: teamInviteId,
    githubUser,
    primaryEmail,
  });

  if (result.status === "expired")
    throw redirect("/signup?error=EXPIRED_INVITE");
  if (result.status === "full") throw redirect("/signup?error=INVITE_FULL");
  if (result.status === "revoked")
    throw redirect("/signup?error=INVITE_REVOKED");
  if (result.status === "not_found")
    throw redirect("/signup?error=EXPIRED_INVITE");

  return result.user!;
}
