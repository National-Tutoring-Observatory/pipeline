import mongoose from "mongoose";
import systemSettingsSchema from "~/lib/schemas/systemSettings.schema";
import type { SystemSettings } from "./systemSettings.types";

const SystemSettingsModel =
  mongoose.models.SystemSettings ||
  mongoose.model("SystemSettings", systemSettingsSchema);

let cache: { value: SystemSettings; expiresAt: number } | null = null;
const CACHE_TTL_MS = 5000;

export class SystemSettingsService {
  private static toSystemSettings(doc: mongoose.Document): SystemSettings {
    return doc.toJSON({ flattenObjectIds: true }) as SystemSettings;
  }

  static async getSettings(): Promise<SystemSettings> {
    const now = Date.now();
    if (cache && now < cache.expiresAt) return cache.value;
    const doc = await SystemSettingsModel.findOneAndUpdate(
      {},
      { $setOnInsert: { maintenanceMode: false, maintenanceMessage: "" } },
      { upsert: true, new: true },
    );
    const settings = this.toSystemSettings(doc);
    cache = { value: settings, expiresAt: now + CACHE_TTL_MS };
    return settings;
  }

  static async update(
    data: Partial<Omit<SystemSettings, "_id">>,
  ): Promise<SystemSettings> {
    const doc = await SystemSettingsModel.findOneAndUpdate({}, data, {
      upsert: true,
      new: true,
    });
    cache = null;
    return this.toSystemSettings(doc);
  }

  static async isMaintenanceMode(): Promise<boolean> {
    return (await this.getSettings()).maintenanceMode;
  }
}
