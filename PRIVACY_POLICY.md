# Privacy Policy

Effective date: April 17, 2026

Trimly AI ("the extension") is a Chrome extension that summarizes or translates web content with OpenAI models.

This policy explains what data is processed, where it is stored, and how it is used.

## Data We Process

The extension may process the following data when you use it:

- Website content (page text or selected text) for summary/translation requests
- OpenAI API key that you enter in extension settings
- Extension settings (model, language, summary length, app language, prompt preferences)
- Local history data (title, URL, timestamp, summary, prompt, model)

## How Data Is Used

Data is used only to provide core extension features:

- Send requested text to OpenAI API to generate summaries/translations
- Store your preferences so the extension keeps your selected settings
- Save history entries so you can review previous results

## Data Sharing

- Website text and your API request payload are sent to OpenAI at `https://api.openai.com/` only when you trigger a summary/translation action.
- We do not sell personal data.
- We do not use ad trackers or analytics SDKs in this extension.

## Storage and Retention

- Settings are stored via Chrome extension storage (`chrome.storage.sync`).
- History, reader payload, and active job state are stored via `chrome.storage.local`.
- Data remains until you remove it (for example, by clearing history, changing settings, or uninstalling the extension).

## Permissions and Purpose

The extension requests only permissions required for its single purpose (summarizing/translating content):

- `activeTab`: access active page content after user action
- `contextMenus`: summarize selected text from right-click menu
- `storage`: save settings and history locally
- `https://api.openai.com/*`: send requests to OpenAI API

## Remote Code

The extension does not load or execute remote code.

## Third-Party Service

OpenAI API is a third-party service. Your use of OpenAI is also subject to OpenAI's terms and privacy policy.

## Children's Privacy

The extension is not directed to children under 13.

## Changes to This Policy

This policy may be updated from time to time. Updates will be published in this repository.

## Contact

For privacy questions, please open an issue in this repository.
