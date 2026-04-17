import { useEffect, useState } from "react";

import { msg, setAppLanguage, useI18nVersion } from "../../src/lib/i18n";
import { renderMarkdown } from "../../src/lib/markdown";
import { getReaderPayload, getSettings } from "../../src/lib/storage";
import { applyTheme, watchSystemTheme } from "../../src/lib/theme";
import type { ReaderPayload, Theme } from "../../src/types";

function formatSourceUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function App() {
  useI18nVersion();
  const [theme, setTheme] = useState<Theme>("auto");
  const [payload, setPayload] = useState<ReaderPayload | null>(null);

  useEffect(() => {
    document.title = "TrimlyAi";

    let cancelled = false;

    void (async () => {
      const [settings, readerPayload] = await Promise.all([getSettings(), getReaderPayload()]);
      if (cancelled) {
        return;
      }

      setAppLanguage(settings.appLanguage);
      setTheme(settings.theme);
      setPayload(readerPayload);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    applyTheme(theme);
    return watchSystemTheme(theme, () => applyTheme(theme));
  }, [theme]);

  if (!payload) {
    return (
      <main className="reader-shell">
        <section className="reader-card reader-empty">
          <p className="eyebrow">TrimlyAi</p>
          <h1 className="reader-title">{msg("readerEmptyTitle")}</h1>
          <p className="reader-description">{msg("readerEmptyBody")}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="reader-shell">
      <article className="reader-card">
        <header className="reader-header">
          <div>
            <p className="eyebrow">TrimlyAi</p>
            <h1 className="reader-title">{payload.title || msg("popupTitle")}</h1>
          </div>
          <div className="reader-meta">
            {payload.sourceUrl ? (
              <a
                className="reader-link"
                href={payload.sourceUrl}
                rel="noreferrer"
                target="_blank">
                {formatSourceUrl(payload.sourceUrl)}
              </a>
            ) : null}
            <p className="reader-description">
              {new Date(payload.createdAt).toLocaleString()}
            </p>
          </div>
        </header>

        <section
          className="reader-summary summary-output"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(payload.summary) }}
        />
      </article>
    </main>
  );
}
