"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global routing error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl p-8 ambient-shadow text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>
        <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">Something went wrong!</h2>
        <p className="font-body text-sm text-on-surface-variant mb-6">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <button
          onClick={() => reset()}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
