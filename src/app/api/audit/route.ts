import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { saveAudit } from "@/lib/db";
import { captureScreenshot } from "@/lib/screenshot";
import { GoogleGenerativeAI } from "@google/generative-ai";

const PENDO_TRACK_URL = "https://data.pendo.io/data/track";
const PENDO_INTEGRATION_KEY = "37f353d5-8a81-465c-a538-c2bcb1b7e7ba";

async function pendoTrackServer(event: string, properties: Record<string, unknown>) {
  try {
    await fetch(PENDO_TRACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pendo-integration-key": PENDO_INTEGRATION_KEY,
      },
      body: JSON.stringify({
        type: "track",
        event,
        visitorId: "system",
        accountId: "system",
        timestamp: Date.now(),
        properties,
      }),
    });
  } catch (err) {
    console.error("Pendo server-side track failed:", err);
  }
}

const PERSONA_RUBRICS = {
  founder: {
    name: "Busy Founder",
    instructions: `You are a Busy Founder. You have zero patience, a million things to do, and you run on coffee and anxiety.
When looking at this landing page screenshot:
- You hate fluff, long paragraphs, and slow loading.
- You immediately want to know: "What is the concrete business value? How much does it cost? How fast can I set it up?"
- Give a very honest, impatient critique. Your score for value-prop will be low if it's not clear in 3 seconds.`
  },
  engineer: {
    name: "Skeptical Engineer",
    instructions: `You are a Skeptical Software Engineer. You hate marketing buzzwords like "synergize", "paradigm shift", "magical", and "AI-powered" (unless it explains exactly how it works).
When looking at this landing page screenshot:
- You look for: "Where is the documentation? Is there a code snippet? What is the tech stack? Where is the pricing?"
- You despise "Book a demo" or "Talk to sales" CTAs without clear pricing or self-serve access.
- Give a highly technical, skeptical critique. If the headline is overly polished marketing copy with zero technical substance, score it very low.`
  },
  buyer: {
    name: "Non-technical Buyer",
    instructions: `You are a Non-technical Business Buyer. You are looking for a solution for your team but you don't care about code.
When looking at this landing page screenshot:
- You look for trust: "Who else uses this? Are there testimonials? Is it secure? What is the refund policy?"
- You want to understand: "How does it help my team? Is it easy to use? Do I need to talk to IT?"
- Give a critique focused on trust, social proof, and clarity of benefits over features.`
  }
};

const JSON_SCHEMA_INSTRUCTION = `
You must analyze the landing page screenshot and return your feedback in STRICT JSON format matching this schema:
{
  "fiveSecondRead": "A short, punchy first-person quote (10-15 words) capturing your initial 3-second gut reaction to this landing page. Be brutally honest and characteristic of your persona.",
  "scores": {
    "valueProp": number (1 to 10),
    "primaryAction": number (1 to 10),
    "trust": number (1 to 10),
    "visualHierarchy": number (1 to 10),
    "copy": number (1 to 10)
  },
  "narration": "A longer first-person narrative (2-3 sentences) detailing your detailed thoughts as you browse the page, highlighting specific friction points.",
  "topFixes": [
    {
      "id": 1,
      "category": "e.g. HERO SECTION or CTA CLARITY or TRUST ELEMENTS",
      "level": "e.g. Fix ASAP or Critical or Recommendation",
      "problem": "One sentence describing the specific design or copy issue.",
      "critique": "A short, sharp critique explaining why it failed.",
      "current": "The text or description of the current element seen on the page.",
      "suggestion": "Your copy-ready suggested rewrite or fix."
    },
    ... (exactly 3 items)
  ]
}
`;

function getMockAudit(url: string, persona: string) {
  const fixes = [
    {
      id: 1,
      category: "HERO SECTION",
      level: "Fix ASAP",
      problem: "The headline uses vague, meaningless business jargon.",
      critique: "Nobody buys 'synergy' or 'paradigms'. Speak to the customer like a real human being.",
      current: "Synergize your workflow paradigms for maximum efficiency.",
      suggestion: "Automate your boring daily tasks in 5 minutes."
    },
    {
      id: 2,
      category: "CTA CLARITY",
      level: "Fix ASAP",
      problem: "'Get Started' is high friction and gives no context.",
      critique: "I don't know if clicking this will ask for my credit card, redirect me to a calendar, or make me fill out a 20-field form.",
      current: "Get Started",
      suggestion: "Start Free Trial (No Credit Card Required)"
    },
    {
      id: 3,
      category: "TRUST & SOCIAL PROOF",
      level: "Recommendation",
      problem: "No customer logos or testimonials are visible above the fold.",
      critique: "If no one else is using your tool, why should I trust you with my email and data?",
      current: "Join thousands of users.",
      suggestion: "Show logos of 3 recognizable companies using it, or embed a real testimonial quote."
    }
  ];

  let read = "I have no idea what this does. It looks like a classic template copy-paste.";
  let narr = "I landed, blinked, saw a massive abstract hero graphic, and left because I didn't see pricing or benefits. The jargon headline made me physically cringe.";
  let scores = { valueProp: 2, primaryAction: 4, trust: 2, visualHierarchy: 5, copy: 3 };

  if (persona === "engineer") {
    read = "Looks like marketing fluff. Where is the documentation and self-serve sign up?";
    narr = "The page tries to sell me 'magical developer productivity' but doesn't show a single line of code or technical architecture. 'Book a Demo' button is an immediate bounce for me.";
    scores = { valueProp: 3, primaryAction: 2, trust: 3, visualHierarchy: 6, copy: 2 };
  } else if (persona === "buyer") {
    read = "Is this secure? Who is using this? I don't see any customer reviews.";
    narr = "The site talks a lot about features, but doesn't explain how it keeps my team's data safe. No testimonials, case studies, or corporate logos makes me suspect this is a weekend project.";
    scores = { valueProp: 4, primaryAction: 5, trust: 1, visualHierarchy: 5, copy: 4 };
  }

  return {
    fiveSecondRead: read,
    scores,
    narration: narr,
    topFixes: fixes
  };
}

