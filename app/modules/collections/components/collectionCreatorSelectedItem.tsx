import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CollectionCreatorSelectedItem = ({
  text,
  onRemoveClicked
}: {
  text: string,
  onRemoveClicked: () => void
}) => {
  return (
    <div className="flex items-center justify-between bg-white px-2 py-1">
      <span className="text-sm">{text}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRemoveClicked}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default CollectionCreatorSelectedItem;
