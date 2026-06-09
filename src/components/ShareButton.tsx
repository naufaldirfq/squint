"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      // Track audit share via clipboard copy
      if (typeof window !== "undefined" && window.pendo) {
        const pathParts = window.location.pathname.split("/");
        const auditId = pathParts[pathParts.length - 1] || "";
        pendo.track("audit_shared", {
          auditId,
          shareUrl: window.location.href,
        });
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="bg-blaze-orange text-white font-bold uppercase px-8 py-4 brutal-border hard-shadow hard-shadow-interactive transition-all duration-100 flex items-center gap-2 rounded-none whitespace-nowrap active:translate-x-1 active:translate-y-1 active:shadow-hard-hover"
    >
      <span className="material-symbols-outlined text-sm font-bold">
        {copied ? "check" : "share"}
      </span>
      {copied ? "Link Copied!" : "Share Audit"}
    </button>
  );
}
