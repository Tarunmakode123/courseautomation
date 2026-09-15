"use client";

import React, { useState, useEffect } from "react";
import { SYLLABUS_DATA } from "@/data/syllabus";
import { Sparkles, Search, CheckSquare, Square, FileText, Image as ImageIcon } from "lucide-react";

export interface FormData {
  className: string;
  subject: string;
  teachingType: "Lecture" | "Lab";
  unit: string;
  topic: string;
  generateNotes: boolean;
  generateImages: boolean;
}

interface MaterialFormProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({ onSubmit, isLoading }) => {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [teachingType, setTeachingType] = useState<"Lecture" | "Lab">("Lecture");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [topicSearch, setTopicSearch] = useState<string>("");
  const [generateNotes, setGenerateNotes] = useState<boolean>(true);
  const [generateImages, setGenerateImages] = useState<boolean>(false);

  // Field 2 Logic: Subject automatically derives from Class
  useEffect(() => {
    if (selectedClass && SYLLABUS_DATA[selectedClass]) {
      setSubject(SYLLABUS_DATA[selectedClass].subject);
    } else {
      setSubject("");
    }
    // Reset topic when class changes
    setSelectedTopic("");
    setTopicSearch("");
  }, [selectedClass]);

  // Reset topic when unit changes
  useEffect(() => {
    setSelectedTopic("");
    setTopicSearch("");
  }, [selectedUnit]);

  // Get topics for current selection
  const availableTopics = React.useMemo(() => {
    if (!selectedClass || !selectedUnit || !SYLLABUS_DATA[selectedClass]) return [];
    const unitData = SYLLABUS_DATA[selectedClass].units[selectedUnit];
    return unitData ? unitData.topics : [];
  }, [selectedClass, selectedUnit]);

  // Filter topics by search query
  const filteredTopics = availableTopics.filter((t) =>
    t.toLowerCase().includes(topicSearch.toLowerCase())
  );

