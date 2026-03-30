function cleanInlineMarkdown(text = "") {
  return String(text || "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(```[\s\S]*?```)/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseMarkdownContent(content = "") {
  const lines = String(content || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];

  function flushParagraph() {
    if (!paragraphLines.length) {
      return;
    }

    const text = cleanInlineMarkdown(paragraphLines.join(" "));
    if (text) {
      blocks.push({ type: "paragraph", content: text });
    }
    paragraphLines = [];
  }

  function flushList() {
    if (!listItems.length) {
      return;
    }

    blocks.push({
      type: "list",
      items: listItems.map((item) => cleanInlineMarkdown(item)).filter(Boolean),
    });
    listItems = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^---+$/.test(line) || /^___+$/.test(line) || /^\*\*\*+$/.test(line)) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: headingMatch[1].length <= 2 ? "heading" : "subheading",
        content: cleanInlineMarkdown(headingMatch[2]),
      });
      continue;
    }

    const listMatch = line.match(/^[-*+]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1]);
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function getMarkdownPreview(content = "", maxLength = 220) {
  const blocks = parseMarkdownContent(content);
  const text = blocks
    .flatMap((block) => (block.type === "list" ? block.items : block.content ? [block.content] : []))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return "Open the task to read the full brief and review criteria.";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}
