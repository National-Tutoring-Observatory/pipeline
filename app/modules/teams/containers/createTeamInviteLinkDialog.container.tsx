import { useState } from "react";
import { useFetcher } from "react-router";
import CreateTeamInviteLinkDialog from "../components/createTeamInviteLinkDialog";

interface Props {
  teamId: string;
}

export default function CreateTeamInviteLinkDialogContainer({ teamId }: Props) {
  const [name, setName] = useState("");
  const [maxUses, setMaxUses] = useState(20);
  const [hasCopied, setHasCopied] = useState(false);
  const fetcher = useFetcher<{
    success?: boolean;
    invite?: { slug: string };
  }>();

  const isCreating = fetcher.state !== "idle";
  const createdSlug =
    fetcher.data && "invite" in fetcher.data ? fetcher.data.invite?.slug : null;
  const inviteLink = createdSlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${createdSlug}`
    : "";

  const submitCreate = () => {
    fetcher.submit(
      JSON.stringify({
        intent: "CREATE_TEAM_INVITE_LINK",
        payload: { name: name.trim(), maxUses },
      }),
      {
        action: `/teams/${teamId}/invite-links`,
        method: "POST",
        encType: "application/json",
      },
    );
  };

  const submitCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setHasCopied(true);
  };

  return (
    <CreateTeamInviteLinkDialog
      name={name}
      maxUses={maxUses}
      inviteLink={inviteLink}
      hasCopied={hasCopied}
      isCreating={isCreating}
      onNameChanged={setName}
      onMaxUsesChanged={setMaxUses}
      onCreateClicked={submitCreate}
      onCopyClicked={submitCopy}
    />
  );
}
