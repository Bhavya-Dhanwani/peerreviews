import Task from "@/models/task.model";
import ExpressError from "@/utils/ExpressError.util";

export async function getAllTasks() {
  const allTasks = await Task.find();

  return {
    message: "Tasks fetched successfully.",
    data: allTasks,
  };
}

export async function createTask(req) {
  const body = await req.json();
  const { title, description_md, difficulty, tags, review } = body;

  if (!title) {
    throw new ExpressError("Title is required.", 400);
  }

  const newTask = await Task.create({
    title,
    description_md,
    difficulty,
    tags,
    review,
  });

  return {
    statusCode: 201,
    message: "Task created successfully.",
    data: newTask,
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
