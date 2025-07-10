import type { ReactNode } from "react";
// @ts-ignore
let updateBreadcrumbDispatch;
// @ts-ignore
export const setDispatch = (dispatch) => {
  updateBreadcrumbDispatch = dispatch;
};

export default (breadcrumbs: []) => {
  // @ts-ignore
  updateBreadcrumbDispatch({ type: 'UPDATE_BREADCRUMBS', breadcrumbs })
}