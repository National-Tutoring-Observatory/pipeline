import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { useContext } from "react";
import { AuthenticationContext } from "~/modules/authentication/authentication.context";
import BillingAuthorization from "~/modules/billing/authorization";
import type {
  BalanceSummary,
  TeamCredit,
} from "~/modules/billing/billing.types";
import type {
  CostByModel,
  CostOverTime,
  SpendGranularity,
} from "~/modules/llmCosts/llmCosts.types";
import type { Team } from "~/modules/teams/teams.types";
import type { User } from "~/modules/users/users.types";
import BillingOverview from "./billingOverview";
import BillingSettings from "./billingSettings";
import CreditHistory from "./creditHistory";
import SpendAnalytics from "./spendAnalytics";

interface BillingUserInfo {
  _id: string;
  username: string;
}

interface PaginatedCredits {
  data: TeamCredit[];
  count: number;
  totalPages: number;
}

interface SpendAnalyticsData {
  byModel: Array<CostByModel & { modelName: string }>;
  bySource: Array<{ label: string; totalCost: number }>;
  overTime: CostOverTime[];
}

interface TeamBillingProps {
  balanceSummary: BalanceSummary | null;
  team: Team;
  credits: PaginatedCredits;
  billingUserInfo: BillingUserInfo | null;
  isSubmitting: boolean;
  creditsSearchValue: string;
  creditsCurrentPage: number;
  isCreditsSyncing: boolean;
  spendAnalytics: SpendAnalyticsData;
  spendGranularity: SpendGranularity;
  onSpendGranularityChanged: (value: SpendGranularity) => void;
  onCreditsSearchValueChanged: (value: string) => void;
  onCreditsPaginationChanged: (page: number) => void;
  onAddCreditsClicked: () => void;
  onAssignPlanClicked: () => void;
  onSetBillingUserClicked: () => void;
}

export default function TeamBilling({
  balanceSummary,
  team,
  credits,
  billingUserInfo,
  isSubmitting,
  creditsSearchValue,
  creditsCurrentPage,
  isCreditsSyncing,
  spendAnalytics,
  spendGranularity,
  onSpendGranularityChanged,
  onCreditsSearchValueChanged,
  onCreditsPaginationChanged,
  onAddCreditsClicked,
  onAssignPlanClicked,
  onSetBillingUserClicked,
}: TeamBillingProps) {
  const user = useContext(AuthenticationContext) as User | null;
  const canAssignPlan = BillingAuthorization.canAssignPlan(user);
  const canSetBillingUser = BillingAuthorization.canSetBillingUser(user);

  if (!balanceSummary) {
    return (
      <Card>
        <CardHeader className="items-center py-10">
          <CardDescription className="text-center">
            No billing plan assigned to this team.
            {canAssignPlan
              ? " Assign a billing plan to enable credits and usage tracking."
              : " A super admin must assign a billing plan before credits can be used."}
          </CardDescription>
          {canAssignPlan && (
            <Button
              className="mt-4 w-fit justify-self-center"
              onClick={onAssignPlanClicked}
            >
              Assign plan
            </Button>
          )}
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <BillingOverview
        balanceSummary={balanceSummary}
        team={team}
        isSubmitting={isSubmitting}
        onAddCreditsClicked={onAddCreditsClicked}
        onAssignPlanClicked={onAssignPlanClicked}
      />

      <SpendAnalytics
        byModel={spendAnalytics.byModel}
        bySource={spendAnalytics.bySource}
        overTime={spendAnalytics.overTime}
        granularity={spendGranularity}
        onGranularityChanged={onSpendGranularityChanged}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CreditHistory
          credits={credits}
          searchValue={creditsSearchValue}
          currentPage={creditsCurrentPage}
          isSyncing={isCreditsSyncing}
          onSearchValueChanged={onCreditsSearchValueChanged}
          onPaginationChanged={onCreditsPaginationChanged}
        />

        {canSetBillingUser && (
          <BillingSettings
            billingUserInfo={billingUserInfo}
            isSubmitting={isSubmitting}
            onSetBillingUserClicked={onSetBillingUserClicked}
          />
        )}
      </div>
    </div>
  );
}
