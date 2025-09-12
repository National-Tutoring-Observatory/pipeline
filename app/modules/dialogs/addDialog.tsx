import type { ReactNode } from "react";
// @ts-ignore
let addModalDispatch;
// @ts-ignore
export const setDispatch = (dispatch) => {
  addModalDispatch = dispatch;
};

export default (component: ReactNode) => {
  // @ts-ignore
  addModalDispatch({ type: 'ADD', modal: { component } })
}