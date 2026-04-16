import { Checkbox } from "@/components/ui/checkbox";
import isNumber from "lodash/isNumber";
import isString from "lodash/isString";

export default function RunSessionViewerAnnotationValue({
  value,
}: {
  value: unknown;
}) {
  if (isString(value) || isNumber(value)) {
    return <div>{value}</div>;
  }

  return (
    <div>
      <Checkbox checked={value as boolean} />
    </div>
  );
}
