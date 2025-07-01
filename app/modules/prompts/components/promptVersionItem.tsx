import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import { Link } from "react-router";
import type { PromptVersion } from "../prompts.types";
import clsx from "clsx";

type PromptVersionItemProps = {
  name: string;
  version: number;
  prompt: number;
  createdAt: string;
  isSelected: boolean;
};

export default function PromptVersionItem({ name, version, prompt, createdAt, isSelected }: PromptVersionItemProps) {

  const className = clsx("block border-b last:border-b-0 p-2", {
    "bg-indigo-50": isSelected
  })

  return (
    <Link to={`/prompts/${prompt}/${version}`} className={className}>
      <div>
        {`# ${version}`}
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