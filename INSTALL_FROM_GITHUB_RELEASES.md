# Install Trimly AI from GitHub Releases

This guide explains how end users can install Trimly AI from the GitHub Releases page.

## 1. Download the correct file

1. Open the repository's `Releases` page.
2. Open the latest release (for example `v0.1.1`).
3. In `Assets`, download the file ending with `-chrome.zip`.
4. Extract the ZIP file to a folder on your computer.

Example asset name:

`trimlyai-chrome-extension-0.1.1-chrome.zip`

## 2. Load the extension in Chrome

1. Open `chrome://extensions`.
2. Enable `Developer mode` (top-right).
3. Click `Load unpacked`.
4. Select the extracted folder (the one containing `manifest.json`).

Trimly AI should now appear in your extension list and toolbar.

## 3. Update to a newer version

Chrome does not auto-update unpacked extensions from GitHub Releases.

To update:
1. Download the new `-chrome.zip` from the latest release.
2. Extract it.
3. In `chrome://extensions`, remove the old Trimly AI extension.
4. Load the new extracted folder with `Load unpacked`.

## Troubleshooting

- `Manifest file is missing or unreadable`:
  You selected the wrong folder. Select the extracted folder that directly contains `manifest.json`.
- Extension is disabled after reload:
  Re-open `chrome://extensions` and enable Trimly AI again.
- Nothing happens when using the extension:
  Open extension settings and confirm your OpenAI API key is set.
