import { createContext } from "react-router";
import type { User } from "~/modules/users/users.types";

export const userContext = createContext<User | null>(null);
