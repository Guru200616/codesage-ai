import React, { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

// Interface merging to bypass standard React 19 typing discrepancies in sandboxed environments
export default interface ErrorBoundary {
  props: Props;
  state: State;
  setState(
    state: Partial<State> | ((state: Readonly<State>, props: Readonly<Props>) => Partial<State> | null) | null,
    callback?: () => void
  ): void;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled runtime error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl mx-auto my-12 animate-fade-in font-sans">
          <div className="p-4 bg-red-50 text-red-600 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Unexpected Client Crash
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            CodeSage AI's safe-mode caught a view rendering crash. This can occasionally happen due to unstable local data queries or dynamic network timeouts.
          </p>
          
          <div className="w-full mt-6 p-4 bg-slate-50 border border-slate-105 rounded-xl text-left font-mono text-xs text-slate-600 overflow-auto max-h-[200px]">
            <p className="font-extrabold text-red-600 mb-1">Error: {this.state.error?.message || "Unknown error"}</p>
            {this.state.error?.stack && (
              <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
            )}
          </div>

          <button
            onClick={this.handleReset}
            className="mt-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-md shadow-blue-100 cursor-pointer active:scale-98"
          >
            <RefreshCw className="w-4 h-4" /> Reset Portal Viewports
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
