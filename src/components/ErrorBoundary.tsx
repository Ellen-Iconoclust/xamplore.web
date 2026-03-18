import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      
      try {
        // Check if it's a Firestore permission error (JSON string)
        const parsedError = JSON.parse(this.state.error?.message || "");
        if (parsedError.error && parsedError.error.includes("Missing or insufficient permissions")) {
          errorMessage = "You don't have permission to access this resource. Please ensure you are logged in with the correct account.";
        }
      } catch (e) {
        // Not a JSON error, use default or specific messages
        if (this.state.error?.message.includes("the client is offline")) {
          errorMessage = "Please check your internet connection or Firebase configuration.";
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#E4E3E0] px-6">
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-secondary/5 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertTriangle size={40} />
            </div>
            <h1 className="font-display text-3xl uppercase tracking-tight mb-4">Something went wrong</h1>
            <p className="text-secondary/60 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
