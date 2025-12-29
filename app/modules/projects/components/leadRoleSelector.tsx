import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import clsx from "clsx"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

export default function LeadRoleSelector({
  roles,
  selectedLeadRole,
  isOpen,
  onTogglePopover,
  onSelectedLeadRoleChanged
}: {
  roles: string[],
  selectedLeadRole: string | null,
  isOpen: boolean,
  onTogglePopover: (isOpen: boolean) => void,
  onSelectedLeadRoleChanged: (selectedLeadRole: string) => void,
}) {
  return (
    <div>
      <Popover open={isOpen} onOpenChange={onTogglePopover}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-[200px] justify-between"
          >
            {selectedLeadRole || "Select lead role..."}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>
                <div>No roles found.</div>
              </CommandEmpty>
              <CommandGroup>
                {roles.map((role: string) => (
                  <CommandItem
                    key={role}
                    value={role}
                    onSelect={() => {
                      onSelectedLeadRoleChanged(role)
                      onTogglePopover(false)
                    }}
                  >
                    <CheckIcon
                      className={clsx(
                        "mr-2 h-4 w-4",
                        selectedLeadRole === role ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {role}
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
