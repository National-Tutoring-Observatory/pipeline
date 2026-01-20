import { PageHeader, PageHeaderLeft } from "@/components/ui/pageHeader";
import { Outlet } from "react-router";
import type { Breadcrumb } from "~/modules/app/app.types";
import Breadcrumbs from "~/modules/app/components/breadcrumbs";
import QueueTypeTabs from "./queueTypeTabs";

const QueuesLayout = ({
  queues,
  breadcrumbs,
}: {
  queues: any,
  breadcrumbs: Breadcrumb[]
}) => {
  return (
    <div className="max-w-6xl p-8">
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
