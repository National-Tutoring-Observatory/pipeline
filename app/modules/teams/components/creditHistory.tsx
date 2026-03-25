import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collection } from "@/components/ui/collection";
import getDateString from "~/modules/app/helpers/getDateString";
import type { TeamCredit } from "~/modules/billing/billing.types";

interface PaginatedCredits {
  data: TeamCredit[];
  count: number;
  totalPages: number;
}

interface CreditHistoryProps {
  credits: PaginatedCredits;
  searchValue: string;
  currentPage: number;
  isSyncing: boolean;
  onSearchValueChanged: (value: string) => void;
  onPaginationChanged: (page: number) => void;
}

function getCreditItemAttributes(credit: TeamCredit) {
  return {
    id: credit._id,
    title: `$${credit.amount.toFixed(2)}`,
    description: credit.note || undefined,
    meta: [{ text: getDateString(credit.createdAt) }],
  };
}

export default function CreditHistory({
  credits,
  searchValue,
  currentPage,
  isSyncing,
  onSearchValueChanged,
  onPaginationChanged,
}: CreditHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Credit history</CardTitle>
      </CardHeader>
      <CardContent>
        <Collection
          items={credits.data}
          itemsLayout="list"
          hasSearch
          hasPagination
          searchValue={searchValue}
          currentPage={currentPage}
          totalPages={credits.totalPages}
          isSyncing={isSyncing}
          filters={[]}
          filtersValues={{}}
          onSortValueChanged={() => {}}
          emptyAttributes={{
            title: "No credits added yet",
            description: "Add credits to get started.",
          }}
          getItemAttributes={getCreditItemAttributes}
          getItemActions={() => []}
          onSearchValueChanged={onSearchValueChanged}
          onPaginationChanged={onPaginationChanged}
          onActionClicked={() => {}}
        />
      </CardContent>
    </Card>
  );
}
