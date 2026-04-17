import type { HistoryItem } from "../types";

export interface LanguageOption {
  code: string;
  label: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "tr", label: "Turkish" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "uk", label: "Ukrainian" },
  { code: "ru", label: "Russian" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" },
];

export function msg(key: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

export function detectBrowserLanguage(): string {
  const uiLanguage = chrome.i18n?.getUILanguage?.() || navigator.language || "en";
  const baseLanguage = uiLanguage.toLowerCase().split("-")[0];

  return SUPPORTED_LANGUAGES.some((language) => language.code === baseLanguage)
    ? baseLanguage
    : "en";
}

export function getLanguageLabel(code: string): string {
  return SUPPORTED_LANGUAGES.find((language) => language.code === code)?.label ?? code;
}

export function translateDocument(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (key) {
      element.textContent = msg(key);
    }
  });

  root.querySelectorAll<HTMLElement>("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (key && "placeholder" in element) {
      (element as HTMLInputElement | HTMLTextAreaElement).placeholder = msg(key);
    }
  });

  root.querySelectorAll<HTMLElement>("[data-i18n-title]").forEach((element) => {
    const key = element.dataset.i18nTitle;
    if (key) {
      element.title = msg(key);
    }
  });
}

export function formatHistoryTime(item: HistoryItem): string {
  const seconds = Math.round((item.timestamp - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(detectBrowserLanguage(), {
    numeric: "auto",
  });

  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  for (const [unit, value] of ranges) {
    if (Math.abs(seconds) >= value) {
      return formatter.format(Math.round(seconds / value), unit);
    }
  }

  return formatter.format(seconds, "second");
}
