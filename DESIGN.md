# v4 — 정비소 소개 사이트 리뉴얼
Active · 2026-10-02. This v4 direction supersedes historical visual/layout guidance below.

## Primary viewport refinement
1920×1080 desktop is the primary design target. Use a 1560px content width (180px side margins), 104px hero heading, large storefront photograph and 18px introduction. Header, introduction and yellow service strip fill the first 1080px viewport. Desktop rules start at 1440px; preserve smaller desktop/tablet/mobile layouts. Scale section headings, body copy, cards and contact/map together. Verify a 1920×1080 screenshot and desktop geometry alongside existing responsive checks.

## Direction
Warm ivory #f5f3ed, ink #202320, yellow #f6cf35. Editorial split hero with factual introduction, oversized Korean typography and a clearly visible real storefront photograph. Preserve the existing logo. Yellow service strip, numbered service rows, pale work-log section, dark visit section and restrained footer. No generated garage photography, fabricated testimonials or unsupported claims.

## Structure and behavior
Header → introduction/photo → services → live RSS work log → contact/map → footer. Reuse current RSS/cache/retry, original titles, 3/6-card pagination, navigation and business-hours logic. Desktop split layouts collapse to single columns on mobile. Preserve keyboard menu/Escape, visible focus, reduced-motion preference, thumbnail contain and 4:3 aspect ratio. Existing dependency set only.

## Versioning and verification
Root is current v4 source. Preserve v1/v2/v3 exactly; publish a separate local build snapshot at `/versions/v4/index.html`, include it in the comparison index and record hashes. Refresh v4 manually after subsequent source edits. Build, RSS regression and browser flow tests; visually inspect desktop/mobile captures. No production deployment requested.

---

# Design
## Source of truth
Historical v3 decisions · 2026-10-02. Existing landing page screenshot, v2 source previews, repository, user-supplied 50-item RSS and Chrome inspection of ablymotors blog. The user's latest guidance supersedes older BMW/MINI-only specifications.
## Brand
Real working garage, confident and practical. MINI is a visual signature, not an admission restriction. Preserve the existing logo, yellow accent and genuine workshop photography. Avoid invented promises, brand lists as a headline, generic English slogans and decorative counters.
## Product goals
Help visitors recognize the workshop, understand real work and reach phone/directions. Keep automatic latest records. No booking system, redesign of the logo, search application or deployment in this task.
## Personas and jobs
Owners assessing a repair shop; returning visitors looking for contact/location. Mobile and desktop.
## Information architecture
Header → real workshop hero and contact → concise service scope → RSS thumbnail cards → visit information and map → footer.
## Design principles
Photography proves context. Each case communicates vehicle, concern and documented work. Keep original sources accessible. Remove repetition before adding components. Never invent repair results from titles or excerpts.
## Visual language
Charcoal #171b1c, warm paper #f4f2eb for readable case content, yellow #ffc107 for primary action. Existing Korean font. Restrained borders, no button glow or grid texture. Generous but bounded spacing. Real images, no generated repair photographs. CSS-only subtle motion with reduced-motion support.
## Components
Reuse HeroSection, ServicesSection, PortfolioSection/BlogCards, TopNav, ContactSection and MapPanel. All cards use current RSS thumbnails, original titles and dates. No manually selected case data. Feed retains cache/retry behavior. Tokens live in src/styles.css.
## Accessibility
Semantic headings, visible keyboard focus, readable contrast, meaningful alt text, labelled navigation and touch controls. Aim for WCAG AA; no formal certification claimed.
## Responsive behavior
Desktop 3-column case grid, mobile single column; desktop starts with 6, mobile with 3; more adds the same count and resizing preserves explicitly expanded records. Titles remain intact in DOM and clamp to 3 visible lines. Preserve visible mobile phone action; no duplicate fixed bottom bar. Contact contains information and map only; the bottom three-photo gallery has been removed. Check widths 320, 390, 768, 1024, 1440, 1920. RSS images use contain in both proxy generation and CSS within 4:3 frames. Card dates, links and counts are at least 14px.
## Interaction states
Preserve loading, cached data, fetch error/retry, more records and image fallback. On uncached feed failure, keep retry and original blog access visible. Empty feed must offer original blog link.
## Content voice
Short Korean descriptions of documented work. MINI character through photos/cases, not repeated exclusive wording. All latest-feed titles must render the RSS/JSON title verbatim, including edits to existing posts. No per-post title overrides.
## Implementation constraints
React/Vite/Tailwind already installed. No new production dependency. Keep RSS updater operational; every case comes from the rotating feed. Build and browser checks including phone, menu, more, fallback, navigation and overflow.
## Open questions
- [ ] Owner: business. Holiday-specific opening exceptions are unknown; preserve published hours.
- [ ] Owner: business. Parking instructions unverified; do not add.

