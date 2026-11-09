// The audit log: one JSON line per applied change, saying when, with which scope, and what. Never the token.
import { appendFileSync } from "node:fs";
import type { Change } from "./platform.ts";

export function recordChange(scope: string, changes: Change[], now = new Date()): void {
  const line = JSON.stringify({ time: now.toISOString(), scope, changes });
  appendFileSync(process.env.ROUTA_AUDIT_LOG || "audit.log", line + "\n");
}