const isLocalUrl = (urlStr: string) => {
  try {
    const cleanUrl = urlStr.trim().replace(/^https?:\/\//i, "");
    return /^(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i.test(cleanUrl);
  } catch {
    return false;
  }
};

export async function POST(req: NextRequest) {
  try {
    const { url, persona, screenshot: uploadedScreenshot } = await req.json();

    if (!persona || (!url && !uploadedScreenshot)) {
      return NextResponse.json(
        { error: "Persona and either URL or uploaded screenshot are required." },
        { status: 400 }
      );
    }

    const auditId = nanoid(10);
    let screenshotBase64 = uploadedScreenshot || "";

    // Step 1: Capture screenshot if not uploaded
    if (!screenshotBase64 && url) {
      if (isLocalUrl(url)) {
        return NextResponse.json(
          { error: "Localhost and local network URLs cannot be captured by the screenshot API. Please take a screenshot of your local page manually and upload it using the fallback uploader below." },
          { status: 400 }
        );
      }
      try {
        screenshotBase64 = await captureScreenshot(url);
      } catch (error: unknown) {
        const err = error as Error;
        console.error("Screenshot capture failed:", err);

        // Track screenshot capture failure
        pendoTrackServer("screenshot_capture_failed", {
          url: url || "",
          persona,
          errorMessage: (err.message || "Unknown error").substring(0, 200),
        });

        return NextResponse.json(
          { error: `Screenshot capture failed: ${err.message || "The screenshot service could not access the URL"}. Please take a screenshot manually and upload it using the fallback uploader below.` },
          { status: 400 }
        );
      }
    }

    // Default mock image if screenshot fails and we have no uploaded image
    if (!screenshotBase64) {
      screenshotBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }

    // Step 2: Run critique via Gemini or fallback
    const geminiKey = process.env.GEMINI_API_KEY;
    let auditResult;

    const selectedPersona = PERSONA_RUBRICS[persona as keyof typeof PERSONA_RUBRICS] || PERSONA_RUBRICS.founder;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-3.1-flash-lite",
          generationConfig: {
            responseMimeType: "application/json",
          }
        });

        const systemPrompt = `
          You are analyzing a landing page screenshot.
          ${selectedPersona.instructions}
          
          CRITICAL: Before analyzing, look at the screenshot. 
          If the screenshot is an error page (like a CloudFront "403 ERROR", a Cloudflare CAPTCHA/challenge page, "Access Denied", "Pardon Our Interruption", or a blank/completely black or white image), you MUST stop immediately and return a JSON object containing only an "error" key explaining the block.
          Example: { "error": "The target website is blocking our screenshot bot (CloudFront 403 Error). Please capture a screenshot manually and upload it using the fallback box below." }
          
          Otherwise, if it is a valid website screenshot, proceed with the audit and return the feedback in the following format:
          ${JSON_SCHEMA_INSTRUCTION}
        `;

        // Extract base64 details
        const base64Data = screenshotBase64.replace(/^data:image\/\w+;base64,/, "");
        const mimeType = screenshotBase64.match(/^data:(image\/\w+);base64,/)?.[1] || "image/png";

        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType
          }
        };

        const result = await model.generateContent([
          systemPrompt,
          imagePart
        ]);

        const text = result.response.text();
        auditResult = JSON.parse(text);

        if (auditResult.error) {
          // Track access block detection
          pendoTrackServer("access_block_detected", {
            url: url || "",
            persona,
            blockType: "ai_detected",
            errorMessage: (auditResult.error as string).substring(0, 200),
          });

          return NextResponse.json({ error: auditResult.error }, { status: 400 });
        }
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Gemini API call failed, using mock generator:", error);
        // If Gemini threw an error because of the image or parsing, check if we had a parsing error and bubble it up
        if (error.message && error.message.includes("JSON")) {
          return NextResponse.json({ error: "Failed to parse critique from Gemini. Please try again with a cleaner screenshot." }, { status: 400 });
        }
        // Track fallback to mock audit
        pendoTrackServer("audit_fallback_to_mock", {
          url: url || "",
          persona,
          errorMessage: (error.message || "Unknown error").substring(0, 200),
          hasGeminiKey: true,
        });

        auditResult = getMockAudit(url || "Uploaded Screenshot", persona);
      }
    } else {
      console.log("No GEMINI_API_KEY configured. Using local mock generator.");

      // Track fallback to mock audit (no API key)
      pendoTrackServer("audit_fallback_to_mock", {
        url: url || "",
        persona,
        errorMessage: "No GEMINI_API_KEY configured",
        hasGeminiKey: false,
      });

      auditResult = getMockAudit(url || "Uploaded Screenshot", persona);
    }

    // Step 3: Save results to database
    const record = {
      id: auditId,
      url: url || "Uploaded Screenshot",
      persona,
      timestamp: new Date().toISOString(),
      screenshot: screenshotBase64,
      ...auditResult
    };

    await saveAudit(record);

    return NextResponse.json({ id: auditId });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Audit API handler error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
