import { getAllMigrations } from "./registry";
import { MigrationRunService } from "./migrationRun";

export class MigrationService {
  static async allWithStatus() {
    const [migrations, runsData] = await Promise.all([
      getAllMigrations(),
      MigrationRunService.allWithRunStatus(),
    ]);

    const dataByMigrationId = new Map(runsData.map((r) => [r.migrationId, r]));

    return migrations.map((migration: any) => {
      const data = dataByMigrationId.get(migration.id);
      return {
        ...migration,
        status: data?.status || "pending",
        lastRun: data?.lastRun || null,
      };
    });
  }
}
