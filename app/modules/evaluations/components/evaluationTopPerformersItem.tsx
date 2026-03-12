import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotIcon, UserIcon } from "lucide-react";
import getKappaCellClass from "../helpers/getKappaCellClass";
import getKappaInterpretation from "../helpers/getKappaInterpretation";
import type { TopPerformer } from "../helpers/getTopPerformersVsGoldLabel";

export default function EvaluationTopPerformersItem({
  performer,
}: {
  performer: TopPerformer;
}) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {performer.rank}
          </div>
          <div className="min-w-0 flex-1">
            <CardHeader className="p-0">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                {performer.isHuman ? (
                  <UserIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                ) : (
                  <BotIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                )}
                {performer.runName}
              </CardTitle>
            </CardHeader>
            <div className="text-muted-foreground text-xs">
              {performer.sampleSize} samples
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <div className="text-muted-foreground text-xs">
              {`Cohen's Kappa`}
            </div>
            <div className="text-sm font-semibold">
              {performer.kappa.toFixed(2)}
            </div>
          </div>
          <Badge
            variant="outline"
            className={getKappaCellClass(performer.kappa)}
          >
            {getKappaInterpretation(performer.kappa)}
          </Badge>
        </div>
        {performer.precision != null &&
          performer.recall != null &&
          performer.f1 != null && (
            <div className="flex items-center gap-3">
              <div>
                <div className="text-muted-foreground text-xs">Precision</div>
                <div className="text-sm font-semibold">
                  {performer.precision.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">Recall</div>
                <div className="text-sm font-semibold">
                  {performer.recall.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs">F1</div>
                <div className="text-sm font-semibold">
                  {performer.f1.toFixed(2)}
                </div>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
