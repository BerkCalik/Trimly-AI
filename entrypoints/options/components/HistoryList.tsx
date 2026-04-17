import { formatHistoryTime, msg } from "../../../src/lib/i18n";
import type { HistoryItem } from "../../../src/types";

interface HistoryListProps {
  items: HistoryItem[];
  query: string;
  selectedHistoryId: string;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
  onClear: () => void;
  getDomain: (url: string) => string;
}

export function HistoryList({
  items,
  query,
  selectedHistoryId,
  onQueryChange,
  onSelect,
  onClear,
  getDomain,
}: HistoryListProps) {
  return (
    <div className="panel-card">
      <input
        className="input"
        type="search"
        placeholder={msg("historySearch")}
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <div className="history-list">
        {items.length ? (
          items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`history-item${item.id === selectedHistoryId ? " is-active" : ""}`}
              onClick={() => onSelect(item.id)}>
              <span className="history-title">{item.title}</span>
              <p className="history-meta">
                {getDomain(item.url)} {"·"} {formatHistoryTime(item)}
              </p>
            </button>
          ))
        ) : (
          <p className="history-empty">{msg("historyEmpty")}</p>
        )}
      </div>
      <button className="secondary-button" type="button" onClick={onClear}>
        {msg("historyClear")}
      </button>
    </div>
  );
}
