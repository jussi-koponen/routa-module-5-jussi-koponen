// Shows a change in plain words and keeps it under an id, so what is applied is what was shown.
import { randomUUID } from "node:crypto";
import type { Change, Settings } from "./platform.ts";

export const PREVIEW_MINUTES = 5;
const shown = new Map<string, { changes: Change[]; at: number }>();

const fail = (why: string): never => {
  throw new Error(`${why} Each change is {"type":"access","group","app","allowed"} or {"type":"policy","id","value"}, with nothing else.`);
};

// Refuses anything the preview could not show in full, so what is applied is what was shown.
export function checkChanges(changes: unknown): Change[] {
  if (!Array.isArray(changes)) return fail("changes must be a list.");
  if (changes.length === 0) return fail("changes is empty, so there is nothing to show.");
  for (const c of changes) {
    const keys = c && typeof c === "object" ? Object.keys(c).sort().join(",") : "";
    if (c?.type === "access") {
      if (keys !== "allowed,app,group,type" || typeof c.group !== "string" || typeof c.app !== "string" || typeof c.allowed !== "boolean") fail(`Not a valid access change: ${JSON.stringify(c)}.`);
    } else if (c?.type === "policy") {
      if (keys !== "id,type,value" || typeof c.id !== "string" || !["boolean", "number", "string"].includes(typeof c.value)) fail(`Not a valid policy change: ${JSON.stringify(c)}.`);
    } else fail(`Unknown change type in ${JSON.stringify(c)}.`);
  }
  return changes as Change[];
}

function inWords(change: Change, settings: Settings): string {
  if (change.type === "access") return `${change.group} ${change.allowed ? "gains" : "loses"} ${change.app}`;
  const policy = settings.policies.find((p) => p.id === change.id);
  return `${change.id} goes from ${JSON.stringify(policy?.value)} to ${JSON.stringify(change.value)}`;
}

export function showChange(changes: Change[], settings: Settings, now = Date.now()): string {
  checkChanges(changes);
  const id = randomUUID();
  shown.set(id, { changes, at: now });
  return [`Change ${id} would do this:`, ...changes.map((c) => `- ${inWords(c, settings)}`), `Nothing has changed yet. Apply it with apply_change and this id within ${PREVIEW_MINUTES} minutes.`].join("\n");
}

export function takeChange(id: string, now = Date.now()): Change[] {
  const entry = shown.get(id);
  if (!entry) throw new Error(`No change has been shown with id ${id}, or it was already applied. Each id works once: preview the change again.`);
  shown.delete(id);
  if (now - entry.at > PREVIEW_MINUTES * 60_000) throw new Error(`The change ${id} was shown more than ${PREVIEW_MINUTES} minutes ago and has expired. Nothing was changed. Preview it again.`);
  return entry.changes;
}
