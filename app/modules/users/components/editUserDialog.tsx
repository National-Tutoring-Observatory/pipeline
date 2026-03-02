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
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import addDialog from "~/modules/dialogs/addDialog";
import type { User } from "../users.types";

const EditUserDialog = ({
  user,
  onUserUpdated,
}: {
  user: User;
  onUserUpdated: () => void;
}) => {
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const fetcher = useFetcher();

  const isSubmitting = fetcher.state !== "idle";
  const errors = fetcher.data?.errors;

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    if (!fetcher.data?.success) return;
    addDialog(null);
    onUserUpdated();
  }, [fetcher.state, fetcher.data]);

  const onSubmit = () => {
    fetcher.submit(
      JSON.stringify({
        intent: "UPDATE_USER",
        payload: { targetUserId: user._id, username, email },
      }),
      { method: "POST", encType: "application/json", action: "/admin/users" },
    );
  };

  const isSubmitButtonDisabled = isSubmitting || username.trim().length < 3;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit user</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            defaultValue={username}
            autoComplete="off"
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
          />
          {errors?.username && (
            <p className="text-destructive text-sm">{errors.username}</p>
          )}
          {!errors?.username &&
            username.trim().length > 0 &&
            username.trim().length < 3 && (
              <p className="text-destructive text-sm">
                Username must be at least 3 characters
              </p>
            )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={email}
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          {errors?.email && (
            <p className="text-destructive text-sm">{errors.email}</p>
          )}
        </div>
        {errors?.general && (
          <p className="text-destructive text-sm">{errors.general}</p>
        )}
      </div>
      <DialogFooter className="justify-end">
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="button"
          disabled={isSubmitButtonDisabled}
          onClick={onSubmit}
        >
          {isSubmitting ? "Saving..." : "Save user"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default EditUserDialog;
