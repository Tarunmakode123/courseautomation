"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { MaterialForm, FormData } from "@/components/MaterialForm";
import { LoadingState } from "@/components/LoadingState";
import { ResultDisplay, GeneratedResultData } from "@/components/ResultDisplay";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultData, setResultData] = useState<GeneratedResultData | null>(null);
  const [currentFormState, setCurrentFormState] = useState<FormData | null>(null);

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setResultData(null);
    setCurrentFormState(formData);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class: formData.className,
          subject: formData.subject,
          type: formData.teachingType,
          unit: formData.unit,
          topic: formData.topic,
          generate: {
            notes: formData.generateNotes,
            images: formData.generateImages,
          },
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        setErrorMessage(
          resJson.message ||
            "Something went wrong while generating the material. Please try again."
        );
        setIsLoading(false);
        return;
      }

      // Handle payload from n8n or proxy response
      const outputData = resJson.data || resJson;

      setResultData({
        notes: outputData.notes,
        images: outputData.images,
        requestInfo: {
          className: formData.className,
          subject: formData.subject,
          teachingType: formData.teachingType,
          unit: formData.unit,
          topic: formData.topic,
        },
      });
    } catch (err) {
      setErrorMessage(
        "Unable to connect to the generation service. Please check the connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsLoading(false);
    setErrorMessage(null);
    setResultData(null);
    setCurrentFormState(null);
  };

  const handleRetry = () => {
    if (currentFormState) {
      handleFormSubmit(currentFormState);
    } else {
      handleReset();
    }
  };

  return (
    <div className="min-h-screen bg-white text-darkText flex flex-col font-sans">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-xl mx-auto my-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-red-900 mb-1">Generation Failed</h3>
            <p className="text-sm text-red-700 mb-4">{errorMessage}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleRetry}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
              >
                Try Again
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-white border border-red-200 text-red-800 text-sm font-semibold rounded-lg hover:bg-red-100/50 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Form
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && currentFormState && (
          <LoadingState
            generateNotes={currentFormState.generateNotes}
            generateImages={currentFormState.generateImages}
          />
        )}

        {/* FORM (hidden during loading or when results are shown) */}
        {!isLoading && !resultData && (
          <MaterialForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        )}

        {/* RESULTS AREA */}
        {!isLoading && resultData && (
          <ResultDisplay data={resultData} onReset={handleReset} />
        )}
      </main>

      <footer className="py-6 border-t border-appBorder text-center text-xs text-secondaryText mt-12 bg-white">
        <p>RGPV Lecture Material Generator • White & Orange Academic Theme</p>
      </footer>
    </div>
  );
}
