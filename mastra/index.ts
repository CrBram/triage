import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import { adviceAgent } from "./agents/advice-agent";
import { triageAgent } from "./agents/triage-agent";

/**
 * Storage for triage sessions, conversation threads and agent memory.
 *
 * - Local: `file:./triage.db` (SQLite on disk).
 * - Hosted: a remote libsql URL (e.g. Turso `libsql://...`) with an auth token.
 *   File-based SQLite does not work on serverless hosts.
 */
const storage = new LibSQLStore({
  id: "triage-storage",
  url: process.env.DATABASE_URL ?? "file:./triage.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const mastra = new Mastra({
  agents: { triageAgent, adviceAgent },
  storage,
  logger: new PinoLogger({
    name: "Triage",
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
  }),
});
