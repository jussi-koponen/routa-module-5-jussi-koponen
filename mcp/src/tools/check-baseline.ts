import { readFileSync } from "node:fs";
import { getSettings } from "../platform.ts";
import type { Settings } from "../platform.ts";
import { requireToken } from "../token-check.ts";

type Value = boolean | number | string;
export type Baseline = { access: Record<string, string[]>; policies: Record<string, Value> };

const baselineFile = new URL("../../../client/security-baseline.json", import.meta.url);

function loadBaseline(): Baseline {
  try {
    return JSON.parse(readFileSync(baselineFile, "utf8")) as Baseline;
  } catch {
    throw new Error("Could not read client/security-baseline.json, so there is nothing to compare with. Nothing was changed.");
  }
}

function say(value: Value): string {
  if (typeof value === "boolean") return value ? "on" : "off";
  return typeof value === "string" ? `"${value}"` : String(value);
}

export function describeDrift(settings: Settings, baseline: Baseline): string {
  const access: string[] = [];
  const policies: string[] = [];

  for (const { group, apps } of settings.access) {
    const allowed = baseline.access[group];
    if (!allowed) {
      access.push(`${group} is on the platform but not in the baseline.`);
      continue;
    }
    for (const app of apps) if (!allowed.includes(app)) access.push(`${group} can reach ${app}, but the baseline says it should not.`);
    for (const app of allowed) if (!apps.includes(app)) access.push(`${group} cannot reach ${app}, but the baseline says it should.`);
  }
  for (const group of Object.keys(baseline.access)) {
    if (!settings.access.some((a) => a.group === group)) access.push(`${group} is in the baseline but not on the platform.`);
  }

  for (const { id, label, value } of settings.policies) {
    if (!(id in baseline.policies)) policies.push(`${label} (${id}) is ${say(value)}, but the baseline has no value for it.`);
    else if (baseline.policies[id] !== value) policies.push(`${label} (${id}) is ${say(value)}, but the baseline says ${say(baseline.policies[id])}.`);
  }
  for (const id of Object.keys(baseline.policies)) {
    if (!settings.policies.some((p) => p.id === id)) policies.push(`${id} is in the baseline but not on the platform.`);
  }

  const total = access.length + policies.length;
  if (total === 0) return "Every setting matches the baseline.";
  const sections = [
    access.length ? `Access (${access.length}):\n${access.map((l) => `- ${l}`).join("\n")}` : "",
    policies.length ? `Policies (${policies.length}):\n${policies.map((l) => `- ${l}`).join("\n")}` : "",
  ].filter(Boolean);
  return `${total} ${total === 1 ? "setting differs" : "settings differ"} from the baseline.\n\n${sections.join("\n\n")}`;
}

export const checkBaselineTool = {
  name: "check_baseline",
  description: "List, in plain words, every setting that differs from Routa's security baseline. Read-only: works with any token and changes nothing.",
  inputSchema: { type: "object", properties: {} },
  async handler() {
    await requireToken();
    return describeDrift(await getSettings(), loadBaseline());
  },
};
