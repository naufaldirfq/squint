"use client";

import { AuditRecord } from "@/lib/db";

interface ExportButtonsProps {
  audit: AuditRecord;
}

export default function ExportButtons({ audit }: ExportButtonsProps) {
  
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportMarkdown = () => {
    let md = `# Squint Landing Page Audit Report\n\n`;
    md += `- **URL:** ${audit.url}\n`;
    md += `- **Persona:** ${audit.persona} Critic\n`;
    md += `- **Date:** ${new Date(audit.timestamp).toLocaleDateString()}\n`;

    const avgScore = Math.round(
      ((audit.scores?.valueProp || 0) +
        (audit.scores?.primaryAction || 0) +
        (audit.scores?.trust || 0) +
        (audit.scores?.visualHierarchy || 0) +
        (audit.scores?.copy || 0)) /
        5
    );
    md += `- **Average Score:** ${avgScore}/10\n`;
    if (audit.performanceScore !== undefined && audit.performanceScore !== null) {
      md += `- **Lighthouse Performance:** ${audit.performanceScore}/100\n`;
    }
    if (audit.accessibilityScore !== undefined && audit.accessibilityScore !== null) {
      md += `- **Lighthouse Accessibility:** ${audit.accessibilityScore}/100\n`;
    }
    md += `\n`;
    md += `## The 5-Second Read\n`;
    md += `> "${audit.fiveSecondRead}"\n\n`;
    
    md += `## Rubric Scores\n`;
    md += `- **Value Proposition:** ${audit.scores?.valueProp}/10\n`;
    md += `- **Primary Action:** ${audit.scores?.primaryAction}/10\n`;
    md += `- **Trust & Credibility:** ${audit.scores?.trust}/10\n`;
    md += `- **Visual Hierarchy:** ${audit.scores?.visualHierarchy}/10\n`;
    md += `- **Copywriting:** ${audit.scores?.copy}/10\n\n`;
    
    md += `## Detailed Narration\n`;
    md += `${audit.narration}\n\n`;

    if (audit.competitorUrl) {
      md += `## Competitor Comparison (${audit.competitorUrl})\n`;
      md += `${audit.competitorComparison || "No comparison detail provided."}\n\n`;
    }

    md += `## Critical Fixes & Recommendations\n\n`;
    audit.topFixes.forEach((fix, index) => {
      md += `### ${index + 1}. [${fix.level}] ${fix.category}\n`;
      md += `**Problem:** ${fix.problem}\n\n`;
      md += `**Critique:** ${fix.critique}\n\n`;
      md += `**Current:** \`${fix.current}\`\n\n`;
      md += `**Suggestion:** **${fix.suggestion}**\n\n`;
      md += `---\n\n`;
    });

    const safeUrl = audit.url.replace(/^https?:\/\//i, "").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    downloadFile(md, `squint_audit_${safeUrl}.md`, "text/markdown;charset=utf-8;");
  };

  const exportCSV = () => {
    const headers = ["ID", "Category", "Priority Level", "Problem", "Critique", "Current Text", "Suggested Fix"];
    const rows = audit.topFixes.map((fix, idx) => [
      fix.id || idx + 1,
      fix.category || "",
      fix.level || "",
      fix.problem || "",
      fix.critique || "",
      fix.current || "",
      fix.suggestion || ""
    ]);

    const escapeCSV = (str: unknown) => {
      if (str === null || str === undefined) return "";
      const cleanStr = String(str).replace(/"/g, '""');
      return `"${cleanStr}"`;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\n");

    const safeUrl = audit.url.replace(/^https?:\/\//i, "").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    downloadFile(csvContent, `squint_fixes_${safeUrl}.csv`, "text/csv;charset=utf-8;");
  };

  return (
    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
      <button
        onClick={exportMarkdown}
        className="bg-white text-primary font-bold uppercase px-6 py-4 brutal-border hard-shadow hard-shadow-interactive transition-all duration-100 flex items-center gap-2 rounded-none whitespace-nowrap active:translate-x-1 active:translate-y-1 active:shadow-hard-hover cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm font-bold">download</span>
        Export MD
      </button>
      <button
        onClick={exportCSV}
        className="bg-white text-primary font-bold uppercase px-6 py-4 brutal-border hard-shadow hard-shadow-interactive transition-all duration-100 flex items-center gap-2 rounded-none whitespace-nowrap active:translate-x-1 active:translate-y-1 active:shadow-hard-hover cursor-pointer"
      >
        <span className="material-symbols-outlined text-sm font-bold">table_view</span>
        Export CSV
      </button>
    </div>
  );
}
