import type { NextFunction, Request, Response } from "express";
import { userIsSuperAdmin } from "~/modules/authorization/helpers/superAdmin";
import { UserService } from "~/modules/users/user";
import sessionStorage from "../../../sessionStorage";
import maintenancePageHtml from "./helpers/maintenancePageHtml";
import { SystemSettingsService } from "./systemSettings";

const EXEMPT_PATHS = [
  "/assets/",
  "/socket.io/",
  "/api/sockets",
  "/api/webhooks/stripe",
];

function isExempt(path: string): boolean {
  return EXEMPT_PATHS.some((exempt) => path.startsWith(exempt));
}

export default async function maintenanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (isExempt(req.path)) return next();

  let settings;
  try {
    settings = await SystemSettingsService.getSettings();
  } catch {
    return next();
  }

  if (!settings.maintenanceMode) return next();

  try {
    const session = await sessionStorage.getSession(req.headers.cookie);
    const sessionUser = session.get("user");
    if (sessionUser?._id) {
      const user = await UserService.findById(sessionUser._id);
      if (userIsSuperAdmin(user)) return next();
    }
  } catch {
    // Session parsing failed — treat as non-admin
  }

  res
    .status(503)
    .set("Retry-After", "300")
    .send(maintenancePageHtml(settings.maintenanceMessage));
}
