import { Users } from "lucide-react";

export default function getAddUserToTeamDialogEmptyAttributes() {
  return {
    icon: <Users />,
    title: "No users available",
    description: "No users available to add to this team",
    actions: [],
  };
}
