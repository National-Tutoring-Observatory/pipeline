import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import AddUserToTeamDialog from "../components/addUserToTeamDialog";
import includes from 'lodash/includes';
import remove from 'lodash/remove';
import cloneDeep from "lodash/cloneDeep";
import InviteUserToTeamDialog from "../components/inviteUserToTeamDialog";

export default function InviteUserToTeamDialogContainer({
  teamId
}: {
  teamId: string,
}) {

  const [role, setRole] = useState('ADMIN');

  const [isGeneratingInviteLink, setIsGeneratingInviteLink] = useState(false);

  let inviteLink: string = '';

  const onRoleChanged = (role: string) => {
    setRole(role);
  }

  const onGenerateInviteLinkClicked = () => {
    console.log('onGenerateInviteLinkClicked');
    setIsGeneratingInviteLink(true);
  }

  return (
    <InviteUserToTeamDialog
      role={role}
      inviteLink={inviteLink}
      isGeneratingInviteLink={isGeneratingInviteLink}
      onRoleChanged={onRoleChanged}
      onGenerateInviteLinkClicked={onGenerateInviteLinkClicked}
    />
  );
}