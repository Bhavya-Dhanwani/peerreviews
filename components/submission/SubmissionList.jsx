"use client";

import SubmissionCard from "@/components/submission/SubmissionCard";
import { useSubmissionDiscussion } from "@/components/submission/SubmissionDiscussionProvider";
import styles from "@/css/submission/SubmissionList.module.css";

export default function SubmissionList() {
  const { filteredSubmissions } = useSubmissionDiscussion();

  if (!filteredSubmissions.length) {
    return <div className={styles.empty}>No submissions match this discussion view.</div>;
  }

  return (
    <section className={styles.section}>
      <div className={styles.list}>
        {filteredSubmissions.map((submission) => (
          <SubmissionCard key={submission._id} submission={submission} />
        ))}
      </div>
    </section>
  );
}
