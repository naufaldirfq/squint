import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { saveAudit } from "@/lib/db";
import { captureScreenshot } from "@/lib/screenshot";
import { GoogleGenerativeAI, Part, SchemaType, Schema } from "@google/generative-ai";
import * as cheerio from "cheerio";

async function fetchPageData(url: string, includeLighthouse = true) {
  let domText = "";
  let performanceScore = null;
  let accessibilityScore = null;

  try {
    // 1. Fetch DOM and extract text via cheerio
    const response = await fetch(url);
    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove scripts, styles
      $('script, style, noscript, iframe, img, svg').remove();
      
      const title = $('title').text().trim();
      const metaDesc = $('meta[name="description"]').attr('content') || '';
      
      // Extract headings
      const h1 = $('h1').map((_, el) => $(el).text().trim()).get().join(' | ');
      const h2 = $('h2').map((_, el) => $(el).text().trim()).get().join(' | ');
      
      const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 3000); // Limit text
      
      domText = `Title: ${title}\nMeta Description: ${metaDesc}\nH1s: ${h1}\nH2s: ${h2}\nBody Snapshot: ${bodyText}`;
    }
  } catch (err) {
    console.error("Failed to fetch DOM data:", err);
  }

  if (includeLighthouse) {
    try {
      // 2. Fetch Lighthouse scores
      const pagespeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&category=ACCESSIBILITY`;
      const psRes = await fetch(pagespeedUrl);
      if (psRes.ok) {
        const psData = await psRes.json();
        performanceScore = Math.round((psData?.lighthouseResult?.categories?.performance?.score || 0) * 100);
        accessibilityScore = Math.round((psData?.lighthouseResult?.categories?.accessibility?.score || 0) * 100);
      }
    } catch (err) {
      console.error("Failed to fetch PageSpeed data:", err);
    }
  }

  return { domText, performanceScore, accessibilityScore };
}

const PERSONA_RUBRICS = {
  founder: {
    name: "Busy Founder",
    instructions: `You are a Busy Founder. You have zero patience, a million things to do, and you run on coffee and anxiety.
When looking at this landing page:
- You hate fluff, long paragraphs, and slow loading.
- You immediately want to know: "What is the concrete business value? How much does it cost? How fast can I set it up?"
- Give a very honest, impatient critique. Your score for value-prop will be low if it's not clear in 3 seconds.`
  },
  engineer: {
    name: "Skeptical Engineer",
    instructions: `You are a Skeptical Software Engineer. You hate marketing buzzwords like "synergize", "paradigm shift", "magical", and "AI-powered" (unless it explains exactly how it works).
When looking at this landing page:
- You look for: "Where is the documentation? Is there a code snippet? What is the tech stack? Where is the pricing?"
- You despise "Book a demo" or "Talk to sales" CTAs without clear pricing or self-serve access.
- Give a highly technical, skeptical critique. If the headline is overly polished marketing copy with zero technical substance, score it very low.`
  },
  buyer: {
    name: "Non-technical Buyer",
    instructions: `You are a Non-technical Business Buyer. You are looking for a solution for your team but you don't care about code.
When looking at this landing page:
- You look for trust: "Who else uses this? Are there testimonials? Is it secure? What is the refund policy?"
- You want to understand: "How does it help my team? Is it easy to use? Do I need to talk to IT?"
- Give a critique focused on trust, social proof, and clarity of benefits over features.`
  },
  inclusive: {
    name: "Inclusive Designer",
    instructions: `You are an Inclusive Designer and Accessibility Advocate. You believe the web should be usable by everyone.
When looking at this landing page:
- You look for: "Is the text readable? Is the contrast high enough? Are buttons clearly identifiable? Is the semantic structure logical?"
- You despise low-contrast gray text, tiny font sizes, and confusing visual hierarchies that are hard to navigate.
- Give a critique heavily focused on visual clarity, contrast, layout simplicity, and whether the page feels accessible to a diverse audience.`
  }
};



