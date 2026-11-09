// PreToolUse hook: refuses any change to mcp/src/token-check.ts.
// Covers file-editing tools and shell commands that write to the file.
// A command that only mentions the file (git add, cat, grep...) is allowed.
import { readFileSync } from "node:fs";

const PROTECTED = "token-check.ts";
const NAME = /token-check(\.ts)?/;

const deny = (why: string) => {
  process.stderr.write(`Blocked: ${why}. mcp/src/token-check.ts is protected; ask the user to change it.\n`);
  process.exit(2);
};

// Git subcommands that only read or stage; anything else may rewrite the file.
const GIT_SAFE = /^(add|status|diff|log|show|blame|ls-files|grep|commit|branch|rev-parse|check-ignore|stash\s+list)\b/;

const input = JSON.parse(readFileSync(0, "utf8"));
const tool = input.tool_name;
const args = input.tool_input ?? {};

if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
  const path = String(args.file_path ?? args.notebook_path ?? "");
  if (path.endsWith(PROTECTED)) deny(`${tool} on ${path}`);
}

if (tool === "Bash") {
  const command = String(args.command ?? "");
  for (const segment of command.split(/&&|\|\||[;|\n]/)) {
    if (!NAME.test(segment)) continue;
    const reason = writeReason(segment.trim());
    if (reason) deny(`${reason}: ${segment.trim()}`);
  }
}

function writeReason(segment: string): string | undefined {
  const git = segment.match(/^git\s+(?:-\S+\s+)*(.*)$/s);
  if (git) {
    return GIT_SAFE.test(git[1]) ? undefined : "git command that can rewrite the file";
  }
  if (/>\s*\S*token-check/.test(segment)) return "redirect into the file";
  if (/\btee\b/.test(segment)) return "tee";
  if (/\bsed\b.*\s(-[a-zA-Z]*i|--in-place)/.test(segment)) return "in-place sed";
  if (/\bperl\b.*\s-[a-zA-Z]*i/.test(segment)) return "in-place perl";
  if (/\b(cp|mv|rm|install|truncate|ln|dd|patch|unlink|shred|rsync)\b/.test(segment)) return "file command";
  if (/\b(node|python3?|ruby|perl|deno|bun)\b/.test(segment) && /write|open\(|unlink|rename|copy|append/i.test(segment)) {
    return "script that writes";
  }
  return undefined;
}
