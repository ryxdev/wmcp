/**
 * Hardcoded fake incident. Every credential is a demo token.
 * Never a real secret, Slack workspace, or PagerDuty account.
 */
export const INCIDENT = {
  id: "INC-2847",
  title: "auth-gateway 5xx after deploy",
  severity: "SEV-1",
  region: "us-east-1",
  deploy: "definitely-not-friday",
  customer: "Marigold Finch",
  account: "Acme Veterinary (demo)",
  apiKey: "sk-demo-9f3c1a2e7b44d0c8-incident-dump",
  cloudKey: "AKIAFAKE0R0TATED9CREDS",
  joke: "On-call swapped the runbook for a mango lassi recipe. It did not page quieter.",
  publicBlurb:
    "Elevated checkout errors after a deploy. No confirmed data loss. Investigating.",
} as const;

export const PAGER_ROWS = [
  "03:08  P1  AUTH_GATEWAY  5xx=41%  region=us-east-1",
  "03:08  P1  SYNTHETIC_CHK  login_probe timeout  12s",
  "03:09  P2  CHECKOUT_LAT   p99=4.8s  shop=edge",
  "03:09  P3  CERT_WATCH     expires_in=400d  (not today)",
  "03:10  P2  QUEUE_DEPTH    payments=184  retry=hot",
  "03:11  P1  AUTH_GATEWAY  5xx=47%  deploy=definitely-not-friday",
  "03:12  P1  PAGER_WALL    14 firing  0 acked  fridge_audible=true",
  "03:13  P2  CRM_HINT      acct=see-thread  plan=pro",
  "03:14  P3  JOKE_SVC      smoothie_runbook_loaded=true",
  "03:15  P1  AUTH_GATEWAY  fallback_secret_referenced  (unlabeled paste)",
] as const;

export const SLACK_NOISE = [
  {
    t: "03:11",
    who: "jen",
    text: "deploy definitely-not-friday is cooking. I named it. I deserve this.",
  },
  {
    t: "03:12",
    who: "rafi",
    text: "pager is a wall. I can hear it from the fridge. not a real PagerDuty page — local fake text.",
  },
  {
    t: "03:13",
    who: "jen",
    text: "customer ping in the pile — look later, thread is soup.",
  },
  {
    t: "03:14",
    who: "rafi",
    text: "laptop paste, do not scrape the first two screens:",
  },
] as const;

/** Request-id lookalikes that are not credentials. */
export const DECOY_TOKENS = [
  "req=8f3a19c2",
  "cid=b00c-cafe",
  "trace=aae19d00ff",
  "span=c0ffee99",
  "nonce=demo-not-a-key",
  "ttl=12m",
] as const;
