import { useEffect, useRef, useState } from "react";

import { SUPPORTED_LANGUAGES, msg, setAppLanguage, useI18nVersion } from "../../src/lib/i18n";
import { renderMarkdown } from "../../src/lib/markdown";
import {
  getSettings,
  saveReaderPayload,
  saveSettings,
} from "../../src/lib/storage";
import { applyTheme, cycleTheme, watchSystemTheme } from "../../src/lib/theme";
import type {
  ContentScriptResponse,
  ExtractedContent,
  RuntimeEvent,
  Settings,
  SummaryErrorCode,
  SummaryLength,
  Theme,
} from "../../src/types";
import { PopupFooter } from "./components/PopupFooter";
import { PopupHeader } from "./components/PopupHeader";
import { SummaryPanel } from "./components/SummaryPanel";

type ActionMode = "none" | "open-settings";
type LaunchMode = "toolbar" | "context-menu";

function getErrorMessage(error: SummaryErrorCode): string {
  switch (error) {
    case "no-api-key":
      return msg("errorNoApiKey");
    case "invalid-api-key":
      return msg("errorInvalidApiKey");
    case "rate-limit":
      return msg("errorRateLimit");
    case "invalid-request":
      return msg("errorInvalidRequest");
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

async function openReaderPage(summary: string, title: string, sourceUrl: string, language: string) {
  await saveReaderPayload({
    title,
    sourceUrl,
    summary,
    language,
    createdAt: Date.now(),
  });

  await chrome.tabs.create({
    url: chrome.runtime.getURL("reader.html"),
  });
}

export function App() {
  useI18nVersion();
  const [theme, setTheme] = useState<Theme>("auto");
  const [statusMessage, setStatusMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [copyLabel, setCopyLabel] = useState(() => msg("popupCopy"));
  const [actionMode, setActionMode] = useState<ActionMode>("none");
  const [launchMode, setLaunchMode] = useState<LaunchMode>("toolbar");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedSummaryLength, setSelectedSummaryLength] = useState<SummaryLength>("medium");
  const [activeSource, setActiveSource] = useState<ExtractedContent | null>(null);

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

    const showIdleState = () => {
      resetOutputState();
      if (!cancelled) {
        setStatusMessage(msg("popupReady"));
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

    const startSummary = async (
      payload: ExtractedContent,
      language: string,
      summaryLength: SummaryLength,
    ) => {
      const requestId = crypto.randomUUID();
      requestIdRef.current = requestId;
      setActiveSource(payload);
      setLoadingState();

      try {
        await chrome.runtime.sendMessage({
          type: "start-summary",
          requestId,
          payload,
          options: { language, summaryLength },
        });
      } catch {
        showError("unknown");
      }
    };

    const initializePopup = async () => {
      const settings = await getSettings();
      if (cancelled) {
        return;
      }

      settingsRef.current = settings;
      setAppLanguage(settings.appLanguage);
      setTheme(settings.theme);
      setSelectedLanguage(settings.language);
      setSelectedSummaryLength(settings.summaryLength);

      const pendingSelection = await getPendingSelection();
      if (cancelled) {
        return;
      }

      if (pendingSelection) {
        setLaunchMode("context-menu");
        await startSummary(pendingSelection, settings.language, settings.summaryLength);
        return;
      }

      setLaunchMode("toolbar");
      showIdleState();
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
    void initializePopup();

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

  const handleStart = async () => {
    setSummary("");
    setWarningMessage(null);
    setShowCopyButton(false);
    setActionMode("none");
    setCopyLabel(msg("popupCopy"));

    const extracted = await extractContentFromActiveTab();
    if (!extracted.success) {
      setActiveSource(null);
      setIsStreaming(false);
      setStatusMessage(getErrorMessage(extracted.error));
      setSummary(`<p class="summary-error">${getErrorMessage(extracted.error)}</p>`);
      setActionMode("none");
      return;
    }

    const requestId = crypto.randomUUID();
    requestIdRef.current = requestId;
    setActiveSource(extracted);
    setSummary("");
    setWarningMessage(null);
    setShowCopyButton(false);
    setActionMode("none");
    setIsStreaming(true);
    setStatusMessage(msg("popupLoading"));
    setCopyLabel(msg("popupCopy"));

    try {
      await chrome.runtime.sendMessage({
        type: "start-summary",
        requestId,
        payload: extracted,
        options: { language: selectedLanguage, summaryLength: selectedSummaryLength },
      });
    } catch {
      setIsStreaming(false);
      setStatusMessage(getErrorMessage("unknown"));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopyLabel(msg("popupCopied"));

    window.setTimeout(() => {
      setCopyLabel(msg("popupCopy"));
    }, 2000);
  };

  const handleOpenInNewTab = async () => {
    if (!summary.trim() || !activeSource) {
      return;
    }

    await openReaderPage(summary, activeSource.title, activeSource.url, selectedLanguage);
  };

  const lengthOptions: Array<{ value: SummaryLength; label: string }> = [
    { value: "short", label: msg("lengthShort") },
    { value: "medium", label: msg("lengthMedium") },
    { value: "detailed", label: msg("lengthDetailed") },
    { value: "full", label: msg("lengthFull") },
  ];

  return (
    <main className="popup-shell">
      <PopupHeader
        themeLabel={themeLabel}
        onOpenSettings={() => void openOptionsPage()}
        onCycleTheme={() => void handleThemeCycle()}
      />

      {launchMode === "toolbar" ? (
        <section className="popup-action-bar">
          <div className="popup-select-grid">
            <label className="popup-field">
              <span>{msg("languageLabel")}</span>
              <select
                className="popup-select"
                value={selectedLanguage}
                disabled={isStreaming}
                onChange={(event) => setSelectedLanguage(event.target.value)}>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="popup-field">
              <span>{msg("lengthLabel")}</span>
              <select
                className="popup-select"
                value={selectedSummaryLength}
                disabled={isStreaming}
                onChange={(event) =>
                  setSelectedSummaryLength(event.target.value as SummaryLength)
                }>
                {lengthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            className="primary-button popup-start-button"
            type="button"
            disabled={isStreaming}
            onClick={() => void handleStart()}>
            {msg("popupStart")}
          </button>
        </section>
      ) : null}

      <SummaryPanel
        statusMessage={statusMessage}
        warningMessage={warningMessage}
        renderedSummary={renderedSummary}
        isEmpty={!summary && (launchMode === "context-menu" || isStreaming)}
        isStreaming={isStreaming}
      />

      <PopupFooter
        copyLabel={copyLabel}
        showCopyButton={showCopyButton}
        showOpenInNewTabButton={showCopyButton}
        showActionButton={actionMode === "open-settings"}
        onCopy={() => void handleCopy()}
        onOpenInNewTab={() => void handleOpenInNewTab()}
        onOpenSettings={() => void openOptionsPage()}
      />
    </main>
  );
}
