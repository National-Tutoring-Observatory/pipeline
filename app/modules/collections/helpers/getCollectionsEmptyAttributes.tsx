import { FolderOpen } from "lucide-react"

export default () => {
  return {
    icon: <FolderOpen />,
    title: 'No collections yet',
    description: "You haven't created any collections yet. Get started by creating your first collection.",
    actions: [{
      action: 'CREATE',
      text: 'Create collection'
    }]
  }
}
