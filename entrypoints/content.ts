import { Readability } from "@mozilla/readability";

import type { ContentScriptRequest, ContentScriptResponse } from "../src/types";

function normalizeContent(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function getSelectionText(): string {
  return normalizeContent(window.getSelection?.()?.toString() ?? "");
}

function getReadableContent(): ContentScriptResponse | null {
  try {
    const clonedDocument = document.cloneNode(true) as Document;
    const article = new Readability(clonedDocument).parse();
    const content = normalizeContent(article?.textContent ?? "");

    if (!content) {
      return null;
    }

    return {
      success: true,
      content,
      title: article?.title?.trim() || document.title || "Untitled page",
      url: location.href,
    };
  } catch {
    return null;
  }
}

function extractContent(): ContentScriptResponse {
  const readable = getReadableContent();
  if (readable) {
    return readable;
  }

  const selection = getSelectionText();
  if (selection) {
    return {
      success: true,
      content: selection,
      title: document.title || "Selected text",
      url: location.href,
    };
  }

  return {
    success: false,
    error: "no-content",
  };
}

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main() {
    chrome.runtime.onMessage.addListener(
      (
        message: ContentScriptRequest,
        _sender,
        sendResponse: (response: ContentScriptResponse) => void,
      ) => {
        if (message.type === "extract-content") {
          sendResponse(extractContent());
          return false;
        }

        if (message.type === "get-selection") {
          const selection = getSelectionText();
          sendResponse(
            selection
              ? {
                  success: true,
                  content: selection,
                  title: document.title || "Selected text",
                  url: location.href,
                }
              : {
                  success: false,
                  error: "no-content",
                },
          );
          return false;
        }

        return false;
      },
    );
  },
});
