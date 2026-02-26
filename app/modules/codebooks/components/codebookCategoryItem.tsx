import { cn } from "@/lib/utils";

export default function CodebookCategoryItem({
  name,
  isSelected,
  onClick,
}: {
  name: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={cn(
        "cursor-pointer border-b p-2 text-sm",
        isSelected && "bg-indigo-50",
      )}
      onClick={onClick}
    >
      {name || "Untitled"}
    </div>
  );
}
