import { msg } from "../../../src/lib/i18n";

interface TabBarProps {
  activeTab: "settings" | "history";
  onChange: (tab: "settings" | "history") => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div className="tab-bar">
      <button
        className={`tab-button${activeTab === "settings" ? " is-active" : ""}`}
        type="button"
        onClick={() => onChange("settings")}>
        {msg("settingsTab")}
      </button>
      <button
        className={`tab-button${activeTab === "history" ? " is-active" : ""}`}
        type="button"
        onClick={() => onChange("history")}>
        {msg("historyTab")}
      </button>
    </div>
  );
}
