import { Authenticator } from "remix-auth";
import type { User } from "~/modules/users/users.types";
import githubStrategy from "./helpers/githubStrategy";
import orcidStrategy from "./helpers/orcidStrategy";

const authenticator = new Authenticator<User>();

authenticator.use(
  githubStrategy,
  "github"
);

authenticator.use(
  orcidStrategy,
  "orcid"
);

export { authenticator };
