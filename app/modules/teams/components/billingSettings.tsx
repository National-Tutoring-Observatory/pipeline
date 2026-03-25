import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings, User } from "lucide-react";
import type { BillingAuthorizationShape } from "~/modules/billing/authorization";

interface BillingUserInfo {
  _id: string;
  username: string;
}

interface BillingSettingsProps {
  billingUserInfo: BillingUserInfo | null;
  authorization: BillingAuthorizationShape;
  isSubmitting: boolean;
  isLoadingMembers: boolean;
  onSetBillingUserClicked: () => void;
}

export default function BillingSettings({
  billingUserInfo,
  authorization,
  isSubmitting,
  isLoadingMembers,
  onSetBillingUserClicked,
}: BillingSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <Settings className="mr-1 inline h-4 w-4" />
          Billing settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-muted-foreground text-xs">Billing user</Label>
          <div className="mt-1 flex items-center gap-2">
            <User className="text-muted-foreground h-4 w-4" />
            <span className="text-sm">
              {billingUserInfo?.username ?? "Not assigned"}
            </span>
            {authorization.canSetBillingUser && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onSetBillingUserClicked}
                disabled={isSubmitting || isLoadingMembers}
              >
                {isLoadingMembers ? "Loading..." : "Change"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
