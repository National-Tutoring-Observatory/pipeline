import type { User } from "~/modules/users/users.types";

export function userIsSuperAdmin(user: User | null): boolean {
  if (!user) {
    return false;
  }
  return user.role === "SUPER_ADMIN";
}
