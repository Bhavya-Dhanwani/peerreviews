function stripInlineMarkdown(text = "") {
  return String(text || "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
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

function createListItem(content, ordered = false) {
  return {
    content,
    ordered,
    children: [],
  };
}

function getListDepth(rawLine = "") {
  const indentMatch = rawLine.match(/^\s*/);
  const indent = indentMatch ? indentMatch[0].length : 0;
  return Math.floor(indent / 2);
}

function isHorizontalRule(line = "") {
  return /^(\s*)(---+|___+|\*\*\*+)(\s*)$/.test(line);
}

function isTableDivider(line = "") {
  const normalized = line.trim();
  return /^\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(normalized);
}

function splitTableRow(line = "") {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableStart(lines, index) {
  const current = lines[index]?.trim() || "";
  const next = lines[index + 1]?.trim() || "";

  if (!current.includes("|") || !next.includes("|")) {
    return false;
  }

  return isTableDivider(next);
}

function isListLine(line = "") {
  return /^(\s*)([-*+]|\d+\.)\s+/.test(line);
}

function isBlockStarter(line = "") {
  return (
    !line.trim() ||
    /^#{1,6}\s+/.test(line) ||
    isHorizontalRule(line) ||
    /^>\s?/.test(line) ||
    /^```/.test(line.trim()) ||
    isListLine(line) ||
    line.trim().startsWith("|")
  );
}

export function parseInlineMarkdown(text = "") {
  const source = String(text || "");
  const tokens = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        content: source.slice(lastIndex, match.index),
      });
    }

    if (match[2] && match[3]) {
      tokens.push({
        type: "link",
        content: match[2],
        href: match[3],
      });
    } else if (match[4]) {
      tokens.push({
        type: "code",
        content: match[4],
      });
    } else if (match[5] || match[6]) {
      tokens.push({
        type: "strong",
        content: match[5] || match[6],
      });
    } else if (match[7] || match[8]) {
      tokens.push({
        type: "em",
        content: match[7] || match[8],
      });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < source.length) {
    tokens.push({
      type: "text",
      content: source.slice(lastIndex),
    });
  }

  return tokens.filter((token) => token.content);
}

export function parseMarkdownContent(content = "") {
  const lines = String(content || "").replace(/\r/g, "").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (/^```/.test(line)) {
      const language = line.slice(3).trim();
      const codeLines = [];
      index += 1;

      while (index < lines.length && !/^```/.test(lines[index].trim())) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({
        type: "code",
        language,
        content: codeLines.join("\n"),
      });
      continue;
    }

    if (isTableStart(lines, index)) {
      const header = splitTableRow(lines[index]);
      const rows = [];
      index += 2;

      while (index < lines.length && lines[index].trim().includes("|")) {
        const row = splitTableRow(lines[index]);
        if (row.some(Boolean)) {
          rows.push(row);
        }
        index += 1;
      }

      blocks.push({
        type: "table",
        header,
        rows,
      });
      continue;
    }

    if (isHorizontalRule(line)) {
      blocks.push({ type: "divider" });
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        content: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines = [];

      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push({
        type: "blockquote",
        content: quoteLines.join(" ").trim(),
      });
      continue;
    }

    if (isListLine(rawLine)) {
      const root = [];
      const stack = [];

      while (index < lines.length && isListLine(lines[index])) {
        const currentLine = lines[index];
        const itemMatch = currentLine.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        const depth = getListDepth(currentLine);
        const ordered = /\d+\./.test(itemMatch[2]);
        const item = createListItem(itemMatch[3].trim(), ordered);

        while (stack.length > depth) {
          stack.pop();
        }

        if (stack.length === 0) {
          root.push(item);
        } else {
          stack[stack.length - 1].children.push(item);
        }

        stack.push(item);
        index += 1;
      }

      blocks.push({
        type: "list",
        ordered: root[0]?.ordered || false,
        items: root,
      });
      continue;
    }

    const paragraphLines = [];

    while (index < lines.length && !isBlockStarter(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    if (!paragraphLines.length) {
      paragraphLines.push(line);
      index += 1;
    }

    const paragraph = paragraphLines.join(" ").trim();
    if (paragraph) {
      blocks.push({
        type: "paragraph",
        content: paragraph,
      });
    }
  }

  return blocks;
}

export function getMarkdownPreview(content = "", maxLength = 220) {
  const blocks = parseMarkdownContent(content);
  const text = blocks
    .flatMap((block) => {
      if (block.type === "list") {
        const flattenItems = (items = []) =>
          items.flatMap((item) => [item.content, ...flattenItems(item.children || [])]);

        return flattenItems(block.items);
      }

      if (block.type === "table") {
        return [...block.header, ...block.rows.flat()];
      }

      return block.content ? [block.content] : [];
    })
    .map((entry) => stripInlineMarkdown(entry))
    .filter(Boolean)
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
