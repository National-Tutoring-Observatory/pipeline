import { Dialog } from "@/components/ui/dialog";
import type { Modal } from "../dialogs.types";

export default function Modal({ isOpen, component, onCloseModalClicked }: Modal) {
  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => {
      if (!isOpen) onCloseModalClicked();
    }}>
      {(isOpen) && (component)}
    </Dialog>
  )
}