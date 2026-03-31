import { BotIcon, ScaleIcon, UserIcon } from "lucide-react";

export default function RunTypeIcon({
  isHuman,
  isAdjudication,
}: {
  isHuman: boolean;
  isAdjudication: boolean;
}) {
  if (isAdjudication) {
    return <ScaleIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />;
  }
  return isHuman ? (
    <UserIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
  ) : (
    <BotIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
  );
}
