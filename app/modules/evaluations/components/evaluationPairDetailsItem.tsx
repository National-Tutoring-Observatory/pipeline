import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import getKappaCellClass from "../helpers/getKappaCellClass";
import getKappaInterpretation from "../helpers/getKappaInterpretation";
import type { PairDetail } from "../helpers/getPairDetails";

export default function EvaluationPairDetailsItem({
  pair,
}: {
  pair: PairDetail;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">
            {pair.runAName} vs {pair.runBName}
          </div>
          <div className="text-muted-foreground text-xs">
            {pair.sampleSize} samples
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{`κ = ${pair.kappa.toFixed(2)}`}</Badge>
          <Badge variant="outline" className={getKappaCellClass(pair.kappa)}>
            {getKappaInterpretation(pair.kappa)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
