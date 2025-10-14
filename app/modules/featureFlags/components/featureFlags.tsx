import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import React from "react";
import { Link, Outlet } from "react-router";
import map from 'lodash/map';
import type { FeatureFlag } from "../featureFlags.types";
import { ChevronRight, PlusIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function FeatureFlags({
  featureFlags,
  onCreateFeatureFlagButtonClicked
}: {
  featureFlags: FeatureFlag[],
  onCreateFeatureFlagButtonClicked: () => void
}) {
  return (
    <div className="max-w-6xl p-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance mb-8">
        Feature flags
      </h1>
      <div>
        <div className="flex justify-end p-2">
          <Button onClick={onCreateFeatureFlagButtonClicked}>Create feature flag</Button>
        </div>
        <div className="border rounded-lg flex relative">
          <ItemGroup className="w-1/3">
            {map(featureFlags, (featureFlag, index) => (
              <React.Fragment key={featureFlag._id}>
                <Item>
                  <ItemContent className="gap-1">
                    <ItemTitle>{featureFlag.name}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Button variant="ghost" size="icon" className="rounded-full" asChild>
                      <Link to={`/featureFlags/${featureFlag._id}`}>
                        <ChevronRight className="size-4" />
                      </Link>
                    </Button>
                  </ItemActions>
                </Item>
                {index !== featureFlags.length - 1 && <ItemSeparator />}
              </React.Fragment>
            ))}
          </ItemGroup>
          <Separator orientation="vertical" className="h-full absolute left-1/3" />
          <div className="w-2/3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}