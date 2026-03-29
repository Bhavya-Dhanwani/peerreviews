"use client";

import styles from "@/css/submission/SubmissionCard.module.css";
import { useSubmissionDiscussion } from "@/components/submission/SubmissionDiscussionProvider";
import { formatIstDate } from "@/utils/date.util";

function getInitials(name = "Peer") {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function ThumbIcon({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.thumbIcon}>
      <path
        d="M9 10V21H5C4.45 21 4 20.55 4 20V11C4 10.45 4.45 10 5 10H9ZM11 21H17.26C17.93 21 18.5 20.58 18.72 19.95L20.74 14.3C20.82 14.11 20.86 13.91 20.86 13.7V12C20.86 10.9 19.96 10 18.86 10H14L14.81 6.11C14.84 5.96 14.86 5.81 14.86 5.65C14.86 5.24 14.69 4.85 14.42 4.58L13.36 3.53L6.78 10.12C6.29 10.61 6 11.29 6 12V19C6 20.1 6.9 21 8 21H11Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SubmissionCard({ submission }) {
  const { currentUserId, openSubmission, toggleLike } = useSubmissionDiscussion();
  const likedByCurrentUser = Boolean(currentUserId && (submission.likedBy || []).includes(currentUserId));
  const reviewActionLabel = submission.isOwner ? "See Reviews" : "Review";
  const projectScore = Number(submission.averageScoreOutOf10 || 0).toFixed(1);

  return (
    <article className={styles.card}>
      <div className={styles.identity}>
        <div className={styles.avatar}>{getInitials(submission.userId?.name)}</div>
        <div>
          <h3 className={styles.name}>{submission.userId?.name || "Anonymous Peer"}</h3>
          <p className={styles.meta}>{submission.createdAt ? formatIstDate(submission.createdAt) : "Unknown date"}</p>
        </div>
      </div>

      <div className={styles.linkRow}>
        <a href={submission.projectLink} target="_blank" rel="noreferrer" className={styles.linkChip}>
          Live Project
        </a>
        <a href={submission.repoLink} target="_blank" rel="noreferrer" className={styles.linkChip}>
          Repository
        </a>
        {(submission.previewImages || []).length ? <span className={styles.linkChip}>{submission.previewImages.length} images</span> : null}
      </div>

      <div className={styles.metrics}>
        <div className={styles.leftMetrics}>
          <span>{submission.likedBy?.length || 0} likes</span>
          <span>{submission.commentCount || 0} comments</span>
        </div>
        <div className={styles.rightMetrics}>
          <span className={styles.reviewMetric}>{submission.reviewCount || 0} reviews</span>
          <span className={styles.scoreMetric}>{projectScore}/10 score</span>
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.supportActions}>
          <button
            type="button"
            className={likedByCurrentUser ? styles.likeButtonActive : styles.likeButton}
            onClick={() => toggleLike(submission._id)}
            aria-pressed={likedByCurrentUser}
          >
            <ThumbIcon filled={likedByCurrentUser} />
            <span>{likedByCurrentUser ? "Liked" : "Like"}</span>
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            data-text="Comment"
            onClick={() => openSubmission(submission, "comments")}
          >
            <span className={styles.buttonLabel}>Comment</span>
          </button>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          data-text={reviewActionLabel}
          onClick={() => openSubmission(submission, "reviews")}
        >
          <span className={styles.buttonLabel}>{reviewActionLabel}</span>
        </button>
      </div>
    </article>
  );
}
