import type { ReactNode } from "react";
import type { OpsRedactionTarget } from "./session";

type Props = {
  field: OpsRedactionTarget;
  painted: boolean;
  onPaint: (field: OpsRedactionTarget) => void;
  children: ReactNode;
};

export function OpsRedactable({ field, painted, onPaint, children }: Props) {
  const label = field === "key" ? "key" : "customer name";

  return (
    <button
      type="button"
      className={`ops-redact${painted ? " is-painted" : ""}`}
      onClick={() => onPaint(field)}
      aria-pressed={painted}
      aria-label={painted ? `${label} painted black` : `Paint ${label} black`}
    >
      {painted ? <span className="ops-blackout" aria-hidden="true" /> : children}
    </button>
  );
}
