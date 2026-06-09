# Squint — One-Page PRD & 11-Day Build Plan

*Working name; rename freely. Other options: FirstLook, ColdOpen, Blink.*

> **One-liner:** Paste a URL and Squint reads your landing page as a skeptical first-time visitor — scoring clarity and handing back copy-ready fixes in ~15 seconds.

**For:** Mind the Product — *Everyone Ships Now* · **Deadline:** Sat 20 Jun, 5:00pm BST (= **11:00pm WIB**, your time)

---

## Part 1 — One-Page PRD

### Problem
Every founder, PM, and designer is too close to their own product to see it the way a stranger does. The highest-leverage question — *does a cold visitor instantly get what this is, who it's for, and what to do next?* — is the hardest to answer about your own work. Today people guess, beg colleagues for feedback, or pay for a usability test they have no time to run.

### Target user
- **Primary:** indie founders, solo makers, and PMs shipping a landing page or MVP who want a fast, honest gut-check. *(Conveniently: this is also the MtP hackathon audience and the judges themselves.)*
- **Secondary:** designers pre-handoff, marketers testing new copy.

### Value proposition
A brutally honest 5-second test, on demand, in one click — not a vague AI summary, but a *specific persona's* reaction plus prioritized, **copy-ready rewrites** you can paste in today.

### Core flow
1. User pastes a URL (or uploads a screenshot as fallback).
2. Optionally picks a persona lens: *Busy founder / Skeptical engineer / Non-technical buyer / First-time visitor.*
3. Squint screenshots the page → one vision + reasoning pass → structured critique.
4. Result page shows: the persona's **5-second read** ("here's what I think this does, who it's for, what I'd click"), **5 scores**, a short **first-person narration** of the cold landing, and the **Top 3 fixes**, each with a concrete rewrite.
5. Every result gets a **shareable URL + score image** → people share, others run it. *(Growth + Novus-traffic engine.)*

### Scope
- **Must-have:** URL input; screenshot; single LLM critique with strict JSON; 5 scores (Value-Prop Clarity, Primary Action, Trust, Visual Hierarchy, Copy); 5-second read; narration; 3 prioritized fixes with rewrites; clean shareable result page; **Novus installed**.
- **Should-have (pick ONE if time):** before/after hero rewrite mockup · persona re-run · compare two URLs.
- **Won't-have (protect scope):** accounts/login, saved history/dashboards, payments, multi-page crawl, mobile app, team features.

### Success metrics (judging-aligned)
- **Shippedness:** a stranger reaches a useful result with **no login**; 100+ unique URLs analyzed during the judging window; Novus shows the analyze → result → share funnel.
- **Product thinking:** clear ICP; output is obviously actionable.
- **Craft:** coherent UI, intentional copy, fast (<20s) result.
- **Originality:** the narration has real voice — it should feel like a sharp colleague, not a checklist.

### Why this wins (the judges are product people)
Maps cleanly onto all four 25% criteria, solves a problem the judges feel *personally*, and produces shareable artifacts that spread through their own community while judging is live (→ real Novus data = Shippedness). It also shows off current AI vision + reasoning. Their rubric literally says a small thing executed with taste beats a big idea executed messily — so build the small thing with taste.

### Stack
Next.js (App Router) on Vercel · vision-capable LLM (Claude or Gemini) via API · hosted screenshot API (ScreenshotOne / Urlbox / Browserless) with screenshot-upload fallback · zod-validated JSON + 1 retry · Tailwind + shadcn/ui · Vercel KV / Upstash for shareable-result storage + OG image · **Novus.ai** + Vercel Analytics.

### Key risks & mitigations
- **Bot-blocked / JS-heavy pages won't screenshot** → screenshot API + "paste a screenshot" fallback.
- **Flaky JSON from the model** → strict schema, low temperature, one retry, sane defaults.
- **Latency/cost on huge pages** → cap input size, strong loading state, cache by URL hash.
- **The prompt *is* the product** → spend all of Day 2 on the rubric + few-shot examples before touching any UI.

---

## Part 2 — 11-Day Build Plan

**Context:** today is Tue 9 Jun; deadline Sat 20 Jun 5pm BST (11pm WIB). Assumes a day job — weeknights ≈ 2–3 focused hrs; the **Jun 13–14 weekend is the big build block**. Submit early (Fri 19); keep Sat 20 as buffer.

**Day 1 — Tue 9 Jun · Skeleton + tracking live**
- Register on Devpost; pick name + domain.
- `create-next-app`, deploy a placeholder to Vercel — a public URL exists on day one.
- Install the **Novus.ai snippet now** so it accumulates history before judging.
- Grab API keys (LLM + screenshot provider).
- Post #1 on LinkedIn: "Building Squint for #EveryoneShipsNow," tag @Mind the Product.

**Day 2 — Wed 10 Jun · The prompt is the product**
- Write the critique system prompt + rubric; define the zod JSON schema.
- Test in the API playground on 5 real landing pages until output is sharp and reliably structured. **No UI yet** — just nail the brain.

**Day 3 — Thu 11 Jun · End-to-end (ugly)**
- Wire URL → screenshot API → LLM → parsed JSON → raw dump on a page. Prove the full loop works on a deployed URL.

**Day 4 — Fri 12 Jun · Personas + reliability**
- Add 3–4 persona presets. Add schema validation + retry. Handle bad URL / screenshot failure → screenshot-upload fallback. Light test pass.

**Days 5–6 — Sat–Sun 13–14 Jun · The big push: craft + shareability**
- Build the real scorecard UI (Tailwind/shadcn): scores, narration, Top-3 fixes with rewrites. Make it feel considered — this is 25% of the score.
- Shareable results: store each under a nanoid, route `/r/[id]`, generate an OG score image.
- Deploy. It should now be genuinely usable by a stranger.

**Day 7 — Mon 15 Jun · Polish + one delighter**
- Ship exactly ONE should-have (before/after hero, persona re-run, or compare-two).
- Tighten all copy throughout — intentional copy is explicitly graded.

**Day 8 — Tue 16 Jun · Soft launch (get real Novus data)**
- Post it properly: LinkedIn + MtP community/Slack + PM & maker communities + your network. Drive dozens of strangers to run it.
- Watch Novus; jot down interesting behaviors for the writeup.

**Day 9 — Wed 17 Jun · Iterate on real friction**
- Fix the single biggest drop-off Novus reveals (e.g., add example URLs / a one-click demo if people bounce before pasting). High-leverage changes only.

**Day 10 — Thu 18 Jun · Demo video + writeup**
- Record 2–3 min: problem → live run on a recognizable site → the fix it gives → the share/score loop.
- Write the description (what / who / tools / what you learned). Screenshot the Novus dashboard.

**Day 11 — Fri 19 Jun · Final QA + submit early**
- Cross-browser + mobile, empty states, error states, proofread.
- **Submit on Devpost** — don't wait for Saturday. Final build-in-public post with the live link.

**Sat 20 Jun — deadline 5pm BST / 11pm WIB · Buffer only**
- Contingency, reply to comments, keep sharing. Done.

---

### The crux
80% of the outcome lives in two places: the **Day-2 rubric prompt** (whether the critique feels sharp or generic) and the **shareable result page** (whether strangers spread it and fill your Novus dashboard). Protect those two; everything else is plumbing.
