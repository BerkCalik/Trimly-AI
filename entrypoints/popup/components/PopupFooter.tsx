import { msg } from "../../../src/lib/i18n";

interface PopupFooterProps {
  copyLabel: string;
  showCopyButton: boolean;
  showOpenInNewTabButton: boolean;
  showActionButton: boolean;
  onCopy: () => void;
  onOpenInNewTab: () => void;
  onOpenSettings: () => void;
}

export function PopupFooter({
  copyLabel,
  showCopyButton,
  showOpenInNewTabButton,
  showActionButton,
  onCopy,
  onOpenInNewTab,
  onOpenSettings,
}: PopupFooterProps) {
  return (
    <footer className="popup-footer">
      {showCopyButton ? (
        <button className="primary-button" type="button" onClick={onCopy}>
          {copyLabel}
        </button>
      ) : null}
      {showOpenInNewTabButton ? (
        <button className="ghost-button" type="button" onClick={onOpenInNewTab}>
          {msg("popupOpenInNewTab")}
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
