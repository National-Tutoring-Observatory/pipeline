import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { ShuffleIcon } from "lucide-react";

interface SessionRandomizerProps {
  sampleSize: number;
  maxSize: number;
  onSampleSizeChanged: (size: number) => void;
  onRandomizeClicked: () => void;
}

export default function SessionRandomizer({
  sampleSize,
  maxSize,
  onSampleSizeChanged,
  onRandomizeClicked,
}: SessionRandomizerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="sm" role="combobox">
          <ShuffleIcon />
          RandomizR
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-4">
        <div className="grid gap-3">
          <Label htmlFor="sample-size">Sample size</Label>
          <Input
            id="sample-size"
            name="sample-size"
            type="number"
            max={`${maxSize}`}
            min="1"
            value={sampleSize}
            onChange={(event) =>
              onSampleSizeChanged(Number(event.target.value))
            }
          />
          <PopoverClose asChild>
            <Button onClick={onRandomizeClicked}>Select</Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
