import { useFetcher } from "react-router";
import Splash from "../components/splash";

export default function SplashContainer() {
  const fetcher = useFetcher();

  const onLoginWithGithubClicked = () => {
    fetcher.submit(
      { provider: "github" },
      {
        action: `/api/authentication`,
        method: "post",
        encType: "application/json",
      },
    );
  };

  return <Splash onLoginWithGithubClicked={onLoginWithGithubClicked} />;
}
