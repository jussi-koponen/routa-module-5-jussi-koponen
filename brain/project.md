# Project brain

## What this is

Routa's IT configures its identity platform by asking Claude, through this MCP server. The brief is in `client/brief.md`.

## What we found out

- The admin API applies a PATCH at once and has no preview, so the server keeps its own.
- The API doesn't enforce scope: any valid token can PATCH. `whoami` says what a token is, and the server must refuse.
- `session-length-hours` takes a number, `guest-access` a string, and the `mfa.*` policies true or false.

## Rules that cost us if we break them

- A read-only token never changes a setting.
- Every change is shown before it is applied, and what is applied is what was shown.

## The baseline-drift tool (check_baseline)

- It touches only `GET /admin/v1/settings` and `client/security-baseline.json`. It never PATCHes.
- It needs only a valid token (`requireToken`), so a read-only token works. Don't use `requireAdmin`.
- In the test environment today, 154 grid boxes aren't the only thing that drifts. Seen with the read-only token: dept-analytics reaches `hr` (baseline: no), ext-contractors reaches `crm` and `finance` (no), managers reach `it-admin` (no); `mfa.ext-contractors` and `mfa.partners` are false, `session-length-hours` is 24, `legacy-sign-in` is true, `guest-access` is "open".
- The baseline file is read at call time, relative to the server's files. A group or policy missing from the baseline, or from the platform, is a difference too.
- `tools/baseline-check.ts` does the same comparison as a script, with the admin token and terse output. The tool is the plain-words, read-only-token version.
