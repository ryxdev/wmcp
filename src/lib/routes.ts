/** Vite `base`. `/wmcp/` on GitHub Pages; `/` if the base is ever reset. */
const BASE = import.meta.env.BASE_URL;

export const HOME_PATH = BASE;
export const STATUS_PATH = `${BASE}status`;

export function isStatusPath(pathname: string): boolean {
  return /\/status\/?$/.test(pathname);
}
