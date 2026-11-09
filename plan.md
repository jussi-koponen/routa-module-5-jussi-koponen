# Plan

- [x] Speak MCP over stdio
- [x] get_settings and who_can_reach
- [x] preview_change and apply_change
- [x] The token check on every tool
- [x] set_session_length: IT asked for a quick way
- [x] copy_group_access: IT asked for a way to line one group up with another
- [x] check_baseline: read-only, lists every setting that differs from client/security-baseline.json in plain words, grouped (access, policies), one sentence per difference, a count, and an "everything matches" line when clean. Works with a read-only token (requireToken), makes no PATCH. Files: mcp/src/tools/check-baseline.ts, mcp/src/tools/index.ts, mcp/test/check-baseline.test.ts
