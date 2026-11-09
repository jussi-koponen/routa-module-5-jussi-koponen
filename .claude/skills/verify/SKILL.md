---
name: verify
description: Check whether the MCP server is done. Use after each build step, and before saying the work is done.
---

Run the checks below. Report each failing check with its error, or say that every check passed. Don't fix anything here, and don't reset anything.

## The checks

1. **The tests pass:** `npm test`.
2. **A live run, as IT would:** `npm run live-check`, with the test environment running. It takes the two tokens from `ROUTA_TOKEN` and `ROUTA_READONLY_TOKEN`, which are already in the environment. Don't read the token files.
3. **The security judge:** a fresh agent that didn't build the server reads it against a file of criteria.

   - **Input:** the criteria file. It defaults to `client/security-criteria.md`; if the user or the plan names another file, use that one. Read nothing into the judge's brief from this file but its path: the judge reads the criteria itself.
   - **Spawn it fresh,** with the Agent tool and `subagent_type: "Explore"`, never a fork, so it has none of the build's context and can't write files. Don't tell it what you expect to find, what was changed lately, or what the tests showed. Brief it like this, filling in the criteria path:

     > You are a security judge. You did not build this MCP server and have no history with it. Read the criteria file `<criteria path>` in full, then read the server (`mcp/src/`, every file, and `.mcp.json`) against each rule in it. Also check the repository for anything the criteria name that lives outside `mcp/src/`, such as tokens committed to files. Don't read token files, `.env*` or `~/.routa`, and don't change anything.
     >
     > Report every finding as one line: `<low|medium|high|critical> — <what is wrong> — <file>:<line> — "<the quoted line>"`. Rate it by the criteria's own wording, and name the rule it falls under. If you find nothing for a rule, say so. If a rule can't be judged from the code, say so rather than guessing. Don't suggest or make fixes.

   - **Result:** relay the judge's findings as written. The check **fails if any finding is high or critical**. Low and medium findings are listed as notes and don't fail it. A finding that has no file and line isn't a finding: send it back to the judge once, and if it still has none, report the check as failed to run, not as passed.
