import { createComment } from "@/controllers/submission.controller";
import apiHandler from "@/utils/api.middleware";

/**
 * @route POST /api/submissions/[id]/comments
 * @description Add a comment on a submission
 * @access Private
 */
export const POST = apiHandler(createComment);
