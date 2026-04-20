import { redirect, useFetcher } from "react-router";
import Invite from "../components/invite";
import getTeamInviteStatus from "../helpers/getTeamInviteStatus";
import { TeamInviteService } from "../teamInvites";
import type { Route } from "./+types/join.route";

const STATUS_TO_ERROR: Record<string, string> = {
  expired: "EXPIRED_INVITE",
  full: "INVITE_FULL",
  revoked: "INVITE_REVOKED",
};

export async function loader({ params }: Route.LoaderArgs) {
  const invite = await TeamInviteService.findOne({ slug: params.slug });
  if (!invite) throw redirect("/signup?error=EXPIRED_INVITE");

  const status = getTeamInviteStatus(invite);
  if (status !== "active") {
    const errorCode = STATUS_TO_ERROR[status] ?? "EXPIRED_INVITE";
    throw redirect(`/signup?error=${errorCode}`);
  }

  return { ok: true, slug: invite.slug };
}

export default function JoinRoute({ params }: Route.LoaderArgs) {
  const fetcher = useFetcher();

  const onLoginWithGithubClicked = () => {
    fetcher.submit(
      { provider: "github", inviteSlug: params.slug },
      {
        action: "/api/authentication",
        method: "post",
        encType: "application/json",
      },
    );
  };

  return (
    <Invite
      errorMessage={!fetcher.data?.ok ? fetcher.data?.error : null}
      onLoginWithGithubClicked={onLoginWithGithubClicked}
    />
  );
}
