import { DropdownMenu, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Filter } from 'lucide-react';
import { Button } from './button';

const Filters = ({
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Filter />
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
};

export default Filters;
