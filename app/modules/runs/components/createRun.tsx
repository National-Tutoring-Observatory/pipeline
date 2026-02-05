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
}: {
  breadcrumbs: Breadcrumb[];
  onStartRunClicked: (createRun: CreateRun) => void;
  isSubmitting: boolean;
  initialRun?: Run | null;
}) {
  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <RunCreatorContainer
        onStartRunClicked={onStartRunClicked}
        isSubmitting={isSubmitting}
        initialRun={initialRun}
      />
    </div>
  );
}
