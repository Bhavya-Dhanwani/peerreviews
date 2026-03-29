"use client";

import styles from "@/css/submission/SubmissionToolbar.module.css";
import { useSubmissionDiscussion } from "@/components/submission/SubmissionDiscussionProvider";

export default function SubmissionToolbar() {
  const { search, setSearch, sortBy, setSortBy, filteredSubmissions } = useSubmissionDiscussion();

  return (
    <section className={styles.section}>
      <div className={styles.toolbar}>
        <label className={styles.field}>
          <span>Search</span>
          <input
            type="text"
            placeholder="Search by peer or project link"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest</option>
            <option value="likes">Most liked</option>
            <option value="rating">Highest rated</option>
          </select>
        </label>

        <div className={styles.countCard}>
          <span>Visible Threads</span>
          <strong>{filteredSubmissions.length}</strong>
        </div>
      </div>
    </section>
  );
}
