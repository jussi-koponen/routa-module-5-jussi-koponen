// Gate: every tool that applies a change must show it first.
// A tool in mcp/src/tools, other than apply-change.ts, that calls patchSettings must also call showChange.
import { readdirSync, readFileSync } from "node:fs";

const dir = "mcp/src/tools";
const stripComments = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const failures: string[] = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "apply-change.ts")) {
  const code = stripComments(readFileSync(`${dir}/${file}`, "utf8"));
  if (/\bpatchSettings\s*\(/.test(code) && !/\bshowChange\s*\(/.test(code)) {
    failures.push(`${dir}/${file} calls patchSettings without calling showChange`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("lint: every change is shown before it is applied");
