import type { CollectionItemAction } from "@/components/ui/collectionContentItem"
import { Copy, Edit } from "lucide-react"

export default (): CollectionItemAction[] => {
  return [{
    action: 'EDIT',
    icon: <Edit />,
    text: 'Edit'
  }, {
    action: 'DUPLICATE',
    icon: <Copy />,
    text: 'Duplicate'
  }]
}
