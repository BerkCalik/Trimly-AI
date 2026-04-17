import { getLanguageLabel, msg, setAppLanguage } from "../src/lib/i18n";
import {
  buildPrompt,
  streamSummary,
  toSummaryErrorCode,
  truncateContent,
} from "../src/lib/openai";
import {
  addHistoryItem,
  ensureDefaultSettings,
  getActiveSummaryJob,
  getSettings,
  saveActiveSummaryJob,
} from "../src/lib/storage";
import type {
  ActiveSummaryJob,
  ExtractedContent,
  RuntimeEvent,
  RuntimeRequest,
  RuntimeResponse,
  SummaryErrorCode,
  SummaryLength,
} from "../src/types";

const CONTEXT_MENU_ID = "trimly-summarize";
let pendingSelection: ExtractedContent | null = null;

async function emitRuntimeEvent(event: RuntimeEvent): Promise<void> {
  try {
    await chrome.runtime.sendMessage(event);
  } catch {
    return;
  }
}

async function ensureContextMenu(): Promise<void> {
  const settings = await getSettings();
  setAppLanguage(settings.appLanguage);
  await chrome.contextMenus.removeAll();
  await chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: msg("contextMenuTitle"),
    contexts: ["selection"],
  });
}

async function bootstrap(): Promise<void> {
  await ensureDefaultSettings();
  await ensureContextMenu();
}

async function handleSummaryRequest(
  request: ExtractedContent,
  requestId: string,
  languageOverride?: string,
  summaryLengthOverride?: SummaryLength,
): Promise<void> {
  const settings = await getSettings();
  const effectiveLanguage = languageOverride ?? settings.language;
  const effectiveSummaryLength = summaryLengthOverride ?? settings.summaryLength;
  const startedAt = Date.now();

  const saveJob = async (
    overrides: Partial<ActiveSummaryJob>,
    replace = false,
  ): Promise<ActiveSummaryJob> => {
    const existingJob = await getActiveSummaryJob();
    if (!replace && existingJob && existingJob.requestId !== requestId) {
      return existingJob;
    }

    const nextJob: ActiveSummaryJob = {
      requestId,
      source: request,
      summary: "",
      language: effectiveLanguage,
      summaryLength: effectiveSummaryLength,
      model: settings.model,
      status: "streaming",
      warning: null,
      error: null,
      startedAt,
      ...((existingJob?.requestId === requestId ? existingJob : null) ?? {}),
      ...overrides,
    };

    await saveActiveSummaryJob(nextJob);
    return nextJob;
  };

  const failWithError = async (
    error: SummaryErrorCode,
    replace = false,
  ): Promise<void> => {
    await saveJob({
      status: "error",
      error,
      completedAt: Date.now(),
    }, replace);
    await emitRuntimeEvent({
      type: "summary-error",
      requestId,
      error,
    });
  };

  if (!request.content.trim()) {
    await failWithError("no-content", true);
    return;
  }

  if (!settings.apiKey.trim()) {
    await failWithError("no-api-key", true);
    return;
  }

  await saveJob({}, true);

  await emitRuntimeEvent({
    type: "summary-start",
    requestId,
  });

  const truncated = truncateContent(request.content);
  const prompt = buildPrompt(
    truncated.text,
    getLanguageLabel(effectiveLanguage),
    effectiveSummaryLength,
    settings.customPrompt,
  );

  if (truncated.truncated) {
    await saveJob({
      warning: "content-trimmed",
    });
    await emitRuntimeEvent({
      type: "summary-warning",
      requestId,
      warning: "content-trimmed",
    });
  }

  try {
    let summary = "";

    for await (const chunk of streamSummary({
      apiKey: settings.apiKey.trim(),
      model: settings.model,
      prompt,
      length: effectiveSummaryLength,
    })) {
      summary += chunk;
      await saveJob({
        summary,
      });
      await emitRuntimeEvent({
        type: "summary-chunk",
        requestId,
        chunk,
      });
    }

    await saveJob({
      summary,
      status: "completed",
      completedAt: Date.now(),
    });

    await emitRuntimeEvent({
      type: "summary-complete",
      requestId,
      summary,
    });

    if (summary.trim()) {
      await addHistoryItem({
        url: request.url,
        title: request.title,
        summary,
        prompt,
        model: settings.model,
        language: effectiveLanguage,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    await failWithError(toSummaryErrorCode(error));
  }
}

export default defineBackground({
  type: "module",
  main() {
    chrome.runtime.onInstalled.addListener(() => {
      void bootstrap();
    });

    chrome.runtime.onStartup.addListener(() => {
      void ensureContextMenu();
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId !== CONTEXT_MENU_ID || !info.selectionText?.trim()) {
        return;
      }

      pendingSelection = {
        content: info.selectionText.trim(),
        title: tab?.title || "Selected text",
        url: tab?.url || "",
      };

      void chrome.action.openPopup();
    });

    chrome.runtime.onMessage.addListener(
      (
        message: RuntimeRequest,
        _sender,
        sendResponse: (response?: RuntimeResponse | { accepted: true }) => void,
      ) => {
        if (message.type === "get-context-menu-text") {
          const response = pendingSelection;
          pendingSelection = null;
          sendResponse(response);
          return false;
        }

        if (message.type === "get-active-summary-job") {
          void getActiveSummaryJob().then((job) => sendResponse(job));
          return true;
        }

        if (message.type === "start-summary") {
          void handleSummaryRequest(
            message.payload,
            message.requestId,
            message.options?.language,
            message.options?.summaryLength,
          );
          sendResponse({ accepted: true });
          return true;
        }

        return false;
      },
    );
  },
});
