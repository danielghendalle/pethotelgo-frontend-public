/**
 * PetHotelGO — Cloudflare Worker reverse proxy.
 *
 * One HTTPS origin (https://<name>.<user>.workers.dev) that:
 *   - serves the SPA from an Oracle Object Storage bucket   (GET /*)
 *   - proxies the REST API to the backend instance          (/api/*)
 *
 * Because the browser only ever talks to this Worker (HTTPS, same origin):
 *   - no mixed-content blocking, even if BACKEND_ORIGIN is http://
 *   - no CORS config needed on the backend
 *   - deep links / refresh work (SPA fallback to index.html below)
 *
 * Config is in wrangler.toml ([vars]). Nothing to edit in this file.
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ---- API -------------------------------------------------------------
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      const origin = env.BACKEND_ORIGIN.replace(/\/+$/, "");
      const target = origin + url.pathname + url.search;
      // Re-use method, headers and body from the incoming request.
      return fetch(new Request(target, request), { redirect: "manual" });
    }

    // ---- Static site from the bucket ------------------------------------
    const base = env.BUCKET_BASE.replace(/\/+$/, "") + "/";
    const key = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const originUrl = base + encodeURI(key);

    // Only the hashed files under assets/ are immutable — safe to cache at
    // Cloudflare's edge. Everything else (index.html, sw.js, manifest, icons)
    // must revalidate on every request or a deploy won't take effect until
    // the edge cache happens to expire. Also purge any entry a previous
    // Worker version may have cached under the old cacheEverything-for-all
    // behavior, so this self-heals instead of waiting out the old TTL.
    const isImmutableAsset = key.startsWith("assets/");
    const cf = isImmutableAsset
      ? { cacheEverything: true }
      : { cacheTtl: 0, cacheEverything: false };

    if (!isImmutableAsset) {
      ctx.waitUntil(caches.default.delete(originUrl));
    }

    let res = await fetch(originUrl, { cf });

    if (!isImmutableAsset) {
      const headers = new Headers(res.headers);
      headers.set("cache-control", "no-cache");
      res = new Response(res.body, { status: res.status, headers });
    }

    // SPA fallback: unknown path with no file extension -> index.html (200).
    // Real missing assets (.js/.css/.png/...) keep their 404.
    const looksLikeRoute = !key.split("/").pop().includes(".");
    if ((res.status === 404 || res.status === 403) && looksLikeRoute) {
      ctx.waitUntil(caches.default.delete(base + "index.html"));
      const index = await fetch(base + "index.html", {
        cf: { cacheTtl: 0, cacheEverything: false },
      });
      const headers = new Headers(index.headers);
      headers.set("content-type", "text/html; charset=utf-8");
      headers.set("cache-control", "no-cache");
      return new Response(index.body, { status: 200, headers });
    }

    return res;
  },
};
