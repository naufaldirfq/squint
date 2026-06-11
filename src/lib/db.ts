import { createClient } from "@supabase/supabase-js";

export interface AuditFix {
  id: number;
  category: string;
  level: string;
  problem: string;
  critique: string;
  current: string;
  suggestion: string;
}

export interface AuditRecord {
  id: string;
  url: string;
  persona: string;
  timestamp: string;
  screenshot: string; // base64 or URL path
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Database operations will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveAudit(record: AuditRecord): Promise<void> {
  const { error } = await supabase.from("audits").insert({
    id: record.id,
    url: record.url,
    persona: record.persona,
    timestamp: record.timestamp,
    screenshot: record.screenshot,
    five_second_read: record.fiveSecondRead,
    scores: record.scores,
    narration: record.narration,
    top_fixes: record.topFixes,
  });

  if (error) {
    console.error("Error saving audit to Supabase:", error);
    throw new Error(`Failed to save audit: ${error.message}`);
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

  return {
    id: data.id,
    url: data.url,
    persona: data.persona,
    timestamp: data.timestamp,
    screenshot: data.screenshot,
    fiveSecondRead: data.five_second_read,
    scores: data.scores as AuditRecord["scores"],
    narration: data.narration,
    topFixes: data.top_fixes as AuditFix[],
  };
}

export async function listAudits(limit: number = 10): Promise<AuditRecord[]> {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error listing audits from Supabase:", error);
    throw new Error(`Failed to list audits: ${error.message}`);
  }

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    url: row.url,
    persona: row.persona,
    timestamp: row.timestamp,
    screenshot: row.screenshot,
    fiveSecondRead: row.five_second_read,
    scores: row.scores as AuditRecord["scores"],
    narration: row.narration,
    topFixes: row.top_fixes as AuditFix[],
  }));
}
