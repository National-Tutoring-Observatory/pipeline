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
import { useState } from "react";

interface AddCreditsDialogProps {
  onAddCreditsClicked: (amount: number, note: string) => void;
}

const AddCreditsDialog = ({ onAddCreditsClicked }: AddCreditsDialogProps) => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const numericAmount = parseInt(amount, 10);
  const isValid = !isNaN(numericAmount) && numericAmount >= 10;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add credits</DialogTitle>
        <DialogDescription>
          Add credits to your team balance. Minimum top-up is $10.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="credit-amount">Amount ($)</Label>
        <Input
          id="credit-amount"
          type="number"
          min="10"
          step="1"
          placeholder="10"
          autoComplete="off"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Label htmlFor="credit-note">Note (optional)</Label>
        <Input
          id="credit-note"
          placeholder="e.g. Monthly top-up"
          autoComplete="off"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
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
            disabled={!isValid}
            onClick={() => onAddCreditsClicked(numericAmount, note)}
          >
            Add credits
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default AddCreditsDialog;
