import type { Db } from "mongodb";

export type MigrationResult = {
  success: boolean;
  message: string;
  stats?: Record<string, number>;
};

export type MigrationFile = {
  id: string;
  name: string;
  description: string;
  up: (db: Db) => Promise<MigrationResult>;
};

export type MigrationStatus = "pending" | "running" | "completed" | "failed";

export type Migration = {
  _id: string;
  migrationId: string;
  status: MigrationStatus;
  startedAt: Date;
  completedAt?: Date;
  triggeredBy: string;
  jobId: string;
  result?: MigrationResult;
  error?: string;
};
