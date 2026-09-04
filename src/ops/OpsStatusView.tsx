import { useEffect } from "react";
import { OPS_INCIDENT } from "./incident";
import { OPS_PATH } from "./paths";
import type { OpsDeskState } from "./session";
import "./ops.css";

type Props = {
  state: OpsDeskState;
  navigate: (path: string) => void;
};

export function OpsStatusView({ state, navigate }: Props) {
  const published =
    state.approved && state.redactions.key && state.redactions.customer;

  useEffect(() => {
    document.title = published
      ? `Public status — ${OPS_INCIDENT.id}`
      : "Public status";
  }, [published]);

  return (
    <div className="ops-root ops-status">
      <header className="ops-topbar">
        <div className="ops-brand">
          <span className="ops-mark">Nexus</span>
          <span className="ops-brand-sub">Public status</span>
        </div>
        <span className="ops-pill">{OPS_INCIDENT.id}</span>
      </header>

      <main className="ops-shell ops-status-shell">
        {published ? (
          <article className="ops-status-card">
            <p className="ops-kicker">Investigating</p>
            <h1>{OPS_INCIDENT.service}</h1>
            <p>{OPS_INCIDENT.publicBlurb}</p>
            <dl className="ops-status-dl">
              <div>
                <dt>Affected customer</dt>
                <dd>
                  <span className="ops-blackout" title="Redacted" />
                </dd>
              </div>
              <div>
                <dt>Rotated credential</dt>
                <dd>
                  <span className="ops-blackout" title="Redacted" />
                </dd>
              </div>
            </dl>
            <p className="ops-hint">
              Redacted fields stay black and are not in this page&apos;s DOM.
              Demo keys and the customer name are not rendered here.
            </p>
          </article>
        ) : (
          <article className="ops-status-card">
            <h1>No public statement</h1>
            <p>Nothing has been approved from the ops console in this tab.</p>
            <button type="button" className="ops-btn" onClick={() => navigate(OPS_PATH)}>
              Back to console
            </button>
          </article>
        )}
      </main>
    </div>
  );
}
