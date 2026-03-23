import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Lazy chunk loading fails after a deploy when cached index.html
    // references old chunk hashes that no longer exist. Auto-reload once
    // to pick up the new index.html with correct chunk URLs.
    const isChunkError =
      error.message?.includes("Loading chunk") ||
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.message?.includes("Importing a module script failed");

    const reloadKey = "error-boundary-reload";
    const lastReload = sessionStorage.getItem(reloadKey);

    if (isChunkError && !lastReload) {
      sessionStorage.setItem(reloadKey, Date.now().toString());
      window.location.reload();
      return;
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-parchment px-6">
          <div className="text-center max-w-md">
            <h1 className="font-serif text-navy text-2xl font-medium mb-4">
              Something went wrong
            </h1>
            <p className="font-sans text-slate text-base mb-6">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="font-mono text-xs uppercase tracking-widest px-6 py-3 bg-navy text-parchment border border-navy hover:bg-burnt hover:border-burnt transition-all duration-200 rounded-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
