import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import getDateString from "~/modules/app/helpers/getDateString";
import getMonthYearString from "~/modules/app/helpers/getMonthYearString";
import type { BillingPeriod } from "~/modules/billing/billing.types";

interface BillingPeriodHistoryProps {
  periods: BillingPeriod[];
}

export default function BillingPeriodHistory({
  periods,
}: BillingPeriodHistoryProps) {
  if (periods.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Period History</CardTitle>
        <CardDescription>
          Closed billing periods and their locked balances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead className="text-right">Billed</TableHead>
              <TableHead className="text-right">Closing Balance</TableHead>
              <TableHead className="text-right">Closed On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period) => (
              <TableRow key={period._id}>
                <TableCell className="font-medium">
                  {getMonthYearString(period.startAt)}
                </TableCell>
                <TableCell className="text-right">
                  ${(period.rawCost ?? 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  ${(period.billedAmount ?? 0).toFixed(2)}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    (period.closingBalance ?? 0) < 0 ? "text-destructive" : ""
                  }`}
                >
                  ${(period.closingBalance ?? 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-muted-foreground text-right">
                  {getDateString(period.closedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
