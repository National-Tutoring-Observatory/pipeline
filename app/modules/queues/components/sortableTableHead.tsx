import { TableHead } from "@/components/ui/table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

type SortField =
  | "name"
  | "timestamp"
  | "processedOn"
  | "finishedOn"
  | "attemptsMade";
type SortDirection = "asc" | "desc";

interface SortableTableHeadProps {
  field: SortField;
  currentSortField: SortField;
  currentSortDirection: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  className?: string;
}

export default function SortableTableHead({
  field,
  currentSortField,
  currentSortDirection,
  onSort,
  children,
  className,
}: SortableTableHeadProps) {
  const isActive = currentSortField === field;

  const getSortIcon = () => {
    if (!isActive) {
      return (
        <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
      );
    }
    return currentSortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 opacity-100" />
    ) : (
      <ChevronDown className="h-4 w-4 opacity-100" />
    );
  };

  return (
    <TableHead className={className}>
      <button
        onClick={() => onSort(field)}
        className={`group flex items-center gap-2 hover:text-foreground transition-colors ${
          isActive ? "text-foreground font-medium" : "text-muted-foreground"
        }`}
      >
        {children}
        {getSortIcon()}
      </button>
    </TableHead>
  );
}
