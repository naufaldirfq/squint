# Changelog

All notable changes to the Squint project will be documented in this file.

## [0.1.0] - 2026-06-09

### Added
- **Next.js 16 App & Tailwind v4 Configuration:** Initialized the Next.js App Router workspace and configured PostCSS to use Tailwind CSS v4.
- **Neo-Brutalist Design System:** Configured colors, margins, spacing, and box shadows in `globals.css` matching the Stitch hackathon templates.
- **Local JSON Database:** Created `src/lib/db.ts` file-based persistent database store (`.data/audits.json`) to track and save scorecards.
- **Cloud Screenshot Integration:** Added `src/lib/screenshot.ts` utilizing the Microlink API to take screenshots of target landing pages and compile them to base64 images.
- **Gemini Vision Critique Engine:** Implemented `/api/audit` using the `gemini-3.1-flash-lite` model to analyze screenshots with custom system instructions corresponding to selected user personas (Busy Founder, Skeptical Engineer, Non-technical Buyer).
- **Interactive Drag & Drop Fallback:** Added native React drag-and-drop event handlers in `AuditForm.tsx` to handle custom screenshot uploads for local network/localhost pages.
- **Visual Block & Error Detection:** Added visual screen checking in the Gemini Vision prompt. If a website blocks our crawler (e.g. CloudFront 403 or CAPTCHAs), Gemini returns a structured error to the client, telling the user to use the drag-and-drop fallback.
- **Dynamic OG Image Generator:** Created `/api/og/[id]` edge route to dynamically output social scorecard preview sharing cards.

### Fixed
- **Invisible selected critic card & footer background styling:** Resolved browser CSS caching/hydration errors by defining theme custom variables directly inside the `:root` selector of `globals.css`.
