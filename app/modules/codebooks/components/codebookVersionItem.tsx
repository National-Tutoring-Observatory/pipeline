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
    "bg-indigo-50": isSelected,
  });

  return (
    <Link
      to={`/codebooks/${codebook}/${version}`}
      replace
      className={className}
    >
      <div className="mb-2">
        <Badge variant="outline" className="bg-white">{`# ${version}`}</Badge>
        {isProduction && (
          <Badge variant="secondary" className="ml-2 bg-indigo-100">
            <BookCheck />
            Production
          </Badge>
        )}
      </div>
      <div className="text-sm text-black/40">{name}</div>
      <div className="text-xs text-black/40">{getDateString(createdAt)}</div>
    </Link>
  );
}
