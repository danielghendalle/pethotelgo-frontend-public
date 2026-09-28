import { clearApiCache } from "@/utils/pwa";
import { AUTH_STORAGE_KEYS } from "./config";

/**
 * Wipes the stored session (+ the PWA runtime cache of authenticated API
 * responses) and hard-navigates to the login screen.
 *
 * The full-page navigation (rather than a client-side route change) is
 * deliberate: it also re-fetches index.html + the bundle, clearing any
 * "stuck on a stale build" state — a case seen on mobile home-screen
 * installs that were backgrounded for a long time.
 */
export function clearSessionAndRedirect(): void {
  localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  void clearApiCache();

  // Relative to the current origin — works served from a domain root or from
  // behind the Cloudflare Worker proxy (see PASSOS_DEPLOY.md).
  globalThis.location.href = "/auth";
}
