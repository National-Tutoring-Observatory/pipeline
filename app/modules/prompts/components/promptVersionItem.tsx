import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import { Link } from "react-router";
import type { PromptVersion } from "../prompts.types";

export default function PromptVersionItem({ name, version, prompt, createdAt }: PromptVersion) {
  return (
    <Link to={`/prompts/${prompt}/${version}`} className="block border-b last:border-b-0 p-2">
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