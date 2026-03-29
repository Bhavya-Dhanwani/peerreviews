import Link from "next/link";
import AdminTaskManager from "@/components/task/AdminTaskManager";
import styles from "@/css/task/AdminTaskPage.module.css";

export default function AdminTaskPage({ currentUser, initialTasks = [] }) {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCard}>
          <div className={styles.topBar}>
            <Link href="/" className={styles.homeLink}>
              Home
            </Link>
            <span className={styles.eyebrow}>Admin Panel</span>
          </div>
          <h1 className={styles.title}>Plan, schedule, and manage peer review tasks</h1>
          <p className={styles.subtitle}>
            Create polished task briefs, schedule them up to one week ahead, and keep future tasks visible only to admins until they go live.
          </p>
          <div className={styles.metaRow}>
            <span className={styles.metaChip}>{currentUser.name}</span>
            <span className={styles.metaChip}>Admin Access</span>
            <span className={styles.metaChip}>{initialTasks.length} total tasks</span>
          </div>
        </div>
      </section>

      <AdminTaskManager initialTasks={initialTasks} />
    </main>
  );
}
