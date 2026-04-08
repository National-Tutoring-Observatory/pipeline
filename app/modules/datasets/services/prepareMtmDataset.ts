import { parse } from "csv-parse/sync";
import { encode } from "gpt-tokenizer";
import getConversationFromJSON from "~/modules/sessions/helpers/getConversationFromJSON";
import type { SessionFile } from "~/modules/sessions/sessions.types";
import getStorageAdapter from "~/modules/storage/helpers/getStorageAdapter";
import type { MtmManifest, MtmManifestSession } from "../datasets.types";
import {
  getDatasetDir,
  getDatasetLatestPath,
  getDatasetManifestPath,
  getDatasetSessionPath,
} from "../helpers/getDatasetStoragePath";

export interface PrepareMtmDatasetResult {
  sessionCount: number;
  failedCount: number;
  totalUtterances: number;
}

function detectLeadRole(roles: string[]): string {
  const nonStudentRoles = roles.filter((r) => r.toLowerCase() !== "student");
  return nonStudentRoles[0] || roles[0];
}

function parseRows(
  fileContent: string,
  format: "csv" | "jsonl",
): Map<string, Record<string, string>[]> {
  const sessionMap = new Map<string, Record<string, string>[]>();

  if (format === "jsonl") {
    for (const line of fileContent.split("\n")) {
      if (!line.trim()) continue;
      const row = JSON.parse(line) as Record<string, string>;
      const sessionId = row.session_id;
      if (!sessionId) throw new Error('JSONL record missing "session_id"');
      if (!sessionMap.has(sessionId)) sessionMap.set(sessionId, []);
      sessionMap.get(sessionId)!.push(row);
    }
  } else {
    const rows = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
    }) as Record<string, string>[];

    for (const row of rows) {
      const sessionId = row.session_id;
      if (!sessionMap.has(sessionId)) sessionMap.set(sessionId, []);
      sessionMap.get(sessionId)!.push(row);
    }
  }

  return sessionMap;
}

async function uploadSessions(
  version: number,
  sessions: Array<{ sessionId: string; sessionFile: SessionFile }>,
  skipLatestUpdate: boolean,
): Promise<PrepareMtmDatasetResult> {
  const storage = getStorageAdapter();
  const manifestSessions: MtmManifestSession[] = [];
  let failedCount = 0;
  let totalUtterances = 0;

  for (const { sessionId, sessionFile } of sessions) {
    try {
      const inputTokens = encode(getConversationFromJSON(sessionFile)).length;
      const filename = `${sessionId}.json`;
      const buffer = Buffer.from(JSON.stringify(sessionFile));

      await storage.upload({
        file: { buffer, size: buffer.length, type: "application/json" },
        uploadPath: getDatasetSessionPath(version, filename),
      });

      manifestSessions.push({
        sessionId,
        filename,
        inputTokens,
        utteranceCount: sessionFile.transcript.length,
        leadRole: sessionFile.leadRole,
      });

      totalUtterances += sessionFile.transcript.length;
      console.log(
        `  Uploaded ${filename} (${sessionFile.transcript.length} utterances, ${inputTokens} tokens)`,
      );
    } catch (error) {
      console.error(
        `  Failed ${sessionId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      failedCount++;
    }
  }

  const manifest: MtmManifest = {
    version,
    createdAt: new Date().toISOString(),
    sessionCount: manifestSessions.length,
    sessions: manifestSessions,
  };

  const manifestBuffer = Buffer.from(JSON.stringify(manifest, null, 2));
  await storage.upload({
    file: {
      buffer: manifestBuffer,
      size: manifestBuffer.length,
      type: "application/json",
    },
    uploadPath: getDatasetManifestPath(version),
  });
  console.log(`Uploaded manifest to ${getDatasetManifestPath(version)}`);

  if (!skipLatestUpdate) {
    const latestBuffer = Buffer.from(JSON.stringify({ version }));
    await storage.upload({
      file: {
        buffer: latestBuffer,
        size: latestBuffer.length,
        type: "application/json",
      },
      uploadPath: getDatasetLatestPath(),
    });
    console.log(`Updated ${getDatasetLatestPath()}`);
  }

  console.log(
    `\nDone: ${manifest.sessionCount} sessions, ${totalUtterances} utterances uploaded to ${getDatasetDir(version)}/`,
  );

  return { sessionCount: manifest.sessionCount, failedCount, totalUtterances };
}

export default async function prepareMtmDataset({
  version,
  fileContent,
  format = "csv",
  skipLatestUpdate = false,
}: {
  version: number;
  fileContent: string;
  format?: "csv" | "jsonl";
  skipLatestUpdate?: boolean;
}): Promise<PrepareMtmDatasetResult> {
  const sessionMap = parseRows(fileContent, format);
  console.log(
    `Parsed ${sessionMap.size} sessions from ${format.toUpperCase()}`,
  );

  const sessions: Array<{ sessionId: string; sessionFile: SessionFile }> = [];

  for (const [sessionId, utterances] of sessionMap) {
    utterances.sort(
      (a, b) => parseInt(a.sequence_id, 10) - parseInt(b.sequence_id, 10),
    );

    const roles = [...new Set(utterances.map((u) => u.role))];
    const leadRole = detectLeadRole(roles);

    const transcript = utterances.map((u, index) => ({
      _id: `${index}`,
      role: u.role,
      content: u.content,
      start_time: "",
      end_time: "",
      timestamp: "",
      session_id: u.session_id,
      sequence_id: u.sequence_id,
      annotations: [],
    }));

    sessions.push({
      sessionId,
      sessionFile: { transcript, leadRole, annotations: [] },
    });
  }

  return uploadSessions(version, sessions, skipLatestUpdate);
}

export async function prepareMtmDatasetFromFiles({
  version,
  sessions,
  skipLatestUpdate = false,
}: {
  version: number;
  sessions: Array<{ sessionId: string; sessionFile: SessionFile }>;
  skipLatestUpdate?: boolean;
}): Promise<PrepareMtmDatasetResult> {
  console.log(`Preparing ${sessions.length} sessions from pre-parsed files`);
  return uploadSessions(version, sessions, skipLatestUpdate);
}
