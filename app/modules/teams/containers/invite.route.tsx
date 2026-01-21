import { useFetcher } from "react-router";
import Invite from "../components/invite";
import type { Route } from "./+types/invite.route";

export default function InviteRoute({ params }: Route.LoaderArgs) {
  const fetcher = useFetcher();

  const onLoginWithGithubClicked = () => {
    fetcher.submit(
      { provider: "github", inviteId: params.id },
      {
        action: `/api/authentication`,
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
