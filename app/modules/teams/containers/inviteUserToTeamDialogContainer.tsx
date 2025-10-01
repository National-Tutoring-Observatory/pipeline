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

  const onGenerateInviteLinkClicked = () => {
    console.log('onGenerateInviteLinkClicked');
  }

  return (
    <InviteUserToTeamDialog
      onGenerateInviteLinkClicked={onGenerateInviteLinkClicked}
    />
  );
}