import { createClient } from "@supabase/supabase-js";

export interface AuditFix {
  id: number;
  category: string;
  level: string;
  problem: string;
  critique: string;
  current: string;
  suggestion: string;
  desktopBoundingBox?: [number, number, number, number];
  mobileBoundingBox?: [number, number, number, number];
}

export interface AuditRecord {
  id: string;
  url: string;
  persona: string;
  customPersonaDescription?: string;
  timestamp: string;
  screenshot: string; // base64 or URL path
  mobileScreenshot?: string;
  competitorUrl?: string;
  competitorScreenshot?: string;
  competitorComparison?: string;
  performanceScore?: number;
  accessibilityScore?: number;
  fiveSecondRead: string;
  scores: {
    valueProp: number;
    primaryAction: number;
    trust: number;
    visualHierarchy: number;
    copy: number;
  };
  narration: string;
  topFixes: AuditFix[];
}

export interface DBScoreExtra {
  mobileScreenshot?: string;
  competitorUrl?: string;
  competitorScreenshot?: string;
  competitorComparison?: string;
  performanceScore?: number;
  accessibilityScore?: number;
  customPersonaDescription?: string;
}

export interface DBScores {
  valueProp?: number;
  primaryAction?: number;
  trust?: number;
  visualHierarchy?: number;
  copy?: number;
  _extra?: DBScoreExtra;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing. Database operations will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadScreenshot(
  base64String: string,
  auditId: string,
  fileNameSuffix: string
): Promise<string> {
  if (!base64String) return "";
  
  if (base64String.startsWith("http://") || base64String.startsWith("https://")) {
    return base64String;
  }

  try {
    let mimeType = "image/png";
    let base64Data = base64String;
    const match = base64String.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    }

    const buffer = Buffer.from(base64Data, "base64");
    const fileExtension = mimeType.split("/")[1] || "png";
    const filePath = `${auditId}/${fileNameSuffix}.${fileExtension}`;

    if (!supabase.storage) {
      throw new Error("Supabase Storage is not initialized.");
    }

    // Attempt to create the bucket 'screenshots' programmatically if it doesn't exist
    try {
      await supabase.storage.createBucket("screenshots", {
        public: true,
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
      });
    } catch {
      // Ignore if it already exists or permissions don't allow listing/creating
    }

    const { error } = await supabase.storage
      .from("screenshots")
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("screenshots")
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.warn(`Failed to upload screenshot (${fileNameSuffix}) to Supabase Storage, falling back to inline Base64:`, err);
    return base64String;
  }
}

export async function saveAudit(record: AuditRecord): Promise<void> {
  let screenshotUrl = record.screenshot;
  let mobileScreenshotUrl = record.mobileScreenshot;
  let competitorScreenshotUrl = record.competitorScreenshot;

  if (record.screenshot) {
    screenshotUrl = await uploadScreenshot(record.screenshot, record.id, "desktop");
  }

  if (record.mobileScreenshot) {
    mobileScreenshotUrl = await uploadScreenshot(record.mobileScreenshot, record.id, "mobile");
  }

  if (record.competitorScreenshot) {
    competitorScreenshotUrl = await uploadScreenshot(record.competitorScreenshot, record.id, "competitor");
  }

  const { error } = await supabase.from("audits").insert({
    id: record.id,
    url: record.url,
    persona: record.persona,
    timestamp: record.timestamp,
    screenshot: screenshotUrl,
    five_second_read: record.fiveSecondRead,
    scores: {
      ...record.scores,
      _extra: {
        mobileScreenshot: mobileScreenshotUrl,
        competitorUrl: record.competitorUrl,
        competitorScreenshot: competitorScreenshotUrl,
        competitorComparison: record.competitorComparison,
        performanceScore: record.performanceScore,
        accessibilityScore: record.accessibilityScore,
        customPersonaDescription: record.customPersonaDescription,
      }
    },
    narration: record.narration,
    top_fixes: record.topFixes,
  });

  if (error) {
    console.error("Error saving audit to Supabase:", error);
    throw new Error(`Failed to save audit: ${error.message}`);
  }
}

