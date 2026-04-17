import type { HistoryItem } from "../../../src/types";
import { msg } from "../../../src/lib/i18n";

interface HistoryDetailProps {
  item: HistoryItem | null;
  onBack: () => void;
  renderSummary: (markdown: string) => string;
  formatDate: (item: HistoryItem) => string;
}

export function HistoryDetail({
  item,
  onBack,
  renderSummary,
  formatDate,
}: HistoryDetailProps) {
  return (
    <div className="panel-card history-detail-card">
      {item ? (
        <>
          <button className="ghost-button mobile-only" type="button" onClick={onBack}>
            {msg("historyBack")}
          </button>
          <div className="history-detail">
            <h2 className="detail-title">{item.title}</h2>
            <a className="detail-url" href={item.url} rel="noreferrer" target="_blank">
              {item.url}
            </a>
            <p className="detail-meta">{formatDate(item)}</p>
            <article
              className="summary-output"
              dangerouslySetInnerHTML={{ __html: renderSummary(item.summary) }}
            />
          </div>
        </>
      ) : (
        <div className="history-empty">{msg("historyDetailEmpty")}</div>
      )}
    </div>
  );
}
