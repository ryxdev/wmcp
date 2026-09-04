# Incident console

A professional ops desk for the WebMCP Challenge. One page for a human and an agent. Three tools. No login.

## Live URL

https://ryxdev.github.io/wmcp/ops/

## Cold path

1. Use **ChatGPT desktop** (not the web app).
2. **Work** / **Codex**.
3. Open the built-in browser with **⌘⇧B**.
4. **Settings › Browser › Permissions** — enable site tools.
5. Open https://ryxdev.github.io/wmcp/ops/
6. Ask the agent to **packetize** / **redact** / **approve**.
7. **Recently used** must show `packetize` → `redact` → `approve` and land on `/ops/status`.

**Luna** does not have WebMCP. Use Sol/Terra / the ChatGPT desktop path above.

The ticket thread is a fake tenant incident: checkout failures after a token rotation, a customer name, and two live-looking keys that are **not real**. The keys sit in an unlabeled paste.

```
sk-demo-c4e81b90a2f6d17e-ops-console
AKIAFAKE7Q2NEXUS9OPS
```

`packetize` reads the seeded ticket, sorts it into Status / Internal / Legal, and does not miss the keys. There is no ticket-system API, no Slack API, no PagerDuty API, no SSO, and no real secrets.

## Why WebMCP

WebMCP (`document.modelContext.registerTool`) lets the page offer the same actions the buttons already run. The agent does not scrape the thread. It calls `packetize`, then `redact`, then `approve`, while you watch the paint land.

This repo feature-detects only `document.modelContext?.registerTool`. It does not use `navigator.modelContext`. If `registerTool` is missing on first paint (common in the ChatGPT in-app browser), the ops view keeps polling until it appears. Tools register for that view only, with an `AbortSignal` that aborts when the view goes away (including navigation to `/ops/status`).

## Three tools

| Tool | Kind | What it does |
| --- | --- | --- |
| `packetize` | read (`readOnlyHint` + `untrustedContentHint`) | Sorts the seeded ticket. Output capped at ~1.5k characters. Works on first load — no extra click. |
| `redact` | write | Paints the key or the customer name black **on the page**. Not a host confirm dialog. You can also click the field. |
| `approve` | write | Same as the on-page Approve button. Opens `/ops/status` after both fields are painted. |

The repo **must be Public**. GitHub Pages on a private repo is not a cold URL. First-time setup (once, repo Settings): **Pages → Source → GitHub Actions**. Push to `main` deploys. There is no login on the site.

## How to run

```bash
npm install
npm run dev
```

Vite `base` is `/wmcp/`, so the local console is `http://localhost:5173/wmcp/ops/`.

Build check:

```bash
npm install
npm run build
```

Preview the production build (SPA fallback serves `/wmcp/ops` and `/wmcp/ops/status`):

```bash
npm run preview
```

Open `http://localhost:4173/wmcp/ops/` (preview) or https://ryxdev.github.io/wmcp/ops/. Cold load is enough — the ticket is hardcoded.

## How to test WebMCP

### ChatGPT desktop in-app browser

Site tools are ChatGPT's WebMCP implementation in the desktop app's built-in browser. Follow **Cold path** above. Use the desktop app, not the web app.

Do not use `toolautosubmit`. The human desk stays visible when WebMCP is present.

### Chrome flag

1. Chrome 150+ (channel that includes the WebMCP origin trial / flag).
2. Enable `chrome://flags/#enable-webmcp-testing` and relaunch.
3. Open https://ryxdev.github.io/wmcp/ops/ or local `http://localhost:5173/wmcp/ops/` (secure context / localhost).
4. In DevTools:

```js
typeof document.modelContext?.registerTool
// "function"

const tools = await document.modelContext.getTools()
tools.map((t) => t.name)
// ["approve", "packetize", "redact"]

await document.modelContext.executeTool(
  tools.find((t) => t.name === "packetize"),
  {},
)
```

Then execute `redact` with `{ "target": "key" }` and `{ "target": "customer" }`, then `approve`. The page should navigate to `/ops/status` (`https://ryxdev.github.io/wmcp/ops/status` on Pages).

## License

MIT. See [LICENSE](LICENSE).

This repo also has the original dump board at https://ryxdev.github.io/wmcp/ — not the judge path.