export async function getLatestAuditForUrl(url: string, persona?: string): Promise<AuditRecord | null> {
  try {
    let query = supabase
      .from("audits")
      .select("*")
      .eq("url", url);

    if (persona) {
      query = query.eq("persona", persona);
    }

    const { data, error } = await query
      .order("timestamp", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return null;
    }

    const row = data[0];
    const rawScores = row.scores as DBScores | null;
    const extra = rawScores?._extra || {};

    return {
      id: row.id,
      url: row.url,
      persona: row.persona,
      customPersonaDescription: extra.customPersonaDescription,
      timestamp: row.timestamp,
      screenshot: row.screenshot,
      mobileScreenshot: extra.mobileScreenshot,
      competitorUrl: extra.competitorUrl,
      competitorScreenshot: extra.competitorScreenshot,
      competitorComparison: extra.competitorComparison,
      performanceScore: extra.performanceScore,
      accessibilityScore: extra.accessibilityScore,
      fiveSecondRead: row.five_second_read,
      scores: {
        valueProp: rawScores?.valueProp || 0,
        primaryAction: rawScores?.primaryAction || 0,
        trust: rawScores?.trust || 0,
        visualHierarchy: rawScores?.visualHierarchy || 0,
        copy: rawScores?.copy || 0,
      },
      narration: row.narration,
      topFixes: row.top_fixes as AuditFix[],
    };
  } catch (err) {
    console.error("Failed to query latest audit for URL:", err);
    return null;
  }
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Record not found
      return null;
    }
    console.error("Error getting audit from Supabase:", error);
    throw new Error(`Failed to get audit: ${error.message}`);
  }

  if (!data) return null;

  const rawScores = data.scores as DBScores | null;
  const extra = rawScores?._extra || {};
  
  return {
    id: data.id,
    url: data.url,
    persona: data.persona,
    customPersonaDescription: extra.customPersonaDescription,
    timestamp: data.timestamp,
    screenshot: data.screenshot,
    mobileScreenshot: extra.mobileScreenshot,
    competitorUrl: extra.competitorUrl,
    competitorScreenshot: extra.competitorScreenshot,
    competitorComparison: extra.competitorComparison,
    performanceScore: extra.performanceScore,
    accessibilityScore: extra.accessibilityScore,
    fiveSecondRead: data.five_second_read,
    scores: {
      valueProp: rawScores?.valueProp || 0,
      primaryAction: rawScores?.primaryAction || 0,
      trust: rawScores?.trust || 0,
      visualHierarchy: rawScores?.visualHierarchy || 0,
      copy: rawScores?.copy || 0,
    },
    narration: data.narration,
    topFixes: data.top_fixes as AuditFix[],
  };
}

export async function listAudits(limit: number = 10): Promise<AuditRecord[]> {
  const { data, error } = await supabase
    .from("audits")
    .select("id, url, persona, timestamp, scores, five_second_read")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error listing audits from Supabase:", error);
    throw new Error(`Failed to list audits: ${error.message}`);
  }

  if (!data) return [];

  return data.map((row) => {
    const rawScores = row.scores as DBScores | null;
    const extra = rawScores?._extra || {};
    return {
      id: row.id,
      url: row.url,
      persona: row.persona,
      customPersonaDescription: extra.customPersonaDescription,
      timestamp: row.timestamp,
      screenshot: "", // Excluded for performance
      mobileScreenshot: extra.mobileScreenshot,
      competitorUrl: extra.competitorUrl,
      competitorScreenshot: extra.competitorScreenshot,
      competitorComparison: extra.competitorComparison,
      performanceScore: extra.performanceScore,
      accessibilityScore: extra.accessibilityScore,
      fiveSecondRead: row.five_second_read,
      scores: {
        valueProp: rawScores?.valueProp || 0,
        primaryAction: rawScores?.primaryAction || 0,
        trust: rawScores?.trust || 0,
        visualHierarchy: rawScores?.visualHierarchy || 0,
        copy: rawScores?.copy || 0,
      },
      narration: "", // Excluded for performance
      topFixes: [], // Excluded for performance
    };
  });
}

export async function countAudits(): Promise<number> {
  const { count, error } = await supabase
    .from("audits")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error counting audits from Supabase:", error);
    return 0;
  }

  return count || 0;
}
