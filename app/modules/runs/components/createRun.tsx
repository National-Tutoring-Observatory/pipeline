import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { CreateRun, Run } from "~/modules/runs/runs.types";
import RunCreatorContainer from "../containers/runCreator.container";

export default function CreateRunComponent({
  breadcrumbs,
  onStartRunClicked,
  isSubmitting,
  initialRun,
  duplicateWarnings = [],
  avgSecondsPerSession,
  outputToInputRatio,
}: {
  breadcrumbs: Breadcrumb[];
  onStartRunClicked: (createRun: CreateRun) => void;
  isSubmitting: boolean;
  initialRun?: Run | null;
  duplicateWarnings?: string[];
  avgSecondsPerSession: number | null;
  outputToInputRatio: number | null;
}) {
  return (
    <div className="max-w-7xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <RunCreatorContainer
        onStartRunClicked={onStartRunClicked}
        isSubmitting={isSubmitting}
        initialRun={initialRun}
        duplicateWarnings={duplicateWarnings}
        avgSecondsPerSession={avgSecondsPerSession}
        outputToInputRatio={outputToInputRatio}
      />
    </div>
  );
}
