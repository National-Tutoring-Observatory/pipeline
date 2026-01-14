import type { CollectionItemAction } from "@/components/ui/collectionContentItem"
import { Edit, Copy } from "lucide-react"
import type { Collection } from "../collections.types";

export default (item: Collection): CollectionItemAction[] => {
  const actions: CollectionItemAction[] = [];

  actions.push({
    action: 'EDIT',
    icon: <Edit />,
    text: 'Edit'
  });

  actions.push({
    action: 'DUPLICATE',
    icon: <Copy />,
    text: 'Duplicate'
  });

  return actions;
}
