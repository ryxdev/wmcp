/** Vite `base`. `/wmcp/` on GitHub Pages; `/` if the base is ever reset. */
const BASE = import.meta.env.BASE_URL;

export const OPS_PATH = `${BASE}ops/`;
export const OPS_STATUS_PATH = `${BASE}ops/status`;

export function isOpsPath(pathname: string): boolean {
  return /\/ops\/?$/.test(pathname);
}

export function isOpsStatusPath(pathname: string): boolean {
  return /\/ops\/status\/?$/.test(pathname);
}
