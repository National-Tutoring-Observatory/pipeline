import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

import { Slider } from "@/components/ui/slider";

import { Switch } from "@/components/ui/switch";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Settings } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { LLMSettings } from "~/core/llm/llm.types";

import { DEFAULT_LLM_SETTINGS } from "~/core/llm/llm.types";

 

export default function LLMSettingsComponent({

  settings,

  onSettingsChanged

}: {

  settings: LLMSettings;

  onSettingsChanged: (settings: LLMSettings) => void;

}) {

  const updateSetting = (key: keyof LLMSettings, value: any) => {

    onSettingsChanged({ ...settings, [key]: value });

  };

 

  return (

    <Popover>

      <PopoverTrigger asChild>

        <Button variant="outline" size="sm">

          <Settings className="w-4 h-4" />

        </Button>

      </PopoverTrigger>

      <PopoverContent className="w-80 p-4">

        <div className="grid gap-4">

          <div className="space-y-2">

            <h4 className="font-medium leading-none">LLM Settings</h4>

            <p className="text-sm text-muted-foreground">

              Adjust model parameters for optimal performance

            </p>

          </div>

 

          {/* Temperature */}

          <div className="grid gap-2">

            <div className="flex items-center justify-between">

              <Label htmlFor="temperature">Temperature</Label>

              <span className="text-sm text-muted-foreground">{settings.temperature}</span>

            </div>

            <Slider

              id="temperature"

              min={0}

              max={1}

              step={0.1}

              value={[settings.temperature]}

              onValueChange={([value]: number[]) => updateSetting('temperature', value)}

              className="w-full"

            />

            <p className="text-xs text-muted-foreground">Higher values make output more random</p>

          </div>

 

         

 

          {/* Top P */}

          <div className="grid gap-2">

            <div className="flex items-center justify-between">

              <Label htmlFor="topP">Top P</Label>

              <span className="text-sm text-muted-foreground">{settings.topP}</span>

            </div>

            <Slider

              id="topP"

              min={0}

              max={1}

              step={0.1}

              value={[settings.topP]}

              onValueChange={([value]: number[]) => updateSetting('topP', value)}

              className="w-full"

            />

          </div>

 

          {/* Frequency Penalty */}

          <div className="grid gap-2">

            <div className="flex items-center justify-between">

              <Label htmlFor="frequencyPenalty">Frequency Penalty</Label>

              <span className="text-sm text-muted-foreground">{settings.frequencyPenalty}</span>

            </div>

            <Slider

              id="frequencyPenalty"

              min={-2}

              max={2}

              step={0.1}

              value={[settings.frequencyPenalty]}

              onValueChange={([value]: number[]) => updateSetting('frequencyPenalty', value)}

              className="w-full"

            />

          </div>

 

          {/* Presence Penalty */}

          <div className="grid gap-2">

            <div className="flex items-center justify-between">

              <Label htmlFor="presencePenalty">Presence Penalty</Label>

              <span className="text-sm text-muted-foreground">{settings.presencePenalty}</span>

            </div>

            <Slider

              id="presencePenalty"

              min={-2}

              max={2}

              step={0.1}

              value={[settings.presencePenalty]}

              onValueChange={([value]: number[]) => updateSetting('presencePenalty', value)}

              className="w-full"

            />

          </div>

 

          {/* Response Format */}

          <div className="grid gap-2">

            <Label htmlFor="responseFormat">Response Format</Label>

            <Select

              value={settings.responseFormat}

              onValueChange={(value: 'json' | 'text') => updateSetting('responseFormat', value)}

            >

              <SelectTrigger>

                <SelectValue />

              </SelectTrigger>

              <SelectContent>

                <SelectItem value="json">JSON</SelectItem>

                <SelectItem value="text">Text</SelectItem>

              </SelectContent>

            </Select>

          </div>

 

          {/* Reset Button */}

          <Button

            variant="outline"

            size="sm"

            onClick={() => onSettingsChanged(DEFAULT_LLM_SETTINGS)}

          >

            Reset to Defaults

          </Button>

        </div>

      </PopoverContent>

    </Popover>

  );

}