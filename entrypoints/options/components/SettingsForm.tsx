import { msg } from "../../../src/lib/i18n";
import type { AppLanguage, Model, SummaryLength, Theme } from "../../../src/types";

interface SettingsDraft {
  apiKey: string;
  model: Model;
  language: string;
  summaryLength: SummaryLength;
  theme: Theme;
  appLanguage: AppLanguage;
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
  appLanguageOptions: Option<AppLanguage>[];
  onFieldChange: <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) => void;
  onToggleApiKey: () => void;
  onOpenApiKeys: () => void;
}

export function SettingsForm({
  draft,
  isApiKeyVisible,
  saveFeedback,
  modelOptions,
  languageOptions,
  lengthOptions,
  themeOptions,
  appLanguageOptions,
  onFieldChange,
  onToggleApiKey,
  onOpenApiKeys,
}: SettingsFormProps) {
  return (
    <>
      <div className="panel-card">
        <label className="field">
          <span>{msg("apiKeyLabel")}</span>
          <div className="input-row">
            <div className="input-with-icon">
              <input
                className="input input-with-icon-field"
                type={isApiKeyVisible ? "text" : "password"}
                autoComplete="off"
                value={draft.apiKey}
                onChange={(event) => onFieldChange("apiKey", event.target.value)}
              />
              <button
                aria-label={msg(isApiKeyVisible ? "hide" : "show")}
                className="input-icon-button"
                type="button"
                onClick={onToggleApiKey}>
                <svg
                  aria-hidden="true"
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
                  <circle cx="12" cy="12" r="3" />
                  {isApiKeyVisible ? null : <path d="M4 4l16 16" />}
                </svg>
              </button>
            </div>
            <button className="secondary-button api-token-button" type="button" onClick={onOpenApiKeys}>
              {msg("getApiToken")}
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

        <p className="field-explainer">
          {msg(
            draft.summaryLength === "full"
              ? "settingsLanguageLengthHintFull"
              : "settingsLanguageLengthHintSummary",
          )}
        </p>

        <label className="field">
          <span>{msg("appLanguageLabel")}</span>
          <select
            className="input"
            value={draft.appLanguage}
            onChange={(event) => onFieldChange("appLanguage", event.target.value as AppLanguage)}>
            {appLanguageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

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
      </div>

      <p className="save-feedback settings-feedback">{saveFeedback}</p>
    </>
  );
}
