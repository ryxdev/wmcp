export type OpsRedactionTarget = "key" | "customer";

export type OpsDeskState = {
  packetized: boolean;
  approved: boolean;
  redactions: Record<OpsRedactionTarget, boolean>;
};

export const INITIAL_OPS_DESK: OpsDeskState = {
  packetized: false,
  approved: false,
  redactions: { key: false, customer: false },
};

const STORAGE_KEY = "wmcp-ops-console";

function isOpsDeskState(value: unknown): value is OpsDeskState {
  if (!value || typeof value !== "object") return false;
  const v = value as OpsDeskState;
  return (
    typeof v.packetized === "boolean" &&
    typeof v.approved === "boolean" &&
    typeof v.redactions?.key === "boolean" &&
    typeof v.redactions?.customer === "boolean"
  );
}

export function loadOpsDesk(): OpsDeskState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_OPS_DESK;
    const parsed: unknown = JSON.parse(raw);
    if (!isOpsDeskState(parsed)) return INITIAL_OPS_DESK;
    return parsed;
  } catch {
    return INITIAL_OPS_DESK;
  }
}

export function saveOpsDesk(state: OpsDeskState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function opsBothPainted(state: OpsDeskState): boolean {
  return state.redactions.key && state.redactions.customer;
}
