import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // If the error comes from an external browser extension, don't trigger error state
    if (
      error.message?.includes("MetaMask") ||
      error.stack?.includes("chrome-extension://") ||
      error.stack?.includes("moz-extension://")
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      error.message?.includes("MetaMask") ||
      error.stack?.includes("chrome-extension://") ||
      error.stack?.includes("moz-extension://")
    ) {
      // Ignored extension error
      return;
    }
    console.error("Uncaught application error:", error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Ops, algo inesperado ocorreu</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Ocorreu uma instabilidade transitória na interface. Seus treinos e dados continuam salvos no dispositivo.
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recarregar FORZON</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
