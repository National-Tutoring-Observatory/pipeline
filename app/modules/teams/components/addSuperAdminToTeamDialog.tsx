import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export default function AddSuperAdminToTeamDialog({
  isSubmitButtonDisabled,
  onAddSuperAdminToTeamClicked,
  reason,
  onReasonChanged
}: {
  isSubmitButtonDisabled: boolean,
  onAddSuperAdminToTeamClicked: () => void,
  reason: string,
  onReasonChanged: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Super Admin to Team </DialogTitle>
        <DialogDescription>
          Select a user to add as a Super Admin to this team.
        </DialogDescription>
      </DialogHeader>
      <div>
        <div>
          <Label className="text-xs mb-2">Reason</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={onReasonChanged}
          />
        </div>
        <div className="mt-3">
          <Label className="text-xs mb-2">Assignment type</Label>
          <RadioGroup defaultValue="temporary">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="temporary" id="temporary" />
              <Label htmlFor="temporary">I need temporary access for debugging purposes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="permanent" id="permanent" />
              <Label htmlFor="permanent">I certify I am a member of this team and need regular access</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={isSubmitButtonDisabled}
          onClick={onAddSuperAdminToTeamClicked}
        >
          Add Super Admin
        </Button>
        < DialogClose asChild >
          <Button variant="outline" > Cancel </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};
