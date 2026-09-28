/**
 * Drops the service-worker runtime cache that holds authenticated API
 * responses. Call on logout / hard auth failure so a cached list of pets,
 * owners, reservations, etc. can't be read back on a shared device after the
 * session ends. The precache (app shell) is intentionally left intact.
 */
export async function clearApiCache(): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.includes("api-get")).map((k) => caches.delete(k)),
    );
  } catch {
    /* best-effort — never block logout on cache eviction */
  }
}
