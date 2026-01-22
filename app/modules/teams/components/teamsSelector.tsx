import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import clsx from "clsx";
import { Check, ChevronsUpDown } from "lucide-react";
import type { Team } from "../teams.types";

export default function TeamsSelector({
  selectedTeam,
  teams,
  isOpen,
  isLoading,
  onToggleDropdown,
  onTeamSelected,
}: {
  selectedTeam: string | null;
  teams: Team[];
  isOpen: boolean;
  isLoading: boolean;
  onToggleDropdown: (isOpen: boolean) => void;
  onTeamSelected: (selectedTeam: string) => void;
}) {
  return (
    <Popover open={isOpen} onOpenChange={onToggleDropdown}>
      <PopoverTrigger asChild disabled={isLoading}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[200px] justify-between"
        >
          {selectedTeam
            ? teams.find((team) => team._id === selectedTeam)?.name
            : "Select team..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search team..." className="h-9" />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              {teams.map((team) => (
                <CommandItem
                  key={team._id}
                  value={team._id}
                  onSelect={(currentValue) => {
                    onTeamSelected(currentValue);
                    onToggleDropdown(false);
                  }}
                >
                  {team.name}
                  <Check
                    className={clsx(
                      "ml-auto",
                      selectedTeam === team._id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
