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
import type { BillingPlan } from "~/modules/billing/billing.types";

interface AssignBillingPlanDialogProps {
  plans: BillingPlan[];
  currentPlanId?: string;
  onAssignPlanClicked: (planId: string) => void;
}

const AssignBillingPlanDialog = ({
  plans,
  currentPlanId,
  onAssignPlanClicked,
}: AssignBillingPlanDialogProps) => {
  const [selectedPlanId, setSelectedPlanId] = useState(currentPlanId ?? "");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {currentPlanId ? "Change billing plan" : "Assign billing plan"}
        </DialogTitle>
        <DialogDescription>
          Select a billing plan for this team. The plan determines the markup
          rate applied to LLM usage costs.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan) => (
              <SelectItem key={plan._id} value={plan._id}>
                {plan.name} ({((plan.markupRate - 1) * 100).toFixed(0)}% markup)
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
            disabled={!selectedPlanId || selectedPlanId === currentPlanId}
            onClick={() => onAssignPlanClicked(selectedPlanId)}
          >
            {currentPlanId ? "Change plan" : "Assign plan"}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default AssignBillingPlanDialog;
