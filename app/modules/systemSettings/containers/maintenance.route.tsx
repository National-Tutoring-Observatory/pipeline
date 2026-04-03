import { useEffect, useState } from "react";
import { data, redirect, useFetcher } from "react-router";
import { toast } from "sonner";
import { AuditService } from "~/modules/audits/audit";
import getSessionUser from "~/modules/authentication/helpers/getSessionUser";
import SystemAdminAuthorization from "~/modules/authorization/systemAdminAuthorization";
import Maintenance from "../components/maintenance";
import { SystemSettingsService } from "../systemSettings";
import type { Route } from "./+types/maintenance.route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser({ request });
  if (!user || !SystemAdminAuthorization.Maintenance.canManage(user)) {
    return redirect("/");
  }

  const settings = await SystemSettingsService.getSettings();

  return { settings };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getSessionUser({ request });
  if (!user || !SystemAdminAuthorization.Maintenance.canManage(user)) {
    return data({ errors: { general: "Access denied" } }, { status: 403 });
  }

  const { intent, payload } = await request.json();

  if (intent === "TOGGLE_MAINTENANCE") {
    const { maintenanceMode, maintenanceMessage } = payload;

    const settings = await SystemSettingsService.update({
      maintenanceMode: Boolean(maintenanceMode),
      maintenanceMessage: maintenanceMessage || "",
      updatedAt: new Date().toISOString(),
      updatedBy: user._id,
    });

    await AuditService.create({
      action: maintenanceMode ? "ENABLE_MAINTENANCE" : "DISABLE_MAINTENANCE",
      performedBy: user._id,
      performedByUsername: user.username,
      context: { maintenanceMessage: maintenanceMessage || "" },
    });

    return data({ success: true, intent: "TOGGLE_MAINTENANCE", settings });
  }

  return data({ errors: { general: "Invalid intent" } }, { status: 400 });
}

export default function MaintenanceRoute({ loaderData }: Route.ComponentProps) {
  const { settings } = loaderData;
  const fetcher = useFetcher();

  const savedSettings =
    fetcher.data && "success" in fetcher.data && fetcher.data.success
      ? fetcher.data.settings
      : null;

  const [maintenanceMode, setMaintenanceMode] = useState(
    settings.maintenanceMode,
  );
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    settings.maintenanceMessage,
  );

  const updatedAt = savedSettings?.updatedAt ?? settings.updatedAt;
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    if ("success" in fetcher.data && fetcher.data.success) {
      toast.success(
        fetcher.data.settings.maintenanceMode
          ? "Maintenance mode enabled"
          : "Maintenance mode disabled",
      );
    } else if (fetcher.data.errors) {
      toast.error(fetcher.data.errors.general || "An error occurred");
    }
  }, [fetcher.state, fetcher.data]);

  const submitToggle = () => {
    fetcher.submit(
      JSON.stringify({
        intent: "TOGGLE_MAINTENANCE",
        payload: { maintenanceMode, maintenanceMessage },
      }),
      { method: "POST", encType: "application/json" },
    );
  };

  const breadcrumbs = [{ text: "Maintenance" }];

  return (
    <Maintenance
      maintenanceMode={maintenanceMode}
      maintenanceMessage={maintenanceMessage}
      updatedAt={updatedAt}
      isSubmitting={isSubmitting}
      breadcrumbs={breadcrumbs}
      onMaintenanceModeChanged={setMaintenanceMode}
      onMaintenanceMessageChanged={setMaintenanceMessage}
      onSaveClicked={submitToggle}
    />
  );
}
