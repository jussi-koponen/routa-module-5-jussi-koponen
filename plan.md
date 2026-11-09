# Plan

- [x] Speak MCP over stdio
- [x] get_settings and who_can_reach
- [x] preview_change and apply_change
- [x] The token check on every tool
- [x] set_session_length: IT asked for a quick way
- [x] copy_group_access: IT asked for a way to line one group up with another
- [x] set_session_length only shows the change; apply_change applies it (lint found it applying unshown)
- [x] copy_group_access only shows the change, behind requireAdmin; apply_change applies it (security judge: two highs)
- [ ] preview_change validates its changes and shows every field, so what is applied is what was shown (default criteria, high)
- [ ] Previews expire after five minutes (hiidenkivi, high)
- [ ] apply_change records scope, change and time in an audit log, never the token (hiidenkivi, high)
