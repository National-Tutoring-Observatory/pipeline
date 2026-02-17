export default function calculateCohensKappa(
  labelsA: string[],
  labelsB: string[],
): number {
  if (labelsA.length === 0 || labelsB.length === 0) return 0;
  if (labelsA.length !== labelsB.length) return 0;

  const totalItems = labelsA.length;

  const categories = [...new Set([...labelsA, ...labelsB])];

  const frequencyA: Record<string, number> = {};
  const frequencyB: Record<string, number> = {};
  let agreementCount = 0;

  for (const category of categories) {
    frequencyA[category] = 0;
    frequencyB[category] = 0;
  }

  for (let index = 0; index < totalItems; index++) {
    frequencyA[labelsA[index]]++;
    frequencyB[labelsB[index]]++;
    if (labelsA[index] === labelsB[index]) {
      agreementCount++;
    }
  }

  const observedAgreement = agreementCount / totalItems;

  let expectedAgreement = 0;
  for (const category of categories) {
    expectedAgreement +=
      (frequencyA[category] / totalItems) *
      (frequencyB[category] / totalItems);
  }

  if (expectedAgreement === 1) return 1;

  return (observedAgreement - expectedAgreement) / (1 - expectedAgreement);
}
