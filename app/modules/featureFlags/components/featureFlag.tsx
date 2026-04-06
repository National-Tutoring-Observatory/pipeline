import { Button } from "@/components/ui/button";
import { Collection } from "@/components/ui/collection";
import type { CollectionItemAction } from "@/components/ui/collectionItemContent";
import { Trash, Users } from "lucide-react";
import type { User } from "~/modules/users/users.types";
import type { FeatureFlag } from "../featureFlags.types";

export default function FeatureFlag({
  featureFlag,
  users,
  onAddUsersClicked,
  onRemoveUserFromFeatureFlagClicked,
  onDeleteFeatureFlagClicked,
}: {
  featureFlag: FeatureFlag;
  users: User[];
  onAddUsersClicked: () => void;
  onRemoveUserFromFeatureFlagClicked: (userId: string) => void;
  onDeleteFeatureFlagClicked: () => void;
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div>{featureFlag.name}</div>
        <div>
          <Button
            variant="secondary"
            className="cursor-pointer"
            onClick={onAddUsersClicked}
          >
            Add users
          </Button>
          <Button
            variant="destructive"
            className="ml-2"
            onClick={onDeleteFeatureFlagClicked}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className="p-4">
        <Collection
          items={users}
          itemsLayout="list"
          emptyAttributes={{
            icon: <Users />,
            title: "No users",
            description: "No users have been added to this feature flag",
            actions: [],
          }}
          getItemAttributes={(user: User) => ({
            id: user._id,
            title: user.name || user.username,
            meta: [
              { text: [user.email, user.username].filter(Boolean).join(" · ") },
            ],
          })}
          getItemActions={(): CollectionItemAction[] => [
            {
              action: "REMOVE",
              text: "Remove",
              icon: <Trash className="size-4" />,
              variant: "destructive",
            },
          ]}
          currentPage={1}
          totalPages={1}
          filters={[]}
          filtersValues={{}}
          onPaginationChanged={() => {}}
          onFiltersValueChanged={() => {}}
          onSortValueChanged={() => {}}
          onItemActionClicked={({ id, action }) => {
            if (action === "REMOVE") {
              onRemoveUserFromFeatureFlagClicked(id);
            }
          }}
          onActionClicked={() => {}}
        />
      </div>
    </div>
  );
}
