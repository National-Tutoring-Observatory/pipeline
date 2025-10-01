import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoaderPinwheel } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import map from 'lodash/map';
import includes from 'lodash/includes';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function InviteUserToTeamDialog({
  onGenerateInviteLinkClicked
}: {
  onGenerateInviteLinkClicked: () => void
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite a new user to a team</DialogTitle>
        <DialogDescription>
          Clicking "Generate invite" will give you a one-time invite link to send to a user you would like to become a team member. <br /><br />More roles will be added soon.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" onClick={onGenerateInviteLinkClicked}>
            Generate invite
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent >
  );
}