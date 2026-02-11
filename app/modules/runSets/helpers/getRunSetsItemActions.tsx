import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import { Copy, Edit, FileInput, Trash2 } from "lucide-react";
import type { RunSet } from "../runSets.types";

export default (_item: RunSet): CollectionItemAction[] => {
  return [
    {
      action: "EDIT",
      icon: <Edit />,
      text: "Edit",
    },
    {
      action: "DUPLICATE",
      icon: <Copy />,
      text: "Duplicate",
    },
    {
      action: "USE_AS_TEMPLATE",
      icon: <FileInput />,
      text: "Use as template",
    },
    {
      action: "DELETE",
      icon: <Trash2 />,
      text: "Delete",
    },
  ];
};
