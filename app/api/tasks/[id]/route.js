import { deleteTask, getSingleTask, updateTask } from "@/controllers/task.controller";
import apiHandler from "@/utils/api.middleware";
import { requireApiSession } from "@/utils/routeAuth.util";

export const GET = apiHandler(getSingleTask);

export const PATCH = apiHandler(async (req, context) => {
  await requireApiSession({ adminOnly: true });
  return updateTask(req, context);
});

export const DELETE = apiHandler(async (req, context) => {
  await requireApiSession({ adminOnly: true });
  return deleteTask(req, context);
});
