"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface LoadingStateProps {
  generateNotes: boolean;
  generateImages: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  generateNotes,
  generateImages,
}) => {
  const [stageIndex, setStageIndex] = useState(0);

  const stages = [
    "Preparing your request...",
    generateNotes ? "Generating RGPV-level notes..." : "Formatting topic details...",
    generateImages ? "Generating visual material (Infographic, Diagram, Table, Flowchart)..." : "Structuring academic contents...",
    "Preparing your results...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 2800);

    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div className="bg-white rounded-xl border border-appBorder shadow-sm p-8 max-w-xl mx-auto text-center my-8">
      <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <h3 className="text-xl font-bold text-darkText mb-2 flex items-center justify-center gap-2">
        <Sparkles className="w-5 h-5 text-orange-500" />
        Generating Material...
      </h3>

      <p className="text-sm font-medium text-orange-600 bg-orange-50 py-2 px-4 rounded-full inline-block mb-4 border border-orange-100">
        {stages[stageIndex]}
      </p>

      <p className="text-xs text-secondaryText max-w-sm mx-auto">
        Please wait while our engine compiles syllabus-aligned lecture content and visual assets.
      </p>
    </div>
  );
};
