import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import { Copy, Edit, FileInput, Trash2 } from "lucide-react";
import type { Collection } from "../collections.types";

export default (item: Collection): CollectionItemAction[] => {
  const actions: CollectionItemAction[] = [];

  actions.push({
    action: "EDIT",
    icon: <Edit />,
    text: "Edit",
  });

  actions.push({
    action: "DUPLICATE",
    icon: <Copy />,
    text: "Duplicate",
  });

  actions.push({
    action: "USE_AS_TEMPLATE",
    icon: <FileInput />,
    text: "Use as template",
  });

  actions.push({
    action: "DELETE",
    icon: <Trash2 />,
    text: "Delete",
  });

  return actions;
};
