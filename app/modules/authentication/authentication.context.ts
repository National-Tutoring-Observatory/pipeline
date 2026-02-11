import { createContext } from "react";
import type { User } from "~/modules/users/users.types";

export const AuthenticationContext = createContext<User | null>(null);
