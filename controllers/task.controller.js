import Task from "@/models/task.model";
import ExpressError from "@/utils/ExpressError.util";
import {
  buildTaskVisibilityFilter,
  normalizeTaskStartDateInput,
} from "@/utils/taskSchedule.util";

function sanitizeTaskPayload(body = {}) {
  return {
    title: String(body.title || "").trim(),
    description_md: String(body.description_md || "").trim(),
    difficulty: String(body.difficulty || "").trim(),
    tags: Array.isArray(body.tags)
      ? body.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [],
    review: Array.isArray(body.review)
      ? body.review
          .map((item) => ({
            label: String(item?.label || "").trim(),
            maxScore: Number(item?.maxScore || 0),
          }))
          .filter((item) => item.label)
      : [],
    startDate: String(body.startDate || "").trim(),
  };
}

export async function getAllTasks() {
  const allTasks = await Task.find(buildTaskVisibilityFilter()).sort({ startDate: 1, createdAt: -1 });

  return {
    message: "Tasks fetched successfully.",
    data: allTasks,
  };
}

export async function createTask(req) {
  const body = sanitizeTaskPayload(await req.json());

  if (!body.title) {
    throw new ExpressError("Title is required.", 400);
  }

  const normalizedStartDate = normalizeTaskStartDateInput(body.startDate);

  if (!normalizedStartDate.ok) {
    throw new ExpressError(normalizedStartDate.message, 400);
  }

  const newTask = await Task.create({
    title: body.title,
    description_md: body.description_md,
    difficulty: body.difficulty,
    tags: body.tags,
    review: body.review,
    startDate: normalizedStartDate.value,
  });

  return {
    statusCode: 201,
    message: "Task created successfully.",
    data: newTask,
  };
}

export async function updateTask(req, { params }) {
  const { id } = await params;
  const body = sanitizeTaskPayload(await req.json());

  if (!body.title) {
    throw new ExpressError("Title is required.", 400);
  }

  const normalizedStartDate = normalizeTaskStartDateInput(body.startDate);

  if (!normalizedStartDate.ok) {
    throw new ExpressError(normalizedStartDate.message, 400);
  }

  const updatedTask = await Task.findByIdAndUpdate(
    id,
    {
      title: body.title,
      description_md: body.description_md,
      difficulty: body.difficulty,
      tags: body.tags,
      review: body.review,
      startDate: normalizedStartDate.value,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedTask) {
    throw new ExpressError("Task not found.", 404);
  }

  return {
    message: "Task updated successfully.",
    data: updatedTask,
  };
}

export async function deleteTask(req, { params }) {
  const { id } = await params;
  const deletedTask = await Task.findByIdAndDelete(id);

  if (!deletedTask) {
    throw new ExpressError("Task not found.", 404);
  }

  return {
    message: "Task deleted successfully.",
    data: deletedTask,
  };
}

export async function getSingleTask(req, { params }) {
  const { id } = await params;
  const task = await Task.findById(id);

  if (!task) {
    throw new ExpressError("Task not found.", 404);
  }

  return {
    message: "Task fetched successfully.",
    data: task,
  };
}
