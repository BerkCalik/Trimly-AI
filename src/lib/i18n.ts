import { useSyncExternalStore } from "react";

import enMessages from "../../public/_locales/en/messages.json";
import trMessages from "../../public/_locales/tr/messages.json";
import type { AppLanguage, HistoryItem } from "../types";

export interface LanguageOption {
  code: string;
  label: string;
}

interface LocaleMessage {
  message: string;
  placeholders?: Record<string, { content: string }>;
}

type LocaleMessages = Record<string, LocaleMessage>;

const UI_LANGUAGE_CODES = ["en", "tr"] as const;
const localeCatalogs: Record<(typeof UI_LANGUAGE_CODES)[number], LocaleMessages> = {
  en: enMessages as LocaleMessages,
  tr: trMessages as LocaleMessages,
};

let activeAppLanguage: AppLanguage = "auto";
const listeners = new Set<() => void>();

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "original", label: "Original" },
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

function notifyI18nChange(): void {
  listeners.forEach((listener) => listener());
}

function substituteMessage(
  entry: LocaleMessage | undefined,
  substitutions?: string | string[],
): string | null {
  if (!entry) {
    return null;
  }

  let message = entry.message;
  if (!substitutions) {
    return message;
  }

  const values = Array.isArray(substitutions) ? substitutions : [substitutions];

  if (entry.placeholders) {
    for (const [name, placeholder] of Object.entries(entry.placeholders)) {
      const match = placeholder.content.match(/\$(\d+)/);
      const index = match ? Number(match[1]) - 1 : -1;
      const replacement = index >= 0 ? values[index] ?? "" : "";
      message = message.replaceAll(`$${name.toUpperCase()}$`, replacement);
    }
    return message;
  }

  values.forEach((value, index) => {
    message = message.replaceAll(`$${index + 1}`, value);
  });

  return message;
}

export function detectBrowserLanguage(): string {
  const uiLanguage = chrome.i18n?.getUILanguage?.() || navigator.language || "en";
  const baseLanguage = uiLanguage.toLowerCase().split("-")[0];

  return SUPPORTED_LANGUAGES.some((language) => language.code === baseLanguage)
    ? baseLanguage
    : "en";
}

export function detectUiLanguage(): "en" | "tr" {
  const uiLanguage = chrome.i18n?.getUILanguage?.() || navigator.language || "en";
  const baseLanguage = uiLanguage.toLowerCase().split("-")[0];

  return baseLanguage === "tr" ? "tr" : "en";
}

export function getResolvedAppLanguage(appLanguage: AppLanguage = activeAppLanguage): "en" | "tr" {
  return appLanguage === "auto" ? detectUiLanguage() : appLanguage;
}

export function setAppLanguage(appLanguage: AppLanguage): void {
  activeAppLanguage = appLanguage;
  notifyI18nChange();
}

export function getAppLanguage(): AppLanguage {
  return activeAppLanguage;
}

export function useI18nVersion(): AppLanguage {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getAppLanguage,
    getAppLanguage,
  );
}

export function msg(key: string, substitutions?: string | string[]): string {
  const resolvedLanguage = getResolvedAppLanguage();

  if (activeAppLanguage === "auto") {
    return chrome.i18n.getMessage(key, substitutions) || key;
  }

  const localized = substituteMessage(localeCatalogs[resolvedLanguage][key], substitutions);
  return localized || key;
}

export function getLanguageLabel(code: string): string {
  if (code === "original") {
    return "the original language of the source text";
  }

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
  const formatter = new Intl.RelativeTimeFormat(getResolvedAppLanguage(), {
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
