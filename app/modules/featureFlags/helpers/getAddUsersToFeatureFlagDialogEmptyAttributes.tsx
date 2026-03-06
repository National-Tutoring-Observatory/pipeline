import { Users } from "lucide-react";

export default function getAddUsersToFeatureFlagDialogEmptyAttributes() {
  return {
    icon: <Users />,
    title: "No users available",
    description: "No users available to add to this feature flag",
    actions: [],
  };
}
