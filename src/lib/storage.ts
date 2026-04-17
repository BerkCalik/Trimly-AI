import { detectBrowserLanguage } from "./i18n";
import type { HistoryItem, Settings } from "../types";

const SETTINGS_KEY = "settings";
const HISTORY_KEY = "history";
const HISTORY_LIMIT = 50;

export const DEFAULT_PROMPT = `You are a text summarizer. Summarize the following article in {language}.
Summary length: {length}.
Use markdown formatting with short headings and bullet points where appropriate.

Article:
{content}`;

export function getDefaultSettings(): Settings {
  return {
    apiKey: "",
    model: "gpt-4o-mini",
    language: detectBrowserLanguage(),
    summaryLength: "medium",
    theme: "auto",
    customPrompt: null,
  };
}

export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(SETTINGS_KEY);
  const storedSettings = result[SETTINGS_KEY] as Partial<Settings> | undefined;

  return {
    ...getDefaultSettings(),
    ...storedSettings,
  };
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  const nextSettings: Settings = {
    ...current,
    ...settings,
  };

  await chrome.storage.sync.set({
    [SETTINGS_KEY]: nextSettings,
  });
}

export async function ensureDefaultSettings(): Promise<void> {
  const result = await chrome.storage.sync.get(SETTINGS_KEY);

  if (!result[SETTINGS_KEY]) {
    await chrome.storage.sync.set({
      [SETTINGS_KEY]: getDefaultSettings(),
    });
  }
}

export async function getHistory(): Promise<HistoryItem[]> {
  const result = await chrome.storage.local.get(HISTORY_KEY);
  const history = result[HISTORY_KEY] as HistoryItem[] | undefined;

  return Array.isArray(history) ? history : [];
}

export async function addHistoryItem(item: Omit<HistoryItem, "id">): Promise<void> {
  const history = await getHistory();
  const nextHistory: HistoryItem[] = [
    {
      id: crypto.randomUUID(),
      ...item,
    },
    ...history,
  ].slice(0, HISTORY_LIMIT);

  await chrome.storage.local.set({
    [HISTORY_KEY]: nextHistory,
  });
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.set({
    [HISTORY_KEY]: [],
  });
}
