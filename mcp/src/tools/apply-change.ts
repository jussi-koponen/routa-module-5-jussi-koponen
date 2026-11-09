import { recordChange } from "../audit.ts";
import { patchSettings, whoami } from "../platform.ts";
import { takeChange } from "../preview.ts";
import { requireAdmin } from "../token-check.ts";

export const applyChangeTool = {
  name: "apply_change",
  description: "Change the live settings by applying a change that preview_change, set_session_length or copy_group_access has shown, by its id. Needs an admin token. An id works once and expires after five minutes. Every applied change is recorded in the audit log.",
  inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  async handler({ id }: { id: string }) {
    await requireAdmin();
    const changes = takeChange(id);
    const { scope } = await whoami();
    const { applied } = await patchSettings(changes);
    try {
      recordChange(scope, changes);
    } catch (err) {
      throw new Error(`Applied ${applied} change${applied === 1 ? "" : "s"}, but the audit log could not be written: ${(err as Error).message}. Check ROUTA_AUDIT_LOG.`);
    }
    return `Applied ${applied} change${applied === 1 ? "" : "s"}.`;
  },
};
