import { getSingleTask } from "@/controllers/task.controller";
import apiHandler from "@/utils/api.middleware";
/**
 * @route GET /api/task/[id]
 * @description Get single tasks
 * @access Public
 */

export const GET = apiHandler(getSingleTask);
