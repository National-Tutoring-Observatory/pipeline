import { useState } from "react";
import { useFetcher } from "react-router";

import InviteUserToTeamDialog from "../components/inviteUserToTeamDialog";

export default function InviteUserToTeamDialogContainer({
  teamId,
}: {
  teamId: string;
}) {
  const [role, setRole] = useState("ADMIN");
  const [username, setUsername] = useState("");
  const [hasCopiedInviteLink, setHasCopiedInviteLink] = useState(false);
  const [isGeneratingInviteLink, setIsGeneratingInviteLink] = useState(false);
  const fetcher = useFetcher();

  let inviteLink: string = "";

  const onRoleChanged = (role: string) => {
    setRole(role);
  };

  const onUsernameChanged = (username: string) => {
    setUsername(username);
  };

  const onGenerateInviteLinkClicked = () => {
    setIsGeneratingInviteLink(true);
    fetcher.submit(
      JSON.stringify({
        intent: "GENERATE_INVITE_LINK",
        payload: {
          teamId,
          role,
          username,
        },
      }),
      {
        action: "/api/teams/generateInviteToTeam",
        method: "POST",
        encType: "application/json",
      },
    );
  };

  const onCopyInviteClicked = () => {
    navigator.clipboard.writeText(inviteLink);
    setHasCopiedInviteLink(true);
  };

  if (fetcher.data && fetcher.data.data && fetcher.data.data.inviteId) {
    inviteLink = `${window.location.origin}/invite/${fetcher.data.data.inviteId}`;
  }

  return (
    <InviteUserToTeamDialog
      role={role}
      username={username}
      inviteLink={inviteLink}
      hasCopiedInviteLink={hasCopiedInviteLink}
      isGeneratingInviteLink={isGeneratingInviteLink}
      onRoleChanged={onRoleChanged}
      onGenerateInviteLinkClicked={onGenerateInviteLinkClicked}
      onCopyInviteClicked={onCopyInviteClicked}
      onUsernameChanged={onUsernameChanged}
    />
  );
}
