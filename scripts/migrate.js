const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. Load environment variables from .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found at " + envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local");
  process.exit(1);
}

console.log("Connecting to Supabase at:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Read local audits database file
const dataDir = path.join(__dirname, "..", ".data");
const dataFile = path.join(dataDir, "audits.json");

if (!fs.existsSync(dataFile)) {
  console.log("No local audits.json database found at:", dataFile);
  process.exit(0);
}

const fileContent = fs.readFileSync(dataFile, "utf-8");
let db;
try {
  db = JSON.parse(fileContent);
} catch (e) {
  console.error("Error parsing audits.json:", e);
  process.exit(1);
}

const audits = db.audits || {};
const auditIds = Object.keys(audits);

if (auditIds.length === 0) {
  console.log("No audits found in local audits.json database.");
  process.exit(0);
}

console.log(`Found ${auditIds.length} audits in local database. Starting migration...`);

async function migrate() {
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const id of auditIds) {
    const record = audits[id];
    console.log(`Processing audit ${id} for URL: ${record.url}`);

    // Check if audit already exists in Supabase
    const { data: existing, error: checkError } = await supabase
      .from("audits")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) {
      console.error(`  Error checking existence of ${id}:`, checkError.message);
      failCount++;
      continue;
    }

    if (existing) {
      console.log(`  Audit ${id} already exists in Supabase. Skipping.`);
      skipCount++;
      continue;
    }

    // Insert record
    const { error: insertError } = await supabase.from("audits").insert({
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

    if (insertError) {
      console.error(`  Failed to insert audit ${id}:`, insertError.message);
      failCount++;
    } else {
      console.log(`  Successfully migrated audit ${id}!`);
      successCount++;
    }
  }

  console.log("\nMigration Summary:");
  console.log(`- Successfully migrated: ${successCount}`);
  console.log(`- Skipped (already exists): ${skipCount}`);
  console.log(`- Failed: ${failCount}`);
}

migrate().catch((err) => {
  console.error("Migration failed with error:", err);
});
