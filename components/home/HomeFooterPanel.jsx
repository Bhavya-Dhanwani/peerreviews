import styles from "@/css/home/Hero.module.css";

export default function HomeFooterPanel({ taskCount = 0 }) {
  return (
    <section className={styles.footerPanel}>
      <article className={styles.footerMetricCard}>
        <span className={styles.metricLabel}>Open Review Threads</span>
        <strong className={styles.metricValue}>{taskCount}</strong>
        <p className={styles.metricText}>
          Every task becomes a project discussion room where peers submit, comment, like, and review.
        </p>
      </article>

      <article className={styles.footerStackCard}>
        <div className={styles.footerHeading}>
          <span className={styles.eyebrow}>How It Works</span>
          <h3 className={styles.footerTitle}>A simple loop for better builds</h3>
          <p className={styles.footerCopy}>
            Discuss projects, review peer submissions, and improve each build together.
          </p>
          <p className={styles.footerSubCopy}>
            Pick a task, study the brief, submit your project, then join the discussion around how others approached the same problem.
          </p>
        </div>

        <div className={styles.stackRow}>
          <span>1</span>
          <p>Read the brief and understand the review criteria before you build.</p>
        </div>
        <div className={styles.stackRow}>
          <span>2</span>
          <p>Submit your live link, repository, and preview images when your project is ready.</p>
        </div>
        <div className={styles.stackRow}>
          <span>3</span>
          <p>Review other submissions, discuss tradeoffs, and improve the overall project quality together.</p>
        </div>
      </article>
    </section>
  );
}
