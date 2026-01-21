import { useEffect, useReducer } from "react";
import Modal from "../components/modal";
import { setDispatch } from "../addDialog";
import type { Modal as ModalType } from "../dialogs.types";

function modalReducer(
  modal: ModalType,
  action: { type: string; modal?: ModalType },
): ModalType {
  switch (action.type) {
    case "ADD": {
      return {
        isOpen: true,
        component: action.modal?.component ?? null,
        onCloseModalClicked: action.modal?.onCloseModalClicked ?? (() => {}),
      };
    }
    case "REMOVE": {
      return {
        ...modal,
        isOpen: false,
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

export default function DialogContainer() {
  const [modal, dispatch] = useReducer(modalReducer, {
    isOpen: false,
    component: null,
    onCloseModalClicked: () => {},
  });

  useEffect(() => {
    setDispatch(dispatch);
  }, []);

  const onCloseModalClicked = () => {
    dispatch({ type: "REMOVE" });
  };

  return <Modal {...modal} onCloseModalClicked={onCloseModalClicked} />;
}
