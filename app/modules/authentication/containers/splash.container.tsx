import { useFetcher, useRouteLoaderData } from "react-router";
import Splash from "../components/splash";

export default function SplashContainer() {
  const fetcher = useFetcher();
  const rootData = useRouteLoaderData("root") as
    | { openSignup?: boolean }
    | undefined;
  const openSignup = rootData?.openSignup ?? false;

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

  return (
    <Splash
      openSignup={openSignup}
      onLoginWithGithubClicked={onLoginWithGithubClicked}
    />
  );
}