## Execution and verification
1. Record source evidence and lock existing core flows with a browser regression check before edits.
2. Implement hero/services/contact and RSS-driven case presentation.
3. Verify build, responsive screenshots, links, fallback states and source fidelity. Review final diff independently before completion.

## Current verification contract
- Build the current source and manually refresh the v3 comparison snapshot; keep v1/v2 intact.
- `scripts/check-browser.cjs`: original JSON titles, responsive initial cards/more/rotation, 320–1920px overflow, keyboard menu/Escape, phone and source links, gallery removal, reduced motion, feed failure/retry/cache, image failure and successful alternate RSS proxy. Thumbnail URLs and CSS use contain, including old cached proxy URLs.
- `scripts/check-rss.mjs`: original XML/CDATA titles, numeric entities, RSS changes, alternate proxy success, valid-cache preservation, invalid-cache rejection and output failure.
- Local checks do not prove production Naver credentials, native app launch or an actual GitHub Pages deployment.
- Historical manual-case research is retained only in `docs/CONTENT-SOURCES.md`; those cards, assets and title overrides are absent from the current implementation.

## Bounded cleanup, 2026-10-02
Scope: RSS title/cache boundaries, thumbnail consistency, card text size, redundant section label and stale documentation. Preserve the existing hero/contact layout, source titles, original links and v1/v2 snapshots. Valid cache preservation and explicit image-error text are grounded fail-safes; accepting corrupt cache as success is not. Fix and test these boundaries before deleting duplicate CSS/labels. No new dependencies or generalized abstraction.

## Approved refinement, 2026-10-02
Keep the charcoal/yellow palette and background-photo hero. Desktop photography scales to hero height at wide viewports with a left gradient, preserving the shop and vehicle framing instead of enlarging to viewport width. Use factual titles: 광주 자동차 정비 / JM모토리, 정비 서비스, 최근 정비 사례, 오시는 길. Remove generic promises and completion claims. Contact actions appear once beside a compact plain map; gallery stays removed. Service phrases and opening-hour groups wrap as units. Historical v1/v2 stay frozen; manually refresh v3 after verification.

## v6 scroll photography · 2026-10-02
User rejected the illustrated car. Removed the model and controls. v6 now uses the actual workshop photograph in a sticky scene: normal scrolling expands an inset photograph toward full width while the introduction passes above it, then releases into services. Inspiration: the user likes Samsung-style product scroll interactions. No scroll hijacking or fabricated media. Mobile stacks the introduction and photograph. Keep motion toggle, reduced-motion preference, original RSS titles/summaries, card feedback and contact actions. No new dependencies; preserve v1–v5. Build with `node scripts/build-v6.mjs` then `npm run build`; verify scroll geometry, screenshots, responsive layouts and core functionality in Whale.

## v7 editorial workshop · 2026-10-02
Independent comparison version at `/versions/v7/index.html`. Combines the real photography and factual introduction of v5 with v4's warm paper sections and clearer editorial hierarchy. Charcoal split hero, oversized workshop name, yellow service strip, numbered services, original RSS titles and summaries, restrained contact buttons. Photography stays visible without scroll-dependent content. Existing logo, phone, hours, navigation, feed handling and responsive pagination remain from v5. No new dependencies. v1–v6 and the root v4 remain unchanged.

Build: `node scripts/build-v7.mjs` then `npm run build`. Browser verification: `scripts/check-v7.cjs`, with `PUPPETEER_PATH` and `CHROME_PATH` pointing to existing installations. Checked widths 320, 390, 768, 1024, 1440 and 1920, original titles/summaries, more, image fallback, mobile Escape, reduced motion and runtime errors. Desktop and mobile screenshots inspected. External map/thumbnail availability depends on the upstream provider.

### v7 container refinement
Desktop content width is capped at 1440px with at least 80px side margins: 1920px viewport → 1440px content, 1440px viewport → 1280px content. Header, hero, yellow strip and sections share the same alignment. Existing tablet/mobile gutters remain.
