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
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface TopUpDialogProps {
  onTopUpClicked: (amount: number) => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100];

export default function TopUpDialog({ onTopUpClicked }: TopUpDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(25);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const rawAmount = customAmount ? parseInt(customAmount, 10) : selectedPreset;
  const isValid = rawAmount !== null && !isNaN(rawAmount) && rawAmount >= 1;

  const handleSubmit = () => {
    setIsLoading(true);
    onTopUpClicked(rawAmount as number);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Top up credits</DialogTitle>
        <DialogDescription>
          Purchase credits via Stripe. You will be redirected to a secure
          checkout page.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid grid-cols-4 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={
                selectedPreset === preset && !customAmount
                  ? "default"
                  : "outline"
              }
              disabled={isLoading}
              onClick={() => {
                setSelectedPreset(preset);
                setCustomAmount("");
              }}
            >
              ${preset}
            </Button>
          ))}
        </div>
        <Input
          type="number"
          min="1"
          step="1"
          placeholder="Custom amount ($)"
          autoComplete="off"
          disabled={isLoading}
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setSelectedPreset(null);
          }}
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={isLoading}>
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="button"
          disabled={!isValid || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecting...
            </>
          ) : (
            "Continue to checkout"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
