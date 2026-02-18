import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import includes from "lodash/includes";
import { Copy, Edit, FolderPlus, ListPlus, Stamp, Trash2 } from "lucide-react";
import { useContext } from "react";
import { AuthenticationContext } from "~/modules/authentication/authentication.context";
import type { User } from "~/modules/users/users.types";

export default function useRunsItemActions(): () => CollectionItemAction[] {
  const authentication = useContext(AuthenticationContext) as User | null;
  const hasRunSets = includes(
    authentication?.featureFlags,
    "HAS_PROJECT_COLLECTIONS",
  );

  return (_item?: unknown): CollectionItemAction[] => {
    const actions: CollectionItemAction[] = [
      {
        action: "EDIT",
        icon: <Edit />,
        text: "Edit",
      },
      {
        action: "DUPLICATE",
        icon: <Copy />,
        text: "Duplicate",
      },
      {
        action: "DELETE",
        icon: <Trash2 />,
        text: "Delete",
        variant: "destructive",
      },
    ];

    if (hasRunSets) {
      actions.push(
        {
          action: "ADD_TO_EXISTING_RUN_SET",
          icon: <ListPlus />,
          text: "Add to Existing Run Set",
        },
        {
          action: "ADD_TO_NEW_RUN_SET",
          icon: <FolderPlus />,
          text: "Add to New Run Set",
        },
        {
          action: "USE_AS_RUN_SET_TEMPLATE",
          icon: <Stamp />,
          text: "Use as Run Set Template",
        },
      );
    }

    return actions;
  };
}
