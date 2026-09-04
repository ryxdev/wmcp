import { INCIDENT } from "../data/incident";

/** Chrome / WebMCP guidance: keep a single tool output near 1.5k characters. */
export const PACKET_CAP = 1500;

/**
 * Sort the seeded pile into Status / Internal / Legal.
 * Reads the hardcoded dump — not the DOM — so a buried key cannot be missed.
 */
export function packetizeDump(): string {
  const lines = [
    "STATUS",
    `${INCIDENT.id} ${INCIDENT.title}. ${INCIDENT.severity}. ${INCIDENT.region}. Deploy ${INCIDENT.deploy}.`,
    INCIDENT.publicBlurb,
    "",
    "INTERNAL",
    `Customer: ${INCIDENT.customer} / ${INCIDENT.account}`,
    `API key: ${INCIDENT.apiKey}`,
    `Cloud key: ${INCIDENT.cloudKey}`,
    INCIDENT.joke,
    "Noise is local fake Slack-like + pager text. No Slack or PagerDuty APIs.",
    "",
    "LEGAL",
    "Do not publish keys or the customer name. Paint those fields on the page, then approve.",
  ];

  const text = lines.join("\n");
  if (text.length <= PACKET_CAP) return text;
  return `${text.slice(0, PACKET_CAP - 1)}…`;
}

export function packetHasSecrets(text: string): boolean {
  return (
    text.includes(INCIDENT.apiKey) &&
    text.includes(INCIDENT.cloudKey) &&
    text.includes(INCIDENT.customer)
  );
}

const _boot = packetizeDump();
if (_boot.length > PACKET_CAP || !packetHasSecrets(_boot)) {
  throw new Error("packetize contract: secrets must fit inside the 1.5k cap");
}
