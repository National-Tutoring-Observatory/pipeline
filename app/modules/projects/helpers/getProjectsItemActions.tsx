import { Edit, Trash2 } from "lucide-react"

export default () => {
  return [{
    action: 'EDIT',
    icon: <Edit />,
    text: 'Edit'
  }, {
    action: 'DELETE',
    icon: <Trash2 />,
    text: 'Delete',
  }]
}
