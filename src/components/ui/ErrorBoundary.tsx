"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050508] p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-red-500/10">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-[family-name:var(--font-mono)] mb-2">
                Something went wrong
              </h2>
              <p className="text-sm text-gray-400">
                An unexpected error occurred. Your data is safe — try refreshing.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left">
                <p className="text-xs text-gray-500 font-[family-name:var(--font-mono)] break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
