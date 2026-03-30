"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import styles from "@/css/task/AdminTaskForm.module.css";
import {
  getScheduleBounds,
  getDateInputValue,
  getMinimumSubmissionDeadlineDate,
} from "@/utils/taskSchedule.util";

const DEFAULT_REVIEW = [
  { label: "Folder Structure", maxScore: 5 },
  { label: "UI/UX", maxScore: 5 },
  { label: "Code Quality", maxScore: 5 },
  { label: "Readme Quality", maxScore: 5 },
  { label: "Code Optimization", maxScore: 5 },
];

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

export default function AdminTaskForm({ task = null, onSaved, onCancelEdit }) {
  const review = useMemo(() => task?.review?.length ? task.review : DEFAULT_REVIEW, [task]);
  const bounds = useMemo(() => getScheduleBounds(), []);
  const [form, setForm] = useState(() => createInitialForm(task, bounds));
  const [isSubmitting, startSubmitTransition] = useTransition();
  const isEditing = Boolean(task?._id);
  const minSubmissionDeadlineValue = useMemo(
    () => getDateInputValue(getMinimumSubmissionDeadlineDate(form.startDate || bounds.minDateValue)),
    [bounds.minDateValue, form.startDate]
  );

  function updateField(field, value) {
    setForm((current) => {
      if (field === "startDate") {
        const nextMinDeadlineValue = getDateInputValue(
          getMinimumSubmissionDeadlineDate(value || bounds.minDateValue)
        );

        return {
          ...current,
          startDate: value,
          submissionDeadline:
            current.submissionDeadline && current.submissionDeadline >= nextMinDeadlineValue
              ? current.submissionDeadline
              : nextMinDeadlineValue,
        };
      }

      return { ...current, [field]: value };
    });
  }

  function resetForm() {
    setForm(createInitialForm(task, bounds));
  }

  function handleSubmit(event) {
    event.preventDefault();

    startSubmitTransition(async () => {
      try {
        const endpoint = isEditing ? `/api/tasks/${task._id}` : "/api/tasks";
        const response = await fetch(endpoint, {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: form.title,
            description_md: form.description_md,
            difficulty: form.difficulty,
            startDate: form.startDate,
            submissionDeadline: form.submissionDeadline,
            tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
            review: review.filter((item) => item.label.trim()),
          }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || `Unable to ${isEditing ? "update" : "create"} task.`);
        }

        onSaved?.(serializeClientTask(result.data), isEditing ? "edit" : "create");

        if (!isEditing) {
          resetForm();
        }
      } catch (error) {
        toast.error(error.message || "Unable to save task right now.");
      }
    });
  }

  return (
    <section className={styles.section}>
      <div className={styles.formShell}>
          <div className={styles.formHeader}>
            <div>
              <span className={styles.eyebrow}>{isEditing ? "Edit Task" : "Create Task"}</span>
              <h2 className={styles.title}>{isEditing ? "Refine an existing task" : "Publish a new review brief"}</h2>
              {isEditing ? <p className={styles.editingCopy}>Currently editing: {task.title}</p> : null}
            </div>
            {isEditing ? (
              <button type="button" className={styles.ghostButton} onClick={onCancelEdit}>
                Cancel Edit
              </button>
            ) : null}
          </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Task Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Design a peer review discussion platform"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Difficulty</span>
              <select
                value={form.difficulty}
                onChange={(event) => updateField("difficulty", event.target.value)}
              >
                {DIFFICULTY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Tags</span>
              <input
                type="text"
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                placeholder="nextjs, mongodb, peer-review"
              />
            </label>

            <label className={styles.field}>
              <span>Start Date</span>
              <input
                type="date"
                min={bounds.minDateValue}
                max={bounds.maxDateValue}
                value={form.startDate}
                onChange={(event) => updateField("startDate", event.target.value)}
                required
              />
            </label>
          </div>

          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Submission Deadline</span>
              <input
                type="date"
                min={minSubmissionDeadlineValue}
                value={form.submissionDeadline}
                onChange={(event) => updateField("submissionDeadline", event.target.value)}
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Task Description (Markdown)</span>
            <textarea
              rows={11}
              value={form.description_md}
              onChange={(event) => updateField("description_md", event.target.value)}
              placeholder="# Objective&#10;Explain what peers should review, what to submit, and how discussions should work."
            />
          </label>

          <div className={styles.schemaBlock}>
            <div className={styles.schemaHeader}>
              <div>
                <h3 className={styles.schemaTitle}>Review Schema</h3>
                <p className={styles.schemaNote}>This fixed rubric keeps every task consistent for peer reviews.</p>
              </div>
              <div className={styles.scoreLegend}>5 marks each</div>
            </div>

            <div className={styles.criteriaList}>
              {review.map((item) => (
                <div key={item.label} className={styles.criterionRow}>
                  <input
                    type="text"
                    value={item.label}
                    readOnly
                    aria-label={`${item.label} criterion`}
                  />
                  <input
                    type="number"
                    min="5"
                    max="5"
                    step="1"
                    value={item.maxScore}
                    readOnly
                    className={styles.scoreInput}
                    aria-label={`${item.label} max score`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
              {isSubmitting ? (isEditing ? "Updating Task..." : "Publishing Task...") : (isEditing ? "Save Changes" : "Publish Task")}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={resetForm} disabled={isSubmitting}>
              {isEditing ? "Reset Changes" : "Reset Form"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function createInitialForm(task, bounds) {
  const startDate = getBoundedStartDate(task?.startDate, bounds);
  const minimumDeadlineValue = getDateInputValue(getMinimumSubmissionDeadlineDate(startDate || bounds.minDateValue));
  const existingDeadlineValue = task?.submissionDeadline ? getDateInputValue(task.submissionDeadline) : "";

  return {
    title: task?.title || "",
    description_md: task?.description_md || "",
    difficulty: task?.difficulty || DIFFICULTY_OPTIONS[0],
    tags: Array.isArray(task?.tags) ? task.tags.join(", ") : "",
    startDate,
    submissionDeadline:
      existingDeadlineValue && existingDeadlineValue >= minimumDeadlineValue
        ? existingDeadlineValue
        : minimumDeadlineValue,
  };
}

function getBoundedStartDate(value, bounds) {
  const formatted = value ? getDateInputValue(value) : "";

  if (!formatted) {
    return bounds.minDateValue;
  }

  if (formatted < bounds.minDateValue) {
    return bounds.minDateValue;
  }

  if (formatted > bounds.maxDateValue) {
    return bounds.maxDateValue;
  }

  return formatted;
}

function serializeClientTask(task = {}) {
  return {
    _id: String(task._id || ""),
    title: task.title || "",
    description_md: task.description_md || "",
    difficulty: task.difficulty || DIFFICULTY_OPTIONS[0],
    tags: Array.isArray(task.tags) ? task.tags : [],
    review: Array.isArray(task.review) ? task.review : DEFAULT_REVIEW,
    startDate: task.startDate ? new Date(task.startDate).toISOString() : null,
    submissionDeadline: task.submissionDeadline ? new Date(task.submissionDeadline).toISOString() : null,
    isScheduled: task.startDate ? new Date(task.startDate) > new Date() : false,
    createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : new Date().toISOString(),
  };
}
