import type { Theme } from "../types";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "auto") {
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  }

  return theme;
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  const resolvedTheme = resolveTheme(theme);
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.dataset.theme = theme;
}

export function cycleTheme(theme: Theme): Theme {
  if (theme === "auto") {
    return "light";
  }

  if (theme === "light") {
    return "dark";
  }

  return "auto";
}

export function watchSystemTheme(theme: Theme, onChange: () => void): () => void {
  if (theme !== "auto") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(DARK_QUERY);
  const listener = () => onChange();
  mediaQuery.addEventListener("change", listener);

  return () => mediaQuery.removeEventListener("change", listener);
}
