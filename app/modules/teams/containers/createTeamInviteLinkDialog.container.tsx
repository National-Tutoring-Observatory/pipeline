import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import CreateTeamInviteLinkDialog from "../components/createTeamInviteLinkDialog";

interface Props {
  teamId: string;
}

type ActionResponse =
  | { success: true; invite: { slug: string } }
  | { errors: { general?: string; name?: string; maxUses?: string } };

export default function CreateTeamInviteLinkDialogContainer({ teamId }: Props) {
  const [name, setName] = useState("");
  const [maxUses, setMaxUses] = useState(20);
  const [hasCopied, setHasCopied] = useState(false);
  const fetcher = useFetcher<ActionResponse>();

  const isCreating = fetcher.state !== "idle";
  const createdSlug =
    fetcher.data && "invite" in fetcher.data ? fetcher.data.invite?.slug : null;
  const inviteLink = createdSlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${createdSlug}`
    : "";

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if ("errors" in fetcher.data) {
      const msg =
        fetcher.data.errors.general ||
        fetcher.data.errors.name ||
        fetcher.data.errors.maxUses ||
        "An error occurred";
      toast.error(msg);
    }
  }, [fetcher.state, fetcher.data]);

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
