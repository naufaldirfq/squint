import fs from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "audits.json");

// Helper to ensure data directory and file exist
function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ audits: {} }), "utf-8");
  }
}

export async function saveAudit(record: AuditRecord): Promise<void> {
  ensureDb();
  const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
  const db = JSON.parse(fileContent);
  db.audits[record.id] = record;
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export async function getAudit(id: string): Promise<AuditRecord | null> {
  ensureDb();
  const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
  const db = JSON.parse(fileContent);
  return db.audits[id] || null;
}

export async function listAudits(limit: number = 10): Promise<AuditRecord[]> {
  ensureDb();
  const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
  const db = JSON.parse(fileContent);
  const list = Object.values(db.audits) as AuditRecord[];
  // Sort descending by timestamp
  list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return list.slice(0, limit);
}
