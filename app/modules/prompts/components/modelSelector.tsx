import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import clsx from "clsx";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import findModelByCode from '~/modules/llm/helpers/findModelByCode';
import type { Provider } from '~/modules/llm/model.types';


export default function ModelSelector({
  providers,
  selectedModel,
  isModelsOpen,
  onToggleModelPopover,
  onSelectedModelChanged
}: {
  providers: Provider[],
  selectedModel: string,
  isModelsOpen: boolean,
  onToggleModelPopover: (isPromptsOpen: boolean) => void,
  onSelectedModelChanged: (selectedPrompt: string) => void,
}) {

  const selectedModelInfo = findModelByCode(selectedModel);

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
            {selectedModelInfo
              ? selectedModelInfo.name
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
              {providers.map((provider) => (
                <CommandGroup key={provider.name} heading={provider.name}>
                  {provider.models.map((model) => (
                    <CommandItem
                      key={model.code}
                      value={model.code}
                      onSelect={() => {
                        onSelectedModelChanged(model.code)
                        onToggleModelPopover(false)
                      }}
                    >
                      <CheckIcon
                        className={clsx(
                          "mr-2 h-4 w-4",
                          selectedModel === model.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {model.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
