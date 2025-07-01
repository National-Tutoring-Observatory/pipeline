import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import { Link } from "react-router";
import type { PromptVersion } from "../prompts.types";
import clsx from "clsx";
import { Badge } from "@/components/ui/badge";

type PromptVersionItemProps = {
  name: string;
  version: number;
  prompt: number;
  createdAt: string;
  isSelected: boolean;
  isLatest: boolean;
};

export default function PromptVersionItem({ name, version, prompt, createdAt, isSelected, isLatest }: PromptVersionItemProps) {

  const className = clsx("block border-b last:border-b-0 p-2", {
    "bg-indigo-50": isSelected
  })

  return (
    <Link to={`/prompts/${prompt}/${version}`} className={className}>
      <div className="mb-2">
        <Badge variant="outline" className="bg-white">{`# ${version}`}</Badge>
        {(isLatest) && (
          <Badge variant="secondary" className="bg-indigo-100 ml-2">Latest</Badge>
        )}
      </div>
      <div className="text-sm text-black/40">
        {name}
      </div>
      <div className="text-xs text-black/40">
        {dayjs(createdAt).format('ddd, MMM D, YYYY - h:mm A')}
      </div>
    </Link>
  )
}