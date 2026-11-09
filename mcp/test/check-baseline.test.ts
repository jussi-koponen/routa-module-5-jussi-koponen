import assert from "node:assert/strict";
import { test } from "node:test";
import { checkBaselineTool, describeDrift } from "../src/tools/check-baseline.ts";
import type { Baseline } from "../src/tools/check-baseline.ts";
import type { Settings } from "../src/platform.ts";
import { fakePlatform } from "./fake-platform.ts";

const baseline: Baseline = {
  access: { staff: ["documents"], contractors: ["timesheets"] },
  policies: { "session-length-hours": 8, "legacy-sign-in": false },
};
const policy = (id: string, label: string, value: boolean | number | string) => ({ id, label, value });

test("a matching platform is reported as matching", () => {
  const settings: Settings = {
    access: [{ group: "staff", apps: ["documents"] }, { group: "contractors", apps: ["timesheets"] }],
    policies: [policy("session-length-hours", "Session length", 8), policy("legacy-sign-in", "Allow legacy sign-in", false)],
  };
  assert.equal(describeDrift(settings, baseline), "Every setting matches the baseline.");
});

test("every difference is listed in plain words", () => {
  const settings: Settings = {
    access: [{ group: "staff", apps: ["documents", "finance"] }, { group: "contractors", apps: [] }],
    policies: [policy("session-length-hours", "Session length", 24), policy("legacy-sign-in", "Allow legacy sign-in", true)],
  };
  const text = describeDrift(settings, baseline);
  assert.match(text, /^4 settings differ/);
  assert.match(text, /staff can reach finance, but the baseline says it should not\./);
  assert.match(text, /contractors cannot reach timesheets, but the baseline says it should\./);
  assert.match(text, /Session length \(session-length-hours\) is 24, but the baseline says 8\./);
  assert.match(text, /Allow legacy sign-in \(legacy-sign-in\) is on, but the baseline says off\./);
});

test("groups and policies missing on either side are reported", () => {
  const settings: Settings = { access: [{ group: "extra", apps: [] }], policies: [policy("new-policy", "New policy", "x")] };
  const text = describeDrift(settings, baseline);
  assert.match(text, /extra is on the platform but not in the baseline/);
  assert.match(text, /staff is in the baseline but not on the platform/);
  assert.match(text, /New policy \(new-policy\) is "x", but the baseline has no value/);
  assert.match(text, /legacy-sign-in is in the baseline but not on the platform/);
});

test("check_baseline works with a read-only token and changes nothing", async () => {
  const { patches } = fakePlatform("read");
  const text = await checkBaselineTool.handler();
  assert.match(text, /differ/);
  assert.equal(patches.length, 0);
});
