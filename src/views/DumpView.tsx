import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Redactable } from "../components/Redactable";
import {
  DECOY_TOKENS,
  INCIDENT,
  PAGER_ROWS,
  SLACK_NOISE,
} from "../data/incident";
import type { ModelContextTool } from "../webmcp";
import { useViewTools } from "../hooks/useViewTools";
import { packetHasSecrets, packetizeDump } from "../lib/packetize";
import { STATUS_PATH } from "../lib/routes";
import {
  bothPainted,
  type DeskState,
  type RedactionTarget,
} from "../lib/session";

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
  state: DeskState;
  setState: (updater: (prev: DeskState) => DeskState) => void;
  navigate: (path: string) => void;
};

export function DumpView({ state, setState, navigate }: Props) {
  const redactionsRef = useRef(state.redactions);
  redactionsRef.current = state.redactions;

  useEffect(() => {
    document.title = "Night dump — INC-2847 (fake)";
  }, []);

  const paint = (target: RedactionTarget) => {
    redactionsRef.current = { ...redactionsRef.current, [target]: true };
    setState((prev) => ({
      ...prev,
      redactions: { ...prev.redactions, [target]: true },
    }));
  };

  const runPacketize = (): string => {
    const dump = packetizeDump();
    setState((prev) => ({ ...prev, packetized: true }));
    return dump;
  };

  const runApprove = (): { ok: true; path: "/status" } | { ok: false; error: string } => {
    if (!redactionsRef.current.key || !redactionsRef.current.customer) {
      return {
        ok: false,
        error: "Paint the key and the customer name on this page before approve.",
      };
    }
    setState((prev) => ({ ...prev, approved: true }));
    navigate(STATUS_PATH);
    return { ok: true, path: "/status" };
  };

  const tools = useMemo<ModelContextTool[]>(
    () => [
      {
        name: "packetize",
        title: "Packetize dump",
        description:
          "Read the seeded incident pile and sort it into Status, Internal, and Legal. Returns capped dump text. Finds keys a DOM guess will miss. No extra click needed.",
        inputSchema: EMPTY_INPUT,
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: async (_input, options) => {
          if (options.signal.aborted) {
            throw options.signal.reason ?? new DOMException("Aborted", "AbortError");
          }
          const dump = runPacketize();
          if (!packetHasSecrets(dump)) {
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
          "Ship the public status page after the key and customer name are painted black. Same as the on-page Approve button. Opens /status on this origin.",
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
  const canApprove = bothPainted(state);
  const packet = state.packetized ? packetizeDump() : "";

  return (
    <div className="desk">
      <header className="mast">
        <div className="mast-brand">
          <p className="eyebrow">Night dump · fake incident</p>
          <h1>
            {INCIDENT.id} <span>{INCIDENT.title}</span>
          </h1>
          <p className="mast-meta">
            {INCIDENT.severity} · {INCIDENT.region} · deploy {INCIDENT.deploy}
          </p>
        </div>
        <div className="mast-flags">
          <span className="stamp">FAKE DATA ONLY</span>
          <span className={`chip ${toolsOn ? "chip-on" : "chip-off"}`}>
            {toolsOn
              ? "WebMCP tools on this view"
              : "No WebMCP — human desk still works"}
          </span>
        </div>
      </header>

      <p className="thesis">
        A DOM-guessing agent skims labels and misses a live-looking key in the
        pile. <code>packetize</code> reads the seeded dump and does not miss it.
        You paint redactions. Approve ships a public status page.
      </p>

      <div className="layout">
        <section className="pile" aria-label="Incident pile">
          <h2>The pile</h2>
          <p className="hint">
            Click a highlighted key or the customer name to paint it black.
          </p>

          <div className="pager" aria-label="Fake pager wall">
            <h3>Pager wall</h3>
            <ol>
              {PAGER_ROWS.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ol>
          </div>

          <div className="slack" aria-label="Fake Slack-like noise">
            <h3>#inc-auth-gateway</h3>
            {SLACK_NOISE.map((msg) => (
              <p key={`${msg.t}-${msg.who}`}>
                <time>{msg.t}</time> <b>{msg.who}</b> {msg.text}
              </p>
            ))}
            <pre className="noise">
              {DECOY_TOKENS.join("  ")}
              {"\n"}
              smoothie: mango, kefir, despair
              {"\n"}
              unlabeled paste token=
              <Redactable
                field="key"
                painted={state.redactions.key}
                onPaint={paint}
              >
                {INCIDENT.cloudKey}
              </Redactable>
              {"  "}
              {INCIDENT.joke}
              {"\n"}
              AUTH_GATEWAY_CONFIG fallback_secret=
              <Redactable
                field="key"
                painted={state.redactions.key}
                onPaint={paint}
              >
                {INCIDENT.apiKey}
              </Redactable>
              {"\n"}
              acct=
              <Redactable
                field="customer"
                painted={state.redactions.customer}
                onPaint={paint}
              >
                {INCIDENT.customer}
              </Redactable>
              {` / ${INCIDENT.account}`}
            </pre>
          </div>
        </section>

        <aside className="console" aria-label="Human desk">
          <h2>Desk</h2>
          <ol className="steps">
            <li>Packetize the pile</li>
            <li>Paint key + customer</li>
            <li>Approve the public page</li>
          </ol>

          <div className="actions">
            <button type="button" className="btn" onClick={() => void runPacketize()}>
              Packetize
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => paint("key")}
              disabled={state.redactions.key}
            >
              Paint keys
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => paint("customer")}
              disabled={state.redactions.customer}
            >
              Paint customer
            </button>
            <button
              type="button"
              className="btn btn-approve"
              onClick={() => {
                void runApprove();
              }}
              disabled={!canApprove}
            >
              Approve
            </button>
          </div>

          {!canApprove && (
            <p className="hint">
              Approve stays dark until both the key and the customer name are
              painted.
            </p>
          )}

          {state.packetized && (
            <div className="packets">
              <PacketColumn
                title="Status"
                body={sliceSection(packet, "STATUS", "INTERNAL")}
              />
              <PacketColumn
                title="Internal"
                body={
                  <>
                    <p>
                      Customer:{" "}
                      <Redactable
                        field="customer"
                        painted={state.redactions.customer}
                        onPaint={paint}
                      >
                        {INCIDENT.customer}
                      </Redactable>
                    </p>
                    <p>
                      API key:{" "}
                      <Redactable
                        field="key"
                        painted={state.redactions.key}
                        onPaint={paint}
                      >
                        {INCIDENT.apiKey}
                      </Redactable>
                    </p>
                    <p>
                      Cloud key:{" "}
                      <Redactable
                        field="key"
                        painted={state.redactions.key}
                        onPaint={paint}
                      >
                        {INCIDENT.cloudKey}
                      </Redactable>
                    </p>
                    <p>{INCIDENT.joke}</p>
                  </>
                }
              />
              <PacketColumn
                title="Legal"
                body={sliceSection(packet, "LEGAL")}
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function sliceSection(text: string, start: string, end?: string): string {
  const from = text.indexOf(start);
  if (from === -1) return text;
  const bodyStart = from + start.length;
  const to = end ? text.indexOf(end, bodyStart) : text.length;
  return text.slice(bodyStart, to === -1 ? text.length : to).trim();
}

function PacketColumn({
  title,
  body,
}: {
  title: string;
  body: ReactNode;
}) {
  return (
    <article className="packet">
      <h3>{title}</h3>
      {typeof body === "string" ? <p className="packet-body">{body}</p> : body}
    </article>
  );
}
