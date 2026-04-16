import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { Outlet } from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import QueueTypeTabs, { type Queue } from "./queueTypeTabs";

const QueuesLayout = ({
  queues,
  breadcrumbs,
}: {
  queues: Queue[];
  breadcrumbs: Breadcrumb[];
}) => {
  return (
    <div className="max-w-7xl p-8">
      <PageHeader>
        <PageHeaderLeft>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </PageHeaderLeft>
      </PageHeader>
      <div className="mb-6">
        <QueueTypeTabs queues={queues} />
      </div>
      <Outlet />
    </div>
  );
};

export default QueuesLayout;
