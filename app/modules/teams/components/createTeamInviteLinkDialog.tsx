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
import { Skeleton } from "@/components/ui/skeleton";
import { CopyCheckIcon, CopyIcon, Loader2Icon } from "lucide-react";
import INVITE_LINK_TTL_DAYS from "../helpers/inviteLink";

export const NAME_MAX = 100;
export const USES_MIN = 1;
export const USES_MAX = 500;

interface Props {
  name: string;
  maxUses: number;
  inviteLink: string;
  hasCopied: boolean;
  isCreating: boolean;
  onNameChanged: (name: string) => void;
  onMaxUsesChanged: (uses: number) => void;
  onCreateClicked: () => void;
  onCopyClicked: () => void;
}

export default function CreateTeamInviteLinkDialog({
  name,
  maxUses,
  inviteLink,
  hasCopied,
  isCreating,
  onNameChanged,
  onMaxUsesChanged,
  onCreateClicked,
  onCopyClicked,
}: Props) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a team invite link</DialogTitle>
        <DialogDescription>
          {!isCreating && !inviteLink && (
            <span>
              Create a shareable link for events like conferences. Anyone with
              the link can join the team up to the limit you set.
            </span>
          )}
        </DialogDescription>
      </DialogHeader>
      <div>
        {!isCreating && !inviteLink && (
          <div className="flex flex-col gap-3">
            <div>
              <Label className="mb-1 text-xs">Name</Label>
              <Input
                value={name}
                maxLength={NAME_MAX}
                onChange={(e) => onNameChanged(e.target.value)}
                placeholder="e.g. Learning Conference Norway"
                autoComplete="off"
              />
              <div className="text-muted-foreground mt-1 text-right text-xs">
                {name.length} / {NAME_MAX}
              </div>
            </div>
            <div>
              <Label className="mb-1 text-xs">Maximum uses</Label>
              <Input
                type="number"
                min={USES_MIN}
                max={USES_MAX}
                value={maxUses}
                onChange={(e) => onMaxUsesChanged(Number(e.target.value))}
              />
            </div>
          </div>
        )}
        {isCreating && !inviteLink && (
          <Skeleton className="h-[20px] w-full rounded-full" />
        )}
        {inviteLink && (
          <div className="relative">
            <div className="bg-muted rounded-2xl p-2 pr-10 text-sm break-all">
              {inviteLink}
            </div>
            <Button
              variant="ghost"
              aria-label={hasCopied ? "Link copied" : "Copy link"}
              className="absolute top-0 right-1 z-10 cursor-pointer"
              disabled={hasCopied}
              onClick={onCopyClicked}
            >
              {hasCopied ? <CopyCheckIcon /> : <CopyIcon />}
            </Button>
            <div className="text-muted-foreground mt-4 text-xs">
              {`This invite link will expire in ${INVITE_LINK_TTL_DAYS} days.`}
            </div>
          </div>
        )}
      </div>
      <DialogFooter className="justify-end">
        {!inviteLink && (
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isCreating}>
              Cancel
            </Button>
          </DialogClose>
        )}
        {!inviteLink && (
          <Button
            type="button"
            disabled={
              isCreating ||
              name.trim().length === 0 ||
              name.length > NAME_MAX ||
              maxUses < USES_MIN ||
              maxUses > USES_MAX
            }
            onClick={onCreateClicked}
          >
            {isCreating && <Loader2Icon className="animate-spin" />}
            Generate invite link
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
}
