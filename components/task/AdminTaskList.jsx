"use client";

import Link from "next/link";
import styles from "@/css/task/AdminTaskList.module.css";

export default function AdminTaskList({ tasks = [], editingTaskId, onEditTask, onDeleteTask }) {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>All Tasks</span>
          <h2 className={styles.title}>Manage live and scheduled task briefs</h2>
        </div>
      </div>

      <div className={styles.list}>
        {tasks.length ? (
          tasks.map((task) => {
            const scheduled = Boolean(task.isScheduled);
            const active = editingTaskId === task._id;

            return (
              <article
                key={task._id}
                className={`${styles.card} ${active ? styles.cardActive : ""}`}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardMeta}>
                      <span className={`${styles.statusChip} ${scheduled ? styles.scheduled : styles.live}`}>
                        {scheduled ? "Scheduled" : "Live"}
                      </span>
                      <span className={styles.dateChip}>{formatDate(task.startDate)}</span>
                    </div>
                    <h3 className={styles.cardTitle}>{task.title}</h3>
                  </div>
                  <span className={styles.countChip}>{task.review?.length || 0} criteria</span>
                </div>

                <p className={styles.cardText}>
                  {task.description_md?.trim()
                    ? task.description_md.replace(/[#*_`>-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
                    : "No task brief added yet."}
                </p>

                <div className={styles.tags}>
                  {(task.tags || []).length ? (
                    task.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className={styles.tagMuted}>No tags</span>
                  )}
                </div>

                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => onEditTask(task._id)}>
                    Edit
                  </button>
                  <Link href={`/task/${task._id}`} className={styles.linkButton}>
                    Open
                  </Link>
                  <button type="button" className={styles.dangerButton} onClick={() => onDeleteTask(task._id)}>
                    Delete
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <h3>No tasks yet</h3>
            <p>Create the first task and it will appear here for editing and scheduling.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) {
    return "No start date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
