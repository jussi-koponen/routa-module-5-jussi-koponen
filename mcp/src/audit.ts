// The audit log: one JSON line per change, written before the change is applied. Never the token.
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Change } from "./platform.ts";

// Next to the server's code unless ROUTA_AUDIT_LOG says otherwise, so it doesn't depend on the working directory.
export const auditPath = () => process.env.ROUTA_AUDIT_LOG || resolve(import.meta.dirname, "..", "audit.log");

export function recordChange(scope: string, changes: Change[], now = new Date()): void {
  const line = JSON.stringify({ time: now.toISOString(), scope, changes });
  try {
    appendFileSync(auditPath(), line + "\n");
  } catch (err) {
    throw new Error(`The change was not recorded in the audit log at ${auditPath()} (${(err as Error).message}), so nothing was changed. Set ROUTA_AUDIT_LOG to a file that can be written, then preview the change again.`);
  }
}
