import { defineConfig } from "wxt";

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    permissions: ["activeTab", "contextMenus", "storage"],
    host_permissions: ["https://api.openai.com/*"],
    options_ui: {
      open_in_tab: true,
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: "Ctrl+Shift+S",
          mac: "Command+Shift+S",
        },
        description: "Open TrimlyAi popup",
      },
    },
  },
});
