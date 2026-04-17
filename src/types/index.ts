export const MODEL_OPTIONS = [
  "gpt-5-nano",
  "gpt-5-mini",
  "gpt-5.1",
  "gpt-4.1",
  "gpt-4o-mini",
  "gpt-4o",
] as const;
export const SUMMARY_LENGTH_OPTIONS = ["short", "medium", "detailed", "full"] as const;
export const THEME_OPTIONS = ["auto", "light", "dark"] as const;
export const APP_LANGUAGE_OPTIONS = ["auto", "en", "tr"] as const;

export type Model = (typeof MODEL_OPTIONS)[number];
export type SummaryLength = (typeof SUMMARY_LENGTH_OPTIONS)[number];
export type Theme = (typeof THEME_OPTIONS)[number];
export type AppLanguage = (typeof APP_LANGUAGE_OPTIONS)[number];

export interface Settings {
  apiKey: string;
  model: Model;
  language: string;
  summaryLength: SummaryLength;
  theme: Theme;
  appLanguage: AppLanguage;
  customPrompt: string | null;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  prompt?: string;
  model?: Model;
  language: string;
  timestamp: number;
}

export interface ExtractedContent {
  content: string;
  title: string;
  url: string;
}

export interface SummaryRequestOptions {
  language?: string;
  summaryLength?: SummaryLength;
}

export interface ReaderPayload {
  title: string;
  sourceUrl: string;
  summary: string;
  language: string;
  createdAt: number;
}

export type SummaryWarningCode = "content-trimmed";
export type SummaryErrorCode =
  | "no-api-key"
  | "invalid-api-key"
  | "rate-limit"
  | "invalid-request"
  | "network"
  | "no-content"
  | "timeout"
  | "unknown";

export type ContentScriptRequest =
  | { type: "extract-content" }
  | { type: "get-selection" };

export type ContentScriptResponse =
  | ({ success: true } & ExtractedContent)
  | { success: false; error: SummaryErrorCode };

export type RuntimeRequest =
  | {
      type: "start-summary";
      requestId: string;
      payload: ExtractedContent;
      options?: SummaryRequestOptions;
    }
  | { type: "get-context-menu-text" };

export type RuntimeResponse = ExtractedContent | null;

export type RuntimeEvent =
  | { type: "summary-start"; requestId: string }
  | { type: "summary-warning"; requestId: string; warning: SummaryWarningCode }
  | { type: "summary-chunk"; requestId: string; chunk: string }
  | { type: "summary-complete"; requestId: string; summary: string }
  | { type: "summary-error"; requestId: string; error: SummaryErrorCode };
