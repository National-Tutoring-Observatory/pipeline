import type { User } from "~/modules/users/users.types";
import { createCookieSessionStorage } from "react-router";
import { Authenticator } from "remix-auth";
import githubStrategy from "./helpers/githubStrategy";
import localStrategy from "./helpers/localStrategy";
import orcidStrategy from "./helpers/orcidStrategy";

const authenticator = new Authenticator<User>();

console.log(process.env.NODE_ENV);

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    // @ts-ignore
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

authenticator.use(
  localStrategy,
  "local"
);

authenticator.use(
  githubStrategy,
  "github"
);

authenticator.use(
  orcidStrategy,
  "orcid"
);

export { authenticator, sessionStorage };