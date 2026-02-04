import { StatItem } from "@/components/ui/stat-item";
import type { Collection } from "../collections.types";

interface CollectionCreateRunsInfoProps {
  collection: Collection;
}

export default function CollectionCreateRunsInfo({
  collection,
}: CollectionCreateRunsInfoProps) {
  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <h3 className="mb-4 text-sm font-semibold">Collection Info</h3>
      <div className="grid grid-cols-2 gap-4">
        <StatItem label="Name">{collection.name}</StatItem>
        <StatItem label="Annotation Type">
          {collection.annotationType === "PER_UTTERANCE"
            ? "Per Utterance"
            : "Per Session"}
        </StatItem>
        <StatItem label="Sessions">{collection.sessions?.length || 0}</StatItem>
        <StatItem label="Existing Runs">
          {collection.runs?.length || 0}
        </StatItem>
      </div>
    </div>
  );
}
