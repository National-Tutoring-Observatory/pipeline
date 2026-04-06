import type { CollectionItemAction } from "@/components/ui/collectionItemContent";
import { Copy, Edit, FolderPlus, ListPlus, Stamp, Trash2 } from "lucide-react";

export default function useRunsItemActions(): () => CollectionItemAction[] {
  return (_item?: unknown): CollectionItemAction[] => {
    return [
      {
        action: "ADD_TO_EXISTING_RUN_SET",
        icon: <ListPlus />,
        text: "Add to Existing Run Set",
      },
      {
        action: "ADD_TO_NEW_RUN_SET",
        icon: <FolderPlus />,
        text: "Add to New Run Set",
      },
      {
        action: "USE_AS_RUN_SET_TEMPLATE",
        icon: <Stamp />,
        text: "Use as Run Set Template",
      },
      {
        action: "DUPLICATE",
        icon: <Copy />,
        text: "Duplicate",
      },
      {
        action: "EDIT",
        icon: <Edit />,
        text: "Edit",
      },
      {
        action: "DELETE",
        icon: <Trash2 />,
        text: "Delete",
        variant: "destructive",
      },
    ];
  };
}
