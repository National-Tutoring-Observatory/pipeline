import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2Icon, LoaderPinwheel } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import map from 'lodash/map';
import includes from 'lodash/includes';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import getRoles from "../helpers/getRoles";
import { Skeleton } from "@/components/ui/skeleton";

export default function InviteUserToTeamDialog({
  role,
  inviteLink,
  isGeneratingInviteLink,
  onRoleChanged,
  onGenerateInviteLinkClicked
}: {
  role: string,
  inviteLink: string,
  isGeneratingInviteLink: boolean,
  onRoleChanged: (role: string) => void,
  onGenerateInviteLinkClicked: () => void
}) {
  const roles = getRoles();
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite a new user to a team</DialogTitle>
        <DialogDescription>
          {(!isGeneratingInviteLink) && (
            <div>
              Clicking "Generate invite" will give you a one-time invite link to send to a user you would like to become a team member. <br /><br />More roles will be added soon.
            </div>
          )}
        </DialogDescription>
      </DialogHeader>
      <div>
        {(!isGeneratingInviteLink) && (
          <div>
            <Label className="text-xs mb-0.5">Select your users role in this team</Label>
            <Select
              value={role}
              onValueChange={onRoleChanged}
            >
              <SelectTrigger id="annotation-type" className="w-[180px]">
                <SelectValue placeholder="Select an annotation type" />
              </SelectTrigger>
              <SelectContent>
                {map(roles, (role) => {
                  return (
                    <SelectItem
                      key={role.value}
                      value={role.value}>
                      {role.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}
        {(isGeneratingInviteLink) && (
          <div>
            {(inviteLink) && (
              <div>
                <div>
                  {inviteLink}
                </div>
              </div>
            )}
            {(!inviteLink) && (
              <Skeleton className="h-[20px] w-full rounded-full" />
            )}
          </div>
        )}
      </div>
      <DialogFooter className="justify-end">
        {(!isGeneratingInviteLink) && (
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        )}
        <Button type="button" disabled={isGeneratingInviteLink} onClick={onGenerateInviteLinkClicked}>
          {(isGeneratingInviteLink) && (
            <Loader2Icon className="animate-spin" />
          )}
          Generate invite
        </Button>
        {/* <DialogClose asChild>
          <Button type="button" onClick={onGenerateInviteLinkClicked}>
            Generate invite
          </Button>
        </DialogClose> */}
      </DialogFooter>
    </DialogContent >
  );
}