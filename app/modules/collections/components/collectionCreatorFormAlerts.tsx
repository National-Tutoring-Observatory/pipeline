import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { PrefillData } from "~/modules/collections/collections.types";

export default function CollectionFormAlerts({
  errors,
  prefillData,
}: {
  errors: Record<string, string>;
  prefillData?: PrefillData | null;
}) {
  return (
    <>
      {prefillData && (
        <Alert
          variant={
            prefillData.validationErrors?.length ? "destructive" : "default"
          }
        >
          <Info className="h-4 w-4" />
          <AlertTitle>Creating from template</AlertTitle>
          <AlertDescription>
            <p>
              Fields pre-filled from{" "}
              {prefillData.sourceCollectionName ? "collection" : "run"} "
              {prefillData.sourceCollectionName || prefillData.sourceRunName}".
              You can modify any field before creating.
            </p>
            {prefillData.validationErrors?.length ? (
              <ul className="mt-2 list-inside list-disc">
                {prefillData.validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-red-900">Errors</h3>
          <ul className="space-y-1 text-sm text-red-700">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
