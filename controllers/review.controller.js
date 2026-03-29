import Submission from "@/models/submission.model";
import ExpressError from "@/utils/ExpressError.util";
import decodeJWT from "@/utils/decodeJWT.util";
import { serializeSubmission } from "@/utils/discussionData.util";

const REVIEW_TEXT_WORD_LIMIT = 300;

function countWords(value = "") {
  return String(value).trim().split(/\s+/).filter(Boolean).length;
}

function validateReviewText(value, label) {
  if (countWords(value) > REVIEW_TEXT_WORD_LIMIT) {
    throw new ExpressError(`${label} must be ${REVIEW_TEXT_WORD_LIMIT} words or fewer.`, 400);
  }
}

function formatReviewResponse(review = {}) {
  return {
    reviewerId: {
      _id: String(review.reviewerId?._id || review.reviewerId || ""),
      name: review.reviewerId?.name || review.reviewerName || "",
      avatar: review.reviewerId?.avatar || review.reviewerAvatar || "",
    },
    ratings: Array.isArray(review.ratings)
      ? review.ratings.map((rating) => ({
          label: rating?.label || "",
          score: Number(rating?.score || 0),
        }))
      : [],
    whatYouLiked: review.whatYouLiked || "",
    comment: review.comment || "",
  };
}

export async function createReview(req) {
  const currentUser = await decodeJWT();

  if (!currentUser) {
    throw new ExpressError("Please log in to submit a review.", 401);
  }

  const body = await req.json();
  const { submissionId, ratings, comment, whatYouLiked } = body;

  if (!submissionId || !ratings || !Array.isArray(ratings)) {
    throw new ExpressError("Submission ID and ratings array are required.", 400);
  }

  validateReviewText(whatYouLiked, "What you liked");
  validateReviewText(comment, "What can improve");

  const submission = await Submission.findById(submissionId).populate("reviews.reviewerId", "name avatar");

  if (!submission) {
    throw new ExpressError("Submission not found.", 404);
  }

  if (submission.userId.toString() === currentUser.id.toString()) {
    throw new ExpressError("You cannot review your own submission.", 400);
  }

  const alreadyReviewed = submission.reviews.some(
    (review) => review.reviewerId?._id?.toString() === currentUser.id.toString() || review.reviewerId?.toString?.() === currentUser.id.toString()
  );

  if (alreadyReviewed) {
    throw new ExpressError("You have already reviewed this submission.", 400);
  }

  submission.reviews.push({
    reviewerId: currentUser.id,
    reviewerName: currentUser.name || "",
    reviewerAvatar: currentUser.avatar || "",
    ratings,
    whatYouLiked: whatYouLiked || "",
    comment: comment || "",
  });

  await submission.save();
  await submission.populate("reviews.reviewerId", "name avatar");

  const reviewCount = submission.reviews.length;
  const ratingTotal = submission.reviews.reduce(
    (total, review) =>
      total +
      (Array.isArray(review.ratings)
        ? review.ratings.reduce((sum, rating) => sum + Number(rating.score || 0), 0)
        : 0),
    0
  );

  return {
    statusCode: 201,
    message: "Review submitted successfully.",
    data: {
      reviews: submission.reviews.map(formatReviewResponse),
      reviewCount,
      ratingTotal,
    },
  };
}

export async function getReviews(req) {
  const currentUser = await decodeJWT();
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submissionId");

  if (!submissionId) {
    throw new ExpressError("submissionId query parameter is required.", 400);
  }

  const submission = await Submission.findById(submissionId)
    .select("reviews userId likedBy taskId createdAt projectLink repoLink previewImages")
    .populate("reviews.reviewerId", "name avatar");

  if (!submission) {
    throw new ExpressError("Submission not found.", 404);
  }

  const serializedSubmission = serializeSubmission(submission, currentUser);

  if (!serializedSubmission.canViewReviews) {
    throw new ExpressError("Submit your review first to unlock other peer reviews.", 403);
  }

  return {
    message: "Reviews fetched successfully.",
    data: serializedSubmission.reviews,
  };
}
