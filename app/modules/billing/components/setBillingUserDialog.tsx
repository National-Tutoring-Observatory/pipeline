import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface TeamMember {
  _id: string;
  username: string;
}

interface SetBillingUserDialogProps {
  members: TeamMember[];
  currentBillingUserId?: string;
  onSetBillingUserClicked: (userId: string) => void;
}

const SetBillingUserDialog = ({
  members,
  currentBillingUserId,
  onSetBillingUserClicked,
}: SetBillingUserDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState(
    currentBillingUserId ?? "",
  );

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Set billing user</DialogTitle>
        <DialogDescription>
          The billing user can manage credits and spending limits for this team.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a team member" />
          </SelectTrigger>
          <SelectContent>
            {members.map((member) => (
              <SelectItem key={member._id} value={member._id}>
                {member.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={!selectedUserId}
            onClick={() => onSetBillingUserClicked(selectedUserId)}
          >
            Save
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default SetBillingUserDialog;
