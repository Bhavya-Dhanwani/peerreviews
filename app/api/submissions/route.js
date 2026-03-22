import { createSubmission, getAllSubmissions } from "@/controllers/submission.controller";
import apiHandler from "@/utils/api.middleware";

/**
 * @route GET /api/submissions
 * @description Get all submissions (can be filtered by taskId)
 * @access Public
 */
export const GET = apiHandler(getAllSubmissions);

/**
 * @route POST /api/submissions
 * @description Create a new submission
 * @access Private
 */
export const POST = apiHandler(createSubmission);