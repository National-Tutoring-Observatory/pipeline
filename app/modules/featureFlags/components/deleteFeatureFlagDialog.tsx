import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { FeatureFlag } from "../featureFlags.types";

const DeleteFeatureFlagDialog = ({
  featureFlag,
  onDeleteFeatureFlagClicked,
  isSubmitting = false,
}: {
  featureFlag: FeatureFlag;
  onDeleteFeatureFlagClicked: () => void;
  isSubmitting?: boolean;
}) => {
  const [flagName, setFlagName] = useState("");

  let isDeleteButtonDisabled = isSubmitting || flagName !== featureFlag.name;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete feature flag - {featureFlag.name}</DialogTitle>
        <DialogDescription>THIS ACTION IS IRREVERSIBLE.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3">
        <Label htmlFor="name-1">
          To confirm delete, type in the feature flag name.
        </Label>
        <div className="relative">
          <Input
            className="absolute left-0 top-0"
            placeholder={featureFlag.name}
            disabled={true}
            autoComplete="off"
          />
          <Input
            className="focus-visible:border-destructive focus-visible:ring-destructive/50"
            id="name-1"
            name="name"
            value={flagName}
            autoComplete="off"
            onChange={(event) => setFlagName(event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFlagName("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            type="button"
            disabled={isDeleteButtonDisabled}
            variant="destructive"
            onClick={() => {
              onDeleteFeatureFlagClicked();
              setFlagName("");
            }}
          >
            {isSubmitting ? "Deleting..." : "Delete feature flag"}
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default DeleteFeatureFlagDialog;
