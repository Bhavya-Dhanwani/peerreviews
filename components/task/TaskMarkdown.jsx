import styles from "@/css/task/TaskMarkdown.module.css";
import { parseInlineMarkdown, parseMarkdownContent } from "@/utils/markdown.util";

function renderInline(content = "", keyPrefix = "inline") {
  return parseInlineMarkdown(content).map((token, index) => {
    const key = `${keyPrefix}-${token.type}-${index}`;

    if (token.type === "strong") {
      return <strong key={key}>{token.content}</strong>;
    }

    if (token.type === "em") {
      return <em key={key}>{token.content}</em>;
    }

    if (token.type === "code") {
      return (
        <code key={key} className={styles.inlineCode}>
          {token.content}
        </code>
      );
    }

    if (token.type === "link") {
      return (
        <a
          key={key}
          href={token.href}
          target="_blank"
          rel="noreferrer"
          className={styles.link}
        >
          {token.content}
        </a>
      );
    }

    return <span key={key}>{token.content}</span>;
  });
}

function renderList(items = [], ordered = false, keyPrefix = "list") {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <ListTag className={ordered ? styles.orderedList : styles.unorderedList}>
      {items.map((item, index) => (
        <li key={`${keyPrefix}-${index}`} className={styles.listItem}>
          <span>{renderInline(item.content, `${keyPrefix}-${index}`)}</span>
          {item.children?.length
            ? renderList(item.children, item.children[0]?.ordered, `${keyPrefix}-${index}-child`)
            : null}
        </li>
      ))}
    </ListTag>
  );
}

export default function TaskMarkdown({ content = "" }) {
  const blocks = parseMarkdownContent(content);

  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <span className={styles.eyebrow}>Task Brief</span>
        <div className={styles.content}>
          {blocks.length ? (
            blocks.map((block, index) => {
              if (block.type === "heading") {
                if (block.level <= 2) {
                  return (
                    <h2 key={`${block.type}-${index}`} className={styles.heading}>
                      {renderInline(block.content, `heading-${index}`)}
                    </h2>
                  );
                }

                return (
                  <h3 key={`${block.type}-${index}`} className={styles.subheading}>
                    {renderInline(block.content, `subheading-${index}`)}
                  </h3>
                );
              }

              if (block.type === "paragraph") {
                return (
                  <p key={`${block.type}-${index}`} className={styles.paragraph}>
                    {renderInline(block.content, `paragraph-${index}`)}
                  </p>
                );
              }

              if (block.type === "list") {
                return (
                  <div key={`${block.type}-${index}`} className={styles.listBlock}>
                    {renderList(block.items, block.ordered, `list-${index}`)}
                  </div>
                );
              }

              if (block.type === "blockquote") {
                return (
                  <blockquote key={`${block.type}-${index}`} className={styles.blockquote}>
                    {renderInline(block.content, `quote-${index}`)}
                  </blockquote>
                );
              }

              if (block.type === "divider") {
                return <hr key={`${block.type}-${index}`} className={styles.divider} />;
              }

              if (block.type === "code") {
                return (
                  <div key={`${block.type}-${index}`} className={styles.codeBlock}>
                    {block.language ? <span className={styles.codeLabel}>{block.language}</span> : null}
                    <pre className={styles.preformatted}>
                      <code>{block.content}</code>
                    </pre>
                  </div>
                );
              }

              if (block.type === "table") {
                return (
                  <div key={`${block.type}-${index}`} className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          {block.header.map((cell, cellIndex) => (
                            <th key={`header-${cellIndex}`}>{renderInline(cell, `table-head-${index}-${cellIndex}`)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row, rowIndex) => (
                          <tr key={`row-${rowIndex}`}>
                            {row.map((cell, cellIndex) => (
                              <td key={`cell-${rowIndex}-${cellIndex}`}>
                                {renderInline(cell, `table-cell-${index}-${rowIndex}-${cellIndex}`)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              return null;
            })
          ) : (
            <p className={styles.paragraph}>No task description has been added for this task yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
