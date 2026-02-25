import useHasFeatureFlag from "../hooks/useHasFeatureFlag";

export default function Flag({
  flag,
  children,
}: {
  flag: string;
  children: React.ReactElement;
}) {
  const hasFlag = useHasFeatureFlag(flag);

  if (hasFlag) {
    return children;
  }

  return null;
}
