"use client";

import Image from "next/image";
import styles from "@/css/submission/SubmissionModal.module.css";
import { useSubmissionDiscussion } from "@/components/submission/SubmissionDiscussionProvider";
import { formatIstDate } from "@/utils/date.util";

const REVIEW_TEXT_WORD_LIMIT = 300;

function getWordCount(value = "") {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
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

function StarButton({ filled, onClick, label }) {
  return (
    <button type="button" className={filled ? styles.starFilled : styles.starOutline} onClick={onClick} aria-label={label}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.starIcon}>
        <path
          d="M12 3.75L14.55 8.92L20.25 9.75L16.12 13.78L17.1 19.45L12 16.77L6.9 19.45L7.88 13.78L3.75 9.75L9.45 8.92L12 3.75Z"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function ReviewSummary({ ratings = [] }) {
  return (
    <div className={styles.reviewSummaryList}>
      {ratings.map((rating) => (
        <div key={rating.label} className={styles.reviewSummaryItem}>
          <span>{rating.label}</span>
          <strong>{Number(rating.score || 0)}/5</strong>
        </div>
      ))}
    </div>
  );
}

function getInitials(name = "Peer") {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function getOverallScore(ratings = []) {
  return ratings.reduce((total, rating) => total + Number(rating.score || 0), 0);
}

function getAverageRating(ratings = []) {
  if (!ratings.length) {
    return "0.0";
  }

  return (getOverallScore(ratings) / ratings.length).toFixed(1);
}

export default function SubmissionModal() {
  const {
    activePanel,
    commentText,
    closeSubmission,
    currentUserId,
    isCommenting,
    isReviewing,
    likedComment,
    reviewComment,
    reviewScores,
    selectedSubmission,
    setActivePanel,
    setCommentText,
    setLikedComment,
    setReviewComment,
    setReviewScores,
    submitComment,
    submitReview,
    task,
    toggleLike,
  } = useSubmissionDiscussion();

  if (!selectedSubmission) {
    return null;
  }

  const canReview = Boolean(selectedSubmission.canReview);
  const canViewReviews = Boolean(selectedSubmission.canViewReviews);
  const isOwner = Boolean(selectedSubmission.isOwner);
  const likedByCurrentUser = Boolean(currentUserId && (selectedSubmission.likedBy || []).includes(currentUserId));
  const isCommentsPanel = activePanel === "comments";
  const likedWordCount = getWordCount(likedComment);
  const improveWordCount = getWordCount(reviewComment);
  const projectScore = Number(selectedSubmission.averageScoreOutOf10 || 0).toFixed(1);

  return (
    <div className={styles.backdrop} onClick={closeSubmission}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{isCommentsPanel ? "Comment Section" : isOwner ? "Submission Reviews" : "Peer Review"}</span>
            <h2 className={styles.title}>{selectedSubmission.userId?.name || "Peer Submission"}</h2>
            <p className={styles.subtitle}>
              {isCommentsPanel
                ? "Talk about the work like a real discussion feed. Drop a quick thought, question, or suggestion."
                : isOwner
                  ? "This is your submission. Read the reviews other peers left for you and track how they scored your work."
                  : "Read the submission, like it, and leave a structured review that helps the builder improve."}
            </p>
          </div>
          <button type="button" className={styles.closeButton} data-text="Close" onClick={closeSubmission}>
            <span className={styles.buttonLabel}>Close</span>
          </button>
        </div>

        <div className={styles.links}>
          <a href={selectedSubmission.projectLink} target="_blank" rel="noreferrer" className={styles.resourceLink}>
            Live Project
          </a>
          <a href={selectedSubmission.repoLink} target="_blank" rel="noreferrer" className={styles.resourceLink}>
            Repository
          </a>
          <button
            type="button"
            className={likedByCurrentUser ? styles.likeButtonActive : styles.likeButton}
            onClick={() => toggleLike(selectedSubmission._id)}
            aria-pressed={likedByCurrentUser}
          >
            <ThumbIcon filled={likedByCurrentUser} />
            <span>{likedByCurrentUser ? "Liked" : "Like"}</span>
          </button>
        </div>

        {(selectedSubmission.previewImages || []).length ? (
          <div className={styles.previewRow}>
            {selectedSubmission.previewImages.map((image) => (
              <div key={image} className={styles.previewItem}>
                <Image src={image} alt="Project preview" fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
            ))}
          </div>
        ) : null}

        <div className={styles.panelSwitch}>
          <button
            type="button"
            className={activePanel === "reviews" ? styles.switchButtonActive : styles.switchButton}
            onClick={() => setActivePanel("reviews")}
          >
            Reviews
          </button>
          <button
            type="button"
            className={isCommentsPanel ? styles.switchButtonActive : styles.switchButton}
            onClick={() => setActivePanel("comments")}
          >
            Comments
          </button>
        </div>

        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.composeTitle}>{isCommentsPanel ? "Comments" : isOwner ? "Reviews For Your Submission" : "Reviews"}</h3>
            <p className={styles.sectionCopy}>
              {isCommentsPanel
                ? "A real comment feed for quick peer discussion, just like a project social thread."
                : isOwner
                  ? "See exactly how other peers reviewed your work across every criterion."
                  : "See the criterion-wise scores and overall feedback for this submission."}
            </p>
          </div>
          <div className={styles.headerChips}>
            <span className={styles.countChip}>{isCommentsPanel ? `${selectedSubmission.commentCount || 0} comments` : `${selectedSubmission.reviewCount || 0} reviews`}</span>
            {!isCommentsPanel ? <span className={styles.projectScoreChip}>{projectScore}/10 project score</span> : null}
          </div>
        </div>

        {isCommentsPanel ? (
          <>
            <div className={styles.commentComposer}>
              <div className={styles.composerHeader}>
                <h3 className={styles.composeTitle}>Join The Discussion</h3>
                <p className={styles.sectionCopy}>Keep it short, clear, and helpful. Ask a question or point out something worth improving.</p>
              </div>
              <label className={styles.field}>
                <span>Add a comment</span>
                <textarea
                  rows={4}
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Type your comment here..."
                />
              </label>
              <button type="button" className={styles.submitButton} data-text={isCommenting ? "Posting Comment..." : "Post Comment"} onClick={submitComment} disabled={isCommenting}>
                <span className={styles.buttonLabel}>{isCommenting ? "Posting Comment..." : "Post Comment"}</span>
              </button>
            </div>

            <div className={styles.commentFeed}>
              {(selectedSubmission.comments || []).length ? (
                selectedSubmission.comments.map((comment) => (
                  <article key={comment._id || `${comment.commenterId?._id}-${comment.createdAt}`} className={styles.commentCard}>
                    <div className={styles.commentAvatar}>{getInitials(comment.commenterId?.name)}</div>
                    <div className={styles.commentBody}>
                      <div className={styles.commentMeta}>
                        <strong>{comment.commenterId?.name || "Peer"}</strong>
                        <span>{comment.createdAt ? formatIstDate(comment.createdAt) : "Just now"}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  </article>
                ))
              ) : (
                <div className={styles.emptyComments}>No comments yet. Start the conversation.</div>
              )}
            </div>
          </>
        ) : canViewReviews ? (
          <div className={styles.reviewList}>
            {(selectedSubmission.reviews || []).length ? (
              selectedSubmission.reviews.map((review, index) => (
                <article key={`${selectedSubmission._id}-review-${index}`} className={styles.reviewCard}>
                  <div className={styles.reviewHeaderBar}>
                    <div className={styles.reviewIdentity}>
                      <div className={styles.reviewAvatar}>{getInitials(review.reviewerId?.name)}</div>
                      <div className={styles.reviewIdentityCopy}>
                        <strong>{review.reviewerId?.name || "Reviewer"}</strong>
                        <span>{isOwner ? "Reviewed your submission" : "Peer review"}</span>
                      </div>
                    </div>
                    <div className={styles.reviewStatsColumn}>
                      <div className={styles.reviewSummaryChip}>{getOverallScore(review.ratings || [])} pts</div>
                      <div className={styles.averageChip}>Average {getAverageRating(review.ratings || [])}/5</div>
                    </div>
                  </div>
                  <ReviewSummary ratings={review.ratings || []} />
                  <div className={styles.reviewCopyGrid}>
                    <div className={styles.copyBlock}>
                      <span>What they liked</span>
                      <p>{review.whatYouLiked || "No highlight shared yet."}</p>
                    </div>
                    <div className={styles.copyBlock}>
                      <span>What can improve</span>
                      <p>{review.comment || "No improvement note shared yet."}</p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className={styles.emptyComments}>{isOwner ? "No one has reviewed your submission yet." : "No reviews yet. Start the first one."}</div>
            )}
          </div>
        ) : (
          <div className={styles.lockedReviews}>
            Submit your own review first to unlock the rest of the peer feedback on this submission.
          </div>
        )}

        {!isCommentsPanel && canReview ? (
          <div className={styles.reviewComposer}>
            <div className={styles.composerHeader}>
              <h3 className={styles.composeTitle}>Add Your Review</h3>
              <p className={styles.sectionCopy}>All ratings start from 0. Fill the stars you want, then keep both written sections within 300 words.</p>
            </div>
            <div className={styles.criteriaGrid}>
              {(task.review || []).map((criterion) => {
                const maxScore = Math.max(1, criterion.maxScore || 1);
                const currentScore = Number(reviewScores[criterion.label] || 0);

                return (
                  <div key={`${task._id}-${criterion.label}`} className={styles.criterionCard}>
                    <div className={styles.starHeader}>
                      <span className={styles.criterionLabel}>{criterion.label}</span>
                      <strong className={styles.scoreBadge}>{currentScore}/{maxScore}</strong>
                    </div>
                    <div className={styles.starsRow}>
                      {Array.from({ length: maxScore }, (_, index) => {
                        const starNumber = index + 1;
                        return (
                          <StarButton
                            key={`${criterion.label}-${starNumber}`}
                            filled={starNumber <= currentScore}
                            onClick={() =>
                              setReviewScores((current) => ({
                                ...current,
                                [criterion.label]: starNumber,
                              }))
                            }
                            label={`${criterion.label} ${starNumber} star`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <label className={styles.field}>
              <div className={styles.fieldHeader}>
                <span>What you liked</span>
                <span className={likedWordCount > REVIEW_TEXT_WORD_LIMIT ? styles.wordCountDanger : styles.wordCount}>{likedWordCount}/{REVIEW_TEXT_WORD_LIMIT} words</span>
              </div>
              <textarea
                rows={4}
                value={likedComment}
                onChange={(event) => setLikedComment(event.target.value)}
                placeholder="Mention the strongest part of the project, polish, structure, or decisions that stood out."
              />
            </label>
            <label className={styles.field}>
              <div className={styles.fieldHeader}>
                <span>What can improve</span>
                <span className={improveWordCount > REVIEW_TEXT_WORD_LIMIT ? styles.wordCountDanger : styles.wordCount}>{improveWordCount}/{REVIEW_TEXT_WORD_LIMIT} words</span>
              </div>
              <textarea
                rows={5}
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Be specific about issues, missing pieces, rough edges, and the next improvements to make."
              />
            </label>
            <button type="button" className={styles.submitButton} data-text={isReviewing ? "Posting Review..." : "Post Review"} onClick={submitReview} disabled={isReviewing || likedWordCount > REVIEW_TEXT_WORD_LIMIT || improveWordCount > REVIEW_TEXT_WORD_LIMIT}>
              <span className={styles.buttonLabel}>{isReviewing ? "Posting Review..." : "Post Review"}</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}


