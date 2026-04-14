import { Dialog } from "@/components/ui/dialog";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { Modal } from "../dialogs.types";

export default function Modal({
  isOpen,
  component,
  onCloseModalClicked,
}: Modal) {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Capture the trigger element when the dialog opens. useLayoutEffect fires
  // synchronously after the DOM commits but before Radix's useEffect moves
  // focus into the dialog — so activeElement is still the trigger button.
  // Radix can't handle this automatically because dialogs here are opened
  // imperatively (no <DialogTrigger>), so it has no trigger ref.
  useLayoutEffect(() => {
    if (isOpen) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && returnFocusRef.current) {
      returnFocusRef.current.focus();
      returnFocusRef.current = null;
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCloseModalClicked();
      }}
    >
      {component}
    </Dialog>
  );
}
