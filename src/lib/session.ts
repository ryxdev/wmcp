export type RedactionTarget = "key" | "customer";

export type DeskState = {
  packetized: boolean;
  approved: boolean;
  redactions: Record<RedactionTarget, boolean>;
};

export const INITIAL_DESK: DeskState = {
  packetized: false,
  approved: false,
  redactions: { key: false, customer: false },
};

const STORAGE_KEY = "wmcp-night-dump";

function isDeskState(value: unknown): value is DeskState {
  if (!value || typeof value !== "object") return false;
  const v = value as DeskState;
  return (
    typeof v.packetized === "boolean" &&
    typeof v.approved === "boolean" &&
    typeof v.redactions?.key === "boolean" &&
    typeof v.redactions?.customer === "boolean"
  );
}

export function loadDesk(): DeskState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_DESK;
    const parsed: unknown = JSON.parse(raw);
    if (!isDeskState(parsed)) return INITIAL_DESK;
    return parsed;
  } catch {
    return INITIAL_DESK;
  }
}

export function saveDesk(state: DeskState): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function bothPainted(state: DeskState): boolean {
  return state.redactions.key && state.redactions.customer;
}
