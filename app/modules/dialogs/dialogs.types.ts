import type { ReactNode } from "react";

export interface Modal {
  isOpen: boolean;
  component: ReactNode;
  onCloseModalClicked: () => void;
}
