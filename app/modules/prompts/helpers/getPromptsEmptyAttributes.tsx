import { ClipboardList } from "lucide-react"

export default () => {
  return {
    icon: <ClipboardList />,
    title: 'No Prompts yet',
    description: "You haven't created any prompts yet. Get started by creating your first prompt.",
    actions: [{
      action: 'CREATE',
      text: 'Create prompt'
    }]
  }
}
