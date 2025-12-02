import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import map from 'lodash/map';
import { Trash } from "lucide-react";
import React from "react";
import type { User } from "~/modules/users/users.types";
import type { FeatureFlag } from "../featureFlags.types";

export default function FeatureFlag({
  featureFlag,
  users,
  onAddUsersClicked,
  onRemoveUserFromFeatureFlagClicked,
  onDeleteFeatureFlagClicked
}: {
  featureFlag: FeatureFlag,
  users: User[],
  onAddUsersClicked: () => void,
  onRemoveUserFromFeatureFlagClicked: (userId: string) => void,
  onDeleteFeatureFlagClicked: () => void,
}) {
  return (
    <div className="w-full">
      <div className="px-4 py-2 border-b flex items-center justify-between">
        <div>
          {featureFlag.name}
        </div>
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
      <div>
        <ItemGroup className="p-4">
          {map(users, (user, index) => (
            <React.Fragment key={user._id}>
              <Item variant={"outline"}>
                <ItemContent className="gap-1">
                  <ItemTitle>{user.username}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onRemoveUserFromFeatureFlagClicked(user._id)}>
                    <Trash className="size-4" />
                  </Button>
                </ItemActions>
              </Item>
              {index !== users.length - 1 && <ItemSeparator />}
            </React.Fragment>
          ))}
        </ItemGroup>
      </div>
    </div>
  );
}
