import type { User } from "~/modules/users/users.types";

export default function getAddUserToTeamDialogItemAttributes(user: User) {
  return {
    id: user._id,
    title: user.name || user.username,
  };
}
