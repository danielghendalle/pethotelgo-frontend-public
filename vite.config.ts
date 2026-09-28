import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { copyFileSync } from "fs";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// Oracle Cloud Object Storage (and most plain static hosts) have no SPA
// rewrite rule, so a hard refresh on /dashboard would 404. We ship a
// 404.html that is a byte-for-byte copy of index.html; point the bucket's
// error document at it and deep links boot the app correctly.
function spaFallback(): Plugin {
  return {
    name: "spa-404-fallback",
    apply: "build",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      try {
        copyFileSync(path.join(dist, "index.html"), path.join(dist, "404.html"));
        console.log("\n  ✓ dist/404.html written (SPA deep-link fallback)\n");
      } catch {
        /* index.html not emitted (e.g. lib build) — nothing to do */
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isGhPages = mode === "gh-pages";

  return {
  // Served from the root of a domain / CDN in production, so absolute asset
  // URLs are correct at any client-side route depth. The `gh-pages` mode
  // (public demo) is a GitHub Pages *project* site instead, served under
  // /<repo-name>/, so it needs a matching base; App.tsx reads the same value
  // back via `import.meta.env.BASE_URL` for the router's `basename`.
  base: isGhPages ? "/pethotelgo-frontend-public/" : "/",
  server: {
    host: "::",
    port: 3000,
    hmr: {
      overlay: false,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Hashed filenames + long-lived cache headers on the bucket = safe.
    assetsDir: "assets",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split big, independently-versioned vendors into their own chunks so
        // a code change doesn't invalidate the whole bundle in the PWA cache
        // and the browser can fetch them in parallel on slow mobile links.
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "motion-vendor": ["framer-motion"],
          "form-vendor": ["react-hook-form", "zod", "@hookform/resolvers"],
          "date-vendor": ["date-fns"],
        },
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Skipped for the GitHub Pages demo: a service worker scoped to
    // /pethotelgo-frontend-public/ adds install/update complexity a
    // portfolio demo doesn't need, and the manifest below is written for a
    // root-scoped deploy.
    !isGhPages && VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      // Don't run the service worker during `npm run dev`.
      devOptions: { enabled: false },
      // favicon.ico + icons live in public/ and are copied as-is; the big
      // legacy .ico is kept out of the precache via globIgnores below.
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "PetHotel — Gestão para Hotel Pet",
        short_name: "PetHotel",
        description:
          "Sistema de gestão para hotéis pet: agendamentos, clientes, pets, cartões de vacinação e histórico de estadias.",
        lang: "pt-BR",
        dir: "ltr",
        display: "standalone",
        start_url: "/dashboard",
        scope: "/",
        theme_color: "#F97316",
        background_color: "#FBF7F0",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff,woff2}"],
        // Keep the 179 KB legacy .ico and the sample svg out of the precache.
        globIgnores: ["**/favicon.ico", "**/placeholder.svg"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // App-shell fallback for client-side routes; never intercept the API.
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === "https://fonts.googleapis.com" ||
              url.origin === "https://fonts.gstatic.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Read-through cache for API GETs so the app degrades gracefully
            // when the backend is briefly unreachable. Auth/refresh excluded.
            urlPattern: ({ url, request }) =>
              request.method === "GET" &&
              /\/api\//.test(url.pathname) &&
              !/\/api\/auth\//.test(url.pathname),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-get",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
    spaFallback(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
