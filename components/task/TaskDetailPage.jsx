import Link from "next/link";
import TaskMarkdown from "@/components/task/TaskMarkdown";
import styles from "@/css/task/TaskDetailPage.module.css";

export default function TaskDetailPage({ task, submissionCount = 0, hasSubmitted = false, isSubmissionClosed = false }) {
  const deadlineLabel = task.submissionDeadline
    ? new Date(task.submissionDeadline).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <div className={styles.topBar}>
            <Link href="/" className={styles.homeLink}>
              Home
            </Link>
            <span className={styles.eyebrow}>Task Discussion</span>
          </div>
          <h1 className={styles.title}>{task.title}</h1>
          <p className={styles.subtitle}>
            Read the project brief, understand the structured review points, and then join the peer discussion around submitted solutions.
          </p>
          {deadlineLabel ? (
            <p className={styles.subtitle}>
              Submission deadline: <strong>{deadlineLabel}</strong>
            </p>
          ) : null}

          <div className={styles.tagRow}>
            <span className={styles.difficulty}>{task.difficulty || "Open"}</span>
            {(task.tags || []).map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>

          <div className={styles.actions}>
            {hasSubmitted ? (
              <span className={styles.disabledAction}>Submitted</span>
            ) : isSubmissionClosed ? (
              <span className={styles.closedAction}>Submission Closed</span>
            ) : (
              <Link href={`/task/${task._id}/submit`} className={styles.primaryAction} data-text="Submit Project"><span className={styles.buttonLabel}>Submit Project</span></Link>
            )}
            <Link href={`/task/${task._id}/submissions`} className={styles.secondaryAction} data-text={`Submissions (${submissionCount})`}><span className={styles.buttonLabel}>Submissions ({submissionCount})</span></Link>
          </div>
        </div>

        <aside className={styles.criteriaCard}>
          <h2 className={styles.criteriaTitle}>Review Criteria</h2>
          <div className={styles.criteriaList}>
            {(task.review || []).length ? (
              task.review.map((criterion) => (
                <div key={`${task._id}-${criterion.label}`} className={styles.criteriaItem}>
                  <span>{criterion.label}</span>
                  <strong>{criterion.maxScore} pts</strong>
                </div>
              ))
            ) : (
              <div className={styles.criteriaItem}>
                <span>Discussion Mode</span>
                <strong>Open comments</strong>
              </div>
            )}
          </div>
        </aside>
      </section>

      <TaskMarkdown content={task.description_md} />
    </main>
  );
}
