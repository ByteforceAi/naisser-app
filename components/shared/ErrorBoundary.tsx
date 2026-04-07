"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
          <div className="glass-card p-8 max-w-md w-full">
            <div className="w-14 h-14 rounded-xl bg-[rgba(255,59,48,0.08)] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-[var(--accent-danger)]" />
            </div>
            <h2 className="text-lg font-semibold mb-2">
              문제가 발생했어요
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-primary)] text-white rounded-xl
                         text-sm font-semibold shadow-btn-primary hover:shadow-btn-primary-hover
                         transition-all duration-200 ease-out"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
