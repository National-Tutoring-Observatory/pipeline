import { Play } from "lucide-react"

export default () => {
  return {
    icon: <Play />,
    title: 'No Runs yet',
    description: "You haven't created any runs yet. Get started by creating your first run.",
    actions: [{
      action: 'CREATE',
      text: 'Create run'
    }]
  }
}
