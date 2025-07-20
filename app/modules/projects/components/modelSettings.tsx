"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function ModelSettings({
  model,
  settings,
  onChange,
}: {
  model: string;
  settings: Record<string, number>;
  onChange: (updatedSettings: Record<string, number>) => void;
}) {
  const [temperature, setTemperature] = useState(settings.temperature ?? 0.7);

  const handleTemperatureChange = (val: number[]) => {
    setTemperature(val[0]);
    onChange({ ...settings, temperature: val[0] });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-2">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{model} Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex flex-col items-start">
          <span className="text-xs text-muted-foreground mb-1">Temperature: {temperature.toFixed(2)}</span>
          <Slider
            defaultValue={[temperature]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleTemperatureChange}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
