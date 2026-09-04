/**
 * Hardcoded fake ops incident. Every credential is a demo token.
 * Never a real secret, ticket system, or customer environment.
 */
export const OPS_INCIDENT = {
  id: "INC-9104",
  ticket: "TKT-18442",
  title: "Checkout session rejected after tenant token rotation",
  severity: "SEV-2",
  service: "checkout-api",
  region: "us-west-2",
  environment: "production",
  opened: "14m ago",
  assignee: "You",
  customer: "Meridian Harbor Health",
  account: "mhh-prod-18442",
  apiKey: "sk-demo-c4e81b90a2f6d17e-ops-console",
  cloudKey: "AKIAFAKE7Q2NEXUS9OPS",
  publicBlurb:
    "Intermittent checkout failures after a token rotation. Sessions are being reissued. No confirmed data loss.",
} as const;

export const OPS_THREAD = [
  {
    id: "c1",
    t: "03:38",
    who: "Priya Chen",
    role: "Support",
    text: "Tenant opened TKT-18442 from the billing portal. Checkout returns 401 on retry after their overnight rotation. They want a same-day statement.",
  },
  {
    id: "c2",
    t: "03:41",
    who: "Marcus Cole",
    role: "On-call",
    text: "Acknowledged. checkout-api p99 is up in us-west-2 only. I am pulling the tenant thread before we page anyone else.",
  },
  {
    id: "c3",
    t: "03:44",
    who: "Marcus Cole",
    role: "On-call",
    text: "They dropped this in the ticket without a label. Leaving it in the thread so packetize can see it — do not scrape the first two screens.",
    paste: true,
  },
  {
    id: "c4",
    t: "03:47",
    who: "Priya Chen",
    role: "Support",
    text: "Customer asked whether we will name them on the public page. Hold that until legal paints the record.",
  },
] as const;
