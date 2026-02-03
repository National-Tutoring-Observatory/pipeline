import type { CollectionItemAction } from "@/components/ui/collectionContentItem";
import includes from "lodash/includes";
import { Copy, Edit, FolderPlus, ListPlus } from "lucide-react";
import { useContext } from "react";
import { AuthenticationContext } from "~/modules/authentication/containers/authentication.container";
import type { User } from "~/modules/users/users.types";

export default function useProjectRunsItemActions(): () => CollectionItemAction[] {
  const authentication = useContext(AuthenticationContext) as User | null;
  const hasCollections = includes(
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
    ];

    if (hasCollections) {
      actions.push(
        {
          action: "ADD_TO_COLLECTION",
          icon: <ListPlus />,
          text: "Add to Collection",
        },
        {
          action: "CREATE_COLLECTION",
          icon: <FolderPlus />,
          text: "Create Collection",
        },
      );
    }

    return actions;
  };
}
