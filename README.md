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
* **Data Store:** Local filesystem JSON database (`.data/audits.json`) for audit history.

## 🛠 Tech Stack

* **Framework:** Next.js 16 (App Router + Turbopack)
* **Styling:** Tailwind CSS v4 (Pure CSS-in-JS + CSS variables design system)
* **AI Model:** Gemini 3.1 Flash-Lite (via `@google/generative-ai`)
* **Screenshot Engine:** Microlink API (for cloud capture)

---

## ⚙️ Getting Started

### 1. Environment Configuration
Create a `.env.local` file in the root of the project and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📸 Local/Localhost Auditing
Because public cloud screenshot crawlers cannot access your local loopback (`localhost:3000`), when you audit a local project, Squint's API will output a warning. 
Simply take a screenshot of your local page manually, drag-and-drop it into the **Fallback Screenshot Upload** box, choose your critic, and click **Audit** to run a real Gemini Vision analysis on your local design!
