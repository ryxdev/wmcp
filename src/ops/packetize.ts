import { OPS_INCIDENT } from "./incident";

/** Chrome / WebMCP guidance: keep a single tool output near 1.5k characters. */
export const OPS_PACKET_CAP = 1500;

/**
 * Sort the seeded ticket thread into Status / Internal / Legal.
 * Reads the hardcoded ops record — not the DOM — so a buried key cannot be missed.
 */
export function packetizeOps(): string {
  const lines = [
    "STATUS",
    `${OPS_INCIDENT.id} ${OPS_INCIDENT.ticket} ${OPS_INCIDENT.title}.`,
    `${OPS_INCIDENT.severity}. ${OPS_INCIDENT.service}. ${OPS_INCIDENT.region}. ${OPS_INCIDENT.environment}.`,
    OPS_INCIDENT.publicBlurb,
    "",
    "INTERNAL",
    `Customer: ${OPS_INCIDENT.customer} / ${OPS_INCIDENT.account}`,
    `API key: ${OPS_INCIDENT.apiKey}`,
    `Cloud key: ${OPS_INCIDENT.cloudKey}`,
    "Keys arrived as unlabeled paste in the tenant ticket thread.",
    "Noise is a local fake ticket. No Jira, Slack, or PagerDuty APIs.",
    "",
    "LEGAL",
    "Do not publish keys or the customer name. Paint those fields on the page, then approve.",
  ];

  const text = lines.join("\n");
  if (text.length <= OPS_PACKET_CAP) return text;
  return `${text.slice(0, OPS_PACKET_CAP - 1)}…`;
}

export function opsPacketHasSecrets(text: string): boolean {
  return (
    text.includes(OPS_INCIDENT.apiKey) &&
    text.includes(OPS_INCIDENT.cloudKey) &&
    text.includes(OPS_INCIDENT.customer)
  );
}

const _boot = packetizeOps();
if (_boot.length > OPS_PACKET_CAP || !opsPacketHasSecrets(_boot)) {
  throw new Error("ops packetize contract: secrets must fit inside the 1.5k cap");
}
