import type { User } from "~/modules/users/users.types";

export default function getAddUsersToFeatureFlagDialogItemAttributes(
  user: User,
) {
  return {
    id: user._id,
    title: user.name || user.username,
  };
}
