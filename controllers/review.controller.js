import Submission from "@/models/submission.model";
import ExpressError from "@/utils/ExpressError.util";
import decodeJWT from "@/utils/decodeJWT.util";

// Submit a review on a submission
export async function createReview(req) {
  const currentUser = await decodeJWT();

  if (!currentUser) {
    throw new ExpressError("Please log in to submit a review.", 401);
  }

  const body = await req.json();
  const { submissionId, ratings, comment } = body;

  if (!submissionId || !ratings || !Array.isArray(ratings)) {
    throw new ExpressError("Submission ID and ratings array are required.", 400);
  }

  const submission = await Submission.findById(submissionId);

  if (!submission) {
    throw new ExpressError("Submission not found.", 404);
  }

  // Prevent reviewing your own submission
  if (submission.userId.toString() === currentUser.id.toString()) {
    throw new ExpressError("You cannot review your own submission.", 400);
  }

  // Prevent duplicate reviews from the same user
  const alreadyReviewed = submission.reviews.some(
    (review) => review.reviewerId?.toString() === currentUser.id.toString()
  );

  if (alreadyReviewed) {
    throw new ExpressError("You have already reviewed this submission.", 400);
  }

  submission.reviews.push({
    reviewerId: currentUser.id,
    ratings,
    comment: comment || "",
  });

  await submission.save();

  return {
    statusCode: 201,
    message: "Review submitted successfully.",
    data: submission.reviews[submission.reviews.length - 1],
  };
}

// Get all reviews for a submission
export async function getReviews(req) {
  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get("submissionId");

  if (!submissionId) {
    throw new ExpressError("submissionId query parameter is required.", 400);
  }

  const submission = await Submission.findById(submissionId)
    .select("reviews")
    .populate("reviews.reviewerId", "name avatar");

  if (!submission) {
    throw new ExpressError("Submission not found.", 404);
  }

  return {
    message: "Reviews fetched successfully.",
    data: submission.reviews,
  };
}
