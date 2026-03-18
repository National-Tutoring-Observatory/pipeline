import { Badge } from "@/components/ui/badge";
import clsx from "clsx";
import { BookCheck } from "lucide-react";
import { Link } from "react-router";
import getDateString from "~/modules/app/helpers/getDateString";
import type { Codebook } from "../codebooks.types";

type CodebookVersionItemProps = {
  name: string;
  version: number;
  codebook: Codebook | string;
  createdAt: string;
  isSelected: boolean;
  isProduction: boolean;
};

export default function CodebookVersionItem({
  name,
  version,
  codebook,
  createdAt,
  isSelected,
  isProduction,
}: CodebookVersionItemProps) {
  const className = clsx("block border-b p-2", {
    "bg-sandpiper-accent/10": isSelected,
  });

  return (
    <Link
      to={`/codebooks/${codebook}/${version}`}
      replace
      className={className}
    >
      <div className="mb-2">
        <Badge
          variant="outline"
          className="bg-background"
        >{`# ${version}`}</Badge>
        {isProduction && (
          <Badge variant="secondary" className="bg-sandpiper-accent/15 ml-2">
            <BookCheck />
            Production
          </Badge>
        )}
      </div>
      <div className="text-muted-foreground text-sm">{name}</div>
      <div className="text-muted-foreground text-xs">
        {getDateString(createdAt)}
      </div>
    </Link>
  );
}
