import Link from "next/link";
import SubmissionDiscussionProvider from "@/components/submission/SubmissionDiscussionProvider";
import SubmissionToolbar from "@/components/submission/SubmissionToolbar";
import SubmissionList from "@/components/submission/SubmissionList";
import SubmissionModal from "@/components/submission/SubmissionModal";
import styles from "@/css/submission/TaskSubmissionsPage.module.css";

export default function TaskSubmissionsPage({ task, initialSubmissions, currentUser = null }) {
  return (
    <SubmissionDiscussionProvider task={task} initialSubmissions={initialSubmissions} currentUser={currentUser}>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCard}>
            <div className={styles.topBar}>
              <div className={styles.breadcrumbs}>
                <Link href="/" className={styles.homeLink}>
                  Home
                </Link>
                <Link href={`/task/${task._id}`} className={styles.crumbLink}>
                  Task
                </Link>
              </div>
              <span className={styles.eyebrow}>Project Discussions</span>
            </div>
            <h1 className={styles.title}>{task.title}</h1>
            <p className={styles.subtitle}>
              Browse every peer submission for this task, react to the work, and open the full review discussion inside the modal thread.
            </p>
            <div className={styles.actions}>
              <Link href={`/task/${task._id}`} className={styles.secondaryAction} data-text="Back To Task"><span className={styles.buttonLabel}>Back To Task</span></Link>
              <Link href={`/task/${task._id}/submit`} className={styles.primaryAction} data-text="Submit Your Project"><span className={styles.buttonLabel}>Submit Your Project</span></Link>
            </div>
          </div>
        </section>

        <SubmissionToolbar />
        <SubmissionList />
        <SubmissionModal />
      </main>
    </SubmissionDiscussionProvider>
  );
}
