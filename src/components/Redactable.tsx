import type { ReactNode } from "react";
import type { RedactionTarget } from "../lib/session";

type Props = {
  field: RedactionTarget;
  painted: boolean;
  onPaint: (field: RedactionTarget) => void;
  children: ReactNode;
  className?: string;
};

export function Redactable({
  field,
  painted,
  onPaint,
  children,
  className,
}: Props) {
  const label = field === "key" ? "key" : "customer name";

  return (
    <button
      type="button"
      className={`redactable${painted ? " is-painted" : ""}${className ? ` ${className}` : ""}`}
      onClick={() => onPaint(field)}
      aria-pressed={painted}
      aria-label={painted ? `${label} painted black` : `Paint ${label} black`}
    >
      {painted ? <span className="blackout" aria-hidden="true" /> : children}
    </button>
  );
}
