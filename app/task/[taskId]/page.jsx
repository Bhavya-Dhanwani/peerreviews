import { notFound } from "next/navigation";
import connectDB from "@/config/db.config";
import Task from "@/models/task.model";
import Submission from "@/models/submission.model";
import TaskDetailPage from "@/components/task/TaskDetailPage";
import decodeJWT from "@/utils/decodeJWT.util";
import { serializeTask } from "@/utils/discussionData.util";
import { isTaskScheduled } from "@/utils/taskSchedule.util";

export default async function TaskPage({ params }) {
  const currentUser = await decodeJWT();
  await connectDB();
  const { taskId } = await params;
  const task = await Task.findById(taskId).lean();

  if (!task) {
    notFound();
  }

  if (isTaskScheduled(task) && currentUser?.role !== "admin") {
    notFound();
  }

  const submissionCount = await Submission.countDocuments({ taskId });

  return <TaskDetailPage task={serializeTask(task)} submissionCount={submissionCount} />;
}
