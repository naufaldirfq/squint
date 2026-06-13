"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuditFix } from "@/lib/db";

interface ChecklistProps {
  auditId: string;
  topFixes: AuditFix[];
  url: string;
  persona: string;
  competitorUrl?: string;
  screenshot?: string;
  customPersonaDescription?: string;
}

export default function Checklist({
  auditId,
  topFixes = [],
  url,
  persona,
  competitorUrl,
  screenshot,
  customPersonaDescription,
}: ChecklistProps) {
  const router = useRouter();
  const [checkedFixes, setCheckedFixes] = useState<Record<string, boolean>>({});
  const [isReSquinting, setIsReSquinting] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize checked status from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`squint_checked_fixes_${auditId}`);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCheckedFixes(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load checklist state:", e);
    }
  }, [auditId]);

  // Toggle checklist item
  const toggleFix = (fixId: string | number) => {
    const key = String(fixId);
    const updated = {
      ...checkedFixes,
      [key]: !checkedFixes[key],
    };
    setCheckedFixes(updated);
    try {
      localStorage.setItem(`squint_checked_fixes_${auditId}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save checklist state:", e);
    }
  };

  // Helper to render suggestions with custom span markup for bold text
  const renderFormattedText = (text: string) => {
    if (!text) return "";
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <span key={i} className="text-blaze-orange">{part}</span>;
      }
      return part;
    });
  };

  const totalFixes = topFixes.length;
  const resolvedCount = topFixes.filter((fix, idx) => {
    const fixKey = String(fix.id || idx + 1);
    return checkedFixes[fixKey];
  }).length;

  const progressPercent = totalFixes > 0 ? Math.round((resolvedCount / totalFixes) * 100) : 0;

  const handleReSquint = async () => {
    setIsReSquinting(true);
    setError(null);
    setLoadingStep("Step 1/3: Capturing page view...");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url !== "Uploaded Screenshot" ? url : undefined,
          competitorUrl,
          persona,
          customPersonaDescription,
          screenshot: url === "Uploaded Screenshot" ? screenshot : undefined,
        }),
      });

      setLoadingStep("Step 2/3: Analyzing design & copy...");

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to complete re-squint audit.");
      }

      setLoadingStep("Step 3/3: Generating scorecard report...");
      const data = await response.json();

      router.push(`/r/${data.id}?compare=${auditId}`);
    } catch (err: unknown) {
      const e = err as Error;
      console.error(e);
      setError(e.message || "An unexpected error occurred during Re-Squint.");
      setIsReSquinting(false);
    }
  };

  const renderFixCard = (fix: AuditFix, idx: number) => {
    const fixKey = String(fix.id || idx + 1);
    const isChecked = !!checkedFixes[fixKey];

    return (
      <div 
        key={idx} 
        className={`bg-surface-container-lowest brutal-border hard-shadow flex flex-col transition-all duration-200 ${
          isChecked ? "opacity-75 border-tertiary-fixed-dim" : ""
        }`}
      >
        {/* Card Header */}
        <div className={`p-4 brutal-border-b flex justify-between items-center transition-colors ${
          isChecked ? "bg-tertiary-fixed-dim/20" : "bg-surface-variant"
        }`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleFix(fixKey)}
              className={`w-6 h-6 brutal-border flex items-center justify-center transition-all cursor-pointer ${
                isChecked ? "bg-tertiary-fixed-dim" : "bg-white hover:border-blaze-orange"
              }`}
            >
              {isChecked && (
                <span className="material-symbols-outlined text-[16px] font-bold text-primary">check</span>
              )}
            </button>
            <span className={`font-mono-label text-mono-label text-primary font-bold ${isChecked ? "line-through opacity-60" : ""}`}>
              #{fix.id || idx + 1}. {fix.category.toUpperCase()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isChecked && (
              <span className="bg-tertiary-fixed-dim text-primary font-mono-label text-[10px] px-2 py-0.5 uppercase border border-primary">
                Resolved
              </span>
            )}
            <span className="bg-error text-on-error font-mono-label text-mono-label px-2 py-1 uppercase rounded-none">
              {fix.level}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h3 className="font-bold text-primary mb-2">The Problem</h3>
            <p className="text-on-surface-variant">{fix.problem}</p>
          </div>
          <div>
            <h3 className="font-bold text-primary mb-2">The Critique</h3>
            <p className="text-on-surface-variant">{fix.critique}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 brutal-border mt-4">
            <div className="p-4 bg-surface-container-low brutal-border-b md:brutal-border-b-0 md:brutal-border-r">
              <p className="font-mono-label text-mono-label text-on-surface-variant mb-2">
                Current
              </p>
              <p className="font-mono-code text-mono-code text-primary line-through opacity-70">
                {fix.current}
              </p>
            </div>
            <div className="p-4 bg-secondary-fixed-dim">
              <p className="font-mono-label text-mono-label text-primary mb-2">
                Squint Suggestion
              </p>
              <p className="font-mono-code text-mono-code text-primary font-bold">
                {renderFormattedText(fix.suggestion)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Progress Card */}
      <div className="bg-white brutal-border p-6 shadow-hard flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-primary">Audit Action Checklist</h3>
            <p className="text-sm text-on-surface-variant">Check off resolved recommendations below</p>
          </div>
          <span className="font-mono text-blaze-orange font-bold text-lg">
            {resolvedCount} / {totalFixes} Resolved ({progressPercent}%)
          </span>
        </div>
        
        {/* Neo-brutalist progress bar */}
        <div className="w-full bg-surface-container-high h-6 border-2 border-primary overflow-hidden">
          <div 
            className="bg-tertiary-fixed-dim h-full border-r-2 border-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-error-container border-2 border-error p-4 text-left text-error font-medium flex gap-2 items-center">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Fix Cards List */}
      <div className="flex flex-col gap-12">
        {topFixes.slice(0, 3).map((fix, idx) => renderFixCard(fix, idx))}
      </div>

      {totalFixes > 3 && (
        <details className="group cursor-pointer">
          <summary className="font-mono-label text-mono-label text-primary uppercase list-none inline-flex items-center gap-2 brutal-border px-6 py-3 bg-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined group-open:hidden">expand_more</span>
            <span className="material-symbols-outlined hidden group-open:block">expand_less</span>
            Show {totalFixes - 3} More Fixes
          </summary>
          <div className="flex flex-col gap-12 mt-8 cursor-default">
            {topFixes.slice(3).map((fix, idx) => renderFixCard(fix, idx + 3))}
          </div>
        </details>
      )}

      {/* Re-Squint Call-To-Action Box */}
      <div className="bg-surface-container-lowest brutal-border p-6 hard-shadow flex flex-col md:flex-row justify-between items-center gap-6 mt-12">
        <div>
          <h3 className="font-headline-md text-headline-sm-mobile md:text-headline-md font-bold text-primary mb-1">
            Made the changes?
          </h3>
          <p className="text-sm text-on-surface-variant">
            Re-run the audit now to see if your scores improve and fixes are resolved.
          </p>
        </div>
        <button
          onClick={handleReSquint}
          disabled={isReSquinting}
          className="bg-blaze-orange hover:bg-blaze-orange/90 text-white font-headline-md text-sm md:text-base uppercase px-6 py-3 border-2 border-primary shadow-hard-interactive transition-all duration-100 flex items-center justify-center gap-2 rounded-none whitespace-nowrap disabled:opacity-50 cursor-pointer"
        >
          {isReSquinting ? "Squinting..." : "Re-Squint"}
          <span className="material-symbols-outlined text-sm font-bold">cached</span>
        </button>
      </div>

      {/* Re-Squint Loading Overlay */}
      {isReSquinting && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-primary p-8 max-w-md w-full shadow-hard-card text-center flex flex-col items-center gap-4">
            <span className="relative flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blaze-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-blaze-orange"></span>
            </span>
            <h3 className="font-headline-md text-primary uppercase font-bold">Squinting Again...</h3>
            <p className="font-mono-label text-mono-label uppercase text-xs text-blaze-orange animate-pulse">
              {loadingStep}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
