export default function getKappaInterpretation(kappa: number): string {
  if (kappa < 0) return "Poor";
  if (kappa <= 0.2) return "Slight";
  if (kappa <= 0.4) return "Fair";
  if (kappa <= 0.6) return "Moderate";
  if (kappa <= 0.8) return "Substantial";
  return "Almost Perfect";
}
