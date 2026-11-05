import { AccountGate } from "./components/auth/AccountGate";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { themeService } from "./services/themeService";
import "./index.css";

// Initialize theme immediately on hydration
themeService.initTheme();

// Suppress external browser extension noise (e.g. MetaMask, Phantom, wallet injection scripts)
if (typeof window !== "undefined") {
  const isExtensionNoise = (str: string) => {
    const s = (str || "").toLowerCase();
    return (
      s.includes("metamask") ||
      s.includes("failed to connect") ||
      s.includes("chrome-extension://") ||
      s.includes("moz-extension://") ||
      s.includes("inpage.js") ||
      s.includes("nkbihfbeogaeaoehlefnkodbefgpgknn")
    );
  };

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event.reason;
      const reasonStr = String(reason?.message || reason?.stack || reason || "");
      if (isExtensionNoise(reasonStr)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      }
    },
    true
  );

  window.addEventListener(
    "error",
    (event) => {
      const filename = event.filename || "";
      const message = event.message || "";
      const errorStr = String(event.error?.stack || event.error?.message || "");
      if (
        isExtensionNoise(filename) ||
        isExtensionNoise(message) ||
        isExtensionNoise(errorStr)
      ) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      }
    },
    true
  );
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AccountGate><App /></AccountGate>
  </ErrorBoundary>
);
