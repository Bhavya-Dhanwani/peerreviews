import { createTask, getAllTasks } from "@/controllers/task.controller";
import apiHandler from "@/utils/api.middleware";
import { requireApiSession } from "@/utils/routeAuth.util";

/**
 * @route GET /api/task
 * @description Get all tasks
 * @access Public
 */

export const GET = apiHandler(getAllTasks);

/**
 * @route POST /api/task
 * @description Create a task
 * @access Public
 */

export const POST = apiHandler(async (req) => {
  await requireApiSession({ adminOnly: true });
  return createTask(req);
});
