# v6 — scroll photography

Real workshop photograph in a sticky scene, expanding with natural page scrolling. Large typography, sequential section reveals, subtle mouse-only card tilt. The former illustrated car and controls have been removed.

Rebuild: `node scripts/build-v6.mjs`, then `npm run build`.
Validate: `scripts/check-v6.cjs` with existing Puppeteer and a running Whale/Chrome debug endpoint (`PUPPETEER_PATH`, `BROWSER_URL`).

Motion toggle and system reduced-motion preference are supported. RSS titles/summaries and core actions remain from v5. No new dependencies; v1–v5 stay frozen.
