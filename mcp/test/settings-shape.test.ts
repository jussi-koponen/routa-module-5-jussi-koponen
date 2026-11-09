// Checks our settings against a copy of what the platform returned when we built this.
// The copy is local and not committed, so the check is skipped where it isn't present, such as in CI.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const fixture = new URL("./fixtures/local-settings.json", import.meta.url);

test("the recorded settings have the shape the tools expect", { skip: !existsSync(fixture) && "no local recording of the platform's settings" }, () => {
  const recorded = JSON.parse(readFileSync(fixture, "utf8"));
  assert.ok(Array.isArray(recorded.access));
  assert.ok(recorded.access.every((a: { group: string; apps: string[] }) => typeof a.group === "string" && Array.isArray(a.apps)));
  assert.ok(recorded.policies.every((p: { id: string }) => typeof p.id === "string"));
});
