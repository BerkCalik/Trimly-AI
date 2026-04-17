import { useEffect, useRef, useState } from "react";

import { msg } from "../../src/lib/i18n";
import { renderMarkdown } from "../../src/lib/markdown";
import { getSettings, saveSettings } from "../../src/lib/storage";
import { applyTheme, cycleTheme, watchSystemTheme } from "../../src/lib/theme";
import type {
  ContentScriptResponse,
  ExtractedContent,
  RuntimeEvent,
  Settings,
  SummaryErrorCode,
  Theme,
} from "../../src/types";
import { PopupFooter } from "./components/PopupFooter";
import { PopupHeader } from "./components/PopupHeader";
import { SummaryPanel } from "./components/SummaryPanel";

type ActionMode = "none" | "open-settings";

function getErrorMessage(error: SummaryErrorCode): string {
  switch (error) {
    case "no-api-key":
      return msg("errorNoApiKey");
    case "invalid-api-key":
      return msg("errorInvalidApiKey");
    case "rate-limit":
      return msg("errorRateLimit");
    case "network":
      return msg("errorNetwork");
    case "timeout":
      return msg("errorTimeout");
    case "no-content":
      return msg("errorNoContent");
    default:
      return msg("errorUnknown");
  }
}

async function openOptionsPage(): Promise<void> {
  await chrome.runtime.openOptionsPage();
}

async function getPendingSelection(): Promise<ExtractedContent | null> {
  return (await chrome.runtime.sendMessage({
    type: "get-context-menu-text",
  })) as ExtractedContent | null;
}

async function extractContentFromActiveTab(): Promise<ContentScriptResponse> {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.id) {
    return {
      success: false,
      error: "no-content",
    };
  }

  try {
    return (await chrome.tabs.sendMessage(tab.id, {
      type: "extract-content",
    })) as ContentScriptResponse;
  } catch {
    return {
      success: false,
      error: "no-content",
    };
  }
}

export function App() {
  const [theme, setTheme] = useState<Theme>("auto");
  const [statusMessage, setStatusMessage] = useState(() => msg("popupEmpty"));
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [copyLabel, setCopyLabel] = useState(() => msg("popupCopy"));
  const [actionMode, setActionMode] = useState<ActionMode>("none");

  const requestIdRef = useRef("");
  const settingsRef = useRef<Settings | null>(null);

  useEffect(() => {
    document.title = "TrimlyAi";
  }, []);

  useEffect(() => {
    applyTheme(theme);
    return watchSystemTheme(theme, () => applyTheme(theme));
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    const resetOutputState = () => {
      if (cancelled) {
        return;
      }

      setSummary("");
      setWarningMessage(null);
      setShowCopyButton(false);
      setActionMode("none");
      setIsStreaming(false);
      setCopyLabel(msg("popupCopy"));
    };

    const setLoadingState = () => {
      resetOutputState();
      if (!cancelled) {
        setStatusMessage(msg("popupLoading"));
        setIsStreaming(true);
      }
    };

    const showError = (error: SummaryErrorCode) => {
      resetOutputState();
      if (cancelled) {
        return;
      }

      setStatusMessage(getErrorMessage(error));
      setSummary(`<p class="summary-error">${getErrorMessage(error)}</p>`);
      setActionMode(
        error === "no-api-key" || error === "invalid-api-key" ? "open-settings" : "none",
      );
    };

    const startSummary = async (payload: ExtractedContent) => {
      const requestId = crypto.randomUUID();
      requestIdRef.current = requestId;
      setLoadingState();

      try {
        await chrome.runtime.sendMessage({
          type: "start-summary",
          requestId,
          payload,
        });
      } catch {
        showError("unknown");
      }
    };

    const initializeSummaryFlow = async () => {
      const pendingSelection = await getPendingSelection();
      if (pendingSelection) {
        await startSummary(pendingSelection);
        return;
      }

      const extracted = await extractContentFromActiveTab();
      if (!extracted.success) {
        showError(extracted.error);
        return;
      }

      await startSummary(extracted);
    };

    const onRuntimeMessage = (message: RuntimeEvent) => {
      if (message.requestId !== requestIdRef.current || cancelled) {
        return;
      }

      if (message.type === "summary-start") {
        setStatusMessage(msg("popupLoading"));
        return;
      }

      if (message.type === "summary-warning") {
        if (message.warning === "content-trimmed") {
          setWarningMessage(msg("errorContentTrimmed"));
        }
        return;
      }

      if (message.type === "summary-chunk") {
        setSummary((current) => current + message.chunk);
        return;
      }

      if (message.type === "summary-complete") {
        setSummary(message.summary);
        setIsStreaming(false);
        setStatusMessage("");
        setShowCopyButton(true);
        setCopyLabel(msg("popupCopy"));
        return;
      }

      if (message.type === "summary-error") {
        showError(message.error);
      }
    };

    const listener = (message: unknown) => {
      onRuntimeMessage(message as RuntimeEvent);
    };

    chrome.runtime.onMessage.addListener(listener);

    void (async () => {
      const settings = await getSettings();
      if (cancelled) {
        return;
      }

      settingsRef.current = settings;
      setTheme(settings.theme);
      resetOutputState();
      setStatusMessage(msg("popupEmpty"));
      await initializeSummaryFlow();
    })();

    return () => {
      cancelled = true;
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const themeKey = theme === "auto" ? "themeAuto" : theme === "light" ? "themeLight" : "themeDark";
  const themeLabel = msg(themeKey);

  const renderedSummary = !summary
    ? ""
    : summary.startsWith("<p class=\"summary-error\">")
      ? summary
      : renderMarkdown(summary);

  const handleThemeCycle = async () => {
    const nextTheme = cycleTheme(settingsRef.current?.theme ?? theme);
    setTheme(nextTheme);

    if (settingsRef.current) {
      settingsRef.current = {
        ...settingsRef.current,
        theme: nextTheme,
      };
    }

    await saveSettings({ theme: nextTheme });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopyLabel(msg("popupCopied"));

    window.setTimeout(() => {
      setCopyLabel(msg("popupCopy"));
    }, 2000);
  };

  return (
    <main className="popup-shell">
      <PopupHeader
        themeLabel={themeLabel}
        onOpenSettings={() => void openOptionsPage()}
        onCycleTheme={() => void handleThemeCycle()}
      />
      <SummaryPanel
        statusMessage={statusMessage}
        warningMessage={warningMessage}
        renderedSummary={renderedSummary}
        isEmpty={!summary}
        isStreaming={isStreaming}
      />
      <PopupFooter
        copyLabel={copyLabel}
        showCopyButton={showCopyButton}
        showActionButton={actionMode === "open-settings"}
        onCopy={() => void handleCopy()}
        onOpenSettings={() => void openOptionsPage()}
      />
    </main>
  );
}
