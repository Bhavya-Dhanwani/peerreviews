import { toggleLike } from "@/controllers/submission.controller";
import apiHandler from "@/utils/api.middleware";

/**
 * @route POST /api/submissions/[id]/like
 * @description Toggle like on a submission
 * @access Private
 */
export const POST = apiHandler(toggleLike);
