"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import styles from "@/css/submission/SubmitTaskForm.module.css";

async function uploadImages(files) {
  const uploads = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Unable to upload preview image.");
    }

    uploads.push(result.url);
  }

  return uploads;
}

export default function SubmitTaskForm({ task }) {
  const router = useRouter();
  const [form, setForm] = useState({
    projectLink: "",
    repoLink: "",
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, startSubmitTransition] = useTransition();

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    startSubmitTransition(async () => {
      try {
        const previewImages = files.length ? await uploadImages(files) : [];
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            taskId: task._id,
            projectLink: form.projectLink,
            repoLink: form.repoLink,
            previewImages,
          }),
        });
        const result = await response.json();

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to submit this project.");
        }

        toast.success("Project submitted. Your discussion thread is live.");
        router.push(`/task/${task._id}/submissions`);
        router.refresh();
      } catch (error) {
        toast.error(error.message || "Unable to submit right now.");
      }
    });
  }

  const submitLabel = isSubmitting ? "Publishing..." : "Publish Submission";

  return (
    <section className={styles.section}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Live Project Link</span>
          <input
            type="url"
            placeholder="https://your-project.com"
            value={form.projectLink}
            onChange={(event) => updateField("projectLink", event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Repository Link</span>
          <input
            type="url"
            placeholder="https://github.com/you/project"
            value={form.repoLink}
            onChange={(event) => updateField("repoLink", event.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Preview Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 2))}
          />
          <small>Add up to two screenshots so peers can quickly understand your UI.</small>
        </label>

        <button type="submit" className={styles.submitButton} data-text={submitLabel} disabled={isSubmitting}>
          <span className={styles.buttonLabel}>{submitLabel}</span>
        </button>
      </form>
    </section>
  );
}
