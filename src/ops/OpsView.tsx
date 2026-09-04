import { useEffect, useMemo, useRef, type ReactNode } from "react";
import type { ModelContextTool } from "../webmcp";
import { useViewTools } from "../hooks/useViewTools";
import { OPS_INCIDENT, OPS_THREAD } from "./incident";
import { opsPacketHasSecrets, packetizeOps } from "./packetize";
import { OPS_STATUS_PATH } from "./paths";
import { OpsRedactable } from "./Redactable";
import {
  opsBothPainted,
  type OpsDeskState,
  type OpsRedactionTarget,
} from "./session";
import "./ops.css";

const EMPTY_INPUT = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

const REDACT_INPUT = {
  type: "object",
  properties: {
    target: {
      type: "string",
      enum: ["key", "customer"],
      description: "Paint key (both demo creds) or customer name black on the page.",
    },
  },
  required: ["target"],
  additionalProperties: false,
} as const;

type Props = {
  state: OpsDeskState;
  setState: (updater: (prev: OpsDeskState) => OpsDeskState) => void;
  navigate: (path: string) => void;
};

export function OpsView({ state, setState, navigate }: Props) {
  const redactionsRef = useRef(state.redactions);
  redactionsRef.current = state.redactions;

  useEffect(() => {
    document.title = `Ops console — ${OPS_INCIDENT.id}`;
  }, []);

  const paint = (target: OpsRedactionTarget) => {
    redactionsRef.current = { ...redactionsRef.current, [target]: true };
    setState((prev) => ({
      ...prev,
      redactions: { ...prev.redactions, [target]: true },
    }));
  };

  const runPacketize = (): string => {
    const dump = packetizeOps();
    setState((prev) => ({ ...prev, packetized: true }));
    return dump;
  };

  const runApprove = ():
    | { ok: true; path: string }
    | { ok: false; error: string } => {
    if (!redactionsRef.current.key || !redactionsRef.current.customer) {
      return {
        ok: false,
        error: "Paint the key and the customer name on this page before approve.",
      };
    }
    setState((prev) => ({ ...prev, approved: true }));
    navigate(OPS_STATUS_PATH);
    return { ok: true, path: OPS_STATUS_PATH };
  };

  const tools = useMemo<ModelContextTool[]>(
    () => [
      {
        name: "packetize",
        title: "Packetize incident",
        description:
          "Read the seeded ticket thread and sort it into Status, Internal, and Legal. Returns capped text. Finds keys a DOM guess will miss. No extra click needed.",
        inputSchema: EMPTY_INPUT,
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: async (_input, options) => {
          if (options.signal.aborted) {
            throw options.signal.reason ?? new DOMException("Aborted", "AbortError");
          }
          const dump = runPacketize();
          if (!opsPacketHasSecrets(dump)) {
            throw new Error("Packetize missed a seeded secret — refuse to return.");
          }
          return dump;
        },
      },
      {
        name: "redact",
        title: "Paint redaction",
        description:
          "Paint a field black on this page. target=key paints both live-looking demo keys. target=customer paints the customer name. Not a host confirm dialog.",
        inputSchema: REDACT_INPUT,
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (input, options) => {
          if (options.signal.aborted) {
            throw options.signal.reason ?? new DOMException("Aborted", "AbortError");
          }
          const target = input.target;
          if (target !== "key" && target !== "customer") {
            return { ok: false, error: "target must be key or customer." };
          }
          paint(target);
          return { ok: true, painted: target, onPage: true };
        },
      },
      {
        name: "approve",
        title: "Approve status",
        description:
          "Ship the public status page after the key and customer name are painted black. Same as the on-page Approve button. Opens /ops/status on this origin.",
        inputSchema: EMPTY_INPUT,
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: async (_input, options) => {
          if (options.signal.aborted) {
            throw options.signal.reason ?? new DOMException("Aborted", "AbortError");
          }
          return runApprove();
        },
      },
    ],
    [state.redactions.key, state.redactions.customer],
  );

  const toolsOn = useViewTools(tools);
  const canApprove = opsBothPainted(state);
  const packet = state.packetized ? packetizeOps() : "";

  return (
    <div className="ops-root">
      <header className="ops-topbar">
        <div className="ops-brand">
          <span className="ops-mark">Nexus</span>
          <span className="ops-brand-sub">Incident console</span>
        </div>
        <div className="ops-top-meta">
          <span className="ops-pill ops-pill-sev">{OPS_INCIDENT.severity}</span>
          <span className="ops-pill">{OPS_INCIDENT.environment}</span>
          <span className={`ops-pill ${toolsOn ? "ops-pill-on" : ""}`}>
            {toolsOn ? "WebMCP tools on this view" : "No WebMCP — console still works"}
          </span>
        </div>
      </header>

      <main className="ops-shell">
        <section className="ops-hero">
          <p className="ops-kicker">
            {OPS_INCIDENT.id} · {OPS_INCIDENT.ticket}
          </p>
          <h1>{OPS_INCIDENT.title}</h1>
          <dl className="ops-facts">
            <div>
              <dt>Service</dt>
              <dd>{OPS_INCIDENT.service}</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>{OPS_INCIDENT.region}</dd>
            </div>
            <div>
              <dt>Opened</dt>
              <dd>{OPS_INCIDENT.opened}</dd>
            </div>
            <div>
              <dt>Assignee</dt>
              <dd>{OPS_INCIDENT.assignee}</dd>
            </div>
          </dl>
          <p className="ops-lead">
            A DOM-guessing agent skims labels and misses live-looking keys in an
            unlabeled paste. <code>packetize</code> reads the seeded ticket and
            does not miss them. Paint the key and customer name, then approve
            the public page.
          </p>
        </section>

        <div className="ops-grid">
          <section className="ops-panel" aria-label="Ticket thread">
            <header className="ops-panel-head">
              <h2>Tenant ticket</h2>
              <p>Click a highlighted key or the customer name to paint it black.</p>
            </header>

            <ol className="ops-thread">
              {OPS_THREAD.map((msg) => (
                <li key={msg.id} className="ops-comment">
                  <div className="ops-avatar" aria-hidden="true">
                    {initials(msg.who)}
                  </div>
                  <div>
                    <p className="ops-comment-meta">
                      <b>{msg.who}</b>
                      <span>{msg.role}</span>
                      <time>{msg.t}</time>
                    </p>
                    <p className="ops-comment-body">{msg.text}</p>
                    {"paste" in msg && msg.paste && (
                      <UnlabeledPaste
                        paintedKey={state.redactions.key}
                        paintedCustomer={state.redactions.customer}
                        onPaint={paint}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <aside className="ops-rail" aria-label="Human console">
            <section className="ops-panel">
              <header className="ops-panel-head">
                <h2>Runbook</h2>
              </header>
              <ol className="ops-steps">
                <li className={state.packetized ? "is-done" : ""}>Packetize the ticket</li>
                <li className={state.redactions.key ? "is-done" : ""}>Paint both keys</li>
                <li className={state.redactions.customer ? "is-done" : ""}>
                  Paint customer name
                </li>
                <li className={state.approved ? "is-done" : ""}>Approve public status</li>
              </ol>
              <div className="ops-actions">
                <button type="button" className="ops-btn" onClick={() => void runPacketize()}>
                  Packetize
                </button>
                <button
                  type="button"
                  className="ops-btn"
                  onClick={() => paint("key")}
                  disabled={state.redactions.key}
                >
                  Paint keys
                </button>
                <button
                  type="button"
                  className="ops-btn"
                  onClick={() => paint("customer")}
                  disabled={state.redactions.customer}
                >
                  Paint customer
                </button>
                <button
                  type="button"
                  className="ops-btn ops-btn-approve"
                  onClick={() => {
                    void runApprove();
                  }}
                  disabled={!canApprove}
                >
                  Approve
                </button>
              </div>
              {!canApprove && (
                <p className="ops-hint">
                  Approve stays disabled until both the key and the customer name
                  are painted.
                </p>
              )}
            </section>

            {state.packetized && (
              <section className="ops-panel" aria-label="Classification">
                <header className="ops-panel-head">
                  <h2>Classification</h2>
                </header>
                <PacketBlock
                  title="Status"
                  body={sliceSection(packet, "STATUS", "INTERNAL")}
                />
                <PacketBlock
                  title="Internal"
                  body={
                    <>
                      <p>
                        Customer:{" "}
                        <OpsRedactable
                          field="customer"
                          painted={state.redactions.customer}
                          onPaint={paint}
                        >
                          {OPS_INCIDENT.customer}
                        </OpsRedactable>
                        {` / ${OPS_INCIDENT.account}`}
                      </p>
                      <p>
                        API key:{" "}
                        <OpsRedactable
                          field="key"
                          painted={state.redactions.key}
                          onPaint={paint}
                        >
                          {OPS_INCIDENT.apiKey}
                        </OpsRedactable>
                      </p>
                      <p>
                        Cloud key:{" "}
                        <OpsRedactable
                          field="key"
                          painted={state.redactions.key}
                          onPaint={paint}
                        >
                          {OPS_INCIDENT.cloudKey}
                        </OpsRedactable>
                      </p>
                      <p>Keys arrived as unlabeled paste in the tenant ticket thread.</p>
                    </>
                  }
                />
                <PacketBlock title="Legal" body={sliceSection(packet, "LEGAL")} />
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function UnlabeledPaste({
  paintedKey,
  paintedCustomer,
  onPaint,
}: {
  paintedKey: boolean;
  paintedCustomer: boolean;
  onPaint: (field: OpsRedactionTarget) => void;
}) {
  return (
    <pre className="ops-paste">
      {`2026-09-01T03:41:12Z  checkout session rejected
retry=3  shop=edge  env=production
`}
      <OpsRedactable field="key" painted={paintedKey} onPaint={onPaint}>
        {OPS_INCIDENT.apiKey}
      </OpsRedactable>
      {"\n"}
      <OpsRedactable field="key" painted={paintedKey} onPaint={onPaint}>
        {OPS_INCIDENT.cloudKey}
      </OpsRedactable>
      {"\n"}
      {`acct note: `}
      <OpsRedactable field="customer" painted={paintedCustomer} onPaint={onPaint}>
        {OPS_INCIDENT.customer}
      </OpsRedactable>
      {" asked for a same-day rotation"}
    </pre>
  );
}

function sliceSection(text: string, start: string, end?: string): string {
  const from = text.indexOf(start);
  if (from === -1) return text;
  const bodyStart = from + start.length;
  const to = end ? text.indexOf(end, bodyStart) : text.length;
  return text.slice(bodyStart, to === -1 ? text.length : to).trim();
}

function PacketBlock({
  title,
  body,
}: {
  title: string;
  body: ReactNode;
}) {
  return (
    <article className="ops-packet">
      <h3>{title}</h3>
      {typeof body === "string" ? <p>{body}</p> : body}
    </article>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}
