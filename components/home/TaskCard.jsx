import Link from "next/link";
import styles from "@/css/home/TaskCard.module.css";
import { getMarkdownPreview } from "@/utils/markdown.util";

export default function TaskCard({ task, index }) {
  const preview = getMarkdownPreview(task.description_md, 210);
  const deadlineLabel = task.submissionDeadline
    ? new Date(task.submissionDeadline).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
        <span className={styles.difficulty}>{task.difficulty || "Open"}</span>
      </div>

      <h3 className={styles.title}>{task.title}</h3>
      <p className={styles.description}>{preview}</p>
      {deadlineLabel ? (
        <div className={styles.deadlineCard}>
          <span className={styles.deadlineLabel}>Submission deadline</span>
          <strong className={styles.deadlineValue}>{deadlineLabel}</strong>
        </div>
      ) : null}

      <div className={styles.tags}>
        {(task.tags || []).map((tag) => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>

      <div className={styles.criteria}>
        {(task.review || []).slice(0, 3).map((criterion) => (
          <div key={`${task._id}-${criterion.label}`} className={styles.criterion}>
            <span>{criterion.label}</span>
            <strong>{criterion.maxScore}</strong>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Link href={`/task/${task._id}`} className={styles.primaryAction} data-text="Open Task"><span className={styles.buttonLabel}>Open Task</span></Link>
        <Link href={`/task/${task._id}/submissions`} className={styles.secondaryAction} data-text="Submissions"><span className={styles.buttonLabel}>Submissions</span></Link>
      </div>
    </article>
  );
}
