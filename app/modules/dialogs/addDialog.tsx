import type { Dispatch, ReactNode } from "react";
import type { Modal } from "./dialogs.types";

type ModalAction = { type: string; modal?: Partial<Modal> };

let addModalDispatch: Dispatch<ModalAction> | null = null;

export const setDispatch = (dispatch: Dispatch<ModalAction>) => {
  addModalDispatch = dispatch;
};

export default function addDialog(component: ReactNode) {
  addModalDispatch?.({ type: "ADD", modal: { component } });
}
