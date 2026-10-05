# v7 — Editorial workshop

Separate version: `/versions/v7/index.html`. Preserves v1–v6 and the root page.

Uses the frozen v5 application for its existing RSS summaries, original images, navigation and business information. `experience.css` sets the visual direction; `experience.js` adds the real workshop photo, captions and section numbers.

Build with `node scripts/build-v7.mjs`, then `npm run build`.
Verify with `PUPPETEER_PATH=/path/to/puppeteer-core CHROME_PATH=/path/to/chrome node scripts/check-v7.cjs` against the local Vite server. Optional `TEST_URL` and `AUDIT_OUTPUT` select the page and screenshot directory.
