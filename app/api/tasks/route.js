import { createTask, getAllTasks } from "@/controllers/task.controller";
import apiHandler from "@/utils/api.middleware";

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

export const POST = apiHandler(createTask);
