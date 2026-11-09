import { recordChange } from "../audit.ts";
import { patchSettings, whoami } from "../platform.ts";
import { takeChange } from "../preview.ts";
import { requireAdmin } from "../token-check.ts";

export const applyChangeTool = {
  name: "apply_change",
  description: "Change the live settings by applying a change that preview_change, set_session_length or copy_group_access has shown, by its id. Needs an admin token. An id works once and expires after five minutes. Every change is recorded in the audit log before it is applied, and is not applied if it can't be recorded.",
  inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  async handler({ id }: { id: string }) {
    await requireAdmin();
    const changes = takeChange(id);
    const { scope } = await whoami();
    recordChange(scope, changes);
    const { applied } = await patchSettings(changes);
    return `Applied ${applied} change${applied === 1 ? "" : "s"}.`;
  },
};
