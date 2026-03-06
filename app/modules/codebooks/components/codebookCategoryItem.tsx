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
        isSelected && "bg-sandpiper-accent/10",
      )}
      onClick={onClick}
    >
      {name || "Untitled"}
    </div>
  );
}
