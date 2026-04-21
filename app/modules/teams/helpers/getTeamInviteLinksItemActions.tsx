import { CopyIcon, TrashIcon } from "lucide-react";
import type { TeamInvite } from "../teamInvites.types";
import getTeamInviteStatus from "./getTeamInviteStatus";

export default function getTeamInviteLinksItemActions(item: TeamInvite) {
  const status = getTeamInviteStatus(item);
  if (status !== "active") return [];
  return [
    { action: "COPY", text: "Copy link", icon: <CopyIcon /> },
    {
      action: "REVOKE",
      text: "Revoke",
      icon: <TrashIcon />,
      variant: "destructive" as const,
    },
  ];
}
