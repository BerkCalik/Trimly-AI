interface SummaryPanelProps {
  statusMessage: string;
  warningMessage: string | null;
  renderedSummary: string;
  isEmpty: boolean;
  isStreaming: boolean;
}

export function SummaryPanel({
  statusMessage,
  warningMessage,
  renderedSummary,
  isEmpty,
  isStreaming,
}: SummaryPanelProps) {
  const classNames = ["summary-output"];

  if (isEmpty) {
    classNames.push("is-empty");
  }

  if (isStreaming) {
    classNames.push("is-streaming");
  }

  return (
    <section className="popup-panel">
      <p className="summary-status">{statusMessage}</p>
      {warningMessage ? <div className="notice-banner">{warningMessage}</div> : null}
      <article
        className={classNames.join(" ")}
        aria-live="polite"
        dangerouslySetInnerHTML={{ __html: renderedSummary }}
      />
    </section>
  );
}
