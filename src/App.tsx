import React, { useState, useEffect } from "react";
import { AnalysisResult, RepoFile } from "./types";
import RepositorySelector from "./components/RepositorySelector";
import OverviewModule from "./components/OverviewModule";
import ChatModule from "./components/ChatModule";
import SecurityModule from "./components/SecurityModule";
import QualityModule from "./components/QualityModule";
import DependencyGraphModule from "./components/DependencyGraphModule";
import DocumentationModule from "./components/DocumentationModule";
import TestAutomationModule from "./components/TestAutomationModule";
import ExecutionFlowModule from "./components/ExecutionFlowModule";
import { Sparkles, LayoutDashboard, MessageSquareText, ShieldAlert, BadgeInfo, Network, Layers, BookOpen, FlaskConical, Github, LogOut, User } from "lucide-react";

// Firebase/Firestore Imports
import { 
  auth,
  db, 
  handleFirestoreError, 
  OperationType, 
  isFirebaseConfigured, 
  signInWithPopupWrapper, 
  signOutWrapper, 
  onAuthStateChangedWrapper,
  getFriendlyAuthErrorMessage
} from "./lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, getDocFromServer, setDoc, collection, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Auth & DB states
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userScans, setUserScans] = useState<any[]>([]);

  useEffect(() => {
    // 1. Connection validation (as instructed in section 'Validate Connection to Firestore' in SKILL.md)
    const testConnection = async () => {
      if (!isFirebaseConfigured || !db) return;
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    // 2. Listen to Auth change
    const unsubscribe = onAuthStateChangedWrapper(async (currentUser) => {
      setUser(currentUser);
      if (currentUser && isFirebaseConfigured && db) {
        // Sync user document to Firestore DB
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
              id: currentUser.uid,
              email: currentUser.email || "",
              name: currentUser.displayName || "Unknown Engineer",
              createdAt: serverTimestamp(),
            });
          }
        } catch (err) {
          console.error("Error creating user profile document:", err);
        }

        // Fetch user scans
        fetchUserScans(currentUser.uid);
      } else {
        setUserScans([]);
      }
    });

    return () => unsubscribe();
  }, []);


  const fetchUserScans = async (uid: string) => {
    if (!isFirebaseConfigured || !db) return;
    const scansPath = `users/${uid}/scans`;
    try {
      const q = query(collection(db, scansPath), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const scans: any[] = [];
      querySnapshot.forEach((docSnap) => {
        scans.push({ id: docSnap.id, ...docSnap.data() });
      });
      setUserScans(scans);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.LIST, scansPath);
      } catch (logError) {
        console.error("List audits error:", logError);
      }
    }
  };

  const handleSelectScan = (scan: any) => {
    setAnalysisResult({
      repository: scan.repository,
      files: scan.files || [],
      vulnerabilities: scan.vulnerabilities || [],
      codeSmells: scan.codeSmells || [],
      dependencyGraph: scan.dependencyGraph || { nodes: [], edges: [] },
      documentation: scan.documentation || [],
      testSuites: scan.testSuites || [],
      flowTrace: scan.flowTrace || [],
    });
    setActiveTab("overview");
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopupWrapper();
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err.code || err.message);
      setAuthError(friendlyMsg);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutWrapper();
      setAnalysisResult(null);
    } catch (err) {
      console.error("Signout attempt failed:", err);
    }
  };

  // Analyze triggers a full POST to Express analyzer route
  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.error || "GitHub repository audit unsuccessful.");
      }

      const data = await response.json();
      setAnalysisResult(data);
      setActiveTab("overview");

      // Save to Firestore if user is authenticated
      if (isFirebaseConfigured && db && auth?.currentUser) {
        const currentUser = auth.currentUser;
        const scanId = data.repository.id.replace(/[^a-zA-Z0-9_\-]/g, "_");
        const scanPath = `users/${currentUser.uid}/scans/${scanId}`;
        try {
          const scanDocRef = doc(db, "users", currentUser.uid, "scans", scanId);
          await setDoc(scanDocRef, {
            id: scanId,
            userId: currentUser.uid,
            repositoryUrl: url,
            repository: data.repository,
            vulnerabilities: data.vulnerabilities || [],
            codeSmells: data.codeSmells || [],
            dependencyGraph: data.dependencyGraph || { nodes: [], edges: [] },
            documentation: data.documentation || [],
            testSuites: data.testSuites || [],
            flowTrace: data.flowTrace || [],
            files: data.files || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          // Refresh lists
          fetchUserScans(currentUser.uid);
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.WRITE, scanPath);
          } catch (logError) {
            console.error("Save audit error:", logError);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse repository structure. Please verify the URL is public.");
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
  };

  // Helper trigger for file navigation
  const handleSelectFile = (file: RepoFile) => {
    // Optionally focus file view or do something nice
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between">
      {/* Dynamic Main Header Bar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-350 cursor-pointer">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <span className="font-sans font-black text-slate-900 tracking-tight text-lg">
            CodeSage <span className="text-blue-600">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 font-sans">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{user.displayName || "Engineer"}</span>
                <span className="text-2xs text-slate-400 truncate max-w-[150px]">{user.email}</span>
              </div>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  referrerPolicy="no-referrer"
                  alt={user.displayName || "Avatar"}
                  className="w-8 h-8 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-slate-200">
                  <User className="w-4 h-4" />
                </div>
              )}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={!isFirebaseConfigured}
              className={`text-xs font-bold flex items-center gap-2 bg-slate-50 border px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                isFirebaseConfigured 
                  ? "text-slate-700 hover:text-slate-900 hover:border-slate-350" 
                  : "text-slate-400 border-slate-100 cursor-not-allowed opacity-50"
              }`}
              title={isFirebaseConfigured ? "Sign in to persist your scans" : "Firebase is unconfigured"}
            >
              <Github className="w-4 h-4" /> Sign In with Google
            </button>
          )}
        </div>
      </header>

      {/* Main Container viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
        {!analysisResult ? (
          <div className="animate-fade-in font-sans">
            <RepositorySelector
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              error={error}
              user={user}
              userScans={userScans}
              onSelectScan={handleSelectScan}
              onLogin={handleLogin}
              isFirebaseConfigured={isFirebaseConfigured}
              authError={authError}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Horizontal Dashboard Navigation Bar */}
            <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-2xs overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5">
              {[
                { id: "overview", label: "Dashboard", icon: LayoutDashboard },
                { id: "chat", label: "Repo Chat", icon: MessageSquareText },
                { id: "security", label: "Security Intelligence", icon: ShieldAlert },
                { id: "quality", label: "Code Quality", icon: BadgeInfo },
                { id: "dependencies", label: "Dependencies", icon: Network },
                { id: "flow", label: "Execution Flow", icon: Layers },
                { id: "docs", label: "DocCenter", icon: BookOpen },
                { id: "tests", label: "Unit Tests", icon: FlaskConical },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-xl px-4.5 py-3 text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white font-black shadow-md shadow-blue-100"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* View Port Router rendering */}
            <div className="transition-all duration-300 border-0 rounded-0 shadow-none">
              <ErrorBoundary>
                {activeTab === "overview" && (
                  <OverviewModule data={analysisResult} onSelectFile={handleSelectFile} onReset={handleReset} />
                )}
                {activeTab === "chat" && <ChatModule context={analysisResult} />}
                {activeTab === "security" && <SecurityModule vulnerabilities={analysisResult.vulnerabilities} />}
                {activeTab === "quality" && <QualityModule codeSmells={analysisResult.codeSmells} />}
                {activeTab === "dependencies" && <DependencyGraphModule graph={analysisResult.dependencyGraph} />}
                {activeTab === "flow" && <ExecutionFlowModule steps={analysisResult.flowTrace} />}
                {activeTab === "docs" && (
                  <DocumentationModule docs={analysisResult.documentation} repositoryName={analysisResult.repository.name} />
                )}
                {activeTab === "tests" && (
                  <TestAutomationModule initialSuites={analysisResult.testSuites} allFiles={analysisResult.files} />
                )}
              </ErrorBoundary>
            </div>
          </div>
        )}
      </main>

      {/* Modern Dashboard Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-sans tracking-wide">
        <p>© 2026 CodeSage AI. Autonomous Code Intelligence Agent Platform. Reducing developer onboarding from days to minutes.</p>
      </footer>
    </div>
  );
}
