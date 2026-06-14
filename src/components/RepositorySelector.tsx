import React, { useState } from "react";
import { Search, Github, AlertCircle, Loader, Terminal, Sparkles, BookOpen, Layers, LogIn, ShieldCheck } from "lucide-react";

interface RepositorySelectorProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  error: string | null;
  user: any;
  userScans: any[];
  onSelectScan: (scan: any) => void;
  onLogin: () => void;
}

export default function RepositorySelector({
  onAnalyze,
  isLoading,
  error,
  user,
  userScans,
  onSelectScan,
  onLogin,
}: RepositorySelectorProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  const PRESETS = [
    {
      id: "express-auth-stripe",
      name: "express-auth-stripe",
      owner: "codesage-labs",
      desc: "JWT Auth, PostgreSQL Migrations, and Stripe webhooks",
      lang: "TypeScript",
      langColor: "bg-blue-500",
      stars: 1248,
    },
    {
      id: "react-nexus-dashboard",
      name: "react-nexus-dashboard",
      owner: "codesage-labs",
      desc: "SaaS dashboard with real-time grid metrics & viewport charts",
      lang: "React / TS",
      langColor: "bg-cyan-500",
      stars: 842,
    },
    {
      id: "fastapi-spanner-ai",
      name: "fastapi-spanner-ai",
      owner: "codesage-labs",
      desc: "FastAPI asynchronous microservice with Google Cloud Spanner",
      lang: "Python",
      langColor: "bg-emerald-500",
      stars: 940,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {/* Brand Hero Greeting */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-55 text-blue-600 border border-blue-200 rounded-full text-xs font-semibold tracking-wide uppercase mb-3 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Autonomous Code Intelligence
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
          CodeSage <span className="text-blue-600">AI</span>
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto font-sans font-normal">
          Understand, explain, secure, and inspect any public GitHub repository instantly. Reduction of developer onboarding duration from days to minutes.
        </p>
      </div>

      {/* Main Sandbox Search Interface */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden mb-8">
        <div className="h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500" />
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Analyze Public GitHub Repository
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Github className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/expressjs/express"
                disabled={isLoading}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-32 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-200 transition-all text-sm md:text-base font-sans"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-40 transition-all disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Inspect
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pl-1 font-sans">
              <Terminal className="w-3.5 h-3.5" /> Works on any open-source or public framework repository (TypeScript, Python, Javascript, etc.)
            </p>
          </form>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Analysis Unsuccessful</h4>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auth Banner & Recent Scan History */}
      {!user ? (
        <div className="mb-8 p-6 bg-blue-50/40 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Enable Persistent Analysis History</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-sans leading-relaxed">
                Log in securely using Google to unlock active scan history preservation and retrieve past reports instantly.
              </p>
            </div>
          </div>
          <button
            onClick={onLogin}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-3 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <LogIn className="w-4 h-4" /> Sign In with Google
          </button>
        </div>
      ) : (
        userScans.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4 px-1">
              <BookOpen className="w-4 h-4 text-slate-400" /> Your Scanned Repositories
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userScans.map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => onSelectScan(scan)}
                  className="flex flex-col text-left p-5 bg-white border border-slate-100 rounded-xl shadow-xs hover:shadow-md hover:border-blue-250 cursor-pointer transition-all relative group overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-2xs font-extrabold text-slate-400 tracking-wider uppercase">
                      {scan.repository?.mainLanguage || "Codebase"}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm tracking-tight truncate w-full mb-1">
                    {scan.repository?.name || "Repository"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Health Audit Score: <span className="font-extrabold text-blue-600">{scan.repository?.healthScore || 80}/100</span>
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between w-full text-slate-400 text-2xs font-sans">
                    <span className="font-bold text-blue-600 group-hover:underline">load dashboard report →</span>
                    <span className="text-slate-400">
                      {scan.createdAt && scan.createdAt.toDate
                        ? scan.createdAt.toDate().toLocaleDateString()
                        : "Cached Report"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* Preset Sandboxes */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-2xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" /> Try Preloaded Playground Repositories
          </h3>
          <span className="text-2xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">No installation needed</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onAnalyze(preset.id)}
              disabled={isLoading}
              className="flex flex-col text-left p-5 bg-white border border-slate-100 rounded-xl shadow-xs hover:shadow-md hover:border-blue-200 disabled:opacity-55 active:scale-98 cursor-pointer transition-all relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Github className="w-12 h-12 text-slate-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${preset.langColor}`} />
                <span className="text-2xs font-extrabold text-slate-400 tracking-wider uppercase">{preset.lang}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm tracking-tight truncate w-full mb-1">
                {preset.name}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1 font-sans">
                {preset.desc}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between w-full text-slate-400 text-xs font-sans">
                <span className="font-bold text-slate-400 group-hover:text-blue-600 transition-colors">inspect →</span>
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md font-medium text-slate-600">★ {preset.stars}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
