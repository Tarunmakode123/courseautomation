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
  Tag,
  ListOrdered,
  Code2,
  Table as TableIcon,
  PenTool,
  Award,
  AlertCircle,
  HelpCircle as QuestionIcon,
  Lightbulb,
  FileQuestion,
  FileCode,
  Sparkles,
  Zap,
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

// Safe Array Helper
function safeArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") return [val];
  return [];
}

// Helper for inline **bold** text
function formatInlineBold(text: string) {
  if (typeof text !== "string") return String(text || "");
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-darkText">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Helper component for markdown rendering
const MarkdownText: React.FC<{ content: string }> = ({ content }) => {
  const paragraphs = (content || "").split("\n\n");

  return (
    <div className="space-y-4 text-darkText leading-relaxed">
      {paragraphs.map((p, idx) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-base font-bold text-orange-600 mt-4 mb-2">
              {trimmed.replace(/^###\s*/, "")}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-lg font-bold text-darkText border-b border-orange-100 pb-1.5 mt-5 mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              {trimmed.replace(/^##\s*/, "")}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-xl font-bold text-orange-600 border-b border-orange-200 pb-2 mt-6 mb-3">
              {trimmed.replace(/^#\s*/, "")}
            </h2>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").map((line) => line.replace(/^[-*]\s*/, ""));
          return (
            <ul key={idx} className="list-disc pl-5 text-sm text-gray-800 space-y-1.5">
              {items.map((item, i) => (
                <li key={i}>{formatInlineBold(item)}</li>
              ))}
            </ul>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").map((line) => line.replace(/^\d+\.\s*/, ""));
          return (
            <ol key={idx} className="list-decimal pl-5 text-sm text-gray-800 space-y-1.5">
              {items.map((item, i) => (
                <li key={i}>{formatInlineBold(item)}</li>
              ))}
            </ol>
          );
        }

        if (trimmed.startsWith("```")) {
          const codeText = trimmed.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
          return (
            <pre key={idx} className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto my-3 whitespace-pre">
              <code>{codeText}</code>
            </pre>
          );
        }

        return (
          <p key={idx} className="text-sm text-gray-800">
            {formatInlineBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

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
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const safeImagesObj = (images && typeof images === "object" && !Array.isArray(images) && (images as any).generated !== false) ? images : null;

  // Extract arrays safely
  const keyTerminologyArr = safeArray(notes?.keyTerminology);
  const coreConceptsArr = safeArray(notes?.coreConcepts);
  const componentsArr = safeArray(notes?.components);
  const workingArr = safeArray(notes?.working);
  const stepsArr = safeArray(notes?.steps);
  const formulasArr = safeArray(notes?.formulas);
  const applicationsArr = safeArray(notes?.applications);
  const advantagesArr = safeArray(notes?.advantages);
  const limitationsArr = safeArray(notes?.limitations);
  const importantExamPointsArr = safeArray(notes?.importantExamPoints);
  const typesOrClassificationArr = safeArray(notes?.typesOrClassification);
  const examplesArr = safeArray(notes?.examples);
  const codeExamplesArr = safeArray(notes?.codeExamples);
  const diagramsArr = safeArray(notes?.diagrams);
  const tablesArr = safeArray(notes?.tables);
  const probableQuestions = notes?.probableExamQuestions || null;
  const sevenMarkGuide = notes?.sevenMarkAnswerGuide || null;

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

      {/* NO NOTES MSG IF NONE RETURNED */}
      {!notes && (
        <div className="bg-white rounded-xl border border-appBorder p-8 text-center text-secondaryText">
          <FileQuestion className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="font-semibold text-darkText text-base">No lecture notes were generated for this request.</p>
          <p className="text-xs text-gray-500 mt-1">Please try selecting the Notes option and click Generate again.</p>
        </div>
      )}

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

          <div className="p-6 sm:p-8 space-y-7 text-darkText leading-relaxed">
            {typeof notes === "string" ? (
              <MarkdownText content={notes} />
            ) : (
              <>
                {/* Title */}
                {notes.title && (
                  <h3 className="text-xl font-bold text-darkText border-b border-appBorder pb-2.5">
                    {notes.title}
                  </h3>
                )}

                {/* 1. Introduction */}
                {notes.introduction && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> 1. Introduction
                    </h4>
                    <p className="text-sm text-gray-800 leading-relaxed">{formatInlineBold(notes.introduction)}</p>
                  </div>
                )}

                {/* 2. Definition */}
                {notes.definition && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> 2. Definition
                    </h4>
                    <div className="text-sm text-gray-800 bg-orange-50/70 p-4 rounded-xl border border-orange-100 font-medium leading-relaxed">
                      {formatInlineBold(notes.definition)}
                    </div>
                  </div>
                )}

                {/* 3. Key Terminology */}
                {keyTerminologyArr.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> 3. Key Terminology
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1.5">
                      {keyTerminologyArr.map((item, i) => (
                        <li key={i}>{formatInlineBold(typeof item === "string" ? item : JSON.stringify(item))}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 4. Core Concepts */}
                {coreConceptsArr.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <Layers className="w-4 h-4" /> 4. Core Concepts
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1.5">
                      {coreConceptsArr.map((item, i) => (
                        <li key={i}>{formatInlineBold(typeof item === "string" ? item : JSON.stringify(item))}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. Detailed Explanation */}
                {notes.explanation && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      5. Detailed Explanation
                    </h4>
                    <div className="text-sm text-gray-800 leading-relaxed space-y-2">
                      {formatInlineBold(notes.explanation)}
                    </div>
                  </div>
                )}

                {/* 6. Types & Classifications */}
                {typesOrClassificationArr.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-3 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <ListOrdered className="w-4 h-4" /> 6. Types & Classifications
                    </h4>
                    <div className="space-y-3">
                      {typesOrClassificationArr.map((item, i) => {
                        if (typeof item === "object" && item !== null) {
                          return (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-appBorder">
                              <h5 className="font-bold text-darkText text-sm mb-1">{item.type || item.title || `Type ${i+1}`}</h5>
                              {item.description && <p className="text-xs text-gray-700 mb-2">{formatInlineBold(item.description)}</p>}
                              {item.examples && Array.isArray(item.examples) && (
                                <div className="text-xs text-orange-700 bg-orange-50/60 p-2.5 rounded border border-orange-100">
                                  <span className="font-semibold">Examples:</span> {item.examples.join(", ")}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return (
                          <div key={i} className="text-sm text-gray-800 pl-4 border-l-2 border-orange-400 py-0.5">
                            {formatInlineBold(String(item))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 7. Components */}
                {componentsArr.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      7. System Components
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1.5">
                      {componentsArr.map((comp, i) => (
                        <li key={i}>{formatInlineBold(typeof comp === "string" ? comp : JSON.stringify(comp))}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 8. Working / Working Principle */}
                {workingArr.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      8. Working & Mechanics
                    </h4>
                    <ol className="list-decimal pl-5 text-sm text-gray-800 space-y-1.5">
                      {workingArr.map((w, i) => (
                        <li key={i}>{formatInlineBold(typeof w === "string" ? w : JSON.stringify(w))}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* 9. Step-by-Step Procedure */}
                {stepsArr.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      9. Step-by-Step Procedure
                    </h4>
                    <ol className="list-decimal pl-5 text-sm text-gray-800 space-y-1.5">
                      {stepsArr.map((step, i) => (
                        <li key={i}>{formatInlineBold(typeof step === "string" ? step : JSON.stringify(step))}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* 10 & 11. Examples / Worked Examples */}
                {examplesArr.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-3 border-b border-orange-100 pb-1">
                      10. Examples & Illustrations
                    </h4>
                    <div className="space-y-3">
                      {examplesArr.map((ex, i) => {
                        if (typeof ex === "object" && ex !== null) {
                          return (
                            <div key={i} className="p-3.5 bg-gray-50 rounded-lg border border-appBorder text-xs text-gray-800 flex flex-col gap-1">
                              {ex.word && <div className="font-bold text-orange-700 text-sm">{ex.word}</div>}
                              {ex.analysis && <div><span className="font-semibold text-gray-700">Analysis:</span> {ex.analysis}</div>}
                              {ex.type && <div><span className="font-semibold text-gray-700">Category:</span> {ex.type}</div>}
                            </div>
                          );
                        }
                        return (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg border border-appBorder text-xs text-gray-800">
                            {formatInlineBold(String(ex))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 12. Code Examples */}
                {codeExamplesArr.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-orange-600 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-orange-600" /> 12. Code Examples
                    </h4>
                    {codeExamplesArr.map((codeEx: any, i: number) => (
                      <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-md">
                        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
                          <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-orange-400" />
                            <span className="font-bold text-white text-sm">
                              {codeEx.title || `Code Example ${i + 1}`}
                            </span>
                          </div>
                          {codeEx.language && (
                            <span className="text-xs bg-orange-500/20 text-orange-300 px-2.5 py-0.5 rounded border border-orange-500/30 uppercase font-mono">
                              {codeEx.language}
                            </span>
                          )}
                        </div>

                        <div className="p-4 space-y-3">
                          {codeEx.purpose && (
                            <p className="text-xs text-gray-300">
                              <span className="font-semibold text-orange-400">Purpose:</span> {codeEx.purpose}
                            </p>
                          )}

                          {codeEx.code && (
                            <div className="relative">
                              <pre className="p-4 bg-gray-950 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed border border-gray-800">
                                <code>{codeEx.code}</code>
                              </pre>
                            </div>
                          )}

                          {codeEx.explanation && (
                            <div className="text-xs text-gray-300 pt-1">
                              <span className="font-semibold text-orange-400">Explanation:</span> {codeEx.explanation}
                            </div>
                          )}

                          {(codeEx.expected_output || codeEx.expectedOutput) && (
                            <div className="pt-2 border-t border-gray-800">
                              <span className="text-xs font-semibold text-orange-400 block mb-1">
                                Expected Output:
                              </span>
                              <pre className="p-3 bg-gray-950 text-gray-200 rounded text-xs font-mono whitespace-pre border border-gray-800">
                                <code>{codeEx.expected_output || codeEx.expectedOutput}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 13. Diagram Instructions */}
                {diagramsArr.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-orange-600 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <PenTool className="w-5 h-5 text-orange-600" /> 13. Diagram / Figure Instructions
                    </h4>
                    {diagramsArr.map((diag: any, i: number) => (
                      <div key={i} className="p-5 bg-orange-50/40 rounded-xl border border-orange-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-darkText text-sm">
                            {diag.title || `Diagram ${i + 1}`}
                          </h5>
                          <span className="text-xs font-semibold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                            Figure Guide
                          </span>
                        </div>

                        {diag.purpose && (
                          <p className="text-xs text-gray-700">
                            <span className="font-semibold text-orange-800">Purpose:</span> {diag.purpose}
                          </p>
                        )}

                        {(diag.what_to_draw || diag.whatToDraw) && (
                          <div className="p-3 bg-white rounded border border-orange-200 text-xs text-gray-800">
                            <span className="font-bold text-orange-700 block mb-1">What to Draw in Answer Book:</span>
                            {diag.what_to_draw || diag.whatToDraw}
                          </div>
                        )}

                        {diag.labels && Array.isArray(diag.labels) && diag.labels.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-orange-800 block mb-1">Labels to include:</span>
                            <ul className="list-disc pl-5 text-xs text-gray-700 space-y-0.5">
                              {diag.labels.map((lbl: string, idx: number) => (
                                <li key={idx}>{lbl}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {diag.explanation && (
                          <p className="text-xs text-gray-700 italic border-t border-orange-200/60 pt-2">
                            {diag.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 14. Tables */}
                {tablesArr.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-base font-bold text-orange-600 border-b border-orange-100 pb-1 flex items-center gap-2">
                      <TableIcon className="w-5 h-5 text-orange-600" /> 14. Comparative Tables
                    </h4>
                    {tablesArr.map((tbl: any, i: number) => (
                      <div key={i} className="space-y-2">
                        {tbl.title && <h5 className="font-bold text-darkText text-sm">{tbl.title}</h5>}
                        <div className="overflow-x-auto rounded-lg border border-appBorder">
                          <table className="w-full text-xs text-left text-gray-800">
                            {tbl.headers && Array.isArray(tbl.headers) && (
                              <thead className="bg-orange-100 text-orange-950 font-bold uppercase border-b border-orange-200">
                                <tr>
                                  {tbl.headers.map((hdr: string, idx: number) => (
                                    <th key={idx} className="px-4 py-3">
                                      {hdr}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                            )}
                            <tbody>
                              {tbl.rows && Array.isArray(tbl.rows) && tbl.rows.map((row: any[], rIdx: number) => (
                                <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                                  {Array.isArray(row) && row.map((cell: any, cIdx: number) => (
                                    <td key={cIdx} className="px-4 py-2.5 border-t border-appBorder">
                                      {String(cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 15. Formulas */}
                {formulasArr.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      15. Mathematical Formulas
                    </h4>
                    <div className="space-y-2">
                      {formulasArr.map((form, i) => (
                        <div key={i} className="p-3 bg-orange-50/60 rounded-lg border border-orange-100 font-mono text-xs text-orange-950">
                          {String(form)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 16. Real-World Applications */}
                {applicationsArr.length > 0 && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      16. Real-World Applications
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1.5">
                      {applicationsArr.map((app, i) => (
                        <li key={i}>{formatInlineBold(typeof app === "string" ? app : JSON.stringify(app))}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 17 & 18. Advantages & Limitations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {advantagesArr.length > 0 && (
                    <div className="p-4 bg-green-50/60 rounded-xl border border-green-100">
                      <h5 className="font-bold text-green-900 text-sm mb-2">17. Advantages</h5>
                      <ul className="list-disc pl-4 text-xs text-green-950 space-y-1">
                        {advantagesArr.map((adv, i) => (
                          <li key={i}>{formatInlineBold(typeof adv === "string" ? adv : JSON.stringify(adv))}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {limitationsArr.length > 0 && (
                    <div className="p-4 bg-red-50/60 rounded-xl border border-red-100">
                      <h5 className="font-bold text-red-900 text-sm mb-2">18. Limitations</h5>
                      <ul className="list-disc pl-4 text-xs text-red-950 space-y-1">
                        {limitationsArr.map((lim, i) => (
                          <li key={i}>{formatInlineBold(typeof lim === "string" ? lim : JSON.stringify(lim))}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 20. Important RGPV Exam Points */}
                {importantExamPointsArr.length > 0 && (
                  <div className="p-5 bg-orange-50 rounded-xl border border-orange-200">
                    <h4 className="text-sm font-bold text-orange-950 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-orange-600" />
                      20. Important RGPV Exam Points
                    </h4>
                    <ul className="list-disc pl-5 text-xs text-orange-950 space-y-1 font-medium">
                      {importantExamPointsArr.map((pt, i) => (
                        <li key={i}>{formatInlineBold(typeof pt === "string" ? pt : JSON.stringify(pt))}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 21. Probable Examination Questions */}
                {probableQuestions && (
                  <div className="p-6 bg-orange-50/80 rounded-xl border border-orange-200 space-y-4">
                    <div className="border-b border-orange-200 pb-2">
                      <h4 className="text-lg font-bold text-orange-950 flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-600" />
                        RGPV EXAM PREPARATION
                      </h4>
                      <p className="text-xs text-orange-800 italic mt-0.5">
                        Practice / probable questions based on the generated study material
                      </p>
                    </div>

                    {/* Short Answer Questions */}
                    {(probableQuestions.short_answer || probableQuestions.shortAnswer) && (
                      <div>
                        <h5 className="font-bold text-orange-900 text-sm mb-1.5">Short Answer Questions</h5>
                        <ol className="list-decimal pl-5 text-xs text-orange-950 space-y-1 font-medium">
                          {safeArray(probableQuestions.short_answer || probableQuestions.shortAnswer).map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Medium Answer Questions */}
                    {(probableQuestions.medium_answer || probableQuestions.mediumAnswer) && (
                      <div>
                        <h5 className="font-bold text-orange-900 text-sm mb-1.5">Medium Answer Questions</h5>
                        <ol className="list-decimal pl-5 text-xs text-orange-950 space-y-1 font-medium">
                          {safeArray(probableQuestions.medium_answer || probableQuestions.mediumAnswer).map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* 7-Mark Long Answer Questions */}
                    {(probableQuestions.long_answer_7_marks || probableQuestions.longAnswer7Marks) && (
                      <div>
                        <h5 className="font-bold text-orange-900 text-sm mb-1.5">7-Mark / Long Answer Questions</h5>
                        <ol className="list-decimal pl-5 text-xs text-orange-950 space-y-1 font-semibold">
                          {safeArray(probableQuestions.long_answer_7_marks || probableQuestions.longAnswer7Marks).map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {/* 22. How to Write a 7-Mark Answer */}
                {sevenMarkGuide && (
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 sm:p-7 rounded-2xl shadow-lg space-y-5">
                    <div className="border-b border-orange-400/60 pb-3 flex items-center justify-between">
                      <div>
                        <span className="text-xs uppercase font-bold tracking-wider text-orange-200 bg-orange-700/50 px-2.5 py-0.5 rounded">
                          RGPV Exam Mastery
                        </span>
                        <h3 className="text-xl font-extrabold mt-1">HOW TO WRITE A 7-MARK ANSWER</h3>
                      </div>
                      <Sparkles className="w-7 h-7 text-orange-200" />
                    </div>

                    {/* Purpose */}
                    {sevenMarkGuide.purpose && (
                      <p className="text-xs text-orange-50 leading-relaxed font-medium bg-orange-700/30 p-3 rounded-lg border border-orange-400/40">
                        {sevenMarkGuide.purpose}
                      </p>
                    )}

                    {/* Recommended Answer Structure */}
                    {(sevenMarkGuide.recommended_structure || sevenMarkGuide.recommendedStructure) && (
                      <div>
                        <h4 className="font-bold text-sm text-orange-100 mb-2 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-orange-200" /> Recommended Answer Structure
                        </h4>
                        <ul className="list-disc pl-5 text-xs text-orange-50 space-y-1">
                          {safeArray(sevenMarkGuide.recommended_structure || sevenMarkGuide.recommendedStructure).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 3-Page Answer Strategy */}
                    {(sevenMarkGuide.page_wise_strategy || sevenMarkGuide.pageWiseStrategy) && (
                      <div>
                        <h4 className="font-bold text-sm text-orange-100 mb-2.5">3-Page Answer Strategy</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {safeArray(sevenMarkGuide.page_wise_strategy || sevenMarkGuide.pageWiseStrategy).map((pageContent, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20 text-xs text-orange-50">
                              <span className="font-extrabold text-orange-200 block mb-1 text-xs uppercase">
                                Page {i + 1}
                              </span>
                              {typeof pageContent === "object" ? pageContent.content || JSON.stringify(pageContent) : String(pageContent)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Important Keywords */}
                    {(sevenMarkGuide.important_keywords || sevenMarkGuide.importantKeywords) && (
                      <div>
                        <h4 className="font-bold text-sm text-orange-100 mb-2">Important Keywords to Include</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {safeArray(sevenMarkGuide.important_keywords || sevenMarkGuide.importantKeywords).map((kw, i) => (
                            <span key={i} className="bg-white text-orange-800 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Diagram Strategy */}
                    {(sevenMarkGuide.diagram_strategy || sevenMarkGuide.diagramStrategy) && (
                      <div className="bg-orange-700/40 p-3.5 rounded-xl border border-orange-400/40 text-xs text-orange-50">
                        <span className="font-bold text-orange-200 block mb-0.5">Diagram Strategy:</span>
                        {sevenMarkGuide.diagram_strategy || sevenMarkGuide.diagramStrategy}
                      </div>
                    )}

                    {/* Memory Trick */}
                    {(sevenMarkGuide.memory_trick || sevenMarkGuide.memoryTrick) && (
                      <div className="bg-yellow-400 text-yellow-950 p-4 rounded-xl font-bold shadow-sm text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-yellow-900">
                          <Lightbulb className="w-4 h-4 text-yellow-800" /> MEMORY TRICK
                        </div>
                        <div className="text-sm">{sevenMarkGuide.memory_trick || sevenMarkGuide.memoryTrick}</div>
                      </div>
                    )}

                    {/* If You Forget in the Exam */}
                    {(sevenMarkGuide.if_you_forget || sevenMarkGuide.ifYouForget) && (
                      <div className="bg-orange-800/60 p-4 rounded-xl border border-orange-400/50 text-xs text-orange-100 space-y-1">
                        <span className="font-bold text-orange-200 uppercase tracking-wider text-xs block">
                          IF YOU FORGET IN THE EXAM
                        </span>
                        <p>{sevenMarkGuide.if_you_forget || sevenMarkGuide.ifYouForget}</p>
                      </div>
                    )}

                    {/* Common Mistakes */}
                    {(sevenMarkGuide.common_mistakes || sevenMarkGuide.commonMistakes) && (
                      <div className="bg-red-950/40 p-4 rounded-xl border border-red-400/40 text-xs text-red-100 space-y-1">
                        <span className="font-bold text-red-200 uppercase tracking-wider text-xs flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-red-300" /> Common Mistakes to Avoid
                        </span>
                        <ul className="list-disc pl-5 space-y-0.5 text-red-100">
                          {safeArray(sevenMarkGuide.common_mistakes || sevenMarkGuide.commonMistakes).map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 30. Summary */}
                {notes.summary && (
                  <div>
                    <h4 className="text-base font-bold text-orange-600 mb-2 border-b border-orange-100 pb-1">
                      30. Summary & Takeaways
                    </h4>
                    <p className="text-sm text-gray-800 italic bg-gray-50 p-4 rounded-xl border border-gray-200 leading-relaxed">
                      {formatInlineBold(notes.summary)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* IMAGES RESULT SECTION */}
      {safeImagesObj && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-darkText flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange-500" />
              Visual Learning Material
            </h3>
            <span className="text-xs text-secondaryText">4 Visual Formats Generated</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VisualCard
              title="1. Infographic"
              typeSuffix="Infographic"
              imageUrl={safeImagesObj.infographic}
              onDownload={(url) => downloadImage(url, "Infographic")}
            />
            <VisualCard
              title="2. Diagram"
              typeSuffix="Diagram"
              imageUrl={safeImagesObj.diagram}
              onDownload={(url) => downloadImage(url, "Diagram")}
            />
            <VisualCard
              title="3. Table"
              typeSuffix="Table"
              imageUrl={safeImagesObj.table}
              onDownload={(url) => downloadImage(url, "Table")}
            />
            <VisualCard
              title="4. Flowchart"
              typeSuffix="Flowchart"
              imageUrl={safeImagesObj.flowchart}
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
