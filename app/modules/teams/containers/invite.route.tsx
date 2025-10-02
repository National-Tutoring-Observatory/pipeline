import { useFetcher } from "react-router";
import Invite from "../components/invite";

export default function InviteRoute() {

  const fetcher = useFetcher();

  const onLoginWithGithubClicked = () => {
    fetcher.submit({ provider: 'github' }, {
      action: `/api/authentication`,
      method: "post",
      encType: "application/json"
    });
  }

  return (
    <Invite
      onLoginWithGithubClicked={onLoginWithGithubClicked}
    />
  );
}
