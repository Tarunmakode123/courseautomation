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
  Lightbulb,
  FileQuestion,
  FileCode,
  Sparkles,
  Zap,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Check,
  XCircle,
  Info,
} from "lucide-react";

export interface GeneratedResultData {
  notes?: any;
  verification?: any;
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

// Clean malformed SVG artifacts without removing legitimate academic "SVG" words
function cleanSvgArtifacts(str: any): string {
  if (typeof str !== "string") return String(str || "");
  return str
    .replace(/\bsvg(?=[A-Z0-9])/g, "") // removes "svg" when glued to capitalized word e.g. svgType, svgHMM, svgMEMORY
    .replace(/^\s*svg\s*$/gi, "") // removes standalone "svg" line
    .replace(/svg(?=(1\.|2\.|3\.|Introduction|Definition|MEMORY|Common))/gi, "")
    .trim();
}

// Helper to strip leading numbers or bullets (e.g., "1. ", "1) ", "- ", "* ")
function cleanListItem(text: any): string {
  if (typeof text !== "string") return cleanSvgArtifacts(text);
  const cleaned = text.replace(/^(\d+[\.\)]|step\s*\d+:?|[-*•])\s*/i, "").trim();
  return cleanSvgArtifacts(cleaned);
}

// Helper to parse keywords into clean individual pill badges
function parseKeywords(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.flatMap((v) => parseKeywords(v));
  }
  if (typeof val === "string") {
    const cleanStr = cleanSvgArtifacts(val);
    if (cleanStr.includes(",")) {
      return cleanStr.split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (cleanStr.includes("\n")) {
      return cleanStr.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    if (/[a-z][A-Z]/.test(cleanStr)) {
      return cleanStr.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ").map((s) => s.trim()).filter(Boolean);
    }
    return [cleanStr.trim()];
  }
  return [cleanSvgArtifacts(val)];
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
  const clean = cleanSvgArtifacts(text);
  const parts = clean.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-darkText">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Render Markdown Tables as HTML tables
function renderMarkdownTable(tableString: string) {
  const lines = tableString.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return null;

  const dataLines = lines.filter((line) => !/^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?$/.test(line));
  if (dataLines.length === 0) return null;

  const parseRow = (rowStr: string) => {
    return rowStr.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  };

  const headers = parseRow(dataLines[0]);
  const rows = dataLines.slice(1).map(parseRow);

  return (
    <div className="overflow-x-auto rounded-xl border border-appBorder my-4 shadow-sm">
      <table className="w-full text-xs text-left text-gray-800">
        <thead className="bg-orange-100 text-orange-950 font-bold uppercase border-b border-orange-200">
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} className="px-4 py-3 border-r border-orange-200/60 last:border-r-0">
                {cleanSvgArtifacts(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-2.5 border-t border-appBorder border-r border-appBorder last:border-r-0">
                  {formatInlineBold(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Type-Aware Smart Renderer for ANY nested value (NEVER outputs [object Object])
const RenderSmartContent: React.FC<{ value: any }> = ({ value }) => {
  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    const cleanStr = cleanSvgArtifacts(value);
    if (cleanStr.includes("|") && cleanStr.includes("\n")) {
      const parsedTable = renderMarkdownTable(cleanStr);
      if (parsedTable) return parsedTable;
    }
    return <span className="whitespace-pre-wrap">{formatInlineBold(cleanStr)}</span>;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return <span>{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const isStringArray = value.every((v) => typeof v === "string" || typeof v === "number");

    if (isStringArray) {
      return (
        <ul className="list-disc pl-5 text-xs text-gray-800 space-y-1">
          {value.map((item, idx) => (
            <li key={idx}>{formatInlineBold(cleanListItem(String(item)))}</li>
          ))}
        </ul>
      );
    }

    return (
      <div className="space-y-3 my-2">
        {value.map((item, idx) => (
          <RenderObjectCard key={idx} obj={item} defaultTitle={`Item ${idx + 1}`} />
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return <RenderObjectCard obj={value} />;
  }

  return null;
};

// Generic Object Card Component that dynamically renders ANY object without dropping fields or outputting [object Object]
const RenderObjectCard: React.FC<{ obj: Record<string, any>; defaultTitle?: string }> = ({ obj, defaultTitle }) => {
  if (typeof obj !== "object" || obj === null) {
    return (
      <div className="p-3.5 bg-gray-50 rounded-xl border border-appBorder text-xs text-gray-800">
        {formatInlineBold(cleanListItem(String(obj)))}
      </div>
    );
  }

  const labelMap: Record<string, string> = {
    title: "Title",
    word: "Word / Term",
    name: "Name",
    problem: "Problem / Question",
    question: "Question",
    input: "Input",
    analysis: "Analysis / Breakdown",
    explanation: "Explanation",
    description: "Description",
    result: "Result / Answer",
    answer: "Answer",
    output: "Expected Output",
    type: "Category / Type",
    category: "Category",
    code: "Code Snippet",
    purpose: "Purpose",
    what_to_draw: "What to Draw in Answer Book",
    whatToDraw: "What to Draw in Answer Book",
    labels: "Labels to Include",
    headers: "Headers",
    rows: "Rows",
    claim: "Claim",
    evidence: "Evidence",
    correction: "Correction",
    location: "Location",
    severity: "Severity",
    formula: "Formula",
    calculation: "Calculation",
  };

  const title = obj.title || obj.name || obj.word || defaultTitle;
  const titleKeys = ["title", "name", "word"];

  const entries = Object.entries(obj).filter(([k, v]) => !titleKeys.includes(k) && v !== null && v !== undefined && v !== "");

  // Special handling for Table Object { headers, rows }
  if (obj.headers && Array.isArray(obj.headers) && obj.rows && Array.isArray(obj.rows)) {
    return (
      <div className="space-y-2 my-2">
        {title && <h5 className="font-bold text-darkText text-xs">{cleanSvgArtifacts(title)}</h5>}
        <div className="overflow-x-auto rounded-xl border border-appBorder shadow-sm">
          <table className="w-full text-xs text-left text-gray-800">
            <thead className="bg-orange-100 text-orange-950 font-bold uppercase border-b border-orange-200">
              <tr>
                {obj.headers.map((hdr: any, idx: number) => (
                  <th key={idx} className="px-4 py-3 border-r border-orange-200/60 last:border-r-0">
                    {cleanSvgArtifacts(String(hdr))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {obj.rows.map((row: any[], rIdx: number) => (
                <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  {Array.isArray(row) && row.map((cell: any, cIdx: number) => (
                    <td key={cIdx} className="px-4 py-2.5 border-t border-appBorder border-r border-appBorder last:border-r-0">
                      {formatInlineBold(String(cell))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50/90 rounded-xl border border-appBorder shadow-sm space-y-2.5">
      {title && (
        <div className="font-bold text-orange-700 text-xs border-b border-orange-100 pb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>{cleanSvgArtifacts(title)}</span>
        </div>
      )}

      {entries.map(([key, value]) => {
        const label = labelMap[key] || key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (l) => l.toUpperCase());

        if (key === "code" || key === "code_snippet") {
          return (
            <div key={key} className="space-y-1">
              <span className="font-bold text-gray-700 text-xs block">{label}:</span>
              <pre className="p-3 bg-gray-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed border border-gray-800">
                <code>{String(value)}</code>
              </pre>
            </div>
          );
        }

        // Render URL if source_url key
        if (key === "source_url" && typeof value === "string") {
          return (
            <div key={key} className="text-xs text-gray-800">
              <span className="font-bold text-gray-700 mr-1.5">Source URL:</span>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 underline font-medium hover:text-orange-700 inline-flex items-center gap-1"
              >
                <span>{value}</span>
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            </div>
          );
        }

        return (
          <div key={key} className="text-xs text-gray-800 space-y-0.5">
            <span className="font-bold text-gray-700 block">{label}:</span>
            <div className="pl-2 border-l-2 border-orange-300">
              <RenderSmartContent value={value} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Markdown text renderer
const MarkdownText: React.FC<{ content: string }> = ({ content }) => {
  const paragraphs = (content || "").split("\n\n");

  return (
    <div className="space-y-4 text-darkText leading-relaxed">
      {paragraphs.map((p, idx) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        if (trimmed.includes("|") && trimmed.includes("\n")) {
          const tableElem = renderMarkdownTable(trimmed);
          if (tableElem) return <React.Fragment key={idx}>{tableElem}</React.Fragment>;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-base font-bold text-orange-600 mt-4 mb-2">
              {cleanSvgArtifacts(trimmed.replace(/^###\s*/, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <div key={idx} className="flex items-center gap-2 border-b border-orange-100 pb-1.5 mt-5 mb-3">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold text-darkText">
                {cleanSvgArtifacts(trimmed.replace(/^##\s*/, ""))}
              </h3>
            </div>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-xl font-bold text-orange-600 border-b border-orange-200 pb-2 mt-6 mb-3">
              {cleanSvgArtifacts(trimmed.replace(/^#\s*/, ""))}
            </h2>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split("\n").map((line) => line.replace(/^[-*]\s*/, ""));
          return (
            <ul key={idx} className="list-disc pl-5 text-sm text-gray-800 space-y-1.5">
              {items.map((item, i) => (
                <li key={i}>{formatInlineBold(cleanListItem(item))}</li>
              ))}
            </ul>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split("\n").map((line) => line.replace(/^\d+\.\s*/, ""));
          return (
            <ol key={idx} className="list-decimal pl-5 text-sm text-gray-800 space-y-1.5">
              {items.map((item, i) => (
                <li key={i}>{formatInlineBold(cleanListItem(item))}</li>
              ))}
            </ol>
          );
        }

        if (trimmed.startsWith("```")) {
          const codeText = trimmed.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "");
          return (
            <pre key={idx} className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs font-mono overflow-x-auto my-3 whitespace-pre border border-gray-800">
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

// Verification Panel Component
const VerificationDisplay: React.FC<{ verification: any }> = ({ verification }) => {
  if (!verification || typeof verification !== "object") {
    return (
      <div className="bg-white rounded-xl border border-appBorder p-5 text-center text-xs text-secondaryText shadow-sm">
        <Info className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
        <p className="font-medium">Verification information is not available for this material.</p>
      </div>
    );
  }

  const statusRaw = String(verification.verification_status || verification.status || "verified").toLowerCase();

  let statusBadge = {
    label: "Verified",
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
  };

  if (statusRaw.includes("warning")) {
    statusBadge = {
      label: "Verified with Warnings",
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      icon: <ShieldAlert className="w-4 h-4 text-amber-600" />,
    };
  } else if (statusRaw.includes("correction") || statusRaw.includes("fail") || statusRaw.includes("error")) {
    statusBadge = {
      label: "Needs Correction",
      bg: "bg-red-50 text-red-800 border-red-200",
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
    };
  }

  const confidenceVal = typeof verification.confidence === "number"
    ? Math.round(verification.confidence > 1 ? verification.confidence : verification.confidence * 100)
    : 95;

  const issuesFound = safeArray(verification.issues_found || verification.issues);
  const factualChecks = safeArray(verification.factual_verification);
  const mathChecks = verification.mathematical_verification || null;
  const formulaChecks = safeArray(mathChecks?.formula_checks);
  const numericalChecks = safeArray(mathChecks?.numerical_checks);
  const codeVerification = verification.code_verification || null;
  const codeChecks = safeArray(codeVerification?.checks);
  const internalConsistency = verification.internal_consistency || null;
  const sourcesChecked = safeArray(verification.sources);

  return (
    <div className="bg-white rounded-xl border border-appBorder p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-appBorder pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-darkText flex items-center gap-2">
              Academic Content Verification
            </h3>
            <p className="text-xs text-secondaryText">Cross-verified syllabus & source check</p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1">
          <div className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-2 ${statusBadge.bg}`}>
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </div>
          <span className="text-xs font-semibold text-gray-700">
            Verification confidence: {confidenceVal}%
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 italic">
        * Confidence reflects the verification assessment and is not a percentage guarantee of correctness.
      </p>

      {/* Summary */}
      {verification.overall_verification_summary && (
        <div className="p-3.5 bg-orange-50/50 rounded-xl border border-orange-100 text-xs text-gray-800 leading-relaxed">
          <span className="font-bold text-orange-900 block mb-1">Overall Summary:</span>
          {cleanSvgArtifacts(verification.overall_verification_summary)}
        </div>
      )}

      {/* Issues Found */}
      {issuesFound.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-darkText uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span>Issues & Flagged Items ({issuesFound.length})</span>
          </h4>
          <div className="space-y-2.5">
            {issuesFound.map((issue: any, idx: number) => {
              if (typeof issue === "string") {
                return (
                  <div key={idx} className="p-3 bg-red-50/60 rounded-lg border border-red-100 text-xs text-red-900">
                    {cleanSvgArtifacts(issue)}
                  </div>
                );
              }
              const sourceTitle = issue.source_title || issue.source || "Reference Source";
              return (
                <div key={idx} className="p-3.5 bg-orange-50/40 rounded-xl border border-orange-200 text-xs text-gray-800 space-y-1.5">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-orange-900">{issue.location || `Issue ${idx + 1}`}</span>
                    {issue.severity && (
                      <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                        {issue.severity}
                      </span>
                    )}
                  </div>
                  {issue.problem && <p><span className="font-semibold text-gray-700">Problem:</span> {issue.problem}</p>}
                  {issue.description && <p><span className="font-semibold text-gray-700">Description:</span> {issue.description}</p>}
                  {issue.explanation && <p><span className="font-semibold text-gray-700">Explanation:</span> {issue.explanation}</p>}
                  {issue.correction && <p><span className="font-semibold text-emerald-800">Correction:</span> {issue.correction}</p>}
                  {issue.evidence && <p><span className="font-semibold text-gray-700">Evidence:</span> {issue.evidence}</p>}
                  {issue.source_url ? (
                    <div className="pt-1">
                      <a
                        href={issue.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 font-semibold underline inline-flex items-center gap-1 hover:text-orange-700"
                      >
                        <span>Source: {sourceTitle}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="text-gray-600 text-[11px] font-medium">Source: {sourceTitle}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Factual Verification */}
      {factualChecks.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-darkText uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Factual Verification ({factualChecks.length})</span>
          </h4>
          <div className="space-y-2.5">
            {factualChecks.map((item: any, idx: number) => {
              if (typeof item === "string") {
                return <div key={idx} className="p-3 bg-gray-50 rounded-lg text-xs text-gray-800">{item}</div>;
              }
              const isCorrect = String(item.status || "").toLowerCase().includes("correct");
              return (
                <div key={idx} className="p-3.5 bg-gray-50/80 rounded-xl border border-appBorder text-xs text-gray-800 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-darkText">{item.claim || `Claim ${idx + 1}`}</span>
                    {item.status && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  {item.evidence && <p><span className="font-semibold text-gray-700">Evidence:</span> {item.evidence}</p>}
                  {item.source_url ? (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 font-semibold underline inline-flex items-center gap-1 hover:text-orange-700"
                    >
                      <span>{item.source_title || item.source_url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : item.source_title ? (
                    <span className="text-gray-600 font-medium">Source: {item.source_title}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mathematical Verification */}
      {(formulaChecks.length > 0 || numericalChecks.length > 0) && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-darkText uppercase tracking-wider flex items-center gap-1.5">
            <CalculatorIcon className="w-4 h-4 text-orange-600" />
            <span>Mathematical & Formula Verification</span>
          </h4>
          <div className="space-y-2.5">
            {formulaChecks.map((fc: any, idx: number) => (
              <RenderObjectCard key={idx} obj={fc} defaultTitle={`Formula Check ${idx + 1}`} />
            ))}
            {numericalChecks.map((nc: any, idx: number) => (
              <RenderObjectCard key={idx} obj={nc} defaultTitle={`Numerical Check ${idx + 1}`} />
            ))}
          </div>
        </div>
      )}

      {/* Code Verification */}
      {codeVerification && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1">
            <h4 className="text-xs font-bold text-darkText uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-orange-600" />
              <span>Code Verification</span>
            </h4>
            <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              {codeVerification.executed === true ? "Code Executed" : "Code Inspected"}
            </span>
          </div>
          {codeVerification.overall_status && (
            <p className="text-xs text-gray-700 font-medium">{codeVerification.overall_status}</p>
          )}
          {codeChecks.map((chk: any, idx: number) => (
            <RenderObjectCard key={idx} obj={chk} defaultTitle={`Code Check ${idx + 1}`} />
          ))}
        </div>
      )}

      {/* Internal Consistency */}
      {internalConsistency && (
        <div className="p-3.5 bg-gray-50 rounded-xl border border-appBorder text-xs text-gray-800 space-y-1">
          <span className="font-bold text-gray-700 block">Internal Consistency: {internalConsistency.status || "Check Passed"}</span>
          {internalConsistency.issues && Array.isArray(internalConsistency.issues) && internalConsistency.issues.length > 0 && (
            <ul className="list-disc pl-4 text-xs text-gray-700 space-y-0.5">
              {internalConsistency.issues.map((iss: any, idx: number) => (
                <li key={idx}>{String(iss)}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Sources Checked */}
      {sourcesChecked.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-darkText uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-orange-600" />
            <span>Sources Checked ({sourcesChecked.length})</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sourcesChecked.map((src: any, idx: number) => {
              if (typeof src === "string") {
                return (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-xs font-medium text-gray-800">
                    {src}
                  </div>
                );
              }
              const title = src.source_title || src.title || `Source ${idx + 1}`;
              const type = src.source_type || src.type || "Academic Reference";
              const url = src.source_url || src.url;

              return (
                <div key={idx} className="p-3.5 bg-gray-50 rounded-xl border border-appBorder text-xs text-gray-800 flex flex-col justify-between gap-2">
                  <div>
                    <div className="font-bold text-darkText">{title}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{type}</div>
                  </div>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 font-semibold hover:text-orange-700 text-xs inline-flex items-center gap-1 w-fit"
                    >
                      <span>View Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Fallback Calculator Icon
function CalculatorIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ data, onReset }) => {
  const { notes, verification, images, requestInfo } = data;
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

  // Extract sections safely
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

      {/* VERIFICATION PANEL */}
      <VerificationDisplay verification={verification} />

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
                {/* Document Title */}
                {notes.title && (
                  <h3 className="text-xl font-bold text-darkText border-b border-appBorder pb-2.5">
                    {cleanSvgArtifacts(notes.title)}
                  </h3>
                )}

                {/* Introduction */}
                {notes.introduction && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-orange-100">
                      <BookOpen className="w-4 h-4 text-orange-600" />
                      <h4 className="text-base font-bold text-orange-600">Introduction</h4>
                    </div>
                    <div className="text-sm text-gray-800 leading-relaxed">
                      <RenderSmartContent value={notes.introduction} />
                    </div>
                  </div>
                )}

                {/* Definition */}
                {notes.definition && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-orange-100">
                      <CheckCircle2 className="w-4 h-4 text-orange-600" />
                      <h4 className="text-base font-bold text-orange-600">Definition</h4>
                    </div>
                    <div className="text-sm text-gray-800 bg-orange-50/70 p-4 rounded-xl border border-orange-100 font-medium leading-relaxed">
                      <RenderSmartContent value={notes.definition} />
                    </div>
                  </div>
                )}

                {/* Key Terminology */}
                {keyTerminologyArr.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-orange-100">
                      <Tag className="w-4 h-4 text-orange-600" />
                      <h4 className="text-base font-bold text-orange-600">Key Terminology</h4>
                    </div>
                    <RenderSmartContent value={keyTerminologyArr} />
                  </div>
                )}

                {/* Core Concepts */}
                {coreConceptsArr.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 pb-1 border-b border-orange-100">
                      <Layers className="w-4 h-4 text-orange-600" />
                      <h4 className="text-base font-bold text-orange-600">Core Concepts</h4>
                    </div>
                    <RenderSmartContent value={coreConceptsArr} />
                  </div>
                )}

                {/* Detailed Explanation */}
                {notes.explanation && (
                  <div>
                    <div className="mb-2 pb-1 border-b border-orange-100">
                      <h4 className="text-base font-bold text-orange-600">Detailed Explanation</h4>
                    </div>
                    <div className="text-sm text-gray-800 leading-relaxed">
                      <RenderSmartContent value={notes.explanation} />
                    </div>
                  </div>
                )}

                {/* Types & Classifications */}
                {typesOrClassificationArr.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-1 border-b border-orange-100">
                      <ListOrdered className="w-4 h-4 text-orange-600" />
                      <h4 className="text-base font-bold text-orange-600">Types & Classifications</h4>
                    </div>
                    <RenderSmartContent value={typesOrClassificationArr} />
                  </div>
                )}

                {/* System Components */}
                {componentsArr.length > 0 && (
                  <div>
                    <div className="mb-2 pb-1 border-b border-orange-100">
                      <h4 className="text-base font-bold text-orange-600">System Components</h4>
                    </div>
                    <RenderSmartContent value={componentsArr} />
                  </div>
                )}

                {/* Working & Mechanics */}
                {workingArr.length > 0 && (
                  <div>
                    <div className="mb-2 pb-1 border-b border-orange-100">
                      <h4 className="text-base font-bold text-orange-600">Working & Mechanics</h4>
                    </div>
                    <RenderSmartContent value={workingArr} />
                  </div>
                )}

                {/* Step-by-Step Procedure */}
                {stepsArr.length > 0 && (
                  <div>
                    <div className="mb-2 pb-1 border-b border-orange-100">
                      <h4 className="text-base font-bold text-orange-600">Step-by-Step Procedure</h4>
                    </div>
                    <RenderSmartContent value={stepsArr} />
                  </div>
                )}

                {/* Examples & Illustrations */}
                {examplesArr.length > 0 && (
                  <div>
                    <div className="mb-3 pb-1 border-b border-orange-100">
                      <h4 className="text-base font-bold text-orange-600">Examples & Illustrations</h4>
                    </div>
                    <RenderSmartContent value={examplesArr} />
                  </div>
                )}

                {/* Code Examples */}
                {codeExamplesArr.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-orange-100 pb-1">
                      <Code2 className="w-5 h-5 text-orange-600" />
                      <h4 className="text-base font-bold text-orange-600">Code Examples</h4>
                    </div>
                    <RenderSmartContent value={codeExamplesArr} />
                  </div>
                )}

                {/* Diagram Instructions */}
                {diagramsArr.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-orange-100 pb-1">
                      <PenTool className="w-5 h-5 text-orange-600" />
                      <h4 className="text-base font-bold text-orange-600">Diagram / Figure Instructions</h4>
                    </div>
                    <RenderSmartContent value={diagramsArr} />
                  </div>
                )}

                {/* Comparative Tables */}
                {tablesArr.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-orange-100 pb-1">
                      <TableIcon className="w-5 h-5 text-orange-600" />
                      <h4 className="text-base font-bold text-orange-600">Comparative Tables</h4>
                    </div>
                    <RenderSmartContent value={tablesArr} />
                  </div>
                )}

                {/* Mathematical Formulas */}
                {formulasArr.length > 0 && (
                  <div>
                    <div className="mb-2 pb-1 border-b border-orange-100">
                      <h4 className="text-base font-bold text-orange-600">Mathematical Formulas</h4>
                    </div>
                    <RenderSmartContent value={formulasArr} />
                  </div>
                )}

                {/* Real-World Applications */}
                {applicationsArr.length > 0 && (
                  <div>
                    <div className="mb-2 pb-1 border-b border-orange-100">
                      <h4 className="text-base font-bold text-orange-600">Real-World Applications</h4>
                    </div>
                    <RenderSmartContent value={applicationsArr} />
                  </div>
                )}

                {/* Advantages & Limitations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {advantagesArr.length > 0 && (
                    <div className="p-4 bg-green-50/60 rounded-xl border border-green-100">
                      <h5 className="font-bold text-green-900 text-sm mb-2">Advantages</h5>
                      <RenderSmartContent value={advantagesArr} />
                    </div>
                  )}

                  {limitationsArr.length > 0 && (
                    <div className="p-4 bg-red-50/60 rounded-xl border border-red-100">
                      <h5 className="font-bold text-red-900 text-sm mb-2">Limitations</h5>
                      <RenderSmartContent value={limitationsArr} />
                    </div>
                  )}
                </div>

                {/* Important RGPV Exam Points */}
                {importantExamPointsArr.length > 0 && (
                  <div className="p-5 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-4 h-4 text-orange-600" />
                      <h4 className="text-sm font-bold text-orange-950">Important RGPV Exam Points</h4>
                    </div>
                    <RenderSmartContent value={importantExamPointsArr} />
                  </div>
                )}

                {/* Probable Examination Questions */}
                {probableQuestions && (
                  <div className="p-6 bg-orange-50/80 rounded-xl border border-orange-200 space-y-4">
                    <div className="border-b border-orange-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-orange-600" />
                        <h4 className="text-lg font-bold text-orange-950">RGPV EXAM PREPARATION</h4>
                      </div>
                      <p className="text-xs text-orange-800 italic mt-0.5">
                        Practice / Probable Questions based on the generated study material
                      </p>
                    </div>

                    {/* Short Answer Questions */}
                    {(probableQuestions.short_answer || probableQuestions.shortAnswer) && (
                      <div>
                        <h5 className="font-bold text-orange-900 text-sm mb-1.5">Short Answer Questions</h5>
                        <RenderSmartContent value={probableQuestions.short_answer || probableQuestions.shortAnswer} />
                      </div>
                    )}

                    {/* Medium Answer Questions */}
                    {(probableQuestions.medium_answer || probableQuestions.mediumAnswer) && (
                      <div>
                        <h5 className="font-bold text-orange-900 text-sm mb-1.5">Medium Answer Questions</h5>
                        <RenderSmartContent value={probableQuestions.medium_answer || probableQuestions.mediumAnswer} />
                      </div>
                    )}

                    {/* 7-Mark Long Answer Questions */}
                    {(probableQuestions.long_answer_7_marks || probableQuestions.longAnswer7Marks) && (
                      <div>
                        <h5 className="font-bold text-orange-900 text-sm mb-1.5">7-Mark / Long Answer Questions</h5>
                        <RenderSmartContent value={probableQuestions.long_answer_7_marks || probableQuestions.longAnswer7Marks} />
                      </div>
                    )}
                  </div>
                )}

                {/* How to Write a 7-Mark Answer */}
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
                        {cleanSvgArtifacts(sevenMarkGuide.purpose)}
                      </p>
                    )}

                    {/* Recommended Answer Structure */}
                    {(sevenMarkGuide.recommended_structure || sevenMarkGuide.recommendedStructure) && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2 font-bold text-sm text-orange-100">
                          <Zap className="w-4 h-4 text-orange-200" />
                          <span>Recommended Answer Structure</span>
                        </div>
                        <RenderSmartContent value={sevenMarkGuide.recommended_structure || sevenMarkGuide.recommendedStructure} />
                      </div>
                    )}

                    {/* 3-Page Answer Strategy */}
                    {(sevenMarkGuide.page_wise_strategy || sevenMarkGuide.pageWiseStrategy) && (
                      <div>
                        <h4 className="font-bold text-sm text-orange-100 mb-2.5">3-Page Answer Strategy</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {safeArray(sevenMarkGuide.page_wise_strategy || sevenMarkGuide.pageWiseStrategy).map((pageContent, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/20 text-xs text-orange-50 space-y-1">
                              <span className="font-extrabold text-orange-200 block text-xs uppercase">
                                Page {i + 1}
                              </span>
                              <RenderSmartContent value={typeof pageContent === "object" ? pageContent.content || pageContent : pageContent} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Important Keywords */}
                    {(sevenMarkGuide.important_keywords || sevenMarkGuide.importantKeywords) && (
                      <div>
                        <h4 className="font-bold text-sm text-orange-100 mb-2">Important Keywords to Include</h4>
                        <div className="flex flex-wrap gap-2">
                          {parseKeywords(sevenMarkGuide.important_keywords || sevenMarkGuide.importantKeywords).map((kw, i) => (
                            <span key={i} className="bg-white text-orange-900 text-xs font-bold px-3 py-1 rounded-md shadow-sm">
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
                        <RenderSmartContent value={sevenMarkGuide.diagram_strategy || sevenMarkGuide.diagramStrategy} />
                      </div>
                    )}

                    {/* Memory Trick */}
                    {(sevenMarkGuide.memory_trick || sevenMarkGuide.memoryTrick) && (
                      <div className="bg-yellow-400 text-yellow-950 p-4 rounded-xl font-bold shadow-sm text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-yellow-900">
                          <Lightbulb className="w-4 h-4 text-yellow-800" />
                          <span>MEMORY TRICK</span>
                        </div>
                        <div className="text-sm">
                          <RenderSmartContent value={sevenMarkGuide.memory_trick || sevenMarkGuide.memoryTrick} />
                        </div>
                      </div>
                    )}

                    {/* If You Forget in the Exam */}
                    {(sevenMarkGuide.if_you_forget || sevenMarkGuide.ifYouForget) && (
                      <div className="bg-orange-800/60 p-4 rounded-xl border border-orange-400/50 text-xs text-orange-100 space-y-1">
                        <span className="font-bold text-orange-200 uppercase tracking-wider text-xs block">
                          IF YOU FORGET IN THE EXAM
                        </span>
                        <RenderSmartContent value={sevenMarkGuide.if_you_forget || sevenMarkGuide.ifYouForget} />
                      </div>
                    )}

                    {/* Common Mistakes */}
                    {(sevenMarkGuide.common_mistakes || sevenMarkGuide.commonMistakes) && (
                      <div className="bg-red-950/40 p-4 rounded-xl border border-red-400/40 text-xs text-red-100 space-y-1">
                        <div className="flex items-center gap-1 text-xs uppercase font-bold tracking-wider text-red-200">
                          <AlertCircle className="w-3.5 h-3.5 text-red-300" />
                          <span>Common Mistakes to Avoid</span>
                        </div>
                        <RenderSmartContent value={sevenMarkGuide.common_mistakes || sevenMarkGuide.commonMistakes} />
                      </div>
                    )}
                  </div>
                )}

                {/* Summary */}
                {notes.summary && (
                  <div>
                    <div className="mb-2 pb-1 border-b border-orange-100">
                      <h4 className="text-base font-bold text-orange-600">Summary & Takeaways</h4>
                    </div>
                    <div className="text-sm text-gray-800 italic bg-gray-50 p-4 rounded-xl border border-gray-200 leading-relaxed">
                      <RenderSmartContent value={notes.summary} />
                    </div>
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
              <span>Visual Learning Material</span>
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
          <span>Create New Material</span>
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
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
