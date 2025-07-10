import { useEffect, useReducer } from "react";
import Breadcrumbs from "../components/breadcrumbs";
import { setDispatch } from "../updateBreadcrumb";

function breadcrumbsReducer(breadcrumbs: [], action: { type: string, breadcrumbs: [] }) {
  switch (action.type) {
    case 'UPDATE_BREADCRUMBS': {
      return breadcrumbs;
    }
    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}

export default function BreadcrumbsContainer() {

  const [breadcrumbs, dispatch] = useReducer(
    breadcrumbsReducer,
    []
  );

  useEffect(() => {
    setDispatch(dispatch);
  }, []);

  return (
    <Breadcrumbs
      breadcrumbs={breadcrumbs}
    />
  );
}