  const isValid =
    Boolean(selectedClass) &&
    Boolean(subject) &&
    Boolean(teachingType) &&
    Boolean(selectedUnit) &&
    Boolean(selectedTopic) &&
    (generateNotes || generateImages);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    onSubmit({
      className: selectedClass,
      subject,
      teachingType,
      unit: selectedUnit,
      topic: selectedTopic,
      generateNotes,
      generateImages,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-appBorder shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-6 pb-4 border-b border-appBorder">
        <h2 className="text-xl font-bold text-darkText flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          Lecture Details & Configuration
        </h2>
        <p className="text-sm text-secondaryText mt-1">
          Select class parameters to generate structured RGPV lecture notes and visual material.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ROW 1: Field 1 (Class) & Field 2 (Subject) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* FIELD 1: CLASS */}
          <div>
            <label className="block text-sm font-semibold text-darkText mb-2">
              Field 1 — Class <span className="text-orange-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded-lg border border-appBorder bg-white text-darkText focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 transition"
            >
              <option value="">Select Class</option>
              <option value="AIML-1">AIML-1</option>
              <option value="AIML-2">AIML-2</option>
            </select>
          </div>

          {/* FIELD 2: SUBJECT (Derives automatically from Class) */}
          <div>
            <label className="block text-sm font-semibold text-darkText mb-2 flex items-center justify-between">
              <span>Field 2 — Subject</span>
              <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                Auto-derived
              </span>
            </label>
            <input
              type="text"
              readOnly
              disabled
              value={
                subject
                  ? `${subject} (${SYLLABUS_DATA[selectedClass]?.fullSubjectName || ""})`
                  : "Select Class first"
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-appBorder bg-gray-50 text-gray-700 font-medium cursor-not-allowed"
            />
          </div>
        </div>

        {/* ROW 2: Field 3 (Teaching Type) & Field 4 (Unit) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* FIELD 3: TEACHING TYPE */}
          <div>
            <label className="block text-sm font-semibold text-darkText mb-2">
              Field 3 — Teaching Type <span className="text-orange-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setTeachingType("Lecture")}
                className={`py-2.5 px-4 rounded-lg font-medium text-sm border transition text-center ${
                  teachingType === "Lecture"
                    ? "bg-orange-50 border-orange-500 text-orange-600 shadow-sm"
                    : "bg-white border-appBorder text-secondaryText hover:bg-gray-50"
                }`}
              >
                📚 Lecture
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setTeachingType("Lab")}
                className={`py-2.5 px-4 rounded-lg font-medium text-sm border transition text-center ${
                  teachingType === "Lab"
                    ? "bg-orange-50 border-orange-500 text-orange-600 shadow-sm"
                    : "bg-white border-appBorder text-secondaryText hover:bg-gray-50"
                }`}
              >
                🔬 Lab
              </button>
            </div>
          </div>

          {/* FIELD 4: UNIT */}
          <div>
            <label className="block text-sm font-semibold text-darkText mb-2">
              Field 4 — Unit <span className="text-orange-500">*</span>
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              disabled={isLoading || !selectedClass}
              className="w-full px-3.5 py-2.5 rounded-lg border border-appBorder bg-white text-darkText focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 transition"
            >
              <option value="">Select Unit</option>
              {selectedClass &&
                Object.keys(SYLLABUS_DATA[selectedClass].units).map((unitKey) => (
                  <option key={unitKey} value={unitKey}>
                    {unitKey}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* FIELD 5: TOPIC */}
        <div>
          <label className="block text-sm font-semibold text-darkText mb-2">
            Field 5 — Topic <span className="text-orange-500">*</span>
          </label>

          {!selectedClass || !selectedUnit ? (
            <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-appBorder text-sm text-secondaryText text-center">
              Please select Class and Unit to view syllabus topics.
            </div>
          ) : (
            <div className="space-y-2">
              {availableTopics.length > 5 && (
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={topicSearch}
                    onChange={(e) => setTopicSearch(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-appBorder focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              )}

              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-lg border border-appBorder bg-white text-darkText focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 transition"
              >
                <option value="">Select Topic</option>
                {filteredTopics.map((topicItem, idx) => (
                  <option key={idx} value={topicItem}>
                    {topicItem}
                  </option>
                ))}
              </select>

              {selectedTopic && (
                <div className="mt-2 p-2.5 bg-orange-50/60 rounded-md border border-orange-100 text-xs text-orange-700 font-medium">
                  Selected Topic: <span className="font-bold text-orange-900">{selectedTopic}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FIELD 6: WHAT TO GENERATE */}
        <div>
          <label className="block text-sm font-semibold text-darkText mb-3">
            Field 6 — What do you want to generate? <span className="text-orange-500">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Notes Option */}
            <div
              onClick={() => !isLoading && setGenerateNotes(!generateNotes)}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3.5 ${
                generateNotes
                  ? "bg-orange-50/70 border-orange-500 ring-1 ring-orange-500"
                  : "bg-white border-appBorder hover:border-gray-300"
              }`}
            >
              <div className="mt-0.5">
                {generateNotes ? (
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 font-semibold text-darkText text-sm">
                  <FileText className="w-4 h-4 text-orange-600" />
                  Notes
                </div>
                <p className="text-xs text-secondaryText mt-1">
                  Generate RGPV-level lecture/lab notes structured for exams and practicals.
                </p>
              </div>
            </div>

            {/* Images Option */}
            <div
              onClick={() => !isLoading && setGenerateImages(!generateImages)}
              className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3.5 ${
                generateImages
                  ? "bg-orange-50/70 border-orange-500 ring-1 ring-orange-500"
                  : "bg-white border-appBorder hover:border-gray-300"
              }`}
            >
              <div className="mt-0.5">
                {generateImages ? (
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 font-semibold text-darkText text-sm">
                  <ImageIcon className="w-4 h-4 text-orange-600" />
                  Images / Visuals
                </div>
                <p className="text-xs text-secondaryText mt-1">
                  Generate visual learning material: Infographic, Diagram, Table & Flowchart.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-base shadow-md transition flex items-center justify-center gap-2 ${
              isValid && !isLoading
                ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer active:scale-[0.99]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Generate Material
          </button>
          {!isValid && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Please fill all required fields and select at least one output type.
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
