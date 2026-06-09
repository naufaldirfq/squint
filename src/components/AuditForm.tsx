"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AuditForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [persona, setPersona] = useState("founder");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !screenshot) {
      setError("Please enter a landing page URL or upload a screenshot.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      setLoadingStep("Step 1/3: Capturing page view...");
      
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url || undefined,
          persona,
          screenshot: screenshot || undefined,
        }),
      });

      setLoadingStep("Step 2/3: Analyzing design & copy...");
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to complete page audit.");
      }

      setLoadingStep("Step 3/3: Generating scorecard report...");
      const data = await response.json();
      
      router.push(`/r/${data.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white border-2 border-primary shadow-hard-card p-6 md:p-8 flex flex-col gap-6 relative">
      {/* Decorative element */}
      <div className="absolute -top-3 -right-3 bg-tertiary-fixed-dim text-primary font-mono-label text-mono-label px-3 py-1 border-2 border-primary shadow-hard uppercase tracking-wide">
        No mercy
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Main Input area */}
        <div className="flex flex-col md:flex-row gap-4 input-focus-ring bg-white border-2 border-primary p-2 transition-all duration-200">
          <div className="flex-grow flex items-center px-4">
            <span className="material-symbols-outlined text-surface-tint mr-2">link</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full bg-transparent border-none focus:outline-none text-body-lg font-body-lg h-12 text-primary placeholder-surface-tint"
              placeholder="https://yourproduct.com"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blaze-orange text-white font-headline-md text-headline-md uppercase px-8 py-3 border-2 border-primary shadow-hard neo-brutal-btn whitespace-nowrap disabled:opacity-50"
          >
            {isLoading ? "Squinting..." : "Audit"}
          </button>
        </div>

        {/* Screenshot Upload Fallback */}
        <div className="flex flex-col items-start gap-2 border-t border-dashed border-primary/20 pt-4">
          <div className="flex justify-between items-center w-full">
            <span className="font-mono-label text-mono-label text-on-surface-variant uppercase text-xs">
              Or fallback screenshot upload:
            </span>
            {screenshot && (
              <button
                type="button"
                onClick={clearScreenshot}
                className="text-xs text-error hover:underline font-mono"
              >
                [Remove Screenshot]
              </button>
            )}
          </div>
          
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="screenshot-file"
          />

          {!screenshot ? (
            <label
              htmlFor="screenshot-file"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`w-full text-center py-6 border-2 border-dashed cursor-pointer transition-all font-mono-label text-xs uppercase flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? "border-blaze-orange bg-blaze-orange/10 text-blaze-orange"
                  : "border-primary/30 hover:border-primary hover:bg-surface-container-low text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-lg">upload_file</span>
              <span>Drag & drop or browse screenshot image</span>
            </label>
          ) : (
            <div className="flex items-center gap-4 bg-tertiary-fixed-dim/20 brutal-border p-3 w-full">
              <span className="material-symbols-outlined text-tertiary-fixed-dim">image</span>
              <span className="text-xs font-mono font-bold text-primary truncate flex-grow">
                Screenshot Loaded successfully!
              </span>
              <div className="w-10 h-10 border border-primary overflow-hidden relative bg-white">
                <img
                  src={screenshot}
                  alt="preview"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Persona Picker */}
        <div className="flex flex-col gap-3">
          <span className="font-mono-label text-mono-label text-on-surface-variant text-left uppercase">
            Choose your critic:
          </span>
          <div className="flex flex-wrap gap-4">
            <label className="cursor-pointer group flex-1">
              <input
                type="radio"
                name="persona"
                value="founder"
                checked={persona === "founder"}
                onChange={(e) => setPersona(e.target.value)}
                disabled={isLoading}
                className="sr-only"
              />
              <div className={`flex flex-col items-center p-3 border-2 border-primary transition-colors ${
                persona === "founder"
                  ? "bg-primary text-white"
                  : "bg-white text-primary hover:bg-surface-variant"
              }`}>
                <span className="material-symbols-outlined mb-1">work</span>
                <span className="font-mono-label text-mono-label text-xs uppercase text-center">
                  Busy Founder
                </span>
              </div>
            </label>

            <label className="cursor-pointer group flex-1">
              <input
                type="radio"
                name="persona"
                value="engineer"
                checked={persona === "engineer"}
                onChange={(e) => setPersona(e.target.value)}
                disabled={isLoading}
                className="sr-only"
              />
              <div className={`flex flex-col items-center p-3 border-2 border-primary transition-colors ${
                persona === "engineer"
                  ? "bg-primary text-white"
                  : "bg-white text-primary hover:bg-surface-variant"
              }`}>
                <span className="material-symbols-outlined mb-1">code_blocks</span>
                <span className="font-mono-label text-mono-label text-xs uppercase text-center">
                  Skeptical Engineer
                </span>
              </div>
            </label>

            <label className="cursor-pointer group flex-1">
              <input
                type="radio"
                name="persona"
                value="buyer"
                checked={persona === "buyer"}
                onChange={(e) => setPersona(e.target.value)}
                disabled={isLoading}
                className="sr-only"
              />
              <div className={`flex flex-col items-center p-3 border-2 border-primary transition-colors ${
                persona === "buyer"
                  ? "bg-primary text-white"
                  : "bg-white text-primary hover:bg-surface-variant"
              }`}>
                <span className="material-symbols-outlined mb-1">shopping_cart</span>
                <span className="font-mono-label text-mono-label text-xs uppercase text-center">
                  Non-technical Buyer
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Loading / Progress State */}
        {isLoading && (
          <div className="bg-surface-container-low brutal-border p-4 flex flex-col gap-2 items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blaze-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blaze-orange"></span>
            </span>
            <span className="font-mono-label text-mono-label uppercase text-xs font-bold text-blaze-orange animate-pulse">
              {loadingStep}
            </span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-error-container border-2 border-error p-4 text-left text-error font-medium flex gap-2 items-center">
            <span className="material-symbols-outlined">error</span>
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}
      </form>
    </div>
  );
}
