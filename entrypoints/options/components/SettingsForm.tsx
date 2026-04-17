import { msg } from "../../../src/lib/i18n";
import type { Model, SummaryLength, Theme } from "../../../src/types";

interface SettingsDraft {
  apiKey: string;
  model: Model;
  language: string;
  summaryLength: SummaryLength;
  theme: Theme;
  customPrompt: string;
}

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SettingsFormProps {
  draft: SettingsDraft;
  isApiKeyVisible: boolean;
  saveFeedback: string;
  modelOptions: Option<Model>[];
  languageOptions: Option<string>[];
  lengthOptions: Option<SummaryLength>[];
  themeOptions: Option<Theme>[];
  onFieldChange: <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) => void;
  onToggleApiKey: () => void;
  onResetPrompt: () => void;
  onSave: () => void;
}

export function SettingsForm({
  draft,
  isApiKeyVisible,
  saveFeedback,
  modelOptions,
  languageOptions,
  lengthOptions,
  themeOptions,
  onFieldChange,
  onToggleApiKey,
  onResetPrompt,
  onSave,
}: SettingsFormProps) {
  return (
    <>
      <div className="panel-card">
        <label className="field">
          <span>{msg("apiKeyLabel")}</span>
          <div className="input-row">
            <input
              className="input"
              type={isApiKeyVisible ? "text" : "password"}
              autoComplete="off"
              value={draft.apiKey}
              onChange={(event) => onFieldChange("apiKey", event.target.value)}
            />
            <button className="ghost-button" type="button" onClick={onToggleApiKey}>
              {msg(isApiKeyVisible ? "hide" : "show")}
            </button>
          </div>
        </label>

        <label className="field">
          <span>{msg("modelLabel")}</span>
          <select
            className="input"
            value={draft.model}
            onChange={(event) => onFieldChange("model", event.target.value as Model)}>
            {modelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="field-row">
          <label className="field">
            <span>{msg("languageLabel")}</span>
            <select
              className="input"
              value={draft.language}
              onChange={(event) => onFieldChange("language", event.target.value)}>
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{msg("lengthLabel")}</span>
            <select
              className="input"
              value={draft.summaryLength}
              onChange={(event) =>
                onFieldChange("summaryLength", event.target.value as SummaryLength)
              }>
              {lengthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>{msg("themeLabel")}</span>
          <select
            className="input"
            value={draft.theme}
            onChange={(event) => onFieldChange("theme", event.target.value as Theme)}>
            {themeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="panel-card">
        <label className="field">
          <span>{msg("customPromptLabel")}</span>
          <textarea
            className="textarea"
            rows={12}
            value={draft.customPrompt}
            onChange={(event) => onFieldChange("customPrompt", event.target.value)}
          />
        </label>
        <p className="hint">{msg("customPromptHint")}</p>

        <div className="action-row">
          <button className="secondary-button" type="button" onClick={onResetPrompt}>
            {msg("resetPrompt")}
          </button>
          <button className="primary-button" type="button" onClick={onSave}>
            {msg("save")}
          </button>
        </div>
        <p className="save-feedback">{saveFeedback}</p>
      </div>
    </>
  );
}
