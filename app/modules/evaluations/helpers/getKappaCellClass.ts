import getKappaInterpretation from "./getKappaInterpretation";

export default function getKappaCellClass(kappa: number): string {
  const interpretation = getKappaInterpretation(kappa);
  if (interpretation === "Almost Perfect" || interpretation === "Substantial") {
    return "bg-green-50 dark:bg-green-950/30";
  }
  if (interpretation === "Moderate") {
    return "bg-amber-50 dark:bg-amber-950/30";
  }
  return "bg-red-50 dark:bg-red-950/30";
}
