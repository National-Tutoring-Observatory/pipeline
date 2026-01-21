import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ExternalLink } from "lucide-react";

export default function Login({
  errorTitle,
  errorDescription,
  hasError,
  onLoginWithOrcidClicked,
  onLoginWithGithubClicked,
}: {
  errorTitle: string | undefined;
  errorDescription: string | undefined;
  hasError: boolean;
  onLoginWithOrcidClicked: () => void;
  onLoginWithGithubClicked: () => void;
}) {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center"
      style={{ backgroundColor: "#f7f7f7" }}
    >
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto" style={{ maxWidth: "120px" }}>
          <img src="/assets/nto-logo-icon.png" />
        </div>
        <CardHeader>
          <CardTitle className="mb-2">
            <h1 className="text-2xl">National Tutoring Observatory</h1>
          </CardTitle>
          <CardDescription>
            Welcome to the Beta National Tutoring Observatory Pipeline tool!
            This application is designed to help researchers and product teams
            analyze tutoring data efficiently.
            <br />
            <br />
            <b>
              In the beta phase, only users invited by the NTO will be able to
              log in and join a team.
            </b>
            {hasError && (
              <Alert variant="destructive" className="mt-2 text-left">
                <AlertCircle />
                <AlertTitle>{errorTitle}</AlertTitle>
                {errorDescription && (
                  <AlertDescription>{errorDescription}</AlertDescription>
                )}
              </Alert>
            )}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-row gap-2">
          {/* <Button variant="outline" className="w-full" onClick={onLoginWithOrcidClicked}>
            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="72px" height="72px" viewBox="0 0 72 72" version="1.1">
              <title>Orcid logo</title>
              <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="hero" transform="translate(-924.000000, -72.000000)" fillRule="nonzero">
                  <g id="Group-4">
                    <g id="vector_iD_icon" transform="translate(924.000000, 72.000000)">
                      <path d="M72,36 C72,55.884375 55.884375,72 36,72 C16.115625,72 0,55.884375 0,36 C0,16.115625 16.115625,0 36,0 C55.884375,0 72,16.115625 72,36 Z" id="Path" fill="#A6CE39" />
                      <g id="Group" transform="translate(18.868966, 12.910345)" fill="#FFFFFF">
                        <polygon id="Path" points="5.03734929 39.1250878 0.695429861 39.1250878 0.695429861 9.14431787 5.03734929 9.14431787 5.03734929 22.6930505 5.03734929 39.1250878" />
                        <path d="M11.409257,9.14431787 L23.1380784,9.14431787 C34.303014,9.14431787 39.2088191,17.0664074 39.2088191,24.1486995 C39.2088191,31.846843 33.1470485,39.1530811 23.1944669,39.1530811 L11.409257,39.1530811 L11.409257,9.14431787 Z M15.7511765,35.2620194 L22.6587756,35.2620194 C32.49858,35.2620194 34.7541226,27.8438084 34.7541226,24.1486995 C34.7541226,18.1301509 30.8915059,13.0353795 22.4332213,13.0353795 L15.7511765,13.0353795 L15.7511765,35.2620194 Z" id="Shape" />
                        <path d="M5.71401206,2.90182329 C5.71401206,4.441452 4.44526937,5.72914146 2.86638958,5.72914146 C1.28750978,5.72914146 0.0187670918,4.441452 0.0187670918,2.90182329 C0.0187670918,1.33420133 1.28750978,0.0745051096 2.86638958,0.0745051096 C4.44526937,0.0745051096 5.71401206,1.36219458 5.71401206,2.90182329 Z" id="Path" />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
            Login with ORCID
          </Button> */}
          {!hasError && (
            <Button
              variant="outline"
              className="w-1/2 cursor-pointer"
              onClick={onLoginWithGithubClicked}
            >
              <svg
                width="24px"
                height="24px"
                className="scale-120"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                color="#000000"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M14.3333 19V17.137C14.3583 16.8275 14.3154 16.5163 14.2073 16.2242C14.0993 15.9321 13.9286 15.6657 13.7067 15.4428C15.8 15.2156 18 14.4431 18 10.8989C17.9998 9.99256 17.6418 9.12101 17 8.46461C17.3039 7.67171 17.2824 6.79528 16.94 6.01739C16.94 6.01739 16.1533 5.7902 14.3333 6.97811C12.8053 6.57488 11.1947 6.57488 9.66666 6.97811C7.84666 5.7902 7.05999 6.01739 7.05999 6.01739C6.71757 6.79528 6.69609 7.67171 6.99999 8.46461C6.35341 9.12588 5.99501 10.0053 5.99999 10.9183C5.99999 14.4366 8.19999 15.2091 10.2933 15.4622C10.074 15.6829 9.90483 15.9461 9.79686 16.2347C9.68889 16.5232 9.64453 16.8306 9.66666 17.137V19"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M9.66667 17.7018C7.66667 18.3335 6 17.7018 5 15.7544"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
              Login with Github
            </Button>
          )}
          <Button variant="outline" className="w-1/2" asChild>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdCvn_LMyj7fV2ITrvp-0AEgmTzziWC1b7s14TaNLySLL7avw/viewform"
              target="_blank"
            >
              <ExternalLink />
              Sign up to be invited
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
