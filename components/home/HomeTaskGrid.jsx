import TaskCard from "@/components/home/TaskCard";
import styles from "@/css/home/TaskGrid.module.css";

export default function HomeTaskGrid({ tasks = [] }) {
  return (
    <section id="tasks" className={styles.section}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Live Tasks</span>
          <h2 className={styles.title}>Choose a task and enter its discussion thread</h2>
        </div>
        <p className={styles.subtitle}>
          The homepage stays focused on tasks only. Submission and review flows now live on their own pages.
        </p>
      </div>

      {tasks.length ? (
        <div className={styles.grid}>
          {tasks.map((task, index) => (
            <TaskCard key={task._id} task={task} index={index} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No tasks are available yet.</div>
      )}
    </section>
  );
}
