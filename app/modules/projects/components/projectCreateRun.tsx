import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { CreateRun, Run } from "~/modules/runs/runs.types";
import ProjectRunCreatorContainer from "../containers/projectRunCreator.container";

export default function ProjectCreateRun({
  breadcrumbs,
  onStartRunClicked,
  initialRun,
}: {
  breadcrumbs: Breadcrumb[];
  onStartRunClicked: (createRun: CreateRun) => void;
  initialRun?: Run | null;
}) {
  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <ProjectRunCreatorContainer
        onStartRunClicked={onStartRunClicked}
        initialRun={initialRun}
      />
    </div>
  );
}