function getMockAudit(url: string, persona: string, customPersonaDescription?: string) {
  const fixes = [
    {
      id: 1,
      category: "HERO SECTION",
      level: "Fix ASAP",
      problem: "The headline uses vague, meaningless business jargon.",
      critique: "Nobody buys 'synergy' or 'paradigms'. Speak to the customer like a real human being.",
      current: "Synergize your workflow paradigms for maximum efficiency.",
      suggestion: "Automate your boring daily tasks in 5 minutes.",
      desktopBoundingBox: [100, 100, 200, 800] as [number, number, number, number],
      mobileBoundingBox: [150, 50, 250, 950] as [number, number, number, number]
    },
    {
      id: 2,
      category: "CTA CLARITY",
      level: "Fix ASAP",
      problem: "'Get Started' is high friction and gives no context.",
      critique: "I don't know if clicking this will ask for my credit card, redirect me to a calendar, or make me fill out a 20-field form.",
      current: "Get Started",
      suggestion: "Start Free Trial (No Credit Card Required)",
      desktopBoundingBox: [300, 400, 350, 600] as [number, number, number, number],
      mobileBoundingBox: [400, 200, 450, 800] as [number, number, number, number]
    },
    {
      id: 3,
      category: "TRUST & SOCIAL PROOF",
      level: "Recommendation",
      problem: "No customer logos or testimonials are visible above the fold.",
      critique: "If no one else is using your tool, why should I trust you with my email and data?",
      current: "Join thousands of users.",
      suggestion: "Show logos of 3 recognizable companies using it, or embed a real testimonial quote.",
      desktopBoundingBox: [600, 100, 700, 900] as [number, number, number, number],
      mobileBoundingBox: [800, 50, 900, 950] as [number, number, number, number]
    },
    {
      id: 4,
      category: "COPY LENGTH",
      level: "Recommendation",
      problem: "The feature section has huge walls of text.",
      critique: "Nobody reads paragraphs on the internet. They scan. Break this up.",
      current: "Our revolutionary platform leverages cutting-edge technology to streamline your processes, allowing you to focus on what matters most while we handle the heavy lifting in the background.",
      suggestion: "Save 10 hours a week with automated workflows.",
      desktopBoundingBox: [400, 100, 500, 900] as [number, number, number, number],
      mobileBoundingBox: [500, 50, 600, 950] as [number, number, number, number]
    },
    {
      id: 5,
      category: "VISUAL HIERARCHY",
      level: "Recommendation",
      problem: "Secondary actions compete with the primary CTA.",
      critique: "Your 'Learn More' button is the exact same size and color as 'Buy Now'. Users shouldn't have to think about which one to click.",
      current: "Learn More (solid blue button)",
      suggestion: "Learn More (ghost button or simple text link)",
      desktopBoundingBox: [300, 650, 350, 800] as [number, number, number, number],
      mobileBoundingBox: [450, 200, 500, 800] as [number, number, number, number]
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
  } else if (persona === "inclusive") {
    read = "The contrast here is terrible. I can barely read the subheadline.";
    narr = "The light gray text on a white background is an immediate accessibility failure. The visual hierarchy is confusing, and the primary call to action doesn't stand out enough for users with visual impairments.";
    scores = { valueProp: 5, primaryAction: 3, trust: 4, visualHierarchy: 2, copy: 5 };
  } else if (persona === "custom") {
    const name = customPersonaDescription || "Custom Critic";
    read = `Initial reaction from a ${name}: This is not tailored well to my specific expectations.`;
    narr = `As a ${name}, I am evaluating this page. It needs to speak more directly to my needs and preferences. Currently, it feels too generic.`;
    scores = { valueProp: 4, primaryAction: 4, trust: 4, visualHierarchy: 4, copy: 4 };
  }

  return {
    fiveSecondRead: read,
    scores,
    narration: narr,
    topFixes: fixes,
    competitorComparison: "Mock comparison: The competitor's site was much clearer and easier to navigate.",
    performanceScore: 55,
    accessibilityScore: 65,
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
    const { url, persona, customPersonaDescription, competitorUrl, screenshot: uploadedScreenshot } = await req.json();

    if (!persona || (!url && !uploadedScreenshot)) {
      return NextResponse.json(
        { error: "Persona and either URL or uploaded screenshot are required." },
        { status: 400 }
      );
    }

    const auditId = nanoid(10);
    let screenshotBase64 = uploadedScreenshot || "";
    let mobileScreenshotBase64 = "";
    let competitorScreenshotBase64 = "";
    let domText = "";
    let performanceScore = null;
    let accessibilityScore = null;
    let competitorDomText = "";

    // Step 1: Data Gathering (Screenshots, DOM, Lighthouse)
    if (url) {
      if (isLocalUrl(url)) {
        if (!screenshotBase64) {
          return NextResponse.json(
            { error: "Localhost URLs cannot be captured by the screenshot API. Please take a screenshot manually and upload it using the fallback uploader below." },
            { status: 400 }
          );
        }
      } else {
        // Concurrently run all network requests for primary and competitor pages
        let screenshotError: string | null = null;
        
        const primaryPageDataPromise = fetchPageData(url, true);
        
        let desktopScreenshotPromise: Promise<string> | null = null;
        let mobileScreenshotPromise: Promise<string> | null = null;

        if (!screenshotBase64) {
          desktopScreenshotPromise = captureScreenshot(url, false).catch(err => {
            screenshotError = err.message;
            return "";
          });
          mobileScreenshotPromise = captureScreenshot(url, true).catch(err => {
            console.error("Mobile screenshot capture failed:", err);
            return "";
          });
        }

        let competitorScreenshotPromise: Promise<string> | null = null;
        let competitorPageDataPromise: Promise<{
          domText: string;
          performanceScore: number | null;
          accessibilityScore: number | null;
        }> | null = null;

        if (competitorUrl && !isLocalUrl(competitorUrl)) {
          competitorScreenshotPromise = captureScreenshot(competitorUrl, false).catch(err => {
            console.error("Competitor screenshot capture failed:", err);
            return "";
          });
          competitorPageDataPromise = fetchPageData(competitorUrl, false).catch(err => {
            console.error("Competitor DOM scraping failed:", err);
            return { domText: "", performanceScore: null, accessibilityScore: null };
          });
        }

        const [
          primaryPageData,
          desktopScreenshotResult,
          mobileScreenshotResult,
          competitorScreenshotResult,
          competitorPageDataResult
        ] = await Promise.all([
          primaryPageDataPromise,
          desktopScreenshotPromise || Promise.resolve(screenshotBase64),
          mobileScreenshotPromise || Promise.resolve(""),
          competitorScreenshotPromise || Promise.resolve(""),
          competitorPageDataPromise || Promise.resolve({ domText: "", performanceScore: null, accessibilityScore: null })
        ]);

        if (screenshotError) {
          return NextResponse.json(
            { error: `Screenshot capture failed: ${screenshotError}. Please upload manually.` },
            { status: 400 }
          );
        }

        domText = primaryPageData.domText;
        performanceScore = primaryPageData.performanceScore;
        accessibilityScore = primaryPageData.accessibilityScore;
        screenshotBase64 = desktopScreenshotResult;
        mobileScreenshotBase64 = mobileScreenshotResult;
        competitorScreenshotBase64 = competitorScreenshotResult;
        competitorDomText = competitorPageDataResult.domText;
      }
    }

    if (!screenshotBase64) {
      screenshotBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }

    // Step 2: Run critique via Gemini or fallback
    const geminiKey = process.env.GEMINI_API_KEY;
    let auditResult;

    let selectedPersonaInstructions = "";
    let personaName = "Custom Critic";

    if (persona === "custom") {
      personaName = customPersonaDescription || "Custom Critic";
      selectedPersonaInstructions = `You are a custom critic persona: "${personaName}".
Analyze the landing page from the specific perspective and mindset of this persona: "${personaName}".
Take on their exact voice, level of patience, criteria, and concerns.
Be brutally honest, highlight friction points that this persona would care about most, and write your responses in their style and first-person perspective.`;
    } else {
      const rubric = PERSONA_RUBRICS[persona as keyof typeof PERSONA_RUBRICS] || PERSONA_RUBRICS.founder;
      personaName = rubric.name;
      selectedPersonaInstructions = rubric.instructions;
    }

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        
        const auditResponseSchema: Schema = {
          type: SchemaType.OBJECT,
          properties: {
            fiveSecondRead: { 
              type: SchemaType.STRING, 
              description: "A short, punchy first-person quote (10-15 words) capturing your initial reaction. Be brutally honest and characteristic of your persona." 
            },
            scores: {
              type: SchemaType.OBJECT,
              properties: {
                valueProp: { type: SchemaType.INTEGER, description: "Score from 1 to 10" },
                primaryAction: { type: SchemaType.INTEGER, description: "Score from 1 to 10" },
                trust: { type: SchemaType.INTEGER, description: "Score from 1 to 10" },
                visualHierarchy: { type: SchemaType.INTEGER, description: "Score from 1 to 10" },
                copy: { type: SchemaType.INTEGER, description: "Score from 1 to 10" }
              },
              required: ["valueProp", "primaryAction", "trust", "visualHierarchy", "copy"]
            },
            narration: { 
              type: SchemaType.STRING, 
              description: "A longer first-person narrative (2-3 sentences) detailing your thoughts as you browse the page, highlighting specific friction points." 
            },
            topFixes: {
              type: SchemaType.ARRAY,
              description: "List of top 5 issues found on the landing page, ordered by severity.",
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  id: { type: SchemaType.INTEGER },
                  category: { type: SchemaType.STRING, description: "e.g. HERO SECTION or CTA CLARITY or TRUST ELEMENTS" },
                  level: { type: SchemaType.STRING, description: "e.g. Fix ASAP or Critical or Recommendation" },
                  problem: { type: SchemaType.STRING, description: "One sentence describing the specific design or copy issue." },
                  critique: { type: SchemaType.STRING, description: "A short, sharp critique explaining why it failed." },
                  current: { type: SchemaType.STRING, description: "The text or description of the current element seen on the page." },
                  suggestion: { type: SchemaType.STRING, description: "Your copy-ready suggested rewrite or fix." },
                  desktopBoundingBox: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.INTEGER },
                    description: "[ymin, xmin, ymax, xmax] normalized 0-1000 representing the bounding box on the desktop screenshot. If unknown, use [0,0,0,0]."
                  },
                  mobileBoundingBox: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.INTEGER },
                    description: "[ymin, xmin, ymax, xmax] normalized 0-1000 representing the bounding box on the mobile screenshot (if provided). If unknown, use [0,0,0,0]."
                  }
                },
                required: ["id", "category", "level", "problem", "critique", "current", "suggestion"]
              }
            },
            competitorComparison: { 
              type: SchemaType.STRING, 
              description: "If competitor data is provided, write a 2-3 sentence analysis comparing this site to the competitor site. If no competitor data is provided, leave this empty." 
            },
            error: {
              type: SchemaType.STRING,
              description: "Return 'Blocked' only if the screenshot shows a CloudFront 403, CAPTCHA, or Access Denied page."
            }
          },
          required: ["fiveSecondRead", "scores", "narration", "topFixes"]
        };

        const model = genAI.getGenerativeModel({
          model: "gemini-3.1-flash-lite",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: auditResponseSchema,
          }
        });

        let systemPrompt = `
          You are analyzing a landing page screenshot (and potentially its mobile version and a competitor's page).
          ${selectedPersonaInstructions}
        `;

        if (domText) {
          systemPrompt += `\n\nHere is the scraped DOM content for context (do not rate based solely on this, but use it to inform your understanding):\n${domText}`;
        }
        if (performanceScore !== null) {
          systemPrompt += `\n\nThe site has a Lighthouse Performance Score of ${performanceScore}/100.`;
        }
        if (accessibilityScore !== null) {
          systemPrompt += `\n\nThe site has a Lighthouse Accessibility Score of ${accessibilityScore}/100.`;
        }
        if (competitorUrl && competitorScreenshotBase64) {
          systemPrompt += `\n\nYou have also been provided with a screenshot of a competitor's site (${competitorUrl}). Please provide a comparative analysis in the competitorComparison field.`;
          if (competitorDomText) systemPrompt += `\nCompetitor DOM context: ${competitorDomText}`;
        }

        systemPrompt += `
          CRITICAL: Before analyzing, look at the main screenshot. 
          If the screenshot is an error page (CloudFront 403, CAPTCHA, Access Denied), stop and return { "error": "Blocked" }.
          Otherwise, return the feedback exactly matching the schema.
        `;

        const getPart = (b64: string) => ({
          inlineData: {
            data: b64.replace(/^data:image\/\w+;base64,/, ""),
            mimeType: b64.match(/^data:(image\/\w+);base64,/)?.[1] || "image/png"
          }
        });

        const contentParts: (string | Part)[] = [systemPrompt, "Primary Desktop Screenshot:", getPart(screenshotBase64)];
        
        if (mobileScreenshotBase64) {
          contentParts.push("Mobile Viewport Screenshot:", getPart(mobileScreenshotBase64));
        }
        if (competitorScreenshotBase64) {
          contentParts.push("Competitor Desktop Screenshot:", getPart(competitorScreenshotBase64));
        }

        const result = await model.generateContent(contentParts);
        const text = result.response.text();
        auditResult = JSON.parse(text);

        if (auditResult.error) {
          return NextResponse.json({ error: "The target website is blocking our screenshot bot. Please capture manually." }, { status: 400 });
        }
      } catch (err: unknown) {
        console.error("Gemini API call failed, using mock generator:", err);
        auditResult = getMockAudit(url || "Uploaded Screenshot", persona, customPersonaDescription);
      }
    } else {
      console.log("No GEMINI_API_KEY configured. Using local mock generator.");
      auditResult = getMockAudit(url || "Uploaded Screenshot", persona, customPersonaDescription);
    }

    // Assign collected Lighthouse scores to the final result
    if (performanceScore !== null) auditResult.performanceScore = performanceScore;
    if (accessibilityScore !== null) auditResult.accessibilityScore = accessibilityScore;

    // Step 3: Save results to database
    const record = {
      id: auditId,
      url: url || "Uploaded Screenshot",
      persona,
      customPersonaDescription: persona === "custom" ? customPersonaDescription : undefined,
      timestamp: new Date().toISOString(),
      screenshot: screenshotBase64,
      mobileScreenshot: mobileScreenshotBase64 || undefined,
      competitorUrl: competitorUrl || undefined,
      competitorScreenshot: competitorScreenshotBase64 || undefined,
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
