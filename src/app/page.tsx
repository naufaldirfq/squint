import Link from "next/link";
import { listAudits } from "@/lib/db";
import AuditForm from "@/components/AuditForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recentAudits = await listAudits(6);

  return (
    <div className="flex flex-col min-h-screen">
      {/* TopAppBar */}
      <header className="bg-background border-b-2 border-primary sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
          <Link href="/" className="font-display text-headline-md font-black tracking-tighter text-primary">
            SQUINT
          </Link>
          <nav className="hidden md:flex gap-8">
            <a href="#how-it-works" className="text-primary font-medium hover:text-secondary transition-colors duration-200">
              How it works
            </a>
            <a href="#recent" className="text-primary font-medium hover:text-secondary transition-colors duration-200">
              Recent Audits
            </a>
          </nav>
          <button className="md:hidden text-primary">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="w-full px-margin-mobile md:px-margin-desktop py-section-padding max-w-container-max mx-auto flex flex-col items-center text-center">
          <h1 className="font-display text-headline-lg-mobile md:text-display text-primary mb-6 max-w-4xl mx-auto uppercase">
            Stop Guessing. Get Squinted.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-2xl mx-auto border-l-4 border-blaze-orange pl-4 text-left">
            A brutally honest 5-second audit of your landing page by AI personas who don&apos;t care about your feelings.
          </p>

          {/* URL Input & CTA Form Component */}
          <AuditForm />

          {/* Social Proof */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blaze-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-container"></span>
            </span>
            <span className="font-mono-label text-mono-label uppercase text-on-surface-variant text-xs">
              {recentAudits.length > 0
                ? `${1240 + recentAudits.length} pages squinted today`
                : "1,240 pages squinted today"}
            </span>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full px-margin-mobile md:px-margin-desktop py-section-padding bg-surface-variant border-t-2 border-primary" id="how-it-works">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-16 uppercase border-b-2 border-primary pb-4">
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white border-2 border-primary shadow-hard-card p-8 flex flex-col">
                <div className="font-display text-display text-outline-variant mb-4 leading-none">1</div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2 uppercase">Paste URL</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Drop your landing page link or upload a screenshot fallback. We don&apos;t need logins, we just view what your users see.
                </p>
              </div>
              {/* Step 2 */}
              <div className="bg-white border-2 border-primary shadow-hard-card p-8 flex flex-col translate-y-4">
                <div className="font-display text-display text-outline-variant mb-4 leading-none">2</div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2 uppercase">We Squint</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Our AI personas scan your page for exactly 5 seconds, ignoring beautiful animations to focus on what actually translates.
                </p>
              </div>
              {/* Step 3 */}
              <div className="bg-blaze-orange border-2 border-primary shadow-hard-card p-8 flex flex-col translate-y-8">
                <div className="font-display text-display text-white mb-4 leading-none opacity-50">3</div>
                <h3 className="font-headline-md text-headline-md text-white mb-2 uppercase">You Fix</h3>
                <p className="font-body-md text-body-md text-white">
                  Get a brutally honest, prioritized list of why your page isn&apos;t converting, complete with ready-to-copy suggestions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Audits */}
        {recentAudits.length > 0 && (
          <section className="w-full px-margin-mobile md:px-margin-desktop py-section-padding border-t-2 border-primary" id="recent">
            <div className="max-w-container-max mx-auto">
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-12 uppercase border-b-2 border-primary pb-4">
                Recent Audits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentAudits.map((audit) => (
                  <Link
                    href={`/r/${audit.id}`}
                    key={audit.id}
                    className="bg-white border-2 border-primary shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-hard-hover transition-all duration-100 flex flex-col justify-between"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                        <span className="font-mono-label text-[10px] bg-surface-variant text-primary px-2 py-0.5 uppercase tracking-wider font-bold">
                          {audit.persona} Critic
                        </span>
                        <span className="text-xs text-on-surface-variant font-mono">
                          {new Date(audit.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-primary truncate mb-2 font-mono" title={audit.url}>
                        {audit.url.replace(/https?:\/\//, "")}
                      </h3>
                      <p className="text-sm italic text-on-surface-variant line-clamp-3">
                        &ldquo;{audit.fiveSecondRead}&rdquo;
                      </p>
                    </div>
                    <div className="p-4 bg-surface-container-low border-t-2 border-primary flex justify-between items-center font-mono-label text-xs uppercase font-bold">
                      <span>ScoreCard:</span>
                      <span className="text-blaze-orange">
                        {Math.round(
                          ((audit.scores?.valueProp || 0) +
                            (audit.scores?.primaryAction || 0) +
                            (audit.scores?.trust || 0) +
                            (audit.scores?.visualHierarchy || 0) +
                            (audit.scores?.copy || 0)) /
                            5
                        )}
                        /10
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-on-primary border-t-2 border-primary">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-12 gap-8 max-w-container-max mx-auto">
          <span className="font-display text-headline-sm text-on-primary font-black">SQUINT</span>
          <span className="font-mono-label text-mono-label text-on-primary opacity-80 uppercase text-xs">
            Built for MtP Hackathon
          </span>
          <nav className="flex gap-6">
            <Link
              href="/"
              className="font-mono-label text-mono-label text-on-primary opacity-80 hover:opacity-100 hover:text-secondary-fixed transition-opacity uppercase text-xs"
            >
              Run your own audit
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
