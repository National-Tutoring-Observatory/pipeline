import { FolderKanban } from "lucide-react"

export default () => {
  return {
    icon: <FolderKanban />,
    title: 'No Projects yet',
    description: "You haven't created any projects yet. Get started by creating your first project.",
    actions: [{
      action: 'CREATE',
      text: 'Create project'
    }]
  }
}
