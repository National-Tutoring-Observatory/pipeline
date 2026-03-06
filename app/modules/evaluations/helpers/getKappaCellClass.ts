import getKappaInterpretation from "./getKappaInterpretation";

export default function getKappaCellClass(kappa: number): string {
  const interpretation = getKappaInterpretation(kappa);
  if (interpretation === "Almost Perfect" || interpretation === "Substantial") {
    return "bg-sandpiper-success/10 dark:bg-sandpiper-success/10";
  }
  if (interpretation === "Moderate") {
    return "bg-sandpiper-warning/10 dark:bg-sandpiper-warning/10";
  }
  return "bg-sandpiper-destructive/10 dark:bg-sandpiper-destructive/10";
}
