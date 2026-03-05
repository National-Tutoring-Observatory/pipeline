import { FileText } from "lucide-react";

export default function getFilesEmptyAttributes() {
  return {
    icon: <FileText />,
    title: "No files yet",
    description: "Upload files to get started.",
  };
}
