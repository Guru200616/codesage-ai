import React from "react";
import { CodeSmell } from "../types";
import { Hammer, Sparkles, AlertTriangle, Lightbulb, BookOpen, Layers } from "lucide-react";

interface QualityModuleProps {
  codeSmells: CodeSmell[];
}

export default function QualityModule({ codeSmells }: QualityModuleProps) {
  return (
    <div className="space-y-6">
      {/* Introduction bar card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Code Quality & Design Smells</h2>
            <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
              Automatic SOLID compliance inspector. Scans for circular dependency routes, dead methods, tight coupling, and violates Single Responsibility design guidelines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
            <BookOpen className="w-4 h-4 text-indigo-500" /> linting Engine Active
          </span>
        </div>
      </div>

      {codeSmells.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs flex flex-col items-center justify-center">
          <Sparkles className="w-16 h-16 text-indigo-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Clean Code Design Verified</h3>
          <p className="text-sm text-slate-500 max-w-md mt-1">
            Phenomenal work! Our deep static linter has found zero SOLID violations or spaghetti circular couplings within compiled modules.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {codeSmells.map((smell) => (
            <div key={smell.id} className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 px-2.5 bg-amber-100 text-amber-800 text-2xs font-extrabold uppercase rounded-full border border-amber-200">
                    {smell.severity} Smell
                  </div>
                  <h3 className="font-bold text-slate-850 text-sm sm:text-base">{smell.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-2xs font-bold text-slate-400 font-mono">
                  <span>ID: {smell.id}</span>
                  <span>•</span>
                  <span>{smell.file}:{smell.line}</span>
                </div>
              </div>

              {/* Smell details content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                {/* Rule broken */}
                <div className="space-y-2">
                  <span className="block text-2xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" /> Architectural Principle
                  </span>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block">{smell.rule}</span>
                    <span className="text-2xs text-slate-400 mt-1 block">Rule Classification code analyzer</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <span className="block text-2xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Code smell analysis & risk
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/20 p-4 rounded-xl border border-amber-100">
                    {smell.description}
                  </p>

                  {/* Recommendation action plan */}
                  <div className="mt-4 p-4 bg-blue-50/20 border border-blue-100 rounded-xl flex gap-3.5 items-start">
                    <Lightbulb className="w-5 h-5 text-blue-505 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Remedial Action Recommendation</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {smell.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
