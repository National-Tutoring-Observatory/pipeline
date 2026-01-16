import type { CollectionItemAction } from "@/components/ui/collectionContentItem"
import { Copy, Edit, FolderPlus } from "lucide-react"

export default (): CollectionItemAction[] => {
  return [{
    action: 'EDIT',
    icon: <Edit />,
    text: 'Edit'
  }, {
    action: 'DUPLICATE',
    icon: <Copy />,
    text: 'Duplicate'
  }, {
    action: 'CREATE_COLLECTION',
    icon: <FolderPlus />,
    text: 'Create Collection'
  }]
}
