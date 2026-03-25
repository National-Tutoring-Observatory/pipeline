import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Plus } from "lucide-react";
import type { BalanceSummary } from "~/modules/billing/billing.types";

interface BillingOverviewProps {
  balanceSummary: BalanceSummary;
  canAddCredits: boolean;
  isSubmitting: boolean;
  onAddCreditsClicked: () => void;
}

export default function BillingOverview({
  balanceSummary,
  canAddCredits,
  isSubmitting,
  onAddCreditsClicked,
}: BillingOverviewProps) {
  const isLowBalance = balanceSummary.balance < 1 && balanceSummary.balance > 0;
  const isNegativeBalance = balanceSummary.balance <= 0;

  return (
    <>
      {isNegativeBalance && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Insufficient credits</AlertTitle>
          <AlertDescription>
            Your team has no remaining credits. LLM calls will be blocked until
            credits are added.
          </AlertDescription>
        </Alert>
      )}

      {isLowBalance && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Low balance</AlertTitle>
          <AlertDescription>
            Your team balance is below $1. Add credits to avoid service
            interruption.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Balance</CardDescription>
            <CardTitle
              className={`text-2xl ${isNegativeBalance ? "text-destructive" : isLowBalance ? "text-yellow-600" : ""}`}
            >
              ${balanceSummary.balance.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Credits Added</CardDescription>
            <CardTitle className="text-2xl">
              ${balanceSummary.credits.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Usage (with markup)</CardDescription>
            <CardTitle className="text-2xl">
              ${balanceSummary.markedUpCosts.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Plan</CardDescription>
            <CardTitle className="text-2xl">
              {balanceSummary.plan.name}
            </CardTitle>
            <CardDescription>
              {((balanceSummary.plan.markupRate - 1) * 100).toFixed(0)}% markup
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {canAddCredits && (
        <Button onClick={onAddCreditsClicked} disabled={isSubmitting}>
          <Plus className="mr-1 h-4 w-4" />
          Add credits
        </Button>
      )}
    </>
  );
}
