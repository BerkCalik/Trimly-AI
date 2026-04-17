import { msg } from "../../../src/lib/i18n";

interface PopupHeaderProps {
  themeLabel: string;
  onOpenSettings: () => void;
  onCycleTheme: () => void;
}

export function PopupHeader({
  themeLabel,
  onOpenSettings,
  onCycleTheme,
}: PopupHeaderProps) {
  return (
    <header className="popup-header">
      <div>
        <p className="eyebrow">TrimlyAi</p>
        <h1 className="popup-title">{msg("popupTitle")}</h1>
      </div>
      <div className="header-actions">
        <button className="ghost-button" type="button" onClick={onOpenSettings}>
          {msg("popupOpenSettings")}
        </button>
        <button
          className="ghost-button"
          type="button"
          title={msg("popupThemeToggle")}
          onClick={onCycleTheme}>
          {themeLabel}
        </button>
      </div>
    </header>
  );
}
