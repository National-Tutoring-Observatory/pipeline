import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import type { CreateRun } from "~/modules/runs/runs.types";
import ProjectRunCreatorContainer from "../containers/projectRunCreator.container";

export default function ProjectCreateRun({
  breadcrumbs,
  runName,
  onRunNameChanged,
  onStartRunClicked,
}: {
  breadcrumbs: Breadcrumb[];
  runName: string;
  onRunNameChanged: (name: string) => void;
  onStartRunClicked: (createRun: CreateRun) => void;
}) {
  return (
    <div className="max-w-6xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <ProjectRunCreatorContainer
        runName={runName}
        onRunNameChanged={onRunNameChanged}
        onStartRunClicked={onStartRunClicked}
      />
    </div>
  );
}
