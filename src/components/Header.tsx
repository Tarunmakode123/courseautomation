import React from "react";
import { BookOpen } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-appBorder py-5 px-4 sm:px-6 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-darkText tracking-tight">
              RGPV Lecture Material Generator
            </h1>
            <p className="text-sm text-secondaryText mt-0.5">
              Generate syllabus-aligned lecture notes and visual learning material in seconds.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2">
          <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full border border-orange-100">
            RGPV Syllabus Aligned
          </span>
        </div>
      </div>
    </header>
  );
};
