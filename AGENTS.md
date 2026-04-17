# Repository Guidelines

## Project Structure & Module Organization

This repository is a WXT-based Chrome extension. Runtime entrypoints live in `entrypoints/`: `background.ts`, `content.ts`, `popup/`, and `options/`. React UI code is split by screen under `entrypoints/popup` and `entrypoints/options`, with local components beside each `App.tsx`. Shared browser and domain utilities live in `src/lib` (`storage.ts`, `openai.ts`, `i18n.ts`, `theme.ts`, `markdown.ts`), and shared types live in `src/types`. Static assets and extension metadata live in `public/`, including icons and `_locales`.

## Build, Test, and Development Commands

- `npm install`: install dependencies and run `wxt prepare`.
- `npm run dev`: start the WXT development server for local extension work.
- `npm run build`: produce a production build in `.output/chrome-mv3/`.
- `npm run zip`: package the extension for distribution.
- `npm run typecheck`: run `tsc --noEmit` to catch TypeScript regressions.

Use `npm run build && npm run typecheck` before handing off changes.

## Coding Style & Naming Conventions

Use TypeScript with 2-space indentation and keep files focused on one responsibility. Prefer `PascalCase` for React components (`PopupHeader.tsx`), `camelCase` for functions and variables, and `kebab-case` only for markdown/doc filenames. Keep screen-specific components inside their entrypoint folder; put reusable non-UI logic in `src/lib`. Preserve existing CSS files instead of introducing a new styling system without a strong reason.

## Testing Guidelines

There is no automated test suite yet. Validation currently relies on:

- `npm run typecheck`
- `npm run build`
- manual Chrome smoke tests for popup, options, content script, and context-menu flows

When adding features, document the manual verification steps in your PR or handoff note.

## Commit & Pull Request Guidelines

This workspace does not currently include Git history, so no repository-specific commit convention can be inferred. Use short, imperative commit messages such as `Add popup history filter` or `Migrate options screen to React`. For pull requests, include:

- a brief summary of behavior changes
- linked issue or task reference if available
- screenshots or recordings for popup/options UI changes
- manual verification notes listing commands run and browser flows checked

## Security & Configuration Tips

Do not commit secrets. OpenAI settings are user-managed through the extension UI and stored locally. Be careful when changing permissions, host access, or manifest-related config because those affect extension review and user trust.
