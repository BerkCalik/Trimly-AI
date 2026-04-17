import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
});

function escapeHtml(markdown: string): string {
  return markdown
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderMarkdown(markdown: string): string {
  return marked.parse(escapeHtml(markdown)) as string;
}
