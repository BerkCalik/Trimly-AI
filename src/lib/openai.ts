import { DEFAULT_PROMPT } from "./storage";
import type { Model, SummaryErrorCode, SummaryLength } from "../types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_WORDS = 12_000;

export class ApiKeyError extends Error {}
export class RateLimitError extends Error {}
export class NetworkError extends Error {}
export class TimeoutError extends Error {}

const LENGTH_LABELS: Record<SummaryLength, string> = {
  short: "2-3 sentences",
  medium: "1 paragraph",
  detailed: "3-4 paragraphs",
};

export function buildPrompt(
  content: string,
  language: string,
  length: SummaryLength,
  customPrompt: string | null,
): string {
  const template = customPrompt?.trim() || DEFAULT_PROMPT;

  return template
    .replaceAll("{language}", language)
    .replaceAll("{length}", LENGTH_LABELS[length])
    .replaceAll("{content}", content);
}

export function truncateContent(
  content: string,
  maxWords = MAX_WORDS,
): { text: string; truncated: boolean } {
  const words = content.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return {
      text: content.trim(),
      truncated: false,
    };
  }

  return {
    text: words.slice(0, maxWords).join(" "),
    truncated: true,
  };
}

export function toSummaryErrorCode(error: unknown): SummaryErrorCode {
  if (error instanceof ApiKeyError) {
    return "invalid-api-key";
  }

  if (error instanceof RateLimitError) {
    return "rate-limit";
  }

  if (error instanceof TimeoutError) {
    return "timeout";
  }

  if (error instanceof NetworkError) {
    return "network";
  }

  return "unknown";
}

export async function* streamSummary(params: {
  apiKey: string;
  model: Model;
  prompt: string;
}): AsyncGenerator<string> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model,
        stream: true,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You summarize web content clearly, accurately, and concisely. Return markdown only.",
          },
          {
            role: "user",
            content: params.prompt,
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiKeyError("Invalid API key.");
      }

      if (response.status === 429) {
        throw new RateLimitError("Rate limit exceeded.");
      }

      throw new NetworkError(`Unexpected response: ${response.status}`);
    }

    if (!response.body) {
      throw new NetworkError("Response body was empty.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const lines = event.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) {
            continue;
          }

          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") {
            return;
          }

          try {
            const payload = JSON.parse(data) as {
              choices?: Array<{
                delta?: {
                  content?: string | Array<{ type?: string; text?: string }>;
                };
              }>;
            };
            const content = payload.choices?.[0]?.delta?.content;

            if (typeof content === "string" && content) {
              yield content;
            }

            if (Array.isArray(content)) {
              for (const part of content) {
                if (part.type === "text" && part.text) {
                  yield part.text;
                }
              }
            }
          } catch {
            continue;
          }
        }
      }

      if (done) {
        return;
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new TimeoutError("Request timed out.");
    }

    if (error instanceof ApiKeyError || error instanceof RateLimitError || error instanceof TimeoutError) {
      throw error;
    }

    throw new NetworkError(error instanceof Error ? error.message : "Network request failed.");
  } finally {
    clearTimeout(timeoutId);
  }
}
