import Link from "next/link";
import { notFound } from "next/navigation";
import { getAudit, getLatestAuditForUrl } from "@/lib/db";
import ShareButton from "@/components/ShareButton";
import ScreenshotView from "@/components/ScreenshotView";
import ExportButtons from "@/components/ExportButtons";
import Checklist from "@/components/Checklist";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ compare?: string }>;
}

export const dynamic = "force-dynamic";

export default async function AuditResultsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { compare } = await searchParams;
  const audit = await getAudit(id);

  if (!audit) {
    notFound();
  }

  let comparisonAudit = null;
  if (compare && typeof compare === "string") {
    comparisonAudit = await getAudit(compare);
  }

  let competitorAudit = null;
  if (audit.competitorUrl) {
    competitorAudit = await getLatestAuditForUrl(audit.competitorUrl, audit.persona);
    if (!competitorAudit) {
      competitorAudit = await getLatestAuditForUrl(audit.competitorUrl);
    }
  }

  // Helper to color code score classes exactly matching design styles
  const getScoreColorClass = (score: number) => {
    if (score <= 3) return "text-error"; // Red
    if (score <= 6) return "text-secondary-container"; // Orange
    return "text-tertiary-fixed-dim"; // Green
  };

  const renderDeltaBadge = (delta: number) => {
    if (delta > 0) {
      return (
        <span className="inline-flex items-center text-xs font-bold text-tertiary-fixed-dim bg-tertiary-fixed-dim/10 px-2 py-0.5 border border-tertiary-fixed-dim mt-1">
          +{delta}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center text-xs font-bold text-error bg-error/10 px-2 py-0.5 border border-error mt-1">
          {delta}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-bold text-surface-tint bg-surface-variant px-2 py-0.5 border border-surface-tint mt-1">
        0
      </span>
    );
  };

  const renderScoreCard = (label: string, key: "valueProp" | "primaryAction" | "trust" | "visualHierarchy" | "copy") => {
    const score = audit.scores?.[key] || 0;
    const oldScore = comparisonAudit?.scores?.[key];
    
    return (
      <div className="bg-surface-container-lowest brutal-border p-4 text-center flex flex-col justify-between min-h-[120px]">
        <p className="font-mono-label text-mono-label text-on-surface-variant uppercase mb-2 text-xs">
          {label}
        </p>
        <div>
          {comparisonAudit && oldScore !== undefined ? (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-mono text-on-surface-variant mb-1">
                {oldScore} → {score}
              </span>
              <p className={`font-headline-lg text-headline-lg ${getScoreColorClass(score)} leading-none`}>
                {score}/10
              </p>
              {renderDeltaBadge(score - oldScore)}
            </div>
          ) : (
            <p className={`font-headline-lg text-headline-lg ${getScoreColorClass(score)}`}>
              {score}/10
            </p>
          )}
        </div>
      </div>
    );
  };

  // Format display URL
  const displayUrl = audit.url.replace(/https?:\/\//, "");

  return (
    <div className="antialiased min-h-screen flex flex-col font-body-md text-body-md bg-background">
      {/* TopAppBar */}
      <header className="bg-background border-b-2 border-primary docked full-width top-0 z-50">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <Link href="/" className="font-display text-headline-md font-black tracking-tighter text-primary">
            SQUINT
          </Link>
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/" className="text-primary font-medium hover:text-secondary transition-colors duration-200">
              How it works
            </Link>
            <Link href="/#recent" className="text-secondary font-bold border-b-2 border-secondary pb-1 translate-y-0.5 transition-all">
              Recent Audits
            </Link>
          </nav>
          <button className="md:hidden">
            <span className="material-symbols-outlined text-primary text-[32px]">menu</span>
          </button>
        </div>
      </header>

      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop pt-gutter pb-section-padding">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-6">
          <div>
            <p className="font-mono-label text-mono-label text-on-surface-variant uppercase mb-2">
              Audit Report #{id}
            </p>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
              Result for: <span className="text-blaze-orange underline decoration-4 underline-offset-8 font-mono">{displayUrl}</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
            <ShareButton />
            <ExportButtons audit={audit} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-section-padding">
          {/* Left Column: Content */}
          <div className="lg:col-span-8 flex flex-col gap-16">
            
            {/* The 5-Second Read */}
            <section className="bg-surface-container-lowest brutal-border hard-shadow-lg p-8 relative">
              <span className="material-symbols-outlined absolute top-4 left-4 text-surface-dim text-6xl opacity-50 pointer-events-none">
                format_quote
              </span>
              <h2 className="font-mono-label text-mono-label text-primary uppercase brutal-border-b pb-2 mb-6 inline-block">
                The 5-Second Read
              </h2>
              <p className="font-headline-md text-headline-md text-primary leading-tight relative z-10">
                &ldquo;{audit.fiveSecondRead}&rdquo;
              </p>
            </section>

            {/* The Scores */}
            <section>
              {comparisonAudit && (
                <div className="bg-secondary-fixed-dim/25 brutal-border p-6 mb-8 flex flex-col gap-4">
                  <div className="flex justify-between items-center brutal-border-b pb-3 mb-2">
                    <div>
                      <h3 className="font-headline-md text-headline-sm-mobile md:text-headline-sm font-black text-primary uppercase">Delta Scorecard</h3>
                      <p className="text-xs font-mono text-on-surface-variant">
                        Comparing against original audit #{compare}
                      </p>
                    </div>
                    <Link
                      href={`/r/${id}`}
                      className="bg-white hover:bg-surface-variant text-primary font-mono-label text-xs uppercase px-3 py-1.5 brutal-border transition-all shadow-hard"
                    >
                      Clear Comparison
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: "Value Prop", key: "valueProp" },
                      { label: "Primary Action", key: "primaryAction" },
                      { label: "Trust", key: "trust" },
                      { label: "Hierarchy", key: "visualHierarchy" },
                      { label: "Copy", key: "copy" }
                    ].map(({ label, key }) => {
                      const before = (comparisonAudit.scores as Record<string, number>)[key] || 0;
                      const after = (audit.scores as Record<string, number>)[key] || 0;
                      const diff = after - before;
                      const diffSign = diff > 0 ? `+${diff}` : `${diff}`;
                      const diffClass = diff > 0 ? "text-tertiary-fixed-dim" : diff < 0 ? "text-error" : "text-surface-tint";
                      return (
                        <div key={key} className="bg-white brutal-border p-3 flex flex-col items-center justify-center text-center">
                          <span className="font-mono-label text-[10px] uppercase text-on-surface-variant mb-1">{label}</span>
                          <span className="font-bold text-sm text-primary">{before} → {after}</span>
                          <span className={`text-xs font-mono font-bold ${diffClass} mt-0.5`}>({diffSign})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <h2 className="font-headline-md text-headline-md text-primary mb-6">
                The Scores
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {renderScoreCard("Value-Prop", "valueProp")}
                {renderScoreCard("Primary Action", "primaryAction")}
                {renderScoreCard("Trust", "trust")}
                {renderScoreCard("Hierarchy", "visualHierarchy")}
                {renderScoreCard("Copy", "copy")}
              </div>

              {(audit.performanceScore !== undefined || audit.accessibilityScore !== undefined) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {audit.performanceScore !== undefined && (
                    <div className="bg-surface-container-lowest brutal-border p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">speed</span>
                        <div className="flex flex-col items-start">
                          <span className="font-mono-label text-mono-label text-primary uppercase text-xs">Lighthouse Performance</span>
                          {comparisonAudit && comparisonAudit.performanceScore !== undefined && (
                            <span className="text-[10px] font-mono text-on-surface-variant">
                              Was: {comparisonAudit.performanceScore}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {comparisonAudit && comparisonAudit.performanceScore !== undefined && 
                          renderDeltaBadge(audit.performanceScore - comparisonAudit.performanceScore)
                        }
                        <span className={`font-headline-md text-headline-md font-bold ${getScoreColorClass((audit.performanceScore / 100) * 10)}`}>{audit.performanceScore}</span>
                      </div>
                    </div>
                  )}
                  {audit.accessibilityScore !== undefined && (
                    <div className="bg-surface-container-lowest brutal-border p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">accessibility_new</span>
                        <div className="flex flex-col items-start">
                          <span className="font-mono-label text-mono-label text-primary uppercase text-xs">Lighthouse Accessibility</span>
                          {comparisonAudit && comparisonAudit.accessibilityScore !== undefined && (
                            <span className="text-[10px] font-mono text-on-surface-variant">
                              Was: {comparisonAudit.accessibilityScore}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {comparisonAudit && comparisonAudit.accessibilityScore !== undefined && 
                          renderDeltaBadge(audit.accessibilityScore - comparisonAudit.accessibilityScore)
                        }
                        <span className={`font-headline-md text-headline-md font-bold ${getScoreColorClass((audit.accessibilityScore / 100) * 10)}`}>{audit.accessibilityScore}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* The Narration */}
            <section>
              <h2 className="font-mono-label text-mono-label text-primary uppercase mb-4">
                The Narration
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant bg-surface-container-low p-6 brutal-border border-l-8 border-l-blaze-orange">
                &ldquo;{audit.narration}&rdquo;
              </p>
            </section>

            {/* The Fixes */}
            <section>
              <Checklist 
                auditId={id} 
                topFixes={audit.topFixes || []} 
                url={audit.url} 
                persona={audit.persona} 
                competitorUrl={audit.competitorUrl} 
                screenshot={audit.screenshot} 
                customPersonaDescription={audit.customPersonaDescription} 
              />
            </section>

            {/* Competitor Comparison */}
            {audit.competitorUrl && (
              <section className="mt-16">
                <h2 className="font-headline-md text-headline-md text-primary mb-8 brutal-border-b pb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl">compare_arrows</span>
                  Competitor Comparison
                </h2>

                {/* Scorecard comparison (VS Mode) */}
                {competitorAudit ? (
                  <div className="bg-surface-container-lowest brutal-border p-6 mb-8 flex flex-col gap-6">
                    <h3 className="font-mono-label text-mono-label text-primary uppercase brutal-border-b pb-2 inline-block self-start">
                      VS Mode: Head-to-Head Scorecard
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
                      {/* Metric scores side-by-side comparison bars */}
                      <div className="flex flex-col gap-4">
                        {[
                          { label: "Value-Prop", key: "valueProp" },
                          { label: "Primary Action", key: "primaryAction" },
                          { label: "Trust", key: "trust" },
                          { label: "Hierarchy", key: "visualHierarchy" },
                          { label: "Copy", key: "copy" },
                        ].map((metric) => {
                          const yourScore = audit.scores[metric.key as keyof typeof audit.scores] || 0;
                          const compScore = competitorAudit.scores[metric.key as keyof typeof competitorAudit.scores] || 0;
                          
                          return (
                            <div key={metric.key} className="flex flex-col gap-1 brutal-border p-4 bg-surface-container-low">
                              <span className="font-bold text-sm text-primary uppercase font-mono-label">{metric.label}</span>
                              
                              <div className="flex flex-col gap-2 mt-2">
                                {/* Your site bar */}
                                <div>
                                  <div className="flex justify-between text-xs font-mono mb-1">
                                    <span>Your Site</span>
                                    <span className="font-bold">{yourScore}/10</span>
                                  </div>
                                  <div className="w-full bg-surface-container-highest h-4 brutal-border overflow-hidden">
                                    <div 
                                      className="bg-blaze-orange h-full" 
                                      style={{ width: `${yourScore * 10}%` }}
                                    />
                                  </div>
                                </div>
                                
                                {/* Competitor bar */}
                                <div>
                                  <div className="flex justify-between text-xs font-mono mb-1">
                                    <span className="truncate max-w-[200px] block">{competitorAudit.url.replace(/^https?:\/\//i, "")}</span>
                                    <span className="font-bold">{compScore}/10</span>
                                  </div>
                                  <div className="w-full bg-surface-container-highest h-4 brutal-border overflow-hidden">
                                    <div 
                                      className="bg-secondary h-full" 
                                      style={{ width: `${compScore * 10}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary table */}
                      <div className="flex flex-col justify-between">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left font-mono border-collapse brutal-border">
                            <thead>
                              <tr className="bg-surface-variant text-primary text-xs uppercase brutal-border-b">
                                <th className="p-3">Metric</th>
                                <th className="p-3 text-center">You</th>
                                <th className="p-3 text-center">Them</th>
                                <th className="p-3 text-center">Diff</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {[
                                { label: "Value-Prop", key: "valueProp" },
                                { label: "Primary Action", key: "primaryAction" },
                                { label: "Trust", key: "trust" },
                                { label: "Hierarchy", key: "visualHierarchy" },
                                { label: "Copy", key: "copy" },
                              ].map((metric) => {
                                const yourScore = audit.scores[metric.key as keyof typeof audit.scores] || 0;
                                const compScore = competitorAudit.scores[metric.key as keyof typeof competitorAudit.scores] || 0;
                                const diff = yourScore - compScore;
                                let diffClass = "text-primary";
                                let diffSign = "";
                                if (diff > 0) {
                                  diffClass = "text-tertiary-fixed-dim font-bold";
                                  diffSign = "+";
                                } else if (diff < 0) {
                                  diffClass = "text-error font-bold";
                                }
                                return (
                                  <tr key={metric.key} className="brutal-border-b bg-surface-container-lowest">
                                    <td className="p-3 font-body-md font-bold">{metric.label}</td>
                                    <td className="p-3 text-center font-bold">{yourScore}</td>
                                    <td className="p-3 text-center font-bold text-on-surface-variant">{compScore}</td>
                                    <td className={`p-3 text-center ${diffClass}`}>{diffSign}{diff}</td>
                                  </tr>
                                );
                              })}
                              {audit.performanceScore !== undefined && competitorAudit.performanceScore !== undefined && (
                                <tr className="brutal-border-b bg-surface-container-lowest">
                                  <td className="p-3 font-body-md font-bold">Lighthouse Perf</td>
                                  <td className="p-3 text-center font-bold">{audit.performanceScore}</td>
                                  <td className="p-3 text-center font-bold text-on-surface-variant">{competitorAudit.performanceScore}</td>
                                  <td className={`p-3 text-center ${
                                    audit.performanceScore - competitorAudit.performanceScore > 0 
                                      ? "text-tertiary-fixed-dim font-bold" 
                                      : audit.performanceScore - competitorAudit.performanceScore < 0 
                                        ? "text-error font-bold" 
                                        : "text-primary"
                                  }`}>
                                    {audit.performanceScore - competitorAudit.performanceScore > 0 ? "+" : ""}
                                    {audit.performanceScore - competitorAudit.performanceScore}
                                  </td>
                                </tr>
                              )}
                              {audit.accessibilityScore !== undefined && competitorAudit.accessibilityScore !== undefined && (
                                <tr className="brutal-border-b bg-surface-container-lowest">
                                  <td className="p-3 font-body-md font-bold">Lighthouse A11y</td>
                                  <td className="p-3 text-center font-bold">{audit.accessibilityScore}</td>
                                  <td className="p-3 text-center font-bold text-on-surface-variant">{competitorAudit.accessibilityScore}</td>
                                  <td className={`p-3 text-center ${
                                    audit.accessibilityScore - competitorAudit.accessibilityScore > 0 
                                      ? "text-tertiary-fixed-dim font-bold" 
                                      : audit.accessibilityScore - competitorAudit.accessibilityScore < 0 
                                        ? "text-error font-bold" 
                                        : "text-primary"
                                  }`}>
                                    {audit.accessibilityScore - competitorAudit.accessibilityScore > 0 ? "+" : ""}
                                    {audit.accessibilityScore - competitorAudit.accessibilityScore}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 p-4 bg-surface-variant brutal-border text-xs flex flex-col gap-2 font-mono">
                          <div className="flex justify-between items-center">
                            <span className="font-bold uppercase text-primary text-[10px]">Your Average Score:</span>
                            <span className="font-bold text-base text-blaze-orange">
                              {((audit.scores.valueProp + audit.scores.primaryAction + audit.scores.trust + audit.scores.visualHierarchy + audit.scores.copy) / 5).toFixed(1)}/10
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold uppercase text-primary text-[10px]">Competitor Average Score:</span>
                            <span className="font-bold text-base text-secondary">
                              {((competitorAudit.scores.valueProp + competitorAudit.scores.primaryAction + competitorAudit.scores.trust + competitorAudit.scores.visualHierarchy + competitorAudit.scores.copy) / 5).toFixed(1)}/10
                            </span>
                          </div>
                          <div className="border-t border-primary/20 pt-2 flex justify-between items-center">
                            <span className="font-bold uppercase text-primary text-[10px]">Winner:</span>
                            <span className="font-bold uppercase text-sm text-tertiary-fixed-dim">
                              {(() => {
                                const yourAvg = (audit.scores.valueProp + audit.scores.primaryAction + audit.scores.trust + audit.scores.visualHierarchy + audit.scores.copy) / 5;
                                const compAvg = (competitorAudit.scores.valueProp + competitorAudit.scores.primaryAction + competitorAudit.scores.trust + competitorAudit.scores.visualHierarchy + competitorAudit.scores.copy) / 5;
                                if (yourAvg > compAvg) return "You 🏆";
                                if (yourAvg < compAvg) return "Them 🏆";
                                return "Tie 🤝";
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface-container-low brutal-border p-6 mb-8 flex flex-col gap-4 items-center text-center">
                    <span className="material-symbols-outlined text-4xl text-primary">lock</span>
                    <h3 className="font-headline-sm text-primary uppercase font-bold">Unlock VS Mode Scorecard</h3>
                    <p className="text-on-surface-variant max-w-md text-sm">
                      The competitor site has not been audited yet. Run an audit on it to generate its scores and see the head-to-head scorecard.
                    </p>
                    <Link
                      href={`/?url=${encodeURIComponent(audit.competitorUrl)}&competitorUrl=${encodeURIComponent(audit.url)}&persona=${audit.persona}`}
                      className="bg-blaze-orange text-white font-bold uppercase px-6 py-3 brutal-border hard-shadow-interactive transition-all duration-100 flex items-center gap-2 rounded-none text-xs mt-2"
                    >
                      Audit Competitor: {audit.competitorUrl.replace(/^https?:\/\//i, "")}
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                  </div>
                )}

                {/* Compare screenshots side-by-side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  {/* Your Site */}
                  <div className="flex flex-col gap-2">
                    <span className="font-mono-label text-mono-label text-primary uppercase text-xs">Your Site</span>
                    <div className="brutal-border relative h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={audit.screenshot} className="w-full h-auto" alt="Your site" />
                    </div>
                  </div>
                  {/* Competitor Site */}
                  <div className="flex flex-col gap-2">
                    <span className="font-mono-label text-mono-label text-primary uppercase text-xs">Competitor: {audit.competitorUrl.replace(/^https?:\/\//i, "")}</span>
                    <div className="brutal-border relative h-48 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={audit.competitorScreenshot || ""} className="w-full h-auto" alt="Competitor site" />
                    </div>
                  </div>
                </div>

                {audit.competitorComparison && (
                  <div className="bg-surface-container-low brutal-border p-6 border-l-8 border-l-secondary-fixed">
                    <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                      {audit.competitorComparison}
                    </p>
                  </div>
                )}
              </section>
            )}


          </div>

          {/* Right Column: Sidebar (Sticky) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24 flex flex-col gap-6">
              <ScreenshotView 
                desktopScreenshot={audit.screenshot} 
                mobileScreenshot={audit.mobileScreenshot} 
                fixes={audit.topFixes} 
              />
              
              <div className="mt-8 pt-6 border-t border-primary/10 flex flex-col gap-4">
                <p className="font-bold text-sm">Think your landing page is better?</p>
                <Link
                  href="/"
                  className="bg-blaze-orange text-white text-center font-bold uppercase px-6 py-3 brutal-border hard-shadow-interactive transition-all duration-100 flex items-center justify-center gap-2 rounded-none text-xs"
                >
                  Run another audit
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-on-primary border-t-2 border-primary mt-24">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-12 gap-8 max-w-container-max mx-auto">
          <div className="font-display text-headline-sm text-on-primary font-black">SQUINT</div>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="font-headline-md text-headline-md font-bold">Think your page is better?</p>
            <Link
              href="/"
              className="bg-blaze-orange text-white font-bold uppercase px-8 py-4 brutal-border border-white hard-shadow hard-shadow-interactive transition-all duration-100 flex items-center gap-2 rounded-none text-sm active:translate-x-1 active:translate-y-1"
            >
              Run another audit
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </Link>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link
              href="/"
              className="text-on-primary opacity-80 hover:opacity-100 hover:text-secondary-fixed transition-opacity font-mono-label text-mono-label text-xs uppercase"
            >
              Run your own audit
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
