import { INCIDENT } from "../data/incident";
import { HOME_PATH } from "../lib/routes";
import type { DeskState } from "../lib/session";

type Props = {
  state: DeskState;
  navigate: (path: string) => void;
};

export function StatusView({ state, navigate }: Props) {
  const published = state.approved && state.redactions.key && state.redactions.customer;

  return (
    <div className="status-page">
      <header className="status-mast">
        <p className="eyebrow">Public status · same origin</p>
        <h1>{INCIDENT.id}</h1>
        <p className="mast-meta">
          {published ? "Published from the night dump" : "Not published yet"}
        </p>
      </header>

      {published ? (
        <article className="status-card">
          <p className="status-kicker">Investigating</p>
          <p>{INCIDENT.publicBlurb}</p>
          <dl>
            <div>
              <dt>Affected customer</dt>
              <dd>
                <span className="blackout" title="Redacted" />
              </dd>
            </div>
            <div>
              <dt>Rotated credential</dt>
              <dd>
                <span className="blackout" title="Redacted" />
              </dd>
            </div>
          </dl>
          <p className="hint">
            Redacted fields stay black. This page has no Slack, pager, or demo
            keys in the clear.
          </p>
        </article>
      ) : (
        <article className="status-card">
          <p>No public statement has been approved in this tab.</p>
          <button type="button" className="btn" onClick={() => navigate(HOME_PATH)}>
            Back to the dump
          </button>
        </article>
      )}
    </div>
  );
}
