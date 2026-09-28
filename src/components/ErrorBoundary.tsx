import { Component, ReactNode } from "react";
import { AUTH_STORAGE_KEYS } from "@/services/core";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// A render crash anywhere below this boundary previously left the app on a
// permanent blank screen (React unmounts the tree on an uncaught error, and
// there was nothing to catch it) — the only way out was manually clearing
// site data. This clears the session and hard-navigates to /auth instead,
// which also forces the browser to re-fetch index.html/assets rather than
// reuse whatever stale/inconsistent state triggered the crash.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("ErrorBoundary: unhandled render error, resetting session", error, info);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    globalThis.location.replace("/auth");
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
