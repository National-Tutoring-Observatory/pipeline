import { Users } from "lucide-react";

export default function getTeamUsersEmptyAttributes() {
  return {
    icon: <Users />,
    title: "No Users yet",
    description: "No users are associated with this team",
    actions: [],
  };
}
