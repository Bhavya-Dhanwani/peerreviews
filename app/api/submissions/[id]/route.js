import { getSingleSubmission } from "@/controllers/submission.controller";
import apiHandler from "@/utils/api.middleware";

/**
 * @route GET /api/submissions/[id]
 * @description Get a single submission by its ID
 * @access Public
 */
export const GET = apiHandler(getSingleSubmission);