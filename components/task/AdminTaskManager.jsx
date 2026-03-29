"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import AdminTaskForm from "@/components/task/AdminTaskForm";
import AdminTaskList from "@/components/task/AdminTaskList";
import styles from "@/css/task/AdminTaskManager.module.css";

export default function AdminTaskManager({ initialTasks = [] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const editingTask = useMemo(
    () => tasks.find((task) => task._id === editingTaskId) || null,
    [editingTaskId, tasks]
  );

  function handleSaved(savedTask, mode) {
    setTasks((current) => {
      if (mode === "edit") {
        return current
          .map((task) => (task._id === savedTask._id ? savedTask : task))
          .sort(sortTasks);
      }

      return [savedTask, ...current].sort(sortTasks);
    });

    setEditingTaskId(savedTask._id);
    toast.success(mode === "edit" ? "Task updated." : "Task created.");
  }

  async function handleDelete(taskId) {
    const target = tasks.find((task) => task._id === taskId);

    if (!target) {
      return;
    }

    const confirmed = window.confirm(`Delete "${target.title}"? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete task.");
      }

      setTasks((current) => current.filter((task) => task._id !== taskId));
      setEditingTaskId((current) => (current === taskId ? null : current));
      toast.success("Task deleted.");
    } catch (error) {
      toast.error(error.message || "Unable to delete task right now.");
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.column}>
        <AdminTaskForm
          key={editingTask?._id || "create-task"}
          task={editingTask}
          onSaved={handleSaved}
          onCancelEdit={() => setEditingTaskId(null)}
        />
      </div>

      <div className={styles.column}>
        <AdminTaskList
          tasks={tasks}
          editingTaskId={editingTaskId}
          onEditTask={setEditingTaskId}
          onDeleteTask={handleDelete}
        />
      </div>
    </section>
  );
}

function sortTasks(left, right) {
  const leftDate = new Date(left.startDate || left.createdAt || 0).getTime();
  const rightDate = new Date(right.startDate || right.createdAt || 0).getTime();

  if (leftDate !== rightDate) {
    return leftDate - rightDate;
  }

  return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime();
}
