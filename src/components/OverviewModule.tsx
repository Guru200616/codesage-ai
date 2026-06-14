import React, { useState } from "react";
import { Repository, RepoFile } from "../types";
import { Folder, FileCode, ChevronRight, ChevronDown, Award, Star, GitFork, ShieldAlert, Code, BookOpen, AlertCircle, RefreshCw } from "lucide-react";

interface OverviewModuleProps {
  data: {
    repository: Repository;
    files: RepoFile[];
  };
  onSelectFile: (file: RepoFile) => void;
  onReset: () => void;
}

export default function OverviewModule({ data, onSelectFile, onReset }: OverviewModuleProps) {
  const { repository, files } = data;
  const [selectedFile, setSelectedFile] = useState<RepoFile | null>(files[0] || null);

  // File explorer tree building logic
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({ "src": true, "src/controllers": true });

  const toggleDirectory = (dir: string) => {
    setExpandedDirs((prev) => ({ ...prev, [dir]: !prev[dir] }));
  };

  const handleFileClick = (file: RepoFile) => {
    setSelectedFile(file);
    onSelectFile(file);
  };

  // Group files into flat directory tree paths for visual structure
  const directoriesSet = new Set<string>();
  files.forEach((f) => {
    const parts = f.path.split("/");
    if (parts.length > 1) {
      // Collect intermediate path steps
      let currentPath = "";
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        directoriesSet.add(currentPath);
      }
    }
  });

  const directoriesList = Array.from(directoriesSet).sort();

  return (
    <div className="space-y-6">
      {/* Top Banner with controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-800">{repository.name}</h2>
              <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded-full border border-slate-200">
                {repository.framework}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {repository.description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> {repository.stars} stars</span>
              <span className="flex items-center gap-1"><GitFork className="w-3.5 h-3.5" /> {repository.forks} forks</span>
              <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-sm font-semibold text-slate-500">
                Main: {repository.mainLanguage}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 cursor-pointer active:scale-98 transition-all shrink-0"
        >
          <RefreshCw className="w-4 h-4" /> Change Repository
        </button>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Circular Health Meter */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Repository Health</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="54" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="64"
                cy="64"
                r="54"
                fill="transparent"
                stroke={repository.healthScore >= 80 ? "#10b981" : repository.healthScore >= 60 ? "#f59e0b" : "#ef4444"}
                strokeWidth="10"
                strokeDasharray={339.2}
                strokeDashoffset={339.2 - (339.2 * repository.healthScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{repository.healthScore}</span>
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-widest">Score</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 leading-normal">
            Overall reliability score calculated from vulnerabilities, testing indices and design smells.
          </p>
        </div>

        {/* Security Summary findings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Security Findings
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-red-50 p-2.5 rounded-xl border border-red-150">
                <span className="block text-2xs text-red-600 font-semibold uppercase tracking-wider">Critical</span>
                <span className="text-xl font-black text-red-700">{repository.findingsCount.critical}</span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-150">
                <span className="block text-2xs text-amber-600 font-semibold uppercase tracking-wider">High</span>
                <span className="text-xl font-black text-amber-700">{repository.findingsCount.high}</span>
              </div>
              <div className="bg-yellow-50 p-2.5 rounded-xl border border-yellow-150">
                <span className="block text-2xs text-yellow-600 font-semibold uppercase tracking-wider">Medium</span>
                <span className="text-xl font-black text-yellow-700">{repository.findingsCount.medium}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="block text-2xs text-slate-500 font-semibold uppercase tracking-wider">Low</span>
                <span className="text-xl font-black text-slate-600">{repository.findingsCount.low}</span>
              </div>
            </div>
          </div>
          <div className="text-2xs text-slate-400 pt-3 border-t border-slate-50 mt-2">
            * Based on static analysis of source files and dependency audit logs.
          </div>
        </div>

        {/* Development coverages */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Quality Gate Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Documentation Coverage</span>
                  <span className="text-blue-600">{repository.docCoverage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${repository.docCoverage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Test Code Coverage</span>
                  <span className="text-emerald-600">{repository.testCoverage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${repository.testCoverage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Maintainability Index</span>
                  <span className="text-indigo-600">{repository.maintainabilityIndex}/100</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${repository.maintainabilityIndex}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="text-2xs text-slate-400 pt-3 border-t border-slate-50 mt-2 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-slate-400" /> Fully aligned with industry best practices
          </div>
        </div>

        {/* Language distribution list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Languages Profile</h3>
            <div className="space-y-3.5 mt-4">
              {repository.languages.map((l, index) => (
                <div key={l.name}>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${index === 0 ? "bg-blue-500" : index === 1 ? "bg-cyan-400" : "bg-emerald-400"}`} />
                      {l.name}
                    </span>
                    <span>{l.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${index === 0 ? "bg-blue-500" : index === 1 ? "bg-cyan-400" : "bg-emerald-400"}`}
                      style={{ width: `${l.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-2xs text-slate-400 pt-3 border-t border-slate-50 mt-2">
            Computed based on codebase file byte frequencies.
          </div>
        </div>
      </div>

      {/* Code Browser Grid & Directory Tree */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 tracking-wider uppercase flex items-center gap-2.5">
            <BookOpen className="w-4.5 h-4.5 text-slate-400" /> Code Intelligence Explorer
          </h3>
          <span className="text-xs text-slate-400 font-mono">Files Count: {files.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 min-h-[460px]">
          {/* File explorer panel */}
          <div className="border-r border-slate-100 p-4 max-h-[500px] overflow-y-auto bg-slate-50/20 font-sans">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-2 mb-3">Workspace Tree</h4>
            <div className="space-y-0.5">
              {/* Root files */}
              {files.filter((f) => !f.path.includes("/")).map((file) => (
                <button
                  key={file.path}
                  onClick={() => handleFileClick(file)}
                  className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                    selectedFile?.path === file.path
                      ? "bg-blue-50 border border-blue-100 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  <FileCode className={`w-4 h-4 ${selectedFile?.path === file.path ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}

              {/* Directories collapse system */}
              {directoriesList.map((dir) => {
                const isExpanded = expandedDirs[dir];
                const cleanName = dir.split("/").pop();
                const depth = dir.split("/").length - 1;
                const directoryFiles = files.filter((f) => {
                  const parts = f.path.split("/");
                  const parent = parts.slice(0, parts.length - 1).join("/");
                  return parent === dir;
                });

                return (
                  <div key={dir} style={{ marginLeft: `${depth * 8}px` }} className="space-y-0.5">
                    <button
                      onClick={() => toggleDirectory(dir)}
                      className="flex items-center gap-1.5 w-full text-left px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-100 rounded-md cursor-pointer mt-1"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <Folder className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{cleanName}</span>
                    </button>

                    {isExpanded &&
                      directoryFiles.map((file) => (
                        <button
                          key={file.path}
                          onClick={() => handleFileClick(file)}
                          style={{ paddingLeft: "28px" }}
                          className={`flex items-center gap-2 w-full text-left py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                            selectedFile?.path === file.path
                              ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600 pl-4"
                              : "text-slate-600 hover:bg-slate-100 hover:pl-4 pl-3"
                          }`}
                        >
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${selectedFile?.path === file.path ? "text-blue-600" : "text-slate-400"}`} />
                          <span className="truncate text-xs">{file.name}</span>
                        </button>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="col-span-2 p-6 bg-slate-950 flex flex-col justify-between text-slate-300 min-h-[400px] font-mono select-text max-h-[500px]">
            {selectedFile ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    {selectedFile.path}
                  </span>
                  <span>{selectedFile.content ? `${selectedFile.content.split("\n").length} lines` : "0 lines"}</span>
                </div>
                <div className="flex-1 overflow-auto text-xs leading-relaxed max-h-[385px] whitespace-pre p-2 bg-slate-900/50 rounded-lg border border-slate-900">
                  <code className="block text-slate-300">{selectedFile.content || "// No code content cached for this file."}</code>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-slate-500">
                <AlertCircle className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-sm">Select a file from the workspace explorer to analyze raw code structures.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
