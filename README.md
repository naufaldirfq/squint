# Squint - Brutally Honest Landing Page Audits

Squint is a neo-brutalist landing page audit tool built for the MtP Hackathon. It performs a mock "5-second user scan" of any landing page by deploying specialized AI persona critics to analyze copy, design, hierarchy, and actions. It provides actionable, copy-ready suggestions, a score card, and visual "Before & After" mockup transformations.

## 🚀 Key Features

* **3 Dedicated AI Critics:**
  * **Busy Founder:** Zero patience, hates jargon, looking for immediate business value, cost, and time-to-setup.
  * **Skeptical Engineer:** Despises marketing fluff, looks for API code snippets, pricing, self-serve access, and docs.
  * **Non-technical Buyer:** Focuses on security, trust, company logos, testimonials, and team benefits.
* **Scorecard Metrics:** Audits pages across five core vectors (Value Prop, Primary Action, Trust, Visual Hierarchy, and Copy).
* **Before/After Transformation Mockup:** Provides side-by-side previews of the visual page transformation based on the top recommendation.
* **Visual Access Block Detection:** If a target website blocks the cloud screenshot crawler (e.g., CloudFront 403 blocks or Cloudflare CAPTCHAs), Gemini visually identifies the block page and prompts you to upload a manual screenshot.
* **Interactive Drag & Drop:** Supports both standard browsing and full-featured, state-driven drag-and-drop screenshot uploads for localhost/local projects.
* **Dynamic Sharing:** Generates custom edge-compatible OpenGraph scorecard image previews (`/api/og/[id]`) for social sharing.
* **Hybrid Data Store:** Syncs and stores audit history both locally in a JSON database (`.data/audits.json`) and in a remote **Supabase (PostgreSQL)** database for persistent storage, media hosting, and scalability.
* **Integrated Chrome Extension:** Perform audits on active pages directly from your browser toolbar (source files under `extension/`).
* **Squint Intro Video:** Includes a fully animated HTML-based HyperFrames video composition highlighting core mechanics (located under `videos/squint-intro/`).
* **Pendo Analytics Instrumentation:** Features full Novus by Pendo integration monitoring 8 custom actions (e.g. audit submissions, screenshot upload methods, share triggers, and fallback flow activation).

## 🛠 Tech Stack

* **Framework:** Next.js 16 (App Router + Turbopack)
* **Styling:** Tailwind CSS v4 (Pure CSS-in-JS + CSS variables design system)
* **AI Model:** Gemini 3.1 Flash-Lite (via `@google/generative-ai`)
* **Screenshot Engine:** Microlink API (for cloud capture)
* **Database & Cloud Storage:** Supabase (PostgreSQL client + Storage Bucket) + Local JSON DB
* **Analytics Engine:** Novus by Pendo Web SDK
* **Video Composition:** HyperFrames (GSAP and visual assets)

---

## ⚙️ Getting Started

### 1. Environment Configuration
Create a `.env.local` file in the root of the project and add your Gemini API key and Supabase credentials:

```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configurations (Optional for local-only fallback, recommended for full sync)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration
To set up the Supabase database schema, run the migration script:
```bash
node scripts/migrate.js
```
Or apply the SQL migration file found in `supabase/migrations/20260611120241_create_audits_table.sql` directly to your Supabase SQL Editor.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📸 Local/Localhost Auditing
Because public cloud screenshot crawlers cannot access your local loopback (`localhost:3000`), when you audit a local project, Squint's API will output a warning. 
Simply take a screenshot of your local page manually, drag-and-drop it into the **Fallback Screenshot Upload** box, choose your critic, and click **Audit** to run a real Gemini Vision analysis on your local design!

---

## 🧩 Chrome Extension Installation
To install the Squint extension locally in Chrome:
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle at the top right.
3. Click **Load unpacked** at the top left.
4. Select the `extension/` directory from this project workspace.
5. Open the extension popup from your toolbar on any webpage to submit it for audit!
See [CHROMEWEBSTORE.md](file:///Users/mekari/Documents/project/squint/CHROMEWEBSTORE.md) for web store listing details.
