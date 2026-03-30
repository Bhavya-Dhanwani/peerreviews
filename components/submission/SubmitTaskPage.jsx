import Link from "next/link";
import SubmitTaskForm from "@/components/submission/SubmitTaskForm";
import styles from "@/css/submission/SubmitTaskPage.module.css";

export default function SubmitTaskPage({ task }) {
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
        <div className={styles.copyCard}>
          <div className={styles.topBar}>
            <div className={styles.breadcrumbs}>
              <Link href="/" className={styles.homeLink}>
                Home
              </Link>
              <Link href={`/task/${task._id}`} className={styles.crumbLink}>
                Task
              </Link>
            </div>
            <span className={styles.eyebrow}>Submit Project</span>
          </div>
          <h1 className={styles.title}>{task.title}</h1>
          <p className={styles.subtitle}>
            Share your live link, repository, and notes so peers can review your solution in context.
          </p>
          {deadlineLabel ? (
            <p className={styles.subtitle}>
              Submission deadline: <strong>{deadlineLabel}</strong>
            </p>
          ) : null}
          <div className={styles.actions}>
            <Link href={`/task/${task._id}`} className={styles.secondaryAction} data-text="Back To Task"><span className={styles.buttonLabel}>Back To Task</span></Link>
            <Link href={`/task/${task._id}/submissions`} className={styles.secondaryAction} data-text="Submissions"><span className={styles.buttonLabel}>Submissions</span></Link>
          </div>
        </div>
        <div className={styles.criteriaCard}>
          <h2 className={styles.criteriaTitle}>Peers Will Review</h2>
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
                <span>Review Flow</span>
                <strong>Open-ended discussion</strong>
              </div>
            )}
          </div>
        </div>
      </section>

      <SubmitTaskForm task={task} />
    </main>
  );
}
