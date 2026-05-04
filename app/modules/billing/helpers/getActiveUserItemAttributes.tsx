import type { CollectionItemAttributes } from "@/components/ui/collectionItemContent";
import { Building2, DollarSign, Mail } from "lucide-react";
import type { ActiveTeamRow } from "../services/getActiveTeams.server";

export default function getActiveUserItemAttributes(
  row: ActiveTeamRow,
): CollectionItemAttributes {
  const meta = [
    {
      text: `$${row.totalBilledCosts.toFixed(2)}`,
      icon: <DollarSign className="h-3 w-3" />,
    },
    {
      text: row.contactEmail,
      icon: <Mail className="h-3 w-3" />,
    },
  ];

  if (row.institution !== "--") {
    meta.push({
      text: row.institution,
      icon: <Building2 className="h-3 w-3" />,
    });
  }

  return {
    id: row.teamId,
    title: row.teamName,
    description: `Contact: ${row.contactName}`,
    meta,
  };
}
