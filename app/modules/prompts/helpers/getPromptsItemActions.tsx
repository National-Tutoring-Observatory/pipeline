import type { CollectionItemAction } from "@/components/ui/collectionContentItem"
import { Edit, Trash2 } from "lucide-react"

export default (): CollectionItemAction[] => {
  return [{
    action: 'EDIT',
    icon: <Edit />,
    text: 'Edit'
  }]
}
