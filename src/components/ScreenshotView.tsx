"use client";

import { useState } from "react";
import { AuditFix } from "@/lib/db";

interface ScreenshotViewProps {
  desktopScreenshot: string;
  mobileScreenshot?: string;
  fixes: AuditFix[];
}

export default function ScreenshotView({ desktopScreenshot, mobileScreenshot, fixes }: ScreenshotViewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeScreenshot = viewMode === "desktop" ? desktopScreenshot : (mobileScreenshot || desktopScreenshot);

  const renderScreenshotWithBoxes = (isModal: boolean = false) => (
    <div className={`relative w-full ${isModal ? "h-auto max-w-5xl mx-auto" : "h-auto"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={activeScreenshot}
        alt="Website screenshot"
        className="w-full h-auto block"
      />

      {/* Bounding Boxes Overlay */}
      {fixes.map((fix, idx) => {
        const box = viewMode === "desktop" ? fix.desktopBoundingBox : (fix.mobileBoundingBox || fix.desktopBoundingBox);
        
        // Fallback to older audits that might still have boundingBox
        const legacyBox = (fix as AuditFix & { boundingBox?: [number, number, number, number] }).boundingBox;
        const activeBox = box || legacyBox;

        // Only render if we have a valid bounding box that isn't [0,0,0,0]
        if (!activeBox || activeBox.length !== 4 || (activeBox[0] === 0 && activeBox[1] === 0 && activeBox[2] === 0 && activeBox[3] === 0)) {
          return null;
        }

        const ymin = activeBox[0];
        const xmin = activeBox[1];
        const ymax = activeBox[2];
        const xmax = activeBox[3];

        const top = (ymin / 1000) * 100;
        const left = (xmin / 1000) * 100;
        const height = ((ymax - ymin) / 1000) * 100;
        const width = ((xmax - xmin) / 1000) * 100;

        return (
          <div
            key={fix.id || idx}
            className={`absolute border-4 border-error z-20 pointer-events-none ${isModal ? 'border-8' : ''}`}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              height: `${height}%`,
              width: `${width}%`,
            }}
          >
            <div className={`absolute left-0 bg-error text-white font-mono-label whitespace-nowrap ${isModal ? '-top-10 text-lg px-2 py-1' : '-top-6 text-[10px] px-1'}`}>
              #{fix.id || idx + 1} Fix
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center brutal-border-b pb-2">
        <h3 className="font-mono-label text-mono-label text-primary uppercase">
          Screenshot
        </h3>
        
        {mobileScreenshot && (
          <div className="flex bg-surface-container-low brutal-border p-1">
            <button
              onClick={() => setViewMode("desktop")}
              className={`px-3 py-1 font-mono-label text-xs uppercase ${viewMode === "desktop" ? "bg-primary text-white" : "text-primary hover:bg-surface-variant"}`}
            >
              Desktop
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`px-3 py-1 font-mono-label text-xs uppercase ${viewMode === "mobile" ? "bg-primary text-white" : "text-primary hover:bg-surface-variant"}`}
            >
              Mobile
            </button>
          </div>
        )}
      </div>

      <div 
        className="brutal-border hard-shadow bg-surface-container-lowest p-2 relative cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="absolute top-4 right-4 bg-primary text-on-primary p-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity brutal-border flex items-center justify-center">
          <span className="material-symbols-outlined text-sm">fullscreen</span>
        </div>
        {renderScreenshotWithBoxes()}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto p-4 sm:p-8 cursor-zoom-out" onClick={() => setIsModalOpen(false)}>
          <div className="relative w-full max-w-7xl bg-surface-container-lowest brutal-border p-2 cursor-default" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute -top-4 -right-4 bg-primary text-on-primary w-10 h-10 brutal-border flex items-center justify-center z-50 hover:bg-error transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            {renderScreenshotWithBoxes(true)}
          </div>
        </div>
      )}
    </div>
  );
}
