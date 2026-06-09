import Link from "next/link";
import { notFound } from "next/navigation";
import { getAudit } from "@/lib/db";
import ShareButton from "@/components/ShareButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function AuditResultsPage({ params }: PageProps) {
  const { id } = await params;
  const audit = await getAudit(id);

  if (!audit) {
    notFound();
  }

  // Helper to color code score classes exactly matching design styles
  const getScoreColorClass = (score: number) => {
    if (score <= 3) return "text-error"; // Red
    if (score <= 6) return "text-secondary-container"; // Orange
    return "text-tertiary-fixed-dim"; // Green
  };

  // Format display URL
  const displayUrl = audit.url.replace(/https?:\/\//, "");

  // Use the first fix for the before/after visual transformation mockup
  const primaryFix = audit.topFixes?.[0] || {
    category: "HERO SECTION",
    current: "Synergize your workflow paradigms for maximum efficiency.",
    suggestion: "Automate your boring tasks in 5 minutes."
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <p className="font-mono-label text-mono-label text-on-surface-variant uppercase mb-2">
              Audit Report #{id}
            </p>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
              Result for: <span className="text-blaze-orange underline decoration-4 underline-offset-8 font-mono">{displayUrl}</span>
            </h1>
          </div>
          <ShareButton />
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
              <h2 className="font-headline-md text-headline-md text-primary mb-6">
                The Scores
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-surface-container-lowest brutal-border p-4 text-center">
                  <p className="font-mono-label text-mono-label text-on-surface-variant uppercase mb-2 text-xs">
                    Value-Prop
                  </p>
                  <p className={`font-headline-lg text-headline-lg ${getScoreColorClass(audit.scores.valueProp)}`}>
                    {audit.scores.valueProp}/10
                  </p>
                </div>
                <div className="bg-surface-container-lowest brutal-border p-4 text-center">
                  <p className="font-mono-label text-mono-label text-on-surface-variant uppercase mb-2 text-xs">
                    Primary Action
                  </p>
                  <p className={`font-headline-lg text-headline-lg ${getScoreColorClass(audit.scores.primaryAction)}`}>
                    {audit.scores.primaryAction}/10
                  </p>
                </div>
                <div className="bg-surface-container-lowest brutal-border p-4 text-center">
                  <p className="font-mono-label text-mono-label text-on-surface-variant uppercase mb-2 text-xs">
                    Trust
                  </p>
                  <p className={`font-headline-lg text-headline-lg ${getScoreColorClass(audit.scores.trust)}`}>
                    {audit.scores.trust}/10
                  </p>
                </div>
                <div className="bg-surface-container-lowest brutal-border p-4 text-center">
                  <p className="font-mono-label text-mono-label text-on-surface-variant uppercase mb-2 text-xs">
                    Hierarchy
                  </p>
                  <p className={`font-headline-lg text-headline-lg ${getScoreColorClass(audit.scores.visualHierarchy)}`}>
                    {audit.scores.visualHierarchy}/10
                  </p>
                </div>
                <div className="bg-surface-container-lowest brutal-border p-4 text-center col-span-2 md:col-span-1">
                  <p className="font-mono-label text-mono-label text-on-surface-variant uppercase mb-2 text-xs">
                    Copy
                  </p>
                  <p className={`font-headline-lg text-headline-lg ${getScoreColorClass(audit.scores.copy)}`}>
                    {audit.scores.copy}/10
                  </p>
                </div>
              </div>
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

            {/* The Top 3 Fixes */}
            <section>
              <h2 className="font-headline-md text-headline-md text-primary mb-8 brutal-border-b pb-4">
                The Top 3 Fixes
              </h2>
              <div className="flex flex-col gap-12">
                {audit.topFixes.map((fix, idx) => (
                  <div key={idx} className="bg-surface-container-lowest brutal-border hard-shadow flex flex-col">
                    <div className="p-4 brutal-border-b bg-surface-variant flex justify-between items-center">
                      <span className="font-mono-label text-mono-label text-primary">
                        #{fix.id || idx + 1}. {fix.category.toUpperCase()}
                      </span>
                      <span className="bg-error text-on-error font-mono-label text-mono-label px-2 py-1 uppercase rounded-none">
                        {fix.level}
                      </span>
                    </div>
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
                ))}
              </div>
            </section>

            {/* Visual Transformation */}
            <section className="mt-16">
              <h2 className="font-headline-md text-headline-md text-primary mb-8 brutal-border-b pb-4">
                Visual Transformation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Before */}
                <div className="flex flex-col gap-4">
                  <span className="font-mono-label text-mono-label text-primary uppercase">Before</span>
                  <div className="bg-surface-container-lowest brutal-border hard-shadow p-8 relative overflow-hidden h-full flex flex-col justify-center min-h-[200px]">
                    <div className="absolute inset-0 bg-surface-variant/30 backdrop-blur-[1px] z-10"></div>
                    <div className="relative z-0">
                      <div className="w-12 h-2 bg-primary mb-4 opacity-20"></div>
                      <p className="font-headline-md text-headline-md text-primary opacity-40 leading-tight">
                        {primaryFix.current}
                      </p>
                      <div className="mt-8 w-32 h-10 bg-primary opacity-20"></div>
                    </div>
                  </div>
                </div>
                {/* After */}
                <div className="flex flex-col gap-4">
                  <span className="font-mono-label text-mono-label text-primary uppercase">After</span>
                  <div className="bg-surface-container-lowest brutal-border hard-shadow p-8 border-tertiary-fixed-dim h-full flex flex-col justify-center min-h-[200px]">
                    <div className="w-12 h-2 bg-blaze-orange mb-4"></div>
                    <p className="font-headline-md text-headline-md text-primary leading-tight">
                      {renderFormattedText(primaryFix.suggestion)}
                    </p>
                    <button className="mt-8 self-start bg-tertiary-fixed-dim text-primary font-bold uppercase px-6 py-3 brutal-border hard-shadow-interactive text-sm active:translate-x-1 active:translate-y-1">
                      Start Free Trial
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar (Sticky) */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24 flex flex-col gap-6">
              <h3 className="font-mono-label text-mono-label text-primary uppercase brutal-border-b pb-2">
                The &apos;Squint&apos; View
              </h3>
              <div className="brutal-border hard-shadow bg-surface-container-lowest p-2 relative group overflow-hidden cursor-crosshair">
                <div className="absolute inset-0 bg-black/10 z-10 backdrop-blur-sm transition-all duration-300 group-hover:backdrop-blur-none group-hover:bg-transparent flex items-center justify-center pointer-events-none">
                  <span className="bg-primary text-on-primary font-mono-label text-mono-label px-4 py-2 uppercase tracking-widest group-hover:opacity-0 transition-opacity">
                    Hover to un-squint
                  </span>
                </div>
                <img
                  src={audit.screenshot}
                  alt="Website screenshot"
                  className="w-full h-auto block filter contrast-125 saturate-50 group-hover:filter-none transition-all duration-500"
                />
              </div>
              <p className="text-sm text-on-surface-variant mt-2 italic">
                This is what a user sees in the first 3 seconds. Blurry, right?
              </p>
              
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
            <p className="font-body-md text-body-md opacity-50 text-xs mt-4">Built for MtP Hackathon</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
