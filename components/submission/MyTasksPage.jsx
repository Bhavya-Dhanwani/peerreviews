import Link from "next/link";
import styles from "@/css/submission/MyTasksPage.module.css";
import { formatIstDate } from "@/utils/date.util";

function formatDate(value) {
  return value ? formatIstDate(value) : "Unknown date";
}

export default function MyTasksPage({ currentUser, submissions = [] }) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <div className={styles.topBar}>
            <div className={styles.breadcrumbs}>
              <Link href="/" className={styles.homeLink}>
                Home
              </Link>
              <Link href="/#tasks" className={styles.crumbLink}>
                Tasks
              </Link>
            </div>
            <span className={styles.eyebrow}>My Tasks</span>
          </div>
          <h1 className={styles.title}>Your submitted projects and review threads</h1>
          <p className={styles.subtitle}>
            Track every project you have posted, jump back into the discussion, and see how many peer reviews each submission has received.
          </p>
          <div className={styles.metaRow}>
            <span className={styles.metaChip}>{currentUser.name}</span>
            <span className={styles.metaChip}>{submissions.length} submissions</span>
          </div>
        </div>
      </section>

      {submissions.length ? (
        <section className={styles.grid}>
          {submissions.map((submission) => (
            <article key={submission._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <h2 className={styles.cardTitle}>{submission.task?.title || "Task"}</h2>
                  <p className={styles.cardDate}>{formatDate(submission.createdAt)}</p>
                </div>
                <div className={styles.statGroup}>
                  <span className={styles.statChip}>{submission.reviewCount || 0} reviews</span>
                  <span className={styles.statChip}>{submission.commentCount || 0} comments</span>
                </div>
              </div>

              <div className={styles.linkRow}>
                <a href={submission.projectLink} target="_blank" rel="noreferrer" className={styles.secondaryAction} data-text="Live Project"><span className={styles.buttonLabel}>Live Project</span></a>
                <a href={submission.repoLink} target="_blank" rel="noreferrer" className={styles.secondaryAction} data-text="Repository"><span className={styles.buttonLabel}>Repository</span></a>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className={styles.emptyState}>
          <p>You have not submitted any task yet.</p>
          <Link href="/#tasks" className={styles.primaryAction} data-text="Browse Tasks"><span className={styles.buttonLabel}>Browse Tasks</span></Link>
        </section>
      )}
    </main>
  );
}
