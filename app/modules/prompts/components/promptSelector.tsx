import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import clsx from "clsx"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import type { Prompt } from "../prompts.types"

export default function PromptSelector({
  prompts,
  value,
  isLoadingPrompts,
  isOpen,
  onTogglePopover,
  onValueChanged,
}: {
  prompts: Prompt[],
  value: string,
  isLoadingPrompts: boolean,
  isOpen: boolean,
  onTogglePopover: (isOpen: boolean) => void,
  onValueChanged: (value: string) => void,
}) {
  console.log(value);
  return (
    <Popover open={isOpen} onOpenChange={onTogglePopover}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[200px] justify-between"
        >
          {value
            ? prompts.find((prompt: Prompt) => prompt._id === value)?.name
            : "Select prompt..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search prompts..." />
          <CommandList>
            {(isLoadingPrompts) && (
              <div>
                Loading
              </div>
            )}
            {(!isLoadingPrompts) && (
              <CommandEmpty>
                <div>
                  No prompts found.
                </div>
                <Button >Create</Button>
              </CommandEmpty>
            )}
            <CommandGroup>
              {prompts.map((prompt: Prompt) => (
                <CommandItem
                  key={prompt._id}
                  value={prompt._id}
                  onSelect={(currentValue) => {
                    onValueChanged(prompt._id)
                    onTogglePopover(false)
                  }}
                >
                  <CheckIcon
                    className={clsx(
                      "mr-2 h-4 w-4",
                      value === prompt._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {prompt.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}