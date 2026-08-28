"use client";

import TurndownService from "turndown";

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return (
    name
      .trim()
      .replace(/[/\\?%*:|"<>]/g, "-")
      .replace(/\s+/g, "_") || "document"
  );
}

export function exportToPdf() {
  if (typeof window !== "undefined") {
    window.print();
  }
}

export function exportToMarkdown(title: string, htmlContent: string) {
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });

  const markdown = `# ${title}\n\n${turndown.turndown(htmlContent || "")}`;
  downloadFile(
    markdown,
    `${sanitizeFilename(title)}.md`,
    "text/markdown;charset=utf-8"
  );
}

export function exportToHtml(title: string, htmlContent: string) {
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { font-size: 2.2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.6rem; margin-top: 1.5rem; }
    h3 { font-size: 1.3rem; margin-top: 1.2rem; }
    blockquote { border-left: 4px solid #e2e8f0; padding-left: 1rem; color: #64748b; }
    pre { background: #f1f5f9; padding: 12px; border-radius: 6px; overflow-x: auto; }
    code { font-family: monospace; background: #f1f5f9; padding: 2px 4px; border-radius: 4px; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 2rem;" />
  <div class="content">
    ${htmlContent}
  </div>
</body>
</html>`;

  downloadFile(
    fullHtml,
    `${sanitizeFilename(title)}.html`,
    "text/html;charset=utf-8"
  );
}

export function exportToTxt(title: string, htmlContent: string) {
  const temp = document.createElement("div");
  temp.innerHTML = htmlContent;
  const plain = temp.textContent || temp.innerText || "";
  const fullText = `${title}\n${"=".repeat(title.length)}\n\n${plain}`;

  downloadFile(
    fullText,
    `${sanitizeFilename(title)}.txt`,
    "text/plain;charset=utf-8"
  );
}
