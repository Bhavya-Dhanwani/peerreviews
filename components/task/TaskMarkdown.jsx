import styles from "@/css/task/TaskMarkdown.module.css";
import { parseMarkdownContent } from "@/utils/markdown.util";

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
                return (
                  <h2 key={`${block.type}-${index}`} className={styles.heading}>
                    {block.content}
                  </h2>
                );
              }

              if (block.type === "subheading") {
                return (
                  <h3 key={`${block.type}-${index}`} className={styles.subheading}>
                    {block.content}
                  </h3>
                );
              }

              if (block.type === "list") {
                return (
                  <div key={`${block.type}-${index}`} className={styles.list}>
                    {block.items.map((item) => (
                      <div key={item} className={styles.listItem}>
                        {item}
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <p key={`${block.type}-${index}`} className={styles.paragraph}>
                  {block.content}
                </p>
              );
            })
          ) : (
            <p className={styles.paragraph}>No task description has been added for this task yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
