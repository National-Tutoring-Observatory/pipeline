import { SearchIcon } from "lucide-react";
import { Button } from "./button";
import { ButtonGroup } from "./button-group";
import { Input } from "./input";

export type SearchProps = {
  searchValue?: string;
  onSearchValueChanged?: (searchValue: string) => void;
};

function Search({ searchValue, onSearchValueChanged }: SearchProps) {
  return (
    <ButtonGroup>
      <Input
        placeholder="Search..."
        value={searchValue}
        className="shadow-none"
        onChange={(event) => {
          if (onSearchValueChanged) {
            onSearchValueChanged(event.target.value);
          }
        }}
      />
      <Button variant="outline" aria-label="Search" className="shadow-none">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  );
}

export { Search };
