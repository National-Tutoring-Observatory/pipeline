import type { Breadcrumb } from "./app.types";
// @ts-ignore
let updateBreadcrumbDispatch = () => {};
// @ts-ignore
export const setDispatch = (dispatch) => {
  updateBreadcrumbDispatch = dispatch;
};

export default (breadcrumbs: Breadcrumb[]) => {
  // @ts-ignore
  updateBreadcrumbDispatch({ type: "UPDATE_BREADCRUMBS", breadcrumbs });
};
