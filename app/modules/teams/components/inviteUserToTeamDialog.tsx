import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import map from "lodash/map";
import { CopyCheckIcon, CopyIcon, Loader2Icon } from "lucide-react";
import getRoles from "../helpers/getRoles";
import INVITE_LINK_TTL_DAYS from "../helpers/inviteLink";

export default function InviteUserToTeamDialog({
  role,
  username,
  inviteLink,
  hasCopiedInviteLink,
  isGeneratingInviteLink,
  onRoleChanged,
  onGenerateInviteLinkClicked,
  onCopyInviteClicked,
  onUsernameChanged,
}: {
  role: string;
  username: string;
  inviteLink: string;
  hasCopiedInviteLink: boolean;
  isGeneratingInviteLink: boolean;
  onRoleChanged: (role: string) => void;
  onGenerateInviteLinkClicked: () => void;
  onCopyInviteClicked: () => void;
  onUsernameChanged: (username: string) => void;
}) {
  const roles = getRoles();
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Invite a new user to a team</DialogTitle>
        <DialogDescription>
          {!isGeneratingInviteLink && (
            <span>
              Clicking "Generate invite" will give you a one-time invite link to
              send to a user you would like to become a team member.
              <br />
              <br />
              Adding a username will help you identify who you have sent this
              invite link to.
              <br />
              <br />
              More roles will be added soon.
            </span>
          )}
        </DialogDescription>
      </DialogHeader>
      <div>
        {!isGeneratingInviteLink && (
          <div className="flex flex-col gap-2">
            <Label className="text-xs mb-0.5">
              Select your users role in this team
            </Label>
            <Select value={role} onValueChange={onRoleChanged}>
              <SelectTrigger id="annotation-type" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {map(roles, (role) => {
                  return (
                    <SelectItem key={role.value} value={role.value}>
                      {role.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Label className="text-xs mb-0.5">Who is this for</Label>
            <Input
              id="username"
              name="username"
              defaultValue={username}
              autoComplete="off"
              onChange={(event) => onUsernameChanged(event.target.value)}
            />
          </div>
        )}
        {isGeneratingInviteLink && (
          <div>
            {inviteLink && (
              <div className="relative">
                <div className="text-sm bg-gray-100 rounded-2xl p-2 break-all pr-10">
                  {inviteLink}
                </div>
                <Button
                  variant="ghost"
                  className="absolute top-0 z-10 right-1 cursor-pointer"
                  disabled={hasCopiedInviteLink}
                  onClick={onCopyInviteClicked}
                >
                  {hasCopiedInviteLink && <CopyCheckIcon />}

                  {!hasCopiedInviteLink && <CopyIcon />}
                </Button>
                {hasCopiedInviteLink && (
                  <div className="text-xs absolute -bottom-6 right-4 text-green-500">
                    Invite link copied!
                  </div>
                )}
                <div className="text-xs mt-4 text-gray-500">
                  {`This invite link will expire in ${INVITE_LINK_TTL_DAYS} days.`}
                </div>
              </div>
            )}
            {!inviteLink && (
              <Skeleton className="h-[20px] w-full rounded-full" />
            )}
          </div>
        )}
      </div>
      <DialogFooter className="justify-end">
        {!isGeneratingInviteLink && (
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        )}
        {!inviteLink && (
          <Button
            type="button"
            disabled={isGeneratingInviteLink}
            onClick={onGenerateInviteLinkClicked}
          >
            {isGeneratingInviteLink && <Loader2Icon className="animate-spin" />}
            Generate invite
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
}
