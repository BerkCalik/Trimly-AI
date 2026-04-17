import type { SummaryLength } from "../types";

export const DEFAULT_PROMPT = `You are a text summarizer. Summarize the following article in {language}.
Summary length: {length}.
Use markdown formatting with short headings and bullet points where appropriate.

Article:
{content}`;

export const FULL_TRANSLATION_PROMPT = `You are a professional translator. Translate the following article into {language}.
Do not summarize, shorten, or omit content.
Preserve the full meaning, structure, and important details.
Return markdown only.

Article:
{content}`;

export const LENGTH_LABELS: Record<SummaryLength, string> = {
  short: "2-3 sentences",
  medium: "1 paragraph",
  detailed: "3-4 paragraphs",
  full: "full translation",
};

export function getDefaultPrompt(summaryLength: SummaryLength): string {
  return summaryLength === "full" ? FULL_TRANSLATION_PROMPT : DEFAULT_PROMPT;
}

export function getSystemPrompt(summaryLength?: SummaryLength): string {
  return summaryLength === "full"
    ? "You translate web content accurately and completely. Do not summarize or omit content. Return markdown only."
    : "You summarize web content clearly, accurately, and concisely. Return markdown only.";
}
