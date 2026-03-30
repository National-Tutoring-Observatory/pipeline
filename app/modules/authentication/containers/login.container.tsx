import { useFetcher, useRouteLoaderData, useSearchParams } from "react-router";
import Login from "../components/login";

const ERROR_MESSAGES = {
  EXPIRED_INVITE: {
    title: "Your invite link has expired",
    description: "Please reach out to your NTO contact.",
  },
  UNREGISTERED: {
    title: "You have not been registered",
    description:
      "Please use the 'Sign up to be invited' button below to register your interest.",
  },
};

type ErrorType = keyof typeof ERROR_MESSAGES;

export default function LoginContainer() {
  const fetcher = useFetcher();
  const rootData = useRouteLoaderData("root") as
    | { openSignup?: boolean }
    | undefined;
  const openSignup = rootData?.openSignup ?? false;

  const [searchParams] = useSearchParams();

  const hasError = searchParams.has("error");
  const errorType = searchParams.get("error");

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
  let errorTitle: string | undefined;
  let errorDescription: string | undefined;

  if (hasError) {
    if (errorType && errorType in ERROR_MESSAGES) {
      const error = ERROR_MESSAGES[errorType as ErrorType];
      if (error) {
        errorTitle = error.title;
        errorDescription = error.description;
      }
    }
  }

  return (
    <Login
      errorTitle={errorTitle}
      errorDescription={errorDescription}
      hasError={hasError}
      openSignup={openSignup}
      onLoginWithGithubClicked={onLoginWithGithubClicked}
    />
  );
}
