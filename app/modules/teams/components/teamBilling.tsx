import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import type { BillingData } from "~/modules/llm/llmBilling.types";

interface TeamBillingProps {
  billing: BillingData;
}

export default function TeamBilling({ billing }: TeamBillingProps) {
  if (billing.error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Billing data unavailable</AlertTitle>
        <AlertDescription>{billing.error}</AlertDescription>
      </Alert>
    );
  }

  if (!billing.tagSpend) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>
            No billing data found for this team.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardDescription>Total Spend</CardDescription>
          <CardTitle className="text-2xl">
            ${billing.tagSpend.totalSpend.toFixed(4)}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Total Requests</CardDescription>
          <CardTitle className="text-2xl">
            {billing.tagSpend.logCount.toLocaleString()}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
