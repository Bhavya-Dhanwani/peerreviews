import {
  getSingleSubmission,
  deleteSubmission,
  updateSubmission,
} from "@/controllers/submission.controller";
import apiHandler from "@/utils/api.middleware";

/**
 * @route GET /api/submissions/[id]
 * @description Get a single submission by its ID
 * @access Public
 */
export const GET = apiHandler(getSingleSubmission);

/**
 * @route DELETE /api/submissions/[id]
 * @description Delete a submission (owner only)
 * @access Private
 */
export const DELETE = apiHandler(deleteSubmission);

/**
 * @route PUT /api/submissions/[id]
 * @description Update a submission (owner only)
 * @access Private
 */
export const PUT = apiHandler(updateSubmission);