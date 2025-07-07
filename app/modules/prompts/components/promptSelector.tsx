import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import clsx from "clsx"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import type { Prompt, PromptVersion } from "../prompts.types"
import { Badge } from "@/components/ui/badge"
import find from 'lodash/find';

export default function PromptSelector({
  prompts,
  promptVersions,
  selectedPrompt,
  selectedPromptVersion,
  latestVersion,
  isLoadingPrompts,
  isLoadingPromptVersions,
  isPromptsOpen,
  isPromptVersionsOpen,
  onTogglePromptPopover,
  onTogglePromptVersionsPopover,
  onSelectedPromptChanged,
  onSelectedPromptVersionChanged
}: {
  prompts: Prompt[],
  promptVersions: PromptVersion[],
  selectedPrompt: string,
  selectedPromptVersion: string,
  latestVersion: number,
  isLoadingPrompts: boolean,
  isLoadingPromptVersions: boolean,
  isPromptsOpen: boolean,
  isPromptVersionsOpen: boolean,
  onTogglePromptPopover: (isPromptsOpen: boolean) => void,
  onTogglePromptVersionsPopover: (isPromptVersionsOpen: boolean) => void,
  onSelectedPromptChanged: (selectedPrompt: string) => void,
  onSelectedPromptVersionChanged: (selectedPromptVersion: string) => void,
}) {

  let selectedPromptVersionItem = null;
  if (selectedPromptVersion) {
    selectedPromptVersionItem = find(promptVersions, { version: Number(selectedPromptVersion) });
  }

  return (
    <div className="flex items-center">
      <Popover open={isPromptsOpen} onOpenChange={onTogglePromptPopover}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isPromptsOpen}
            className="w-[200px] justify-between"
          >
            {selectedPrompt
              ? prompts.find((prompt: Prompt) => prompt._id === selectedPrompt)?.name
              : "Select prompt..."}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search prompts..." />
            <CommandList>
              {(isLoadingPrompts) && (
                <div className="flex justify-center">
                  Loading
                </div>
              )}
              {(!isLoadingPrompts) && (
                <CommandEmpty>
                  <div>
                    No prompts found.
                  </div>
                  {/* <Button >Create</Button> */}
                </CommandEmpty>
              )}
              <CommandGroup>
                {prompts.map((prompt: Prompt) => (
                  <CommandItem
                    key={prompt._id}
                    value={prompt._id}
                    onSelect={(currentValue) => {
                      onSelectedPromptChanged(prompt._id)
                      onTogglePromptPopover(false)
                    }}
                  >
                    <CheckIcon
                      className={clsx(
                        "mr-2 h-4 w-4",
                        selectedPrompt === prompt._id ? "opacity-100" : "opacity-0"
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
      {(selectedPrompt) && (
        <div className="ml-2">
          <Popover open={isPromptVersionsOpen} onOpenChange={onTogglePromptVersionsPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isPromptVersionsOpen}
                className="w-[200px] justify-between"
              >
                {(selectedPromptVersion && selectedPromptVersionItem) && (
                  <div className="flex items-center">
                    {`#${selectedPromptVersionItem.version}`}
                    {(latestVersion && latestVersion === selectedPromptVersionItem.version) && (
                      <Badge variant="secondary" className="bg-indigo-100 ml-2">Latest</Badge>
                    )}
                  </div>
                ) || (
                    "Select version..."
                  )}
                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search versions..." />
                <CommandList>
                  {(isLoadingPromptVersions) && (
                    <div className="flex justify-center">
                      Loading
                    </div>
                  )}
                  {(!isLoadingPromptVersions) && (
                    <CommandEmpty>
                      <div>
                        No versions found.
                      </div>
                      <Button >Create</Button>
                    </CommandEmpty>
                  )}
                  <CommandGroup>
                    {promptVersions.map((promptVersion: PromptVersion) => (
                      <CommandItem
                        key={promptVersion._id}
                        value={`${promptVersion.version}`}
                        onSelect={(currentValue) => {
                          onSelectedPromptVersionChanged(`${promptVersion.version}`)
                          onTogglePromptVersionsPopover(false)
                        }}
                      >
                        <CheckIcon
                          className={clsx(
                            "mr-2 h-4 w-4",
                            selectedPromptVersion === `${promptVersion.version}` ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div>
                          {`#${promptVersion.version}`}
                          {(latestVersion && latestVersion === promptVersion.version) && (
                            <Badge variant="secondary" className="bg-indigo-100 ml-2">Latest</Badge>
                          )}
                          <div className="text-muted-foreground">
                            {promptVersion.name}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>

  )
}