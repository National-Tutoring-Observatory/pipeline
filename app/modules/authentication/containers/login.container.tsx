import { useFetcher } from "react-router";
import Login from "../components/login";
import { useEffect } from "react";

export default function LoginContainer() {

  const fetcher = useFetcher();

  const onLoginWithOrcidClicked = () => {
    fetcher.submit({ provider: 'orcid' }, {
      action: `/api/authentication`,
      method: "post",
      encType: "application/json"
    })
  }

  const onLoginWithGithubClicked = () => {
    fetcher.submit({ provider: 'github' }, {
      action: `/api/authentication`,
      method: "post",
      encType: "application/json"
    });
  }

  return (
    <Login
      onLoginWithOrcidClicked={onLoginWithOrcidClicked}
      onLoginWithGithubClicked={onLoginWithGithubClicked}
    />
  );
}