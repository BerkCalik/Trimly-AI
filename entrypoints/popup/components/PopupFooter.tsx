import { msg } from "../../../src/lib/i18n";

interface PopupFooterProps {
  copyLabel: string;
  showCopyButton: boolean;
  showActionButton: boolean;
  onCopy: () => void;
  onOpenSettings: () => void;
}

export function PopupFooter({
  copyLabel,
  showCopyButton,
  showActionButton,
  onCopy,
  onOpenSettings,
}: PopupFooterProps) {
  return (
    <footer className="popup-footer">
      {showCopyButton ? (
        <button className="primary-button" type="button" onClick={onCopy}>
          {copyLabel}
        </button>
      ) : null}
      {showActionButton ? (
        <button className="secondary-button" type="button" onClick={onOpenSettings}>
          {msg("popupOpenSettings")}
        </button>
      ) : null}
    </footer>
  );
}
