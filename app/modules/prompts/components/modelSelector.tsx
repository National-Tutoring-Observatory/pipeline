import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import clsx from "clsx"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import type { Model } from "../prompts.types";

export default function ModelSelector({
  models,
  selectedModel,
  isModelsOpen,
  onToggleModelPopover,
  onSelectedModelChanged
}: {
  models: Model[],
  selectedModel: string,
  isModelsOpen: boolean,
  onToggleModelPopover: (isPromptsOpen: boolean) => void,
  onSelectedModelChanged: (selectedPrompt: string) => void,
}) {
  return (
    <div>
      <Popover open={isModelsOpen} onOpenChange={onToggleModelPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isModelsOpen}
            className="w-[200px] justify-between"
          >
            {selectedModel
              ? models.find((model: Model) => model.provider === selectedModel)?.name
              : "Select model..."}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search models..." />
            <CommandList>
              <CommandEmpty>
                <div>
                  No models found.
                </div>
                {/* <Button >Create</Button> */}
              </CommandEmpty>
              <CommandGroup>
                {models.map((model: Model) => (
                  <CommandItem
                    key={model.provider}
                    value={model.provider}
                    onSelect={(currentValue) => {
                      onSelectedModelChanged(model.provider)
                      onToggleModelPopover(false)
                    }}
                  >
                    <CheckIcon
                      className={clsx(
                        "mr-2 h-4 w-4",
                        selectedModel === model.provider ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {model.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}