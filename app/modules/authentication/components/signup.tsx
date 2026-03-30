import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router";

export default function Signup({
  onSignupWithGithubClicked,
}: {
  onSignupWithGithubClicked: () => void;
}) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#f7f7f7]">
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto max-w-[120px]">
          <img src="/assets/nto-logo-icon.png" alt="NTO Logo" />
        </div>
        <CardHeader>
          <CardTitle className="mb-2">
            <h1 className="text-2xl">Create an account</h1>
          </CardTitle>
          <CardDescription>
            <p className="mb-3">
              Analyze tutoring transcripts with AI-powered annotation tools
              built for researchers.
            </p>
            <Badge variant="secondary" className="text-sm">
              $10 free credits to get started
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-3">
          <Button
            className="w-full cursor-pointer"
            onClick={onSignupWithGithubClicked}
          >
            <svg
              width="24px"
              height="24px"
              className="scale-120"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              color="currentColor"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.3333 19V17.137C14.3583 16.8275 14.3154 16.5163 14.2073 16.2242C14.0993 15.9321 13.9286 15.6657 13.7067 15.4428C15.8 15.2156 18 14.4431 18 10.8989C17.9998 9.99256 17.6418 9.12101 17 8.46461C17.3039 7.67171 17.2824 6.79528 16.94 6.01739C16.94 6.01739 16.1533 5.7902 14.3333 6.97811C12.8053 6.57488 11.1947 6.57488 9.66666 6.97811C7.84666 5.7902 7.05999 6.01739 7.05999 6.01739C6.71757 6.79528 6.69609 7.67171 6.99999 8.46461C6.35341 9.12588 5.99501 10.0053 5.99999 10.9183C5.99999 14.4366 8.19999 15.2091 10.2933 15.4622C10.074 15.6829 9.90483 15.9461 9.79686 16.2347C9.68889 16.5232 9.64453 16.8306 9.66666 17.137V19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.66667 17.7018C7.66667 18.3335 6 17.7018 5 15.7544"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign up with GitHub
          </Button>
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-foreground underline hover:no-underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
