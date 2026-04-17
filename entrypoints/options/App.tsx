import { useEffect, useState } from "react";

import { getDefaultPrompt } from "../../src/config/prompts";
import { SUPPORTED_LANGUAGES, msg, setAppLanguage, useI18nVersion } from "../../src/lib/i18n";
import { renderMarkdown } from "../../src/lib/markdown";
import {
  clearHistory,
  getHistory,
  getSettings,
  saveSettings,
} from "../../src/lib/storage";
import { applyTheme, watchSystemTheme } from "../../src/lib/theme";
import type {
  AppLanguage,
  HistoryItem,
  Model,
  Settings,
  SummaryLength,
  Theme,
} from "../../src/types";
import { HistoryDetail } from "./components/HistoryDetail";
import { HistoryList } from "./components/HistoryList";
import { SettingsForm } from "./components/SettingsForm";
import { TabBar } from "./components/TabBar";

type ActiveTab = "settings" | "history";

interface SettingsDraft {
  apiKey: string;
  model: Model;
  language: string;
  summaryLength: SummaryLength;
  theme: Theme;
  appLanguage: AppLanguage;
  customPrompt: string;
}

function toDraft(settings: Settings): SettingsDraft {
  return {
    ...settings,
    customPrompt: settings.customPrompt ?? getDefaultPrompt(settings.summaryLength),
  };
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function App() {
  useI18nVersion();
  const [activeTab, setActiveTab] = useState<ActiveTab>("settings");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [draft, setDraft] = useState<SettingsDraft | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [saveFeedback, setSaveFeedback] = useState("");
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  useEffect(() => {
    document.title = "TrimlyAi";
  }, []);

  useEffect(() => {
    if (!draft) {
      return;
    }

    applyTheme(draft.theme);
    return watchSystemTheme(draft.theme, () => applyTheme(draft.theme));
  }, [draft]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [loadedSettings, loadedHistory] = await Promise.all([getSettings(), getHistory()]);
      if (cancelled) {
        return;
      }

      setAppLanguage(loadedSettings.appLanguage);
      setSettings(loadedSettings);
      setDraft(toDraft(loadedSettings));
      setHistoryItems(loadedHistory);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredHistoryItems = historyItems.filter((item) => {
    const query = historySearchQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      item.title.toLowerCase().includes(query) ||
      item.url.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query)
    );
  });

  const selectedHistoryItem =
    historyItems.find((item) => item.id === selectedHistoryId) ?? null;

  const modelOptions: Array<{ value: Model; label: string }> = [
    { value: "gpt-4o-mini", label: "gpt-4o-mini" },
    { value: "gpt-4o", label: "gpt-4o" },
  ];

  const languageOptions = SUPPORTED_LANGUAGES.map((language) => ({
    value: language.code,
    label: language.label,
  }));

  const lengthOptions: Array<{ value: SummaryLength; label: string }> = [
    { value: "short", label: msg("lengthShort") },
    { value: "medium", label: msg("lengthMedium") },
    { value: "detailed", label: msg("lengthDetailed") },
    { value: "full", label: msg("lengthFull") },
  ];

  const themeOptions: Array<{ value: Theme; label: string }> = [
    { value: "auto", label: msg("themeAuto") },
    { value: "light", label: msg("themeLight") },
    { value: "dark", label: msg("themeDark") },
  ];

  const appLanguageOptions: Array<{ value: AppLanguage; label: string }> = [
    { value: "auto", label: msg("appLanguageAuto") },
    { value: "tr", label: "Türkçe" },
    { value: "en", label: "English" },
  ];

  const handleFieldChange = <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      if (key === "summaryLength") {
        const nextLength = value as SummaryLength;
        const currentDefaultPrompt = getDefaultPrompt(current.summaryLength);
        const nextDefaultPrompt = getDefaultPrompt(nextLength);

        return {
          ...current,
          summaryLength: nextLength,
          customPrompt:
            current.customPrompt === currentDefaultPrompt
              ? nextDefaultPrompt
              : current.customPrompt,
        };
      }

      return { ...current, [key]: value };
    });
  };

  const handleSave = async () => {
    if (!draft) {
      return;
    }

    const apiKey = draft.apiKey.trim();
    if (!apiKey) {
      setSaveFeedback(msg("errorNoApiKey"));
      return;
    }

    const nextSettings: Settings = {
      apiKey,
      model: draft.model,
      language: draft.language,
      summaryLength: draft.summaryLength,
      theme: draft.theme,
      appLanguage: draft.appLanguage,
      customPrompt:
        draft.customPrompt.trim() &&
        draft.customPrompt.trim() !== getDefaultPrompt(draft.summaryLength)
          ? draft.customPrompt.trim()
          : null,
    };

    await saveSettings(nextSettings);
    setAppLanguage(nextSettings.appLanguage);
    setSettings(nextSettings);
    setDraft(toDraft(nextSettings));
    setSaveFeedback(msg("saveSuccess"));

    window.setTimeout(() => {
      setSaveFeedback("");
    }, 2400);
  };

  const handleClearHistory = async () => {
    if (!window.confirm(msg("historyClearConfirm"))) {
      return;
    }

    await clearHistory();
    setHistoryItems([]);
    setSelectedHistoryId("");
  };

  if (!draft || !settings) {
    return null;
  }

  return (
    <main className="options-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Trimly AI</p>
          <h1 className="page-title">{msg("optionsTitle")}</h1>
        </div>
      </header>

      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "settings" ? (
        <section className="panel-grid">
          <SettingsForm
            draft={draft}
            isApiKeyVisible={isApiKeyVisible}
            saveFeedback={saveFeedback}
            modelOptions={modelOptions}
            languageOptions={languageOptions}
            lengthOptions={lengthOptions}
            themeOptions={themeOptions}
            appLanguageOptions={appLanguageOptions}
            onFieldChange={handleFieldChange}
            onToggleApiKey={() => setIsApiKeyVisible((current) => !current)}
            onOpenApiKeys={() =>
              void chrome.tabs.create({
                url: "https://platform.openai.com/api-keys",
              })
            }
          />
          <div className="settings-actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                handleFieldChange("customPrompt", getDefaultPrompt(draft.summaryLength))
              }>
              {msg("resetPrompt")}
            </button>
            <button className="primary-button" type="button" onClick={() => void handleSave()}>
              {msg("save")}
            </button>
          </div>
        </section>
      ) : (
        <section className="history-layout">
          <HistoryList
            items={filteredHistoryItems}
            query={historySearchQuery}
            selectedHistoryId={selectedHistoryId}
            onQueryChange={setHistorySearchQuery}
            onSelect={setSelectedHistoryId}
            onClear={() => void handleClearHistory()}
            getDomain={getDomain}
          />
          <HistoryDetail
            item={selectedHistoryItem}
            onBack={() => setSelectedHistoryId("")}
            renderSummary={renderMarkdown}
            formatDate={(item) =>
              `${msg("historyDate")}: ${new Date(item.timestamp).toLocaleString()}`
            }
          />
        </section>
      )}
    </main>
  );
}
