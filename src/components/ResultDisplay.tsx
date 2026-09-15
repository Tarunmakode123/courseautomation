"use client";

import React from "react";
import { downloadNotesDocx } from "@/utils/docxExport";
import {
  Download,
  RotateCcw,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  BookOpen,
  Layers,
  HelpCircle,
} from "lucide-react";

export interface GeneratedResultData {
  notes?: any;
  images?: {
    infographic?: string;
    diagram?: string;
    table?: string;
    flowchart?: string;
  };
  requestInfo: {
    className: string;
    subject: string;
    teachingType: string;
    unit: string;
    topic: string;
  };
}

interface ResultDisplayProps {
  data: GeneratedResultData;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onReset }) => {
  const { notes, images, requestInfo } = data;
  const { className, subject, teachingType, unit, topic } = requestInfo;

  const handleDownloadNotes = () => {
    if (!notes) return;
    downloadNotesDocx({
      className,
      subject,
      unit,
      topic,
      teachingType,
      notesContent: notes,
    });
  };

  const downloadImage = async (url: string, suffix: string) => {
    const sanitizedClass = className.replace(/[^a-zA-Z0-9]/g, "");
    const sanitizedSubject = subject.replace(/[^a-zA-Z0-9]/g, "");
    const sanitizedUnit = unit.replace(/[^a-zA-Z0-9]/g, "");
    const sanitizedTopic = topic.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const filename = `${sanitizedClass}_${sanitizedSubject}_${sanitizedUnit}_${sanitizedTopic}_${suffix}.png`;

    try {
      if (url.startsWith("data:") || url.startsWith("blob:")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto my-8">
      {/* HEADER BANNER */}
      <div className="bg-white rounded-xl border border-appBorder p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 uppercase tracking-wider bg-orange-50 px-3 py-1 rounded-full border border-orange-100 w-fit mb-2">
            <span>{className}</span>
            <span>•</span>
            <span>{subject}</span>
            <span>•</span>
            <span>{unit}</span>
            <span>•</span>
            <span className="capitalize">{teachingType}</span>
          </div>
          <h2 className="text-2xl font-bold text-darkText">{topic}</h2>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-darkText text-sm font-semibold rounded-lg transition"
        >
          <RotateCcw className="w-4 h-4 text-secondaryText" />
          Create New Material
        </button>
      </div>

      {/* NOTES RESULT SECTION */}
      {notes && (
        <div className="bg-white rounded-xl border border-appBorder shadow-sm overflow-hidden">
          <div className="bg-orange-50 border-b border-orange-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-darkText">
                  {teachingType === "Lab" ? "Lab Practical Notes" : "Lecture Notes"}
                </h3>
                <p className="text-xs text-secondaryText">RGPV Syllabus Compliant Format</p>
              </div>
            </div>

            <button
              onClick={handleDownloadNotes}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-lg shadow-sm transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download Notes (.docx)
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6 text-darkText leading-relaxed">
            {typeof notes === "string" ? (
              <div className="whitespace-pre-wrap font-sans text-sm space-y-3">
                {notes}
              </div>
            ) : (
              <>
                {/* Introduction */}
                {notes.introduction && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Introduction
                    </h4>
                    <p className="text-sm text-gray-700">{notes.introduction}</p>
                  </div>
                )}

                {/* Definition */}
                {notes.definition && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Definition
                    </h4>
                    <p className="text-sm text-gray-700 bg-orange-50/50 p-3 rounded-md border border-orange-100 font-medium">
                      {notes.definition}
                    </p>
                  </div>
                )}

                {/* Core Concepts */}
                {notes.coreConcepts && notes.coreConcepts.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Core Concepts
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {notes.coreConcepts.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Explanation */}
                {notes.explanation && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      Detailed Explanation
                    </h4>
                    <p className="text-sm text-gray-700">{notes.explanation}</p>
                  </div>
                )}

                {/* Steps */}
                {notes.steps && notes.steps.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      Step-by-Step Procedure
                    </h4>
                    <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1.5">
                      {notes.steps.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Examples */}
                {notes.examples && notes.examples.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      Examples & Code Illustration
                    </h4>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto space-y-1">
                      {notes.examples.map((ex: string, i: number) => (
                        <div key={i}>{ex}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lab Specific Fields */}
                {notes.labObjectives && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      Lab Objectives
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {notes.labObjectives.map((obj: string, i: number) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Applications */}
                {notes.applications && notes.applications.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      Real-World Applications
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {notes.applications.map((app: string, i: number) => (
                        <li key={i}>{app}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Advantages & Limitations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {notes.advantages && notes.advantages.length > 0 && (
                    <div className="p-4 bg-green-50/60 rounded-lg border border-green-100">
                      <h5 className="font-bold text-green-800 text-sm mb-2">Advantages</h5>
                      <ul className="list-disc pl-4 text-xs text-green-900 space-y-1">
                        {notes.advantages.map((adv: string, i: number) => (
                          <li key={i}>{adv}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {notes.limitations && notes.limitations.length > 0 && (
                    <div className="p-4 bg-red-50/60 rounded-lg border border-red-100">
                      <h5 className="font-bold text-red-800 text-sm mb-2">Limitations</h5>
                      <ul className="list-disc pl-4 text-xs text-red-900 space-y-1">
                        {notes.limitations.map((lim: string, i: number) => (
                          <li key={i}>{lim}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Important Exam Points */}
                {notes.importantExamPoints && notes.importantExamPoints.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="text-sm font-bold text-orange-900 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-orange-600" />
                      Important RGPV Exam Points
                    </h4>
                    <ul className="list-disc pl-5 text-xs text-orange-950 space-y-1 font-medium">
                      {notes.importantExamPoints.map((pt: string, i: number) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Summary */}
                {notes.summary && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      Summary
                    </h4>
                    <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded border border-gray-200">
                      {notes.summary}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* IMAGES RESULT SECTION */}
      {images && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-darkText flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange-500" />
              Visual Learning Material
            </h3>
            <span className="text-xs text-secondaryText">4 Visual Formats Generated</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Infographic */}
            <VisualCard
              title="1. Infographic"
              typeSuffix="Infographic"
              imageUrl={images.infographic}
              onDownload={(url) => downloadImage(url, "Infographic")}
            />

            {/* 2. Diagram */}
            <VisualCard
              title="2. Diagram"
              typeSuffix="Diagram"
              imageUrl={images.diagram}
              onDownload={(url) => downloadImage(url, "Diagram")}
            />

            {/* 3. Table */}
            <VisualCard
              title="3. Table"
              typeSuffix="Table"
              imageUrl={images.table}
              onDownload={(url) => downloadImage(url, "Table")}
            />

            {/* 4. Flowchart */}
            <VisualCard
              title="4. Flowchart"
              typeSuffix="Flowchart"
              imageUrl={images.flowchart}
              onDownload={(url) => downloadImage(url, "Flowchart")}
            />
          </div>
        </div>
      )}

      {/* BOTTOM RESET BUTTON */}
      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow transition inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Create New Material
        </button>
      </div>
    </div>
  );
};

interface VisualCardProps {
  title: string;
  typeSuffix: string;
  imageUrl?: string;
  onDownload: (url: string) => void;
}

const VisualCard: React.FC<VisualCardProps> = ({ title, imageUrl, onDownload }) => {
  return (
    <div className="bg-white rounded-xl border border-appBorder shadow-sm overflow-hidden flex flex-col justify-between">
      <div className="p-4 border-b border-appBorder bg-gray-50 flex items-center justify-between">
        <h4 className="font-bold text-darkText text-sm">{title}</h4>
      </div>

      <div className="p-4 flex-1 flex items-center justify-center bg-gray-50/50 min-h-[200px]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="max-h-64 object-contain rounded border border-appBorder shadow-inner bg-white"
          />
        ) : (
          <div className="text-center p-6 text-gray-400">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">Visual rendering placeholder</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-appBorder bg-white">
        <button
          onClick={() => imageUrl && onDownload(imageUrl)}
          disabled={!imageUrl}
          className={`w-full py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition ${
            imageUrl
              ? "bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
};
