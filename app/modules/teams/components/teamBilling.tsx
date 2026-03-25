import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import type { BillingAuthorizationShape } from "~/modules/billing/authorization";
import type {
  BalanceSummary,
  TeamCredit,
} from "~/modules/billing/billing.types";
import BillingOverview from "./billingOverview";
import BillingSettings from "./billingSettings";
import CreditHistory from "./creditHistory";

interface BillingUserInfo {
  _id: string;
  username: string;
}

interface PaginatedCredits {
  data: TeamCredit[];
  count: number;
  totalPages: number;
}

interface TeamBillingProps {
  balanceSummary: BalanceSummary | null;
  credits: PaginatedCredits;
  billingUserInfo: BillingUserInfo | null;
  authorization: BillingAuthorizationShape;
  isSubmitting: boolean;
  isLoadingMembers: boolean;
  creditsSearchValue: string;
  creditsCurrentPage: number;
  isCreditsSyncing: boolean;
  onCreditsSearchValueChanged: (value: string) => void;
  onCreditsPaginationChanged: (page: number) => void;
  onAddCreditsClicked: () => void;
  onSetBillingUserClicked: () => void;
}

export default function TeamBilling({
  balanceSummary,
  credits,
  billingUserInfo,
  authorization,
  isSubmitting,
  isLoadingMembers,
  creditsSearchValue,
  creditsCurrentPage,
  isCreditsSyncing,
  onCreditsSearchValueChanged,
  onCreditsPaginationChanged,
  onAddCreditsClicked,
  onSetBillingUserClicked,
}: TeamBillingProps) {
  if (!balanceSummary) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>
            No billing plan assigned to this team. A super admin must assign a
            billing plan before credits can be used.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <BillingOverview
        balanceSummary={balanceSummary}
        canAddCredits={authorization.canAddCredits}
        isSubmitting={isSubmitting}
        onAddCreditsClicked={onAddCreditsClicked}
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

        {authorization.canSetBillingUser && (
          <BillingSettings
            billingUserInfo={billingUserInfo}
            authorization={authorization}
            isSubmitting={isSubmitting}
            isLoadingMembers={isLoadingMembers}
            onSetBillingUserClicked={onSetBillingUserClicked}
          />
        )}
      </div>
    </div>
  );
}
