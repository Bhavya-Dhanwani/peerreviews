import { isTaskScheduled } from "@/utils/taskSchedule.util";

function getSubmissionReviewMeta(submission = {}, currentUser = null) {
  const currentUserId = String(currentUser?.id || "");
  const ownerId =
    typeof submission.userId === "object" && submission.userId?._id
      ? String(submission.userId._id)
      : String(submission.userId || "");
  const reviewEntries = Array.isArray(submission.reviews) ? submission.reviews : [];
  const hasReviewed = Boolean(
    currentUserId &&
      reviewEntries.some((review) => {
        const reviewerId =
          typeof review?.reviewerId === "object" && review.reviewerId?._id
            ? String(review.reviewerId._id)
            : String(review?.reviewerId || "");
        return reviewerId === currentUserId;
      })
  );
  const isOwner = Boolean(currentUserId && ownerId === currentUserId);
  const isAdmin = currentUser?.role === "admin";
  const canViewReviews = Boolean(isOwner || hasReviewed || isAdmin);
  const canReview = Boolean(currentUserId && !isOwner && !hasReviewed && !isAdmin);
  const reviewCount = reviewEntries.length;
  const ratingTotal = reviewEntries.reduce(
    (total, review) =>
      total +
      (Array.isArray(review?.ratings)
        ? review.ratings.reduce((sum, rating) => sum + Number(rating?.score || 0), 0)
        : 0),
    0
  );
  const maxRatingTotal = reviewEntries.reduce(
    (total, review) =>
      total +
      (Array.isArray(review?.ratings)
        ? review.ratings.reduce((sum) => sum + 5, 0)
        : 0),
    0
  );
  const averageScoreOutOf10 = maxRatingTotal
    ? Number(((ratingTotal / maxRatingTotal) * 10).toFixed(1))
    : 0;

  return {
    averageScoreOutOf10,
    canViewReviews,
    canReview,
    hasReviewed,
    isOwner,
    maxRatingTotal,
    reviewCount,
    ratingTotal,
  };
}

export function serializeTask(task = {}) {
  return {
    _id: String(task._id || ""),
    title: task.title || "",
    description_md: task.description_md || "",
    difficulty: task.difficulty || "",
    tags: Array.isArray(task.tags) ? task.tags : [],
    review: Array.isArray(task.review)
      ? task.review.map((criterion) => ({
          label: criterion?.label || "",
          maxScore: Number(criterion?.maxScore || 0),
        }))
      : [],
    startDate: task.startDate ? new Date(task.startDate).toISOString() : null,
    isScheduled: isTaskScheduled(task),
    createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : null,
  };
}

export function serializeSubmission(submission = {}, currentUser = null) {
  const reviewMeta = getSubmissionReviewMeta(submission, currentUser);
  const reviewEntries = Array.isArray(submission.reviews) ? submission.reviews : [];
  const commentEntries = Array.isArray(submission.comments) ? submission.comments : [];

  return {
    _id: String(submission._id || ""),
    taskId:
      typeof submission.taskId === "object" && submission.taskId?._id
        ? String(submission.taskId._id)
        : String(submission.taskId || ""),
    task:
      typeof submission.taskId === "object" && submission.taskId
        ? {
            _id: String(submission.taskId._id || ""),
            title: submission.taskId.title || "",
          }
        : null,
    userId:
      typeof submission.userId === "object" && submission.userId
        ? {
            _id: String(submission.userId._id || ""),
            name: submission.userId.name || "",
            avatar: submission.userId.avatar || "",
          }
        : {
            _id: String(submission.userId || ""),
            name: "",
            avatar: "",
          },
    projectLink: submission.projectLink || "",
    repoLink: submission.repoLink || "",
    previewImages: Array.isArray(submission.previewImages) ? submission.previewImages : [],
    likedBy: Array.isArray(submission.likedBy)
      ? submission.likedBy.map((entry) =>
          typeof entry === "object" && entry?._id ? String(entry._id) : String(entry || "")
        )
      : [],
    reviews: reviewMeta.canViewReviews
      ? reviewEntries.map((review) => ({
          reviewerId:
            typeof review?.reviewerId === "object" && review.reviewerId
              ? {
                  _id: String(review.reviewerId._id || ""),
                  name: review.reviewerId.name || review?.reviewerName || "",
                  avatar: review.reviewerId.avatar || review?.reviewerAvatar || "",
                }
              : {
                  _id: String(review?.reviewerId || ""),
                  name: review?.reviewerName || "",
                  avatar: review?.reviewerAvatar || "",
                },
          ratings: Array.isArray(review?.ratings)
            ? review.ratings.map((rating) => ({
                label: rating?.label || "",
                score: Number(rating?.score || 0),
              }))
            : [],
          whatYouLiked: review?.whatYouLiked || "",
          comment: review?.comment || "",
        }))
      : [],
    comments: commentEntries.map((comment) => ({
      _id: String(comment?._id || ""),
      commenterId:
        typeof comment?.commenterId === "object" && comment.commenterId
          ? {
              _id: String(comment.commenterId._id || ""),
              name: comment.commenterId.name || "",
              avatar: comment.commenterId.avatar || "",
            }
          : {
              _id: String(comment?.commenterId || ""),
              name: "",
              avatar: "",
            },
      text: comment?.text || "",
      createdAt: comment?.createdAt ? new Date(comment.createdAt).toISOString() : null,
    })),
    canViewReviews: reviewMeta.canViewReviews,
    canReview: reviewMeta.canReview,
    hasReviewed: reviewMeta.hasReviewed,
    isOwner: reviewMeta.isOwner,
    reviewCount: reviewMeta.reviewCount,
    ratingTotal: reviewMeta.ratingTotal,
    averageScoreOutOf10: reviewMeta.averageScoreOutOf10,
    commentCount: commentEntries.length,
    createdAt: submission.createdAt ? new Date(submission.createdAt).toISOString() : null,
  };
}
