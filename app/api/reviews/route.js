import { createReview, getReviews } from "@/controllers/review.controller";
import apiHandler from "@/utils/api.middleware";

/**
 * @route POST /api/reviews
 * @description Submit a review on a submission
 * @access Private
 */
export const POST = apiHandler(createReview);

/**
 * @route GET /api/reviews?submissionId=
 * @description Get all reviews for a submission
 * @access Public
 */
export const GET = apiHandler(getReviews);